// Global wire preview initialization script
// Added to all pages automatically

import { initializeWirePreviewEnhancer } from './lib/wire-preview-enhancer';

export function initializeWirePreview() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWirePreviewEnhancer);
  } else {
    initializeWirePreviewEnhancer();
  }

  // Re-initialize on Astro page transitions
  document.addEventListener('astro:after-swap', initializeWirePreviewEnhancer);
}

// Auto-initialize
initializeWirePreview();
