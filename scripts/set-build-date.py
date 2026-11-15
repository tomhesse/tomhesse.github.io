#!/usr/bin/env python3
"""Set the man page revision date in index.html.

A man page carries the date it was last revised, so the date comes from the last
commit touching the page's content rather than from the clock -- rebuilding the
same commit then yields the same page.

The result is deliberately not committed. A commit cannot know its own date, so
index.html keeps a placeholder and CI rewrites it in the checkout it is about to
deploy. This is the opposite of css/palette.css, which is generated at author
time, committed, and verified with `just check`.
"""

import argparse
import datetime
import re
import subprocess
import sys

INDEX = "public/index.html"
CONTENT = ["public"]

# Matches the footer's <time datetime="YYYY-MM-DD">Month D, YYYY</time>.
TIME_RE = re.compile(r'(<time datetime=")(\d{4}-\d{2}-\d{2})(">)([^<]*)(</time>)')


def git(*args):
    result = subprocess.run(["git", *args], capture_output=True, text=True)
    if result.returncode != 0:
        sys.exit(f"git {' '.join(args)} failed: {result.stderr.strip()}")
    return result.stdout.strip()


def content_date():
    """ISO date of the last commit touching the man page's content."""
    # This has to be checked before asking git anything, not after. In a shallow
    # clone the tip commit has no parents, so git treats it as having introduced
    # every file: a path-limited log quietly returns the tip's date instead of
    # the real revision date. It looks like a plausible answer, so refuse up
    # front rather than ship the wrong date.
    if git("rev-parse", "--is-shallow-repository") == "true":
        sys.exit(
            "refusing to derive a date from a shallow clone: path-limited history "
            "is not available, so the result would silently be the tip commit's "
            "date.\nSet `fetch-depth: 0` on the checkout step, or pass --date "
            "explicitly."
        )

    iso = git("log", "-1", "--format=%cd", "--date=short", "--", *CONTENT)
    if not iso:
        sys.exit(f"no commit found touching {', '.join(CONTENT)}")
    return iso


def human(iso):
    """2026-11-13 -> November 13, 2026 (no %-d, which is not portable)."""
    date = datetime.date.fromisoformat(iso)
    return f"{date:%B} {date.day}, {date.year}"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--date",
        metavar="YYYY-MM-DD",
        help="use this date instead of deriving one from git history",
    )
    args = parser.parse_args()

    if args.date:
        try:
            datetime.date.fromisoformat(args.date)
        except ValueError:
            sys.exit(f"--date must be YYYY-MM-DD, got {args.date!r}")
        iso = args.date
    else:
        iso = content_date()

    text = human(iso)

    with open(INDEX, encoding="utf-8") as f:
        html = f.read()

    match = TIME_RE.search(html)
    if not match:
        sys.exit(f'{INDEX}: no <time datetime="..."> element found in the footer')

    if (match.group(2), match.group(4)) == (iso, text):
        print(f"{INDEX}: already {text}")
        return 0

    updated = TIME_RE.sub(
        lambda m: m.group(1) + iso + m.group(3) + text + m.group(5), html, count=1
    )
    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(updated)

    print(f"{INDEX}: {match.group(4)} -> {text}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
