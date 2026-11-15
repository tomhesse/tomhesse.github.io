default:
    @just --list

# serve the site locally
dev:
    python3 -m http.server 8000 -d public

# regenerate public/css/palette.css from the whiskers template
build:
    whiskers templates/palette.css.tera

# verify public/css/palette.css still matches the whiskers template
check:
    whiskers templates/palette.css.tera --check public/css/palette.css

# set the footer date from the last commit touching public/
# (run by CI before deploying; the result is not committed)
set-date:
    python3 scripts/set-build-date.py
