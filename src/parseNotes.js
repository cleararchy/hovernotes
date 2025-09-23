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

export function findNoteReferenceInLine(line, position, prefix) {
    // position is where the hover occured on the line
    // Support: //, #, --, ;, REM (case-insensitive, optional space)
    let regexString = `(?:\\/\\/|#|--|;|REM\\s+)\\s*` + prefix + '\\s*[:#]\\s*(\\d+)';
    const regex = new RegExp(regexString, 'gi');
    let match;
    while ((match = regex.exec(line)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        // vscode behavior: position can be a number (character index) or an object with .character
        const char = typeof position === 'number' ? position : position.character;
        if (char >= start && char <= end) {
            return { found: true, noteNumber: match[1] };
        }
    }
    return { found: false, noteNumber: '' };
}

