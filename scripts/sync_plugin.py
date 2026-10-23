"""Generate or verify the plugin skill bundle from the original skill files."""

import argparse
from pathlib import Path
import shutil


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Check without writing files.")
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    bundle = root / "skills" / "character-profile"
    sources = [root / "SKILL.md"]
    for name in ("agents", "references"):
        directory = root / name
        if not directory.is_dir() or directory.is_symlink():
            parser.error(f"Missing or symlinked source directory: {directory}")
        entries = list(directory.rglob("*"))
        if any(path.is_symlink() for path in entries):
            parser.error(f"Symlinks are not supported in {directory}")
        sources.extend(path for path in entries if path.is_file())
    if not sources[0].is_file() or sources[0].is_symlink():
        parser.error("Missing or symlinked source SKILL.md")
    if (root / "skills").is_symlink() or bundle.is_symlink():
        parser.error("The generated bundle directory must not be a symlink")
    existing = list(bundle.rglob("*")) if bundle.exists() else []
    if any(path.is_symlink() for path in existing):
        parser.error("The generated bundle must not contain symlinks")
    expected = {path.relative_to(root): path for path in sources}
    actual = {path.relative_to(bundle): path for path in existing if path.is_file()}
    changed = [
        relative for relative, source in expected.items()
        if relative not in actual or source.read_bytes() != actual[relative].read_bytes()
    ]
    stale = sorted(actual.keys() - expected.keys())
    if args.check:
        if changed or stale:
            for relative in sorted(changed):
                print(f"Missing or different: {relative.as_posix()}")
            for relative in stale:
                print(f"Unexpected file: {relative.as_posix()}")
            print("Run python scripts/sync_plugin.py to refresh the bundle.")
            return 1
    else:
        for relative in changed:
            destination = bundle / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(expected[relative], destination)
        for relative in stale:
            destination = actual[relative].resolve()
            if not destination.is_relative_to(bundle.resolve()):
                parser.error(f"Unexpected bundle path: {destination}")
            destination.unlink()
    print(f"Plugin bundle matches all {len(expected)} original skill files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
