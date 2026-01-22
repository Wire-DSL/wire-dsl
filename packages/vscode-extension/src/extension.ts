import * as vscode from 'vscode';
import { WireCompletionProvider } from './completionProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Wire DSL extension activated');

  // Register Completion Provider
  const completionProvider = new WireCompletionProvider();
  const completionDisposable = vscode.languages.registerCompletionItemProvider(
    'wire',
    completionProvider,
    ' ', // Trigger on space
    '(', // Trigger on opening paren
    ':', // Trigger on colon
    '{' // Trigger on opening brace
  );
  context.subscriptions.push(completionDisposable);

  // Future: register HoverProvider
  // Future: register WebviewViewProvider
}

export function deactivate() {
  console.log('Wire DSL extension deactivated');
}
