import { parseNotesFromMarkdownContent, findNoteReferenceInLine } from '../parseNotes.js';
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

	test('findNoteReferenceInLine finds note reference with default prefix', () => {
		const line = '//n:10 This is a note reference';
		const result = findNoteReferenceInLine(line, 0, 'n');
		assert.deepStrictEqual(result, { found: true, noteNumber: '10' });
	});

	test('findNoteReferenceInLine finds note reference with any prefix', () => {
		const line = '//see#10 This is a note reference';
		const result = findNoteReferenceInLine(line, 0, 'see');
		assert.deepStrictEqual(result, { found: true, noteNumber: '10' });
	});
	
	test('findNoteReferenceInLine returns not found if no match', () => {
		const line = '//n:#10 This is a note reference';
		const result = findNoteReferenceInLine(line, 0, 'x');
		assert.deepStrictEqual(result, { found: false, noteNumber: '' });
	});

	test('findNoteReferenceInLine works with different comment styles', () => {
		const line = '#n:5 and --n#6 and ;n:7';
		assert.deepStrictEqual(findNoteReferenceInLine(line, 0, 'n'), { found: true, noteNumber: '5' });
		assert.deepStrictEqual(findNoteReferenceInLine(line, 10, 'n'), { found: true, noteNumber: '6' });
		assert.deepStrictEqual(findNoteReferenceInLine(line, 20, 'n'), { found: true, noteNumber: '7' });
	});

	test('findNoteReferenceInLine works with REM comments (batch files)', () => {
		const line = 'REM n:12 this is a batch note';
		const result = findNoteReferenceInLine(line, 0, 'n');
		assert.deepStrictEqual(result, { found: true, noteNumber: '12' });

		const line2 = 'rem see#99 another batch note';
		const result2 = findNoteReferenceInLine(line2, 0, 'see');
		assert.deepStrictEqual(result2, { found: true, noteNumber: '99' });
	});

	test('findNoteReferenceInLine works with HTML and CSS single-line comments', () => {
		const htmlLine = '<!-- n:88 this is an html comment -->';
		const cssLine = '/* n:77 this is a css comment */';
		assert.deepStrictEqual(findNoteReferenceInLine(htmlLine, 0, 'n'), { found: true, noteNumber: '88' });
		assert.deepStrictEqual(findNoteReferenceInLine(cssLine, 0, 'n'), { found: true, noteNumber: '77' });
	});

});