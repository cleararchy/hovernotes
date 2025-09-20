// The module 'vscode' contains the VS Code extensibility API
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseNotesFromMarkdownContent } from './parseNotes.js';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context) {
	// Register hover provider for all languages

	function parseNotesFromMarkdownFile(mdPath) {
		if (!fs.existsSync(mdPath)) {
			vscode.window.showWarningMessage(
				`Hover Notes: Could not find notes file at "${mdPath}". Please check settings.`
			);
			return {};
		}
		const content = fs.readFileSync(mdPath, 'utf8');
		return parseNotesFromMarkdownContent(content);
	}

	// Cache notes for quick lookup
	let notesCache = {};
	let notesFilePath;

	function refreshNotesCache() {
		// Get notes file path from configuration, default to private_notes.md in workspace root
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) return;
		const root = workspaceFolders[0].uri.fsPath;
				 const config = vscode.workspace.getConfiguration('hover-notes');
				 const notesFileSetting = config.get('notesFile', 'private_notes.md');
				 // If absolute path, use as is; if relative, join with workspace root
				 notesFilePath = path.isAbsolute(notesFileSetting)
					 ? notesFileSetting
					 : path.join(root, notesFileSetting);
				 notesCache = parseNotesFromMarkdownFile(notesFilePath);
	}

	refreshNotesCache();

	// Watch for changes to the notes file
	if (notesFilePath) {
		fs.watch(notesFilePath, { persistent: false }, () => {
			refreshNotesCache();
		});
	}

	// Listen for configuration changes to refresh cache if notesFile path changes
	const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('hover-notes.notesFile')) {
			refreshNotesCache();
		}
	});
	context.subscriptions.push(configChangeDisposable);

	const hoverProvider = vscode.languages.registerHoverProvider({ scheme: '*', language: '*' }, {
		provideHover(document, position, token) {
			// Ignore hovering in the notes file itself
			if (notesFilePath && document.uri.fsPath === notesFilePath) {
				return undefined;
			}
			const line = document.lineAt(position.line).text;
			// Look for //n#<number> or #n#<number> in the line
			const regex = /(?:\/\/|#)n#(\d+)/g;
			let match;
			let found = false;
			let noteNumber = '';
			while ((match = regex.exec(line)) !== null) {
				const start = match.index;
				const end = start + match[0].length;
				if (position.character >= start && position.character <= end) {
					found = true;
					noteNumber = match[1];
					break;
				}
			}
			if (found && noteNumber) {
				const note = notesCache[noteNumber];
				if (note) {
					const md = new vscode.MarkdownString(note);
					md.isTrusted = false;
					return new vscode.Hover(md);
				} else {
					return new vscode.Hover(`Note #${noteNumber} not found in notes file.`);
				}
			}
			return undefined;
		}
	});
	context.subscriptions.push(hoverProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Add this line to ensure default export for activate
export default activate;
