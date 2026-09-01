# PSRTN-Grade-7

# Class Notes

A small static website for organizing class notes as PDFs, browsable by subject,
with a public read-only link you can share with classmates. No server, no
database, no login — you (and anyone you trust with edit access) manage it by
editing two things: a folder of PDFs, and one text file that lists them.

## How it's structured

```
notes-site/
├── index.html      the page itself — you shouldn't need to touch this
├── styles.css       visual styling — you shouldn't need to touch this
├── script.js         loads notes.json and renders the list — you shouldn't need to touch this
├── notes.json        the list of notes (THIS is what you edit)
└── pdfs/
    ├── mathematics/
    ├── science/
    ├── social-science/
    ├── english/
    ├── kannada/
    ├── computer/
    └── other/
```

## Adding a note

1. Drop the PDF into the matching subject folder inside `pdfs/`, e.g.
   `pdfs/mathematics/fractions.pdf`.
2. Open `notes.json` and add one entry to the `"notes"` list:

```json
{
  "title": "Fractions — Addition & Subtraction",
  "subject": "mathematics",
  "date": "2026-08-31",
  "file": "pdfs/mathematics/fractions.pdf"
}
```

   - `subject` must match one of the `id` values in the `"subjects"` list at
     the top of `notes.json` (e.g. `mathematics`, `science`, `social-science`,
     `english`, `kannada`, `computer`, `other`).
   - `date` is `YYYY-MM-DD`. Notes are sorted newest first automatically.
   - `file` is the path to the PDF you just added.
3. Save, then publish the change (see **Publishing updates** below). That's
   the whole workflow — no build step, no database migration.

## Grouping notes under topics and subtopics (optional)

For a subject with a lot of notes — say Mathematics with many chapters and
exercises — you can add optional `"topic"` and `"subtopic"` fields to any
note. When a subject has notes with a `topic`, that subject's page shows
them under collapsible dropdown sections instead of one long flat list.

Example — grouping several exercises under one topic:

```json
{ "title": "Exercise 9.1", "subject": "mathematics", "topic": "Percentages", "date": "2026-09-01", "file": "pdfs/mathematics/percentages/9.1.pdf" },
{ "title": "Exercise 9.2", "subject": "mathematics", "topic": "Percentages", "date": "2026-09-01", "file": "pdfs/mathematics/percentages/9.2.pdf" },
{ "title": "Exercise 9.3", "subject": "mathematics", "topic": "Percentages", "date": "2026-09-01", "file": "pdfs/mathematics/percentages/9.3.pdf" }
```

This renders a "Percentages" dropdown containing 9.1, 9.2, and 9.3.

Add `"subtopic"` too if a topic itself has sub-groups, e.g. separate
"Class notes" and "Homework" sections within one topic:

```json
{ "title": "Exercise 9.1", "subject": "mathematics", "topic": "Percentages", "subtopic": "Homework", "date": "2026-09-01", "file": "pdfs/mathematics/percentages/9.1.pdf" }
```

Notes:
- `topic` and `subtopic` are both entirely optional — notes without them
  still show up, listed above any topic dropdowns for that subject.
- Every note with the same `topic` text (spelled exactly the same way,
  including capitalization) is grouped together — there's nothing else to
  set up, no separate list of topics to maintain.
- Dropdowns only appear when you've picked one specific subject tab. The
  "All subjects" view and search results always show a flat list, so a
  search never hides a match inside a collapsed group.

## Removing a note

Delete its entry from `notes.json`. You can leave the PDF file in the
`pdfs/` folder or delete it too — either way it stops appearing on the site
the moment its entry is gone from `notes.json`.

## Adding a new subject

Add an entry to `"subjects"` in `notes.json`, e.g.:

```json
{ "id": "art", "label": "Art" }
```

Then create a matching folder, `pdfs/art/`, for its PDFs.

## Publishing updates (GitHub Pages — recommended)

This is the easiest free way to host it with a shareable public link:

1. Create a free GitHub account if you don't have one, and create a new
   **public** repository (e.g. `class-notes`).
2. Upload this whole `notes-site` folder's contents to that repository
   (drag-and-drop on github.com works fine, or use `git push` if you're
   comfortable with it).
3. In the repository, go to **Settings → Pages**, set the source to the
   `main` branch, and save. GitHub will give you a public URL like
   `https://yourusername.github.io/class-notes/` within a minute or two.
4. Share that link with your classmates. It's read-only for them — they
   can browse and open PDFs, but can't edit anything, because there's no
   editing UI on the site itself.

From then on, **any time you edit `notes.json` or add a PDF and push the
change to GitHub, the live site updates automatically** — usually within a
minute.

### Letting a few trusted classmates help

Since there are no accounts on the site, "who can add notes" is controlled
by who can push changes to the GitHub repository, not by anything on the
website. In the repository's **Settings → Collaborators**, add their GitHub
usernames as collaborators. They'll be able to add PDFs and edit
`notes.json` the same way you do; everyone else only ever sees the
read-only published site.

## Trying it locally before publishing

Because the page loads `notes.json` with `fetch`, opening `index.html`
directly from your file system (`file://...`) won't work in most browsers —
it needs to be served over `http://`. The simplest way:

```
cd notes-site
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## A note on privacy

Since the link will be public and read-only with no login, avoid putting
anything in the notes or filenames that you wouldn't want visible to
anyone who has the link. If you'd rather it not be publicly discoverable,
GitHub Pages links aren't indexed by search engines by default, but they
also aren't private — treat the link itself as the access control.
