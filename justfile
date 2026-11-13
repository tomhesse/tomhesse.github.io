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
