"""Desktop adapter for the existing local faster-whisper installation. No downloads."""
import json
import re
import sys
from pathlib import Path


def tokens(text):
    return re.findall(r"\w+", text.casefold(), flags=re.UNICODE)


def transcribe(request):
    from faster_whisper import WhisperModel

    # Try cached models only, without constructing/downloading a missing model.
    model = None
    load_errors = []
    for name in ["small", "base", "large-v3"]:
        try:
            model = WhisperModel(name, device="cpu", compute_type="int8", local_files_only=True)
            break
        except (OSError, ValueError, RuntimeError) as error:
            load_errors.append(f"{name}: {str(error)[:400]}")
    if model is None:
        raise RuntimeError("Nenhum modelo faster-whisper local disponivel; download automatico desativado. " + "; ".join(load_errors))
    segments, _ = model.transcribe(request["audio"], language=request["language"].split("-")[0],
                                   word_timestamps=True, vad_filter=True)
    words = []
    for segment in segments:
        for word in segment.words or []:
            if word.end > word.start and word.word.strip():
                words.append({"text": word.word.strip(), "startMs": round(word.start * 1000),
                              "endMs": round(word.end * 1000)})
    script = request.get("script", "")
    script_words = script.split()
    # Preserve supplied spelling/punctuation only with a complete word-for-word match.
    reused = len(script_words) == len(words) and all(
        tokens(text) == tokens(word["text"]) for text, word in zip(script_words, words))
    if reused:
        for word, text in zip(words, script_words):
            word["text"] = text
    return {"words": words, "scriptReused": reused, "method": "faster-whisper local word timestamps",
            "model": name, "modelLoadErrors": load_errors}


if __name__ == "__main__":
    try:
        request = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
        print(json.dumps(transcribe(request), ensure_ascii=True))
    except Exception as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
