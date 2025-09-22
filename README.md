# README

It is a good practice to cross-reference relevant notes in your source code (e.g. like this: // note: 123). This extension pop-ups the note (in markdown format) as you hover over the cross-ref. I developed it to keep track code improvements (stuff that I wasn't aware of) suggested by AI.


## Requirements

Keep all your notes in one markdown file formatted as below. They may be cross-reference in any code file as `//note#<note-number>` or `# note:<note-number>` depending on the syntax of a single-line comment in your language.

```markdown
### 1
Note 1

### 2
Note 2.
Multiline.

### 3
Keep going.
```

Once you start cross-referncing notes in your code, you might want to include a directive like this in your CONTRIBUTING.md or equivalent file so that AI assistants don't remove your cross-refs.

```markdown
## Code Editing Guidelines

- **Do not remove or modify any comments that match note reference patterns (e.g., `// n#2`, `// note: 3`) when editing code.**
```

## Extension Settings

1. Path to your notes file.
2. The cross-ref prefix you want to use. e.g. n, note, see, etc.
3. Line limit

## Known Issues

- Currently limited to languages that support `//` or `#` for a single line comment
- Not sure about images in the notes

## Release Notes

Last Updated: Sept 2025

### 1.0.0

Initial release

---