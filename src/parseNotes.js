export function parseNotesFromMarkdownContent(content, maxNoteLines = 20) {
    const noteRegex = /(?:^|\r?\n)###\s*(\d+)\s*(?:\r?\n)?([\s\S]*?)(?=(?:\r?\n###\s*\d+\s*)|$)/g;
    const notes = {};
    let match;
    while ((match = noteRegex.exec(content)) !== null) {
        const number = match[1];
        let body = match[2].trim();
        if (maxNoteLines > 0) {
            const lines = body.split(/\r?\n/);
            if (lines.length > maxNoteLines) {
                body = lines.slice(0, maxNoteLines).join('\n') + '\n...';
            }
        }
        notes[number] = body;
    }
    return notes;
}

