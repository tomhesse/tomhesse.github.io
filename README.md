# homepage

Personal homepage styled as a Unix man page.

A static site: one `index.html`, two stylesheets, one small script. No
framework, no dependencies at runtime.

## Development

```sh
just dev
```

Serves the site at <http://localhost:8000>.

With [direnv](https://direnv.net) the `shell.nix` environment loads
automatically; otherwise run `nix-shell` first.

## Layout

```
public/                     everything that gets deployed, and nothing else
  index.html                the man page itself
  css/palette.css           generated -- do not edit by hand
  css/style.css             fonts, layout, status bar
  js/man-page.js            status bar + key bindings
  assets/fonts/             Roboto Mono (subset, woff2)
templates/palette.css.tera  whiskers template, generates into public/css/
```

`public/` is the entire deployable surface, so deploying is "upload this
directory" rather than an allow-list of paths that has to be kept in sync.
Everything outside it -- the template, `shell.nix`, the justfile -- stays out
of the published site by construction.

## Palette

`public/css/palette.css` is generated from `templates/palette.css.tera` with
[whiskers](https://whiskers.catppuccin.com), Catppuccin's port templating tool.
Edit the template, not the CSS.

```sh
just build   # regenerate public/css/palette.css
just check   # verify the committed CSS matches the template
```

The generated file is committed, so `just check` works as a linter in CI. To add
a color to the page, add its name to the `colors` list in the template's
frontmatter and re-run `just build`.

## Build date

The footer carries the date the page was last revised, as a man page does. It
comes from the last commit touching `public/`, so a README or CI tweak does not
count as a revision and rebuilding a commit always yields the same page.

```sh
just set-date
```

Unlike `public/css/palette.css`, the result is **not committed** -- a commit
cannot know its own date. `public/index.html` keeps a placeholder and the
deploy workflow rewrites it in the checkout it is about to publish; see the
`Set man page date` step in `.github/workflows/deploy.yml`.

`fetch-depth: 0` is not optional. In a shallow clone the tip commit has no
parents, so git treats it as having introduced every file and a path-limited
log returns the tip's date rather than the real revision date -- a wrong answer
that looks right. The script refuses to run on a shallow clone instead of
guessing. Use `--date YYYY-MM-DD` to bypass it deliberately.

## Key bindings

| Key  | Action              |
| ---- | ------------------- |
| `j`  | scroll down         |
| `k`  | scroll up           |
| `gg` | scroll to top       |
| `G`  | scroll to bottom    |
| `t`  | cycle theme         |
| `y`  | yank email          |
| `e`  | open email          |

The theme follows `prefers-color-scheme` until `t` is pressed, after which the
choice is remembered in `localStorage`.

## License

[MIT](LICENSE)
