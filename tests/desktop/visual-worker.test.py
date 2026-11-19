"""Controlled evidence tests. They measure conservatism, not real-world precision."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("visual_worker", Path(__file__).resolve().parents[2] / "scripts/analyze-segment.py")
worker = importlib.util.module_from_spec(spec)
spec.loader.exec_module(worker)


class VisualWorkerTests(unittest.TestCase):
    def test_gameplay_focus_accepts_only_one_confident_central_person(self):
        safe = dict(x=0, y=0, width=.775, height=1)
        focus = worker.gameplay_person_focus([self.face(x=.45, y=.4)], [.95], safe, 1214000)
        self.assertGreater(focus['confidence'], .8)
        self.assertAlmostEqual(focus['x'], .5)

    def test_gameplay_focus_rejects_ambiguous_low_confidence_and_webcam_faces(self):
        safe = dict(x=0, y=0, width=.775, height=1)
        for faces, scores in [([self.face(x=.45, y=.4)], [.7]),
                              ([self.face(x=.4, y=.4), self.face(x=.55, y=.4)], [.99, .99]),
                              ([self.face(x=.8, y=.7)], [.99])]:
            self.assertIsNone(worker.gameplay_person_focus(faces, scores, safe, 1214000))

    def face(self, x=0.05, y=0.1, width=0.1, height=0.15):
        return dict(x=x, y=y, width=width, height=height)

    def samples(self, *faces):
        return [dict(atMs=i * 2500, regions=[f]) for i, f in enumerate(faces)]

    def test_fixed_corner_webcam_candidate_keeps_uncertainty(self):
        person, camera = worker.summarize(self.samples(self.face(), self.face()), [self.face(width=0.25, height=0.3)], True)
        self.assertEqual(person["movement"], "low")
        self.assertEqual(camera["status"], "uncertain")
        self.assertEqual(len(camera["regions"]), 1)

    def test_moving_face(self):
        person, _ = worker.summarize(self.samples(self.face(), self.face(x=0.2)), [], True)
        self.assertEqual(person["movement"], "high")

    def test_no_webcam(self):
        person, camera = worker.summarize([dict(atMs=0, regions=[])], [], True)
        self.assertEqual(person["status"], "not_detected")
        self.assertEqual(camera["status"], "not_detected")
        self.assertEqual(camera["regions"], [])

    def test_full_screen_face_does_not_prove_human_or_speech(self):
        person, camera = worker.summarize(self.samples(self.face(width=0.7, height=0.8)), [], True)
        self.assertEqual(person["status"], "uncertain")
        self.assertEqual(camera["kind"], "unknown")

    def test_npc_is_never_confirmed_as_webcam(self):
        _, camera = worker.summarize(self.samples(self.face(), self.face()), [self.face()], True)
        self.assertEqual(camera["status"], "uncertain")

    def test_partial_sampling_cannot_claim_absence(self):
        person, camera = worker.summarize([], [], False)
        self.assertEqual(person["status"], "uncertain")
        self.assertEqual(camera["status"], "uncertain")

    def test_multiple_faces_movement_unknown(self):
        self.assertEqual(worker.movement([dict(regions=[self.face(), self.face(x=0.6)])] * 2), "unknown")

    def test_normalized_coordinates_and_bounds(self):
        self.assertEqual(worker.region((10, 20, 30, 40), 100, 100), self.face(x=0.1, y=0.2, width=0.3, height=0.4))
        with self.assertRaises(ValueError):
            worker.region((90, 20, 30, 40), 100, 100)

    def test_temporal_panel_localization_keeps_npc_uncertain(self):
        face = self.face(x=.78, y=.08, width=.06, height=.12)
        panel = self.face(x=.7, y=.02, width=.28, height=.25)
        samples = self.samples(*([face] * 4))
        panels = [(s['atMs'], [dict(region=panel, borderScore=.95)]) for s in samples]
        camera = worker.refine_panels(samples, panels, True)
        self.assertEqual(camera['regions'], [panel])
        self.assertEqual(camera['status'], 'uncertain')
        self.assertGreater(camera['confidence'], .8)
        self.assertIsNone(worker.refine_panels(samples, panels[:1], True))
        self.assertIsNone(worker.refine_panels(self.samples(*([self.face()] * 4)), panels, True))


if __name__ == "__main__":
    unittest.main()
