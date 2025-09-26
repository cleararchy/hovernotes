import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { parseNotesFromMarkdownContent, findNoteReferenceInLine } from './parseNotes.js';

export function activate(context) {

	function parseNotesFile(mdPath, maxNoteLines) {
		if (!fs.existsSync(mdPath)) {
			vscode.window.showWarningMessage(
				`CrossRef Notes: Could not find notes file at "${mdPath}". Please check settings.`
			);
			return {};
		}
		const content = fs.readFileSync(mdPath, 'utf8');
		return parseNotesFromMarkdownContent(content, maxNoteLines);
	}

	let notesCache = {};
	let notesFilePath;

	function refreshNotesCache() {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) return;
		const root = workspaceFolders[0].uri.fsPath;
		const config = vscode.workspace.getConfiguration('crossref-notes');
		const notesFileSetting = config.get('notesFile');
		const maxNoteLines = config.get('maxNoteLines');
		// If absolute path, use as is; if relative, join with workspace root
		notesFilePath = path.isAbsolute(notesFileSetting)
			? notesFileSetting
			: path.join(root, notesFileSetting);
		notesCache = parseNotesFile(notesFilePath, maxNoteLines);
		if (Object.keys(notesCache).length > 0) vscode.window.showInformationMessage(
			`CrossRef Notes:\nLoaded notes file at:\n${notesFilePath}`
		);
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
		if (e.affectsConfiguration('crossref-notes.notesFile')) {
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
			// Build regex from user-configurable prefix, match ':' or '#' after prefix, then optional whitespace and a number
			const config = vscode.workspace.getConfiguration('crossref-notes');
			let prefix = config.get('crossRefPrefix');
			// Validate prefix: must be a string of alphabets only
			if (!/^[A-Za-z]+$/.test(prefix)) {
				vscode.window.showWarningMessage(
					`CrossRef Notes: The crossRefPrefix setting ('${prefix}') is invalid. It must be a string of letters only (A-Z, a-z).`
				);
				return undefined;
			}
			const { found, noteNumber } = findNoteReferenceInLine(line, position, prefix);
			if (found && noteNumber) {
				const note = notesCache[noteNumber];
				if (note) {
					const md = new vscode.MarkdownString(note);
					md.isTrusted = false;
					return new vscode.Hover(md);
				} else {
					return new vscode.Hover(`Note #${noteNumber} not found in notes file: ${notesFilePath}`);
				}
			}
			return undefined;
		}
	});
	context.subscriptions.push(hoverProvider);
}

export function deactivate() {}

export default activate;