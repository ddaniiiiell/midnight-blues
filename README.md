# Midnight Blues

A soft-purple, interactive night sky made as a tiny universe of memories and
letters.

## Run locally

This first version is dependency-free. Open `index.html` directly, or serve the
folder locally:

```bash
python3 -m http.server 4173
```

Then visit <http://localhost:4173>.

## Customize

- Add or edit memories and letters in the `stories` object at the top of
  `script.js`. Each non-final entry is rendered as a star automatically, and
  the constellation recalculates its five-point-star layout for the new count.
- Replace the starter `returnMessages` and `midnightMessages` collections in
  `script.js` with personal notes.
- Replace the temporary photo area in `index.html` when real memories are ready.
- Edit the purple palette through the custom properties at the top of
  `styles.css`.

Opened stories, returning visits, and non-repeating welcome-back messages are
stored only in the visitor's browser. Midnight mode follows the visitor's local
time and is active from 12:00 a.m. through 5:59 a.m.

To review special states without waiting, open the site with `?preview=all`.
Use `?preview=midnight` or `?preview=returning` to review either state alone.
