"""Bounded local analysis. Images stay in this process and are never uploaded."""
import json
import hashlib
import math
import os
import shutil
import subprocess
import sys
import time
import tempfile
from pathlib import Path


def detection(status="uncertain", confidence=0.0, reasons=None, **extra):
    return dict(status=status, confidence=confidence, reasons=reasons or [], **extra)


def region(rect, width, height):
    x, y, w, h = (int(v) for v in rect)
    if x < 0 or y < 0 or w <= 0 or h <= 0 or x + w > width or y + h > height:
        raise ValueError("Region outside frame")
    return dict(x=x / width, y=y / height, width=min(w / width, 1 - x / width), height=min(h / height, 1 - y / height))


def movement(samples):
    # Multiple faces cannot be associated safely without tracking/identity.
    visible = [s["regions"] for s in samples if s["regions"]]
    if len(visible) < 2 or any(len(rs) != 1 for rs in visible):
        return "unknown"
    centers = [(rs[0]["x"] + rs[0]["width"] / 2,
                rs[0]["y"] + rs[0]["height"] / 2) for rs in visible]
    distance = max(math.dist(centers[0], c) for c in centers)
    return "low" if distance < 0.04 else "high"


def summarize(samples, candidates, complete):
    has_faces = any(s["regions"] for s in samples)
    status = "uncertain" if has_faces or not complete else "not_detected"
    reasons = (["Face candidates may include game characters; human presence unverified."] if has_faces
               else ["No frontal face in sampled frames; profiles and occlusions may be missed."])
    if not complete:
        reasons.append("Incomplete sampling or unavailable face detector.")
    person = detection(status, 0.0 if status == "uncertain" else 0.5, reasons,
                       movement=movement(samples))
    webcam = detection(status, 0.0 if status == "uncertain" else 0.5,
                       ["Rectangles containing faces are candidates, including possible game UI/NPCs."]
                       if candidates else reasons, regions=candidates[:20], kind="unknown")
    return person, webcam


def ffmpeg(request, args, timeout):
    command = request.get("ffmpeg") or shutil.which("ffmpeg")
    if not command:
        raise RuntimeError("FFmpeg unavailable")
    return subprocess.run([command, "-v", "error", "-nostdin", "-threads", "1",
                           "-protocol_whitelist", "file,pipe", *args],
                          capture_output=True, timeout=timeout, check=True).stdout


def metadata(request):
    command = request.get("ffprobe") or shutil.which("ffprobe")
    if not command:
        raise RuntimeError("FFprobe unavailable")
    raw = subprocess.run([command, "-v", "error", "-protocol_whitelist", "file,pipe",
                          "-show_entries", "format=duration:stream=codec_type", "-of", "json",
                          request["source"]], capture_output=True, timeout=min(10, request["timeoutMs"] / 1000), check=True)
    data = json.loads(raw.stdout)
    duration = float(data.get("format", {}).get("duration", 0))
    if not math.isfinite(duration) or duration <= 0 or request["endMs"] > duration * 1000 + 1:
        raise ValueError("Selected interval exceeds measured source duration")
    return data


