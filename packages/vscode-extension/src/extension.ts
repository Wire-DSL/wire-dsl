import * as vscode from 'vscode';
import { WireCompletionProvider } from './completionProvider';
import { WireHoverProvider } from './hoverProvider';
import { WireDefinitionProvider } from './definitionProvider';
import { WireReferenceProvider } from './referenceProvider';

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

  // Register Hover Provider
  const hoverProvider = new WireHoverProvider();
  const hoverDisposable = vscode.languages.registerHoverProvider('wire', hoverProvider);
  context.subscriptions.push(hoverDisposable);

  // Register Definition Provider (Go-to-Definition)
  const definitionProvider = new WireDefinitionProvider();
  const definitionDisposable = vscode.languages.registerDefinitionProvider(
    'wire',
    definitionProvider
  );
  context.subscriptions.push(definitionDisposable);

  // Register Reference Provider (Go-to-References)
  const referenceProvider = new WireReferenceProvider();
  const referenceDisposable = vscode.languages.registerReferenceProvider(
    'wire',
    referenceProvider
  );
  context.subscriptions.push(referenceDisposable);

  // Future: register WebviewViewProvider
}

export function deactivate() {
  console.log('Wire DSL extension deactivated');
}
