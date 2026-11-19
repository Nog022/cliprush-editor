"""Explicit diagnostic export only. Normal production never invokes this script.

Input is a source-stamped analysis bundle with request, visual and speech fields.
Video overlays are encoded once. Audio is muxed separately using video stream copy.
"""
import argparse
import json
from pathlib import Path
import subprocess
import time


def probe(filename):
    return json.loads(subprocess.check_output([
        'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(filename)], timeout=15))


def mux_audio(video, source, start, duration, output):
    info = probe(source)
    if not any(s['codec_type'] == 'audio' for s in info['streams']):
        raise ValueError('Source has no audio stream. Diagnostic audio cannot be preserved.')
    if not any(s['codec_type'] == 'video' and s['codec_name'] == 'h264' for s in probe(video)['streams']):
        raise ValueError('Diagnostic video must be H.264.')
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-n', '-i', str(video),
                    '-ss', str(start), '-i', str(source), '-t', str(duration),
                    '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy',
                    '-c:a', 'aac', '-profile:a', 'aac_low', '-b:a', '192k',
                    '-movflags', '+faststart', str(output)], check=True, timeout=max(60, duration * 4))


def export(bundle, output):
    a = json.loads(bundle.read_text(encoding='utf-8'))
    request, visual = a['request'], a['visual']
    source = Path(request['source'])
    stamp = source.stat()
    if a['sourceStamp'] != dict(size=stamp.st_size, mtime_ns=stamp.st_mtime_ns):
        raise ValueError('Source changed since analysis.')
    if output.exists():
        raise FileExistsError(output)
    info = probe(source)
    if not any(s['codec_type'] == 'audio' for s in info['streams']):
        raise ValueError('Source has no audio stream.')
    stream = next(s for s in info['streams'] if s['codec_type'] == 'video')
    width, height = stream['width'], stream['height']
    start = request['startMs'] / 1000
    duration = (request['endMs'] - request['startMs']) / 1000
    work = output.parent / (output.stem + '-work')
    work.mkdir(parents=True, exist_ok=False)
    filters = []

    def label(text, x, y, color='white', enable=None):
        filename = work / f'label-{len(filters):03}.txt'
        filename.write_text(text, encoding='utf-8')
        item = (f"drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':textfile='{filename.as_posix()}':"
                f"x={x}:y={y}:fontsize=25:fontcolor={color}:box=1:boxcolor=black@0.8:boxborderw=6")
        filters.append(item + (f":enable='{enable}'" if enable else ''))

    def box(r, color, enable=None):
        x, y, w, h = [round(r[k] * d) for k, d in
                       zip(('x', 'y', 'width', 'height'), (width, height, width, height))]
        filters.append(f'drawbox=x={x}:y={y}:w={w}:h={h}:color={color}:t=4' +
                       (f":enable='{enable}'" if enable else ''))

    label(f'FASE 2 | fonte {start:.3f}s - {start+duration:.3f}s | audio original AAC-LC', 24, height-210)
    label(f"Webcam {visual['webcam']['status'].upper()} | confianca geometrica {visual['webcam']['confidence']:.3f}", 24, height-170, 'yellow')
    label('Painel agregado das amostras (amarelo) | gameplay residual INCERTO (verde)', 24, height-130)
    label('Rosto: ultima amostra, retida por 0,8 s | SEM rastreamento continuo', 24, height-90, 'cyan')
    label('Pessoa / NPC e locutor sem confirmacao | revisao manual disponivel', 24, height-50, 'yellow')
    for r in visual['gameplay']['regions']:
        box(r, 'lime@0.65')
    for r in visual['webcam']['regions']:
        box(r, 'yellow')
    for s in visual['faces']:
        t = s['atMs'] / 1000 - start
        enable = f'gte(t,{t})*lt(t,{min(duration,t+.8)})'
        for r, confidence in zip(s['regions'], s['confidences']):
            box(r, 'cyan', enable)
            label(f"AMOSTRA {s['atMs']/1000:.3f}s | rosto YuNet {confidence:.3f}", 24, 75, 'cyan', enable)
    intervals = a['speech']['intervals']
    expression = '+'.join(f"gte(t,{s['startMs']/1000-start})*lt(t,{s['endMs']/1000-start})" for s in intervals)
    if expression:
        label('Fala Silero VAD | confianca heuristica 0,70 | locutor incerto', 24, 30, 'lime', expression)
    script = work / 'overlay.ffscript'
    script.write_text(',\n'.join(filters), encoding='utf-8')
    video = work / 'video-h264.mp4'
    then = time.monotonic()
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-n', '-ss', str(start), '-i', str(source),
                    '-t', str(duration), '-map', '0:v:0', '-an', '-/filter:v', str(script),
                    '-c:v', 'libx264', '-preset', 'fast', '-crf', '18', '-pix_fmt', 'yuv420p', str(video)],
                   check=True, timeout=max(120, duration * 10))
    render = time.monotonic()-then
    then = time.monotonic()
    mux_audio(video, source, start, duration, output)
    timings = dict(renderSeconds=render, audioMuxSeconds=time.monotonic()-then)
    (work / 'timings.json').write_text(json.dumps(timings, indent=2))
    print(json.dumps(timings))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--analysis', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    export(args.analysis, args.output)