def panel_candidates(frame, faces):
    """Measure four independent borders, allowing rounded/open panel corners."""
    import cv2
    import numpy as np
    height, width = frame.shape[:2]
    edges = cv2.Canny(frame, 55, 130)
    horizontal, vertical = [], []
    for kernel, positions, axis in [((25, 1), horizontal, 1), ((1, 25), vertical, 0)]:
        straight = cv2.morphologyEx(edges, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_RECT, kernel))
        contours, _ = cv2.findContours(straight, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            positions.append(int(y + h // 2) if axis else int(x + w // 2))
    near = cv2.dilate(edges, np.ones((3, 3), np.uint8)) > 0
    candidates = []
    for face in faces:
        fx, fy, fw, fh = [face[k] * d for k, d in
                          zip(('x', 'y', 'width', 'height'), (width, height, width, height))]
        left = sorted(set(x for x in vertical if fx - width * .35 < x < fx))
        right = sorted(set(x for x in vertical if fx + fw < x < fx + fw + width * .35))
        top = sorted(set(y for y in horizontal if fy - height * .3 < y < fy))
        bottom = sorted(set(y for y in horizontal if fy + fh < y < fy + fh + height * .3))
        for x in left:
            for r in right:
                for y in top:
                    for b in bottom:
                        w, h = r - x, b - y
                        if not (.02 <= w * h / (width * height) <= .3 and 1.1 <= w / h <= 2.5
                                and w >= fw * 1.8 and h >= fh * 1.15):
                            continue
                        scores = [near[y, x+3:r-2].mean(), near[b, x+3:r-2].mean(),
                                  near[y+3:b-2, x].mean(), near[y+3:b-2, r].mean()]
                        if min(scores) >= .72:
                            candidates.append(dict(region=region((x, y, w, h), width, height),
                                                   borderScore=float(min(scores))))
    return sorted(candidates, key=lambda c: c['borderScore'], reverse=True)[:20]


def refine_panels(samples, panels, complete):
    """Conservative geometry classification. A stable NPC portrait remains possible."""
    groups = []
    for at, candidates in panels:
        for candidate in candidates:
            r = candidate['region']
            group = next((g for g in groups if max(abs(r[k] - g['region'][k]) for k in r) < .015), None)
            if group is None:
                group = dict(region=r, times=set(), scores=[])
                groups.append(group)
            if at not in group['times']:
                group['times'].add(at)
                group['scores'].append(candidate['borderScore'])
    groups.sort(key=lambda g: (len(g['times']), sum(g['scores']) / len(g['scores'])), reverse=True)
    if not groups:
        return None
    g = groups[0]
    coverage = len(g['times']) / max(1, len(samples))
    r = g['region']
    # Require temporal persistence and containment of a face in the same panel.
    stable = sum(any(r['x'] <= f['x'] and r['y'] <= f['y'] and
                     f['x'] + f['width'] <= r['x'] + r['width'] and
                     f['y'] + f['height'] <= r['y'] + r['height'] for f in s['regions'])
                 for s in samples) / max(1, len(samples))
    if len(g['times']) < 3 or coverage < .7 or stable < .7:
        return None
    confidence = round(min(.89, coverage * stable * sum(g['scores']) / len(g['scores']) * .89), 3)
    return detection('uncertain', confidence,
                     [f'Stable face-containing panel; four borders in {len(g["times"])}/{len(samples)} samples.',
                      'Geometric confidence only; an embedded NPC portrait cannot be excluded.',
                      'Sparse measurements; manual review available.'],
                     regions=[r], kind='embedded')


def gameplay_regions(overlays):
    """Disjoint visible source rectangles outside the proposed panel."""
    if not overlays:
        return []
    r = overlays[0]
    x, y, w, h = (r[k] for k in ('x', 'y', 'width', 'height'))
    return [dict(x=a, y=b, width=c, height=d) for a, b, c, d in
            [(0, 0, x, 1), (x+w, 0, 1-x-w, 1), (x, 0, w, y), (x, y+h, w, 1-y-h)]
            if c > 0 and d > 0]


def cache_write(filename, data):
    descriptor, temporary = tempfile.mkstemp(dir=filename.parent, suffix='.tmp')
    try:
        with os.fdopen(descriptor, 'wb') as output:
            output.write(data)
        os.replace(temporary, filename)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def gameplay_person_focus(faces, confidences, safe, at):
    """Reuse YuNet observations, accepting only an unambiguous central face inside safe gameplay."""
    candidates = []
    for face, confidence in zip(faces, confidences):
        cx, cy = face['x'] + face['width'] / 2, face['y'] + face['height'] / 2
        inside = (face['x'] >= safe['x'] and face['y'] >= safe['y'] and
                  face['x'] + face['width'] <= safe['x'] + safe['width'] and
                  face['y'] + face['height'] <= safe['y'] + safe['height'])
        if confidence >= .9 and inside and abs(cx - .5) <= .18 and .2 <= cy <= .9:
            candidates.append(dict(atMs=at, x=cx, y=cy, confidence=confidence))
    return candidates[0] if len(candidates) == 1 else None


def visual(request):
    started = time.monotonic()
    samples, candidates, times = [], [], []
    complete = True
    errors = []
    panels = []
    cache_hits = 0
    focus_samples = []
    try:
        import cv2
        import numpy as np
        cv2.setNumThreads(1)
        model = Path(__file__).resolve().parents[1] / "desktop/models/face_detection_yunet_2023mar.onnx"
        if hashlib.sha256(model.read_bytes()).hexdigest() != "8f2383e4dd3cfbb4553ea8718107fc0423210dc964f9f4280604804ed2552fa4":
            raise RuntimeError("Local face model hash mismatch")
        detector = cv2.FaceDetectorYN.create(str(model), "", (640, 360), 0.85, 0.3, 100)
        stamp = Path(request['source']).stat()
        cache = Path(request['cacheDirectory']) if request.get('cacheDirectory') else None
        if cache:
            cache.mkdir(parents=True, exist_ok=True)
        duration = request["endMs"] - request["startMs"]
        count = min(request["maxSamples"], math.ceil(duration / request["sampleEveryMs"]))
        # Uniformly cover long bounded selections, retaining sparse analysis.
        step = max(request["sampleEveryMs"], duration / count)
        for n in range(count):
            remaining = request["timeoutMs"] / 1000 - (time.monotonic() - started)
            if remaining < 0.1:
                complete = False
                break
            at = request["startMs"] + round(n * step)
            try:
                key = hashlib.sha256(json.dumps([request['source'], stamp.st_size, stamp.st_mtime_ns,
                                                at, 'yunet-640-v1']).encode()).hexdigest()
                image_path = cache / (key + '.jpg') if cache else None
                face_path = cache / (key + '.json') if cache else None
                cached_face = None
                try:
                    data = image_path.read_bytes()
                    cached_face = json.loads(face_path.read_text())
                    cache_hits += 1
                except (AttributeError, OSError, ValueError):
                    data = ffmpeg(request, ["-ss", str(at / 1000), "-noautorotate", "-i", request["source"],
                                       "-t", str((request["endMs"] - at) / 1000),
                                       "-map", "0:v:0", "-frames:v", "1", "-vf", "scale=640:640:force_original_aspect_ratio=decrease",
                                       "-f", "image2pipe", "-c:v", "mjpeg", "pipe:1"], remaining)
                frame = cv2.imdecode(np.frombuffer(data, dtype=np.uint8), cv2.IMREAD_COLOR)
                if frame is None:
                    raise RuntimeError("Frame decode failed")
                height, width = frame.shape[:2]
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                detector.setInputSize((width, height))
                reused = cached_face or next((s for s in request.get('faceSamples', []) if s['atMs'] == at), None)
                _, found = (None, None) if reused else detector.detect(frame)
                faces = []
                confidences = []
                for face in ([] if found is None else found[:20]):
                    x, y = max(0, int(face[0])), max(0, int(face[1]))
                    right, bottom = min(width, math.ceil(face[0] + face[2])), min(height, math.ceil(face[1] + face[3]))
                    if right > x and bottom > y:
                        faces.append((x, y, right - x, bottom - y))
                        confidences.append(min(1.0, max(0.0, float(face[-1]))))
                regions = [region(r, width, height) for r in faces[:20]]
                if reused:
                    regions, confidences = reused['regions'], reused['confidences']
                if request.get('gameplayFocusRegion'):
                    focus = gameplay_person_focus(regions, confidences, request['gameplayFocusRegion'], at)
                    if focus:
                        focus_samples.append(focus)
                times.append(at)
                samples.append(dict(atMs=at, regions=regions, confidences=confidences))
                if cache and not cached_face:
                    cache_write(image_path, data)
                    cache_write(face_path, json.dumps(samples[-1]).encode())
                panels.append((at, panel_candidates(frame, regions)))
                # Only measured closed rectangular boundaries can become candidates.
                contours, _ = cv2.findContours(cv2.Canny(gray, 70, 150), cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
                for contour in contours:
                    polygon = cv2.approxPolyDP(contour, 0.02 * cv2.arcLength(contour, True), True)
                    if len(polygon) != 4 or not cv2.isContourConvex(polygon):
                        continue
                    x, y, w, h = cv2.boundingRect(polygon)
                    if not 0.02 <= w * h / (width * height) <= 0.4:
                        continue
                    if not any(x <= fx and y <= fy and fx + fw <= x + w and fy + fh <= y + h
                               for fx, fy, fw, fh in faces):
                        continue
                    r = region((x, y, w, h), width, height)
                    if not any(sum(abs(r[k] - old[k]) for k in r) < 0.06 for old in candidates):
                        candidates.append(r)
                        candidates = candidates[:20]
            except (cv2.error, RuntimeError, subprocess.SubprocessError, OSError, ValueError) as error:
                complete = False
                errors.append(str(error)[:200])
    except Exception as error:
        complete = False
        errors.append(str(error)[:200])
    person, webcam = summarize(samples, candidates, complete)
    measured = refine_panels(samples, panels, complete)
    if measured:
        webcam = measured
    person["reasons"].extend(errors[:3])
    focus_result = {}
    if request.get('gameplayFocusRegion'):
        stable = len(focus_samples) >= 3 and len(focus_samples) / max(1, len(times)) >= .6
        stable = stable and all(math.dist((a['x'], a['y']), (b['x'], b['y'])) <= .12
                                for a, b in zip(focus_samples, focus_samples[1:]))
        focus_result['focus'] = detection('detected' if stable and complete else 'uncertain',
            min(s['confidence'] for s in focus_samples) if stable else 0,
            ['Existing YuNet face confidence, safe-region containment, centrality and temporal consistency.',
             'Main-character identity unverified; vehicle model unavailable. Abstains on ambiguous objects.'], method='central-face',
            samples=focus_samples if stable and complete else [])
    return dict(sampledAtMs=times, samplingComplete=complete, faces=samples, person=person, webcam=webcam,
                frameCacheHits=cache_hits,
                gameplay=detection(reasons=["Game content cannot be established by a face/rectangle detector."],
                                   regions=gameplay_regions(webcam['regions']), overlays=webcam['regions'], **focus_result))


def speech(request):
    try:
        info = metadata(request)
        if not any(s.get("codec_type") == "audio" for s in info.get("streams", [])):
            return detection("not_detected", 1.0, ["Source has no audio stream."], speakerMatched=False, intervals=[])
        import numpy as np
        from faster_whisper.vad import get_speech_timestamps
        audio = ffmpeg(request, ["-ss", str(request["startMs"] / 1000), "-i", request["source"],
                                 "-t", str((request["endMs"] - request["startMs"]) / 1000),
                                 "-vn", "-ac", "1", "-ar", "16000", "-f", "f32le", "pipe:1"],
                       request["timeoutMs"] / 1000)
        samples = np.frombuffer(audio, dtype=np.float32)
        expected = (request["endMs"] - request["startMs"]) * 16
        if len(samples) < expected - 1600:
            raise RuntimeError("Audio does not cover selected interval")
        segments = get_speech_timestamps(samples, sampling_rate=16000)
        intervals = [dict(startMs=request["startMs"] + round(s["start"] / 16),
                          endMs=min(request["endMs"], request["startMs"] + round(s["end"] / 16)))
                     for s in segments if s["end"] > s["start"]]
        return detection("detected" if intervals else "not_detected", 0.7,
                         ["Silero VAD; confidence is heuristic, visible speaker unverified."],
                         speakerMatched=False, intervals=intervals)
    except Exception as error:
        return detection(reasons=[str(error)[:300]], speakerMatched=False, intervals=[])


def main():
    request = json.load(sys.stdin)
    if not (0 <= request["startMs"] < request["endMs"] and
            request["endMs"] - request["startMs"] <= 600000 and
            1000 <= request["sampleEveryMs"] <= 10000 and
            1 <= request["maxSamples"] <= 120 and 1 <= request["timeoutMs"] <= 300000):
        raise ValueError("Invalid analysis bounds")
    if sys.argv[1] != "speech":
        metadata(request)
    result = speech(request) if sys.argv[1] == "speech" else visual(request)
    print(json.dumps(result, allow_nan=False))


if __name__ == "__main__":
    main()
