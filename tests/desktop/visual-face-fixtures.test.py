"""Optional real-detector fixtures, using the official YuNet example locally.

Set CLIPRUSH_FACE_FIXTURE to a local image. No download or image display is performed.
The fixtures simulate layouts. They do not measure real gameplay/NPC accuracy.
"""
import importlib.util
import os
from pathlib import Path
import tempfile
import unittest

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location("worker", ROOT / "scripts/analyze-segment.py")
worker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)


@unittest.skipUnless(os.environ.get("CLIPRUSH_FACE_FIXTURE"), "Local face fixture required")
class FaceFixtures(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.directory = Path(tempfile.mkdtemp(prefix="faces-", dir=ROOT / "out/visual-face-fixtures"))
        image = cv2.imread(os.environ["CLIPRUSH_FACE_FIXTURE"])
        height, width = image.shape[:2]
        detector = cv2.FaceDetectorYN.create(str(ROOT / "desktop/models/face_detection_yunet_2023mar.onnx"),
                                            "", (width, height), 0.9, 0.3, 500)
        _, faces = detector.detect(image)
        if faces is None:
            raise RuntimeError("Fixture has no detected face")
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w, h = (int(v) for v in face[:4])
        cls.portrait = image[max(0, y - h // 3):min(height, y + h * 4 // 3),
                             max(0, x - w // 3):min(width, x + w * 4 // 3)]

    def analyze(self, name, moving=False, fullscreen=False):
        filename = self.directory / (name + ".avi")
        writer = cv2.VideoWriter(str(filename), cv2.VideoWriter_fourcc(*"MJPG"), 4, (640, 360))
        self.assertTrue(writer.isOpened())
        for n in range(24):
            frame = np.full((360, 640, 3), (80, 110, 40), dtype=np.uint8)
            if fullscreen:
                portrait = cv2.resize(self.portrait, (360, 360))
                frame[:, 140:500] = portrait
            else:
                cv2.rectangle(frame, (5, 5), (285, 225), (250, 250, 250), 3)
                dx = int(n * 100 / 23) if moving else 0
                portrait = cv2.resize(self.portrait, (120, 160))
                frame[30:190, 20 + dx:140 + dx] = portrait
            writer.write(frame)
        writer.release()
        request = dict(source=str(filename), startMs=0, endMs=6000, sampleEveryMs=2500, maxSamples=24, timeoutMs=30000)
        worker.metadata(request)
        result = worker.visual(request)
        self.assertTrue(result["samplingComplete"])
        self.assertTrue(any(f["regions"] for f in result["faces"]))
        self.assertTrue(all(0 <= c <= 1 for f in result["faces"] for c in f["confidences"]))
        return result

    def test_fixed_corner(self):
        result = self.analyze("fixed")
        self.assertEqual(result["person"]["movement"], "low")
        self.assertTrue(result["webcam"]["regions"])
        self.assertEqual(result["webcam"]["status"], "uncertain")

    def test_moving_corner(self):
        result = self.analyze("moving", moving=True)
        self.assertEqual(result["person"]["movement"], "high")

    def test_fullscreen(self):
        result = self.analyze("fullscreen", fullscreen=True)
        self.assertEqual(result["webcam"]["kind"], "unknown")
        self.assertEqual(result["person"]["status"], "uncertain")

    def test_npc_portrait_simulation_is_ambiguous(self):
        result = self.analyze("npc-portrait-simulation")
        self.assertEqual(result["webcam"]["status"], "uncertain")


if __name__ == "__main__":
    unittest.main()
