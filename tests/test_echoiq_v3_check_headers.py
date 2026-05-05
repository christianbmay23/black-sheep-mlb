from __future__ import annotations

import csv
import importlib.util
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
CREATE_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "create_slate.py"
CHECK_SCRIPT = REPO_ROOT / "echoiq_v3" / "scripts" / "check_headers.py"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None
    assert spec.loader is not None
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    sys.path.insert(0, str(path.parent))
    try:
        spec.loader.exec_module(module)
    finally:
        sys.path.pop(0)
    return module


create_slate_module = _load_module("create_slate_for_header_tests", CREATE_SCRIPT)
check_headers_module = _load_module("check_headers_for_tests", CHECK_SCRIPT)


class EchoIQV3CheckHeadersTests(unittest.TestCase):
    def test_blank_slate_created_by_create_slate_passes_header_check(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            result = check_headers_module.check_headers(slate_dir)

            self.assertEqual(result.status, "PASS")
            self.assertEqual(result.errors, [])

    def test_may4_sample_slate_passes_header_check(self):
        result = check_headers_module.check_headers(REPO_ROOT / "slates" / "_sample_2026-05-04")

        self.assertIn(result.status, {"PASS", "WARN"})
        self.assertEqual(result.errors, [])

    def test_missing_column_is_detected(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            path = slate_dir / "04_final_card" / "official_card.csv"
            _rewrite_header(path, lambda headers: headers[:-1])

            result = check_headers_module.check_headers(slate_dir)

            self.assertEqual(result.status, "FAIL")
            self.assertTrue(any("missing columns" in error for error in result.errors))

    def test_extra_column_is_detected(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            path = slate_dir / "04_final_card" / "official_card.csv"
            _rewrite_header(path, lambda headers: headers + ["unexpected_column"])

            result = check_headers_module.check_headers(slate_dir)

            self.assertEqual(result.status, "FAIL")
            self.assertTrue(any("extra columns" in error for error in result.errors))

    def test_fix_empty_repairs_empty_headerless_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            path = slate_dir / "04_final_card" / "watchlist.csv"
            path.write_text("", encoding="utf-8")

            result = check_headers_module.check_headers(slate_dir, fix_empty=True)

            self.assertEqual(result.status, "PASS")
            self.assertIn(path, result.fixed_files)
            self.assertGreater(len(_read_header(path)), 1)

    def test_fix_empty_refuses_populated_csv(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))
            path = slate_dir / "04_final_card" / "official_card.csv"
            original_headers = _read_header(path)
            altered_headers = original_headers[:-1]
            _write_csv(path, altered_headers, [["x" for _ in altered_headers]])

            result = check_headers_module.check_headers(slate_dir, fix_empty=True)

            self.assertEqual(result.status, "FAIL")
            self.assertEqual(_read_header(path), altered_headers)
            self.assertTrue(any("refused --fix-empty" in error for error in result.errors))

    def test_json_cli_returns_parseable_summary(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            completed = subprocess.run(
                [sys.executable, str(CHECK_SCRIPT), str(slate_dir), "--json"],
                cwd=REPO_ROOT,
                text=True,
                capture_output=True,
                check=False,
            )

            self.assertEqual(completed.returncode, 0, completed.stderr)
            payload = json.loads(completed.stdout)
            self.assertEqual(payload["status"], "PASS")
            self.assertGreater(payload["files_checked"], 0)

    def test_write_report_creates_header_drift_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            slate_dir = _create_test_slate(Path(tmp))

            result = check_headers_module.check_headers(slate_dir, write_report=True)

            report = slate_dir / "03_verification" / "header_drift_report.md"
            self.assertEqual(result.report_path, report)
            self.assertTrue(report.exists())
            self.assertIn("EchoIQ v3 Header Drift Report", report.read_text(encoding="utf-8"))


def _create_test_slate(tmp_root: Path) -> Path:
    repo_root = tmp_root / "repo"
    shutil.copytree(REPO_ROOT / "slates" / "_template", repo_root / "slates" / "_template")
    shutil.copytree(REPO_ROOT / "echoiq_v3" / "templates", repo_root / "echoiq_v3" / "templates")
    create_slate_module.create_slate("2026-05-05", repo_root=repo_root)
    return repo_root / "slates" / "2026-05-05"


def _read_header(path: Path) -> list[str]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        return next(reader)


def _rewrite_header(path: Path, transform) -> None:
    headers = _read_header(path)
    _write_csv(path, transform(headers), [])


def _write_csv(path: Path, headers: list[str], rows: list[list[str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerow(headers)
        writer.writerows(rows)


if __name__ == "__main__":
    unittest.main()
