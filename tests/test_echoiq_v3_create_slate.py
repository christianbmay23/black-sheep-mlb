from __future__ import annotations

import importlib.util
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
SCRIPT_PATH = REPO_ROOT / "echoiq_v3" / "scripts" / "create_slate.py"


def _load_create_slate_module():
    spec = importlib.util.spec_from_file_location("create_slate", SCRIPT_PATH)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


create_slate_module = _load_create_slate_module()


class EchoIQV3CreateSlateTests(unittest.TestCase):
    def test_dry_run_reports_actions_without_writing_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = _build_fake_repo(Path(tmp))

            result = create_slate_module.create_slate("2026-05-05", repo_root=root, dry_run=True)

            self.assertEqual(result.slate_date, "2026-05-05")
            self.assertFalse((root / "slates" / "2026-05-05").exists())
            self.assertTrue(any(destination.name == "official_card.csv" for _, destination in result.copied_templates))
            self.assertEqual(result.warnings, [])

    def test_create_slate_copies_expected_templates(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = _build_fake_repo(Path(tmp))

            result = create_slate_module.create_slate("2026-05-05", repo_root=root)
            slate_dir = root / "slates" / "2026-05-05"

            for folder in create_slate_module.FOLDERS:
                self.assertTrue((slate_dir / folder).is_dir(), folder)

            expected_files = [
                "00_inputs/external_public_predictions.csv",
                "00_inputs/source_compliance.csv",
                "00_inputs/INPUTS_README.md",
                "01_raw_research/raw_research_board.csv",
                "01_raw_research/weather_park_board.csv",
                "02_candidates/candidate_board.csv",
                "03_verification/verification_board.csv",
                "03_verification/pass_avoid.csv",
                "04_final_card/official_card.csv",
                "04_final_card/lottery_card.csv",
                "04_final_card/conditional_card.csv",
                "04_final_card/watchlist.csv",
                "04_final_card/final_card_report.md",
                "05_postgame/postgame_grade.csv",
                "05_postgame/error_ledger.csv",
                "05_postgame/model_lessons.csv",
                "05_postgame/postgame_report.md",
                "06_archive/README.md",
            ]
            for relative_path in expected_files:
                self.assertTrue((slate_dir / relative_path).exists(), relative_path)

            self.assertGreater(len(result.copied_templates), 0)

    def test_existing_slate_without_force_fails(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = _build_fake_repo(Path(tmp))
            create_slate_module.create_slate("2026-05-05", repo_root=root)

            with self.assertRaises(FileExistsError):
                create_slate_module.create_slate("2026-05-05", repo_root=root)

    def test_force_overwrites_mapped_files(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = _build_fake_repo(Path(tmp))
            create_slate_module.create_slate("2026-05-05", repo_root=root)
            official_card = root / "slates" / "2026-05-05" / "04_final_card" / "official_card.csv"
            official_card.write_text("stale\n", encoding="utf-8")

            create_slate_module.create_slate("2026-05-05", repo_root=root, force=True)

            self.assertEqual(official_card.read_text(encoding="utf-8"), "official_card.csv\n")

    def test_missing_template_warns_and_continues(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = _build_fake_repo(Path(tmp))
            (root / "echoiq_v3" / "templates" / "lottery_card.csv").unlink()

            result = create_slate_module.create_slate("2026-05-05", repo_root=root)

            self.assertTrue(any("lottery_card.csv" in warning for warning in result.warnings))
            self.assertTrue((root / "slates" / "2026-05-05" / "04_final_card" / "official_card.csv").exists())
            self.assertFalse((root / "slates" / "2026-05-05" / "04_final_card" / "lottery_card.csv").exists())

    def test_invalid_date_rejected(self):
        with self.assertRaises(Exception):
            create_slate_module.validate_date("2026-5-5")
        with self.assertRaises(Exception):
            create_slate_module.validate_date("2026-02-31")


def _build_fake_repo(root: Path) -> Path:
    template_root = root / "slates" / "_template"
    for folder in create_slate_module.FOLDERS:
        (template_root / folder).mkdir(parents=True, exist_ok=True)
    (template_root / "README.md").write_text("# Template\n", encoding="utf-8")

    artifact_templates = root / "echoiq_v3" / "templates"
    artifact_templates.mkdir(parents=True, exist_ok=True)
    filenames = {
        filename
        for filenames in create_slate_module.TEMPLATE_MAPPING.values()
        for filename in filenames
    }
    for filename in filenames:
        (artifact_templates / filename).write_text(f"{filename}\n", encoding="utf-8")
    return root


if __name__ == "__main__":
    unittest.main()
