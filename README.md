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
