"""Worker contract tests with a controlled ASR backend; never load a model."""
import importlib.util
from pathlib import Path
from types import SimpleNamespace
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "narration_worker", Path(__file__).resolve().parents[2] / "scripts/transcribe-narration.py")
worker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)


class WorkerTests(unittest.TestCase):
    def run_transcript(self, script):
        calls = []

        class Model:
            def __init__(self, name, **kwargs):
                calls.append((name, kwargs))

            def transcribe(self, audio, **kwargs):
                self_test.assertEqual(audio, "source.wav")
                self_test.assertEqual(kwargs, {"language": "pt", "word_timestamps": True, "vad_filter": True})
                return iter([SimpleNamespace(words=[
                    SimpleNamespace(word=" Olá", start=0.1, end=0.3),
                    SimpleNamespace(word=" mundo", start=0.4, end=0.7),
                ])]), None

        self_test = self
        with patch.dict("sys.modules", {"faster_whisper": SimpleNamespace(WhisperModel=Model)}):
            result = worker.transcribe({"audio": "source.wav", "language": "pt-BR", "script": script})
        self.assertEqual(calls[0][1]["local_files_only"], True)
        self.assertEqual([(w["startMs"], w["endMs"]) for w in result["words"]], [(100, 300), (400, 700)])
        return result

    def test_matching_script_preserves_spelling_with_measured_timestamps(self):
        result = self.run_transcript("Olá, mundo!")
        self.assertTrue(result["scriptReused"])
        self.assertEqual([w["text"] for w in result["words"]], ["Olá,", "mundo!"])

    def test_mismatched_script_cannot_invent_speech(self):
        result = self.run_transcript("Outra fala inventada")
        self.assertFalse(result["scriptReused"])
        self.assertEqual([w["text"] for w in result["words"]], ["Olá", "mundo"])

    def test_missing_local_models_fail_without_download(self):
        calls = []

        def missing(name, **kwargs):
            calls.append(name)
            self.assertTrue(kwargs["local_files_only"])
            raise OSError("not cached")

        with patch.dict("sys.modules", {"faster_whisper": SimpleNamespace(WhisperModel=missing)}):
            with self.assertRaisesRegex(RuntimeError, "download automatico desativado"):
                worker.transcribe({"audio": "source.wav", "language": "pt-BR"})
        self.assertEqual(calls, ["small", "base", "large-v3"])

    def test_loading_errors_report_each_cached_model(self):
        def broken(name, **kwargs):
            raise RuntimeError(f"corrupted {name} weights")

        with patch.dict("sys.modules", {"faster_whisper": SimpleNamespace(WhisperModel=broken)}):
            with self.assertRaisesRegex(RuntimeError, "small: corrupted small weights.*base: corrupted base weights.*large-v3:"):
                worker.transcribe({"audio": "source.wav", "language": "pt-BR"})


if __name__ == "__main__":
    unittest.main()
