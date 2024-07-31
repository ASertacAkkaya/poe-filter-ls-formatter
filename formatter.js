const vscode = require('vscode');

function activate(context) {
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider('poe-filter', {
            provideDocumentFormattingEdits(document) {
                const text = document.getText();
                const lines = text.split('\n');

                const edits = [];
                let shouldIndent = false;

                // Retrieve user indentation settings
                const config = vscode.workspace.getConfiguration('editor');
                const tabSize = config.get('tabSize', 4); // Default to 4 if not specified
                const useSpaces = config.get('insertSpaces', true); // Default to true if not specified
                const indentString = useSpaces ? ' '.repeat(tabSize) : '\t';

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    const trimmedLine = line.trim();

                    // Determine if we need to apply indentation based on the content of the line
                    if (trimmedLine === 'Show' || trimmedLine === 'Hide' || trimmedLine === 'Minimal') {
                        shouldIndent = true;
                    } else if (trimmedLine === 'Import' || trimmedLine === '' || !shouldIndent) {
                        shouldIndent = false;
                    }

                    // Apply necessary indentation
                    const currentIndentation = line.length - line.trimStart().length;

                    if (shouldIndent && trimmedLine !== 'Show' && trimmedLine !== 'Hide' && trimmedLine !== 'Minimal' && trimmedLine !== 'Import') {
                        // Apply indentation only if it is less than desired
                        if (currentIndentation < indentString.length) {
                            const range = new vscode.Range(i, 0, i, 0);
                            edits.push(vscode.TextEdit.insert(range.start, indentString));
                        }
                    } else if (!shouldIndent && currentIndentation > 0) {
                        // Remove extra indentation if we are not in an indented section
                        const range = new vscode.Range(i, 0, i, currentIndentation);
                        edits.push(vscode.TextEdit.delete(range));
                    }
                }

                return edits;
            }
        })
    );
}

exports.activate = activate;