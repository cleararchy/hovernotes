// Pure function: parses notes from markdown content string
export function parseNotesFromMarkdownContent(content) {
    const noteRegex = /(?:^|\r?\n)###\s*(\d+)\s*(?:\r?\n)?([\s\S]*?)(?=(?:\r?\n###\s*\d+\s*)|$)/g;
    const notes = {};
    let match;
    while ((match = noteRegex.exec(content)) !== null) {
        const number = match[1];
        const body = match[2].trim();
        notes[number] = body;
    }
    return notes;
}

