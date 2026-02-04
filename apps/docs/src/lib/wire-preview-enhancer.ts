/**
 * WirePreviewEnhancer.ts
 * 
 * Client-side script that detects wire code blocks marked with class="wire-preview-enabled"
 * and injects interactive preview buttons.
 * 
 * Usage in markdown:
 * <!-- wire-preview:start -->
 * ```wire
 * ...code...
 * ```
 * <!-- wire-preview:end -->
 */

import { prepareCodeForRendering, validateWireCode } from './wire-code-wrapper';

export function initializeWirePreviewEnhancer() {
  // Find all pre.wire-preview-enabled > code.language-wire blocks
  const codeBlocks = document.querySelectorAll('pre.wire-preview-enabled > code.language-wire');

  codeBlocks.forEach((codeEl) => {
    const preEl = codeEl.parentElement;
    if (!preEl) return;

    // Extract code content
    const codeContent = extractCodeContent(codeEl);
    if (!codeContent) return;

    // Create preview button
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'wire-preview-controls';

    const button = document.createElement('button');
    button.className = 'wire-preview-btn';
    button.innerHTML = '<span>▶️</span><span>Preview</span>';
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      showWirePreview(codeContent);
    });

    buttonContainer.appendChild(button);
    preEl.parentElement?.insertBefore(buttonContainer, preEl.nextSibling);
  });
}

function extractCodeContent(codeEl: Element): string {
  let content = '';
  const walker = document.createTreeWalker(
    codeEl,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node;
  while ((node = walker.nextNode())) {
    content += node.textContent || '';
  }

  return content.trim();
}

async function showWirePreview(code: string) {
  try {
    // Validate code
    const validation = validateWireCode(code);
    if (!validation.valid) {
      showErrorModal(validation.error || 'Invalid code');
      return;
    }

    // Prepare code for rendering
    const preparedCode = prepareCodeForRendering(code);

    // Render using wire-dsl engine
    const svg = await renderWireDSL(preparedCode);

    if (svg) {
      showPreviewModal(svg);
    } else {
      showErrorModal('Failed to generate preview');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to render preview';
    showErrorModal(message);
  }
}

async function renderWireDSL(code: string): Promise<string | null> {
  try {
    // Dynamically import engine only when needed
    const { parseWireDSL, renderToSVG } = await import('@wire-dsl/engine');

    const ast = parseWireDSL(code);
    if (!ast) return null;

    const svg = renderToSVG(ast, {
      width: 800,
      height: 600,
    });

    return svg;
  } catch (err) {
    console.error('Wire render error:', err);
    throw err;
  }
}

function showPreviewModal(svg: string) {
  // Create modal
  const overlay = document.createElement('div');
  overlay.className = 'wire-preview-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'wire-preview-modal';

  const header = document.createElement('div');
  header.className = 'wire-preview-modal-header';
  header.innerHTML = `
    <h3>Wire-DSL Preview</h3>
    <button class="wire-preview-close-btn">✕</button>
  `;

  const body = document.createElement('div');
  body.className = 'wire-preview-modal-body';
  body.innerHTML = svg;

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);

  // Close handlers
  const closeBtn = header.querySelector('.wire-preview-close-btn');
  closeBtn?.addEventListener('click', () => {
    overlay.remove();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function showErrorModal(message: string) {
  // Create modal
  const overlay = document.createElement('div');
  overlay.className = 'wire-preview-modal-overlay';

  const modal = document.createElement('div');
  modal.className = 'wire-preview-modal';

  const header = document.createElement('div');
  header.className = 'wire-preview-modal-header';
  header.innerHTML = `
    <h3>Preview Error</h3>
    <button class="wire-preview-close-btn">✕</button>
  `;

  const body = document.createElement('div');
  body.className = 'wire-preview-modal-body';
  body.innerHTML = `<div class="wire-preview-error"><p>${escapeHtml(message)}</p></div>`;

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  document.body.appendChild(overlay);

  // Close handlers
  const closeBtn = header.querySelector('.wire-preview-close-btn');
  closeBtn?.addEventListener('click', () => {
    overlay.remove();
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWirePreviewEnhancer);
} else {
  initializeWirePreviewEnhancer();
}


// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWirePreviewEnhancer);
} else {
  initializeWirePreviewEnhancer();
}
