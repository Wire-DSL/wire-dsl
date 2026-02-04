/**
 * Rehype Plugin: Wire-DSL Code Previews
 * 
 * Detects HTML comments <!-- wire-preview:start --> ... <!-- wire-preview:end -->
 * alrededor de bloques de código wire y agrega clase para inyección client-side.
 * 
 * La inyección client-side se hace via script inline en astro.config.mjs
 */

import { visit } from 'unist-util-visit';

export default function rehypeWirePreviewPlugin() {
  return (tree: any) => {
    // Buscar comentarios HTML que marcan bloques previewables
    visit(tree, 'html', (node: any, index: number, parent: any) => {
      // Detectar <!-- wire-preview:start -->
      if (node.value.includes('wire-preview:start')) {
        // El siguiente nodo debe ser un <pre>
        if (index + 1 < parent.children.length) {
          const nextNode = parent.children[index + 1];
          
          // Si es un <pre>, agregar clase
          if (nextNode.type === 'element' && nextNode.tagName === 'pre') {
            if (!nextNode.properties.className) {
              nextNode.properties.className = [];
            }
            nextNode.properties.className.push('wire-preview-enabled');
          }
        }
      }
    });
  };
}

