#!/usr/bin/env python3
"""
Create an EchoIQ v3 daily slate folder from the durable repo template.

Usage:
    python3 echoiq_v3/scripts/create_slate.py 2026-05-05
    python3 echoiq_v3/scripts/create_slate.py --dry-run 2026-05-05
    python3 echoiq_v3/scripts/create_slate.py --force 2026-05-05
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path


DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

REPO_ROOT = Path(__file__).resolve().parents[2]

FOLDERS = [
    "00_inputs",
    "01_raw_research",
    "02_candidates",
    "03_verification",
    "04_final_card",
    "05_postgame",
    "06_archive",
]

TEMPLATE_MAPPING = {
    "00_inputs": [
        "external_public_predictions.csv",
        "source_compliance.csv",
    ],
    "01_raw_research": [
        "raw_research_board.csv",
        "external_public_predictions.csv",
        "weather_park_board.csv",
        "pitcher_vulnerability_board.csv",
        "lineup_cluster_board.csv",
    ],
    "02_candidates": [
        "candidate_board.csv",
    ],
    "03_verification": [
        "verification_board.csv",
        "source_compliance.csv",
        "pass_avoid.csv",
    ],
    "04_final_card": [
        "official_card.csv",
        "lottery_card.csv",
        "conditional_card.csv",
        "watchlist.csv",
        "final_card_report.md",
    ],
    "05_postgame": [
        "postgame_grade.csv",
        "error_ledger.csv",
        "model_lessons.csv",
        "postgame_report.md",
    ],
    "06_archive": [],
}

GENERATED_READMES = {
    "00_inputs/INPUTS_README.md": """# Inputs

Use this folder for date scope, user instructions, manual odds, source notes, and any handoff material that defines the slate.

Do not store secrets or API keys here.
""",
    "06_archive/README.md": """# Archive

Use this folder for stale, superseded, or pre-verification artifacts that should be preserved but not treated as current slate truth.
""",
}


@dataclass
class SlateCreateResult:
    slate_date: str
    slate_dir: Path
    dry_run: bool
    force: bool
    created_folders: list[Path] = field(default_factory=list)
    copied_templates: list[tuple[Path, Path]] = field(default_factory=list)
    generated_files: list[Path] = field(default_factory=list)
    skipped_files: list[Path] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def validate_date(value: str) -> str:
    if not DATE_RE.match(value):
        raise argparse.ArgumentTypeError("date must use YYYY-MM-DD format")
    try:
        datetime.strptime(value, "%Y-%m-%d")
    except ValueError as exc:
        raise argparse.ArgumentTypeError(f"invalid calendar date: {value}") from exc
    return value


def create_slate(slate_date: str, *, repo_root: Path = REPO_ROOT, dry_run: bool = False, force: bool = False) -> SlateCreateResult:
    repo_root = Path(repo_root)
    slate_dir = repo_root / "slates" / slate_date
    template_dir = repo_root / "slates" / "_template"
    artifact_template_dir = repo_root / "echoiq_v3" / "templates"

    result = SlateCreateResult(
        slate_date=slate_date,
        slate_dir=slate_dir,
        dry_run=dry_run,
        force=force,
    )

    if not template_dir.exists():
        raise FileNotFoundError(f"Slate template folder not found: {template_dir}")

    if not artifact_template_dir.exists():
        raise FileNotFoundError(f"EchoIQ template folder not found: {artifact_template_dir}")

    if slate_dir.exists() and not force:
        raise FileExistsError(f"Slate folder already exists: {slate_dir}. Use --force to copy into it.")

    _prepare_folders(result, template_dir, slate_dir, dry_run=dry_run)
    _copy_templates(result, artifact_template_dir, slate_dir, dry_run=dry_run, force=force)
    _write_generated_readmes(result, slate_dir, dry_run=dry_run, force=force)
    return result


def _prepare_folders(result: SlateCreateResult, template_dir: Path, slate_dir: Path, *, dry_run: bool) -> None:
    for folder in FOLDERS:
        destination = slate_dir / folder
        result.created_folders.append(destination)
        if not dry_run:
            destination.mkdir(parents=True, exist_ok=True)

    template_readme = template_dir / "README.md"
    destination_readme = slate_dir / "README.md"
    if template_readme.exists():
        result.copied_templates.append((template_readme, destination_readme))
        if not dry_run:
            slate_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(template_readme, destination_readme)
    else:
        result.warnings.append(f"Missing optional slate template README: {template_readme}")


def _copy_templates(result: SlateCreateResult, template_dir: Path, slate_dir: Path, *, dry_run: bool, force: bool) -> None:
    for folder, filenames in TEMPLATE_MAPPING.items():
        for filename in filenames:
            source = template_dir / filename
            destination = slate_dir / folder / filename
            if not source.exists():
                result.warnings.append(f"Missing template, skipped: {source}")
                continue
            if destination.exists() and not force:
                result.skipped_files.append(destination)
                continue
            result.copied_templates.append((source, destination))
            if not dry_run:
                destination.parent.mkdir(parents=True, exist_ok=True)
                shutil.copy2(source, destination)


def _write_generated_readmes(result: SlateCreateResult, slate_dir: Path, *, dry_run: bool, force: bool) -> None:
    for relative_path, content in GENERATED_READMES.items():
        destination = slate_dir / relative_path
        if destination.exists() and not force:
            result.skipped_files.append(destination)
            continue
        result.generated_files.append(destination)
        if not dry_run:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(content, encoding="utf-8")


def print_summary(result: SlateCreateResult) -> None:
    prefix = "DRY RUN - " if result.dry_run else ""
    print(f"{prefix}EchoIQ v3 slate initializer")
    print(f"Slate date: {result.slate_date}")
    print(f"Slate folder: {result.slate_dir}")
    print(f"Force: {result.force}")
    print("")

    print("Created folders:" if not result.dry_run else "Folders to create:")
    for folder in result.created_folders:
        print(f"- {folder}")
    if not result.created_folders:
        print("- none")
    print("")

    print("Copied templates:" if not result.dry_run else "Templates to copy:")
    for source, destination in result.copied_templates:
        print(f"- {source.name} -> {destination.relative_to(result.slate_dir)}")
    if not result.copied_templates:
        print("- none")
    print("")

    print("Generated helper files:" if not result.dry_run else "Helper files to generate:")
    for destination in result.generated_files:
        print(f"- {destination.relative_to(result.slate_dir)}")
    if not result.generated_files:
        print("- none")
    print("")

    print("Skipped files:")
    for path in result.skipped_files:
        print(f"- {path}")
    if not result.skipped_files:
        print("- none")
    print("")

    print("Warnings:")
    for warning in result.warnings:
        print(f"- {warning}")
    if not result.warnings:
        print("- none")


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Create a new EchoIQ v3 daily slate folder.")
    parser.add_argument("slate_date", type=validate_date, help="Slate date in YYYY-MM-DD format.")
    parser.add_argument("--force", action="store_true", help="Copy into an existing slate folder and overwrite mapped files.")
    parser.add_argument("--dry-run", action="store_true", help="Print planned changes without writing files.")
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(sys.argv[1:] if argv is None else argv)
    try:
        result = create_slate(args.slate_date, dry_run=args.dry_run, force=args.force)
    except (FileExistsError, FileNotFoundError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1

    print_summary(result)
    return 0


if __name__ == "__main__":
    sys.exit(main())
