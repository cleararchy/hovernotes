import { parseNotesFromMarkdownContent } from '../parseNotes.js';
import { describe, test } from 'vitest';
import assert from 'assert';

describe('Extension Test Suite', () => {
	test('parseNotesFromMarkdownContent parses all notes', () => {
		const md = `
### 1
This is a sample note. You can use **markdown** formatting here.

### 2
Another note, with multiple lines.

- Bullet 1
- Bullet 2

### 3
A third note for testing multiline and formatting.

> Blockquote example
---

Add more notes as needed.
`;
		const notes = parseNotesFromMarkdownContent(md);
		assert.strictEqual(Object.keys(notes).length, 3);
		assert.strictEqual(notes['1'].startsWith('This is a sample note'), true);
		assert.strictEqual(notes['2'].includes('Bullet 2'), true);
		assert.strictEqual(notes['3'].includes('Blockquote example'), true);
	});
});//n#1
