/**
 * Rehype Plugin: Wire-DSL Code Previews
 * 
 * Detects HTML comments <!-- wire-preview:start --> ... <!-- wire-preview:end -->
 * around wire code blocks and adds a class for client-side injection.
 */

import { visit } from 'unist-util-visit';

export default function rehypeWirePreviewPlugin() {
  return (tree) => {
    let foundCount = 0;
    let modifiedCount = 0;
    
    // Search for HTML comment nodes that mark previewable blocks
    visit(tree, 'html', (node, index, parent) => {
      // Detect <!-- wire-preview:start -->
      if (node.value && node.value.includes('wire-preview:start')) {
        foundCount++;
        console.log(`[rehype-wire-previews] Found marker #${foundCount}`);
        // The next node could be:
        // 1. A <pre> element directly (without expressive-code wrapper)
        // 2. A <div> element from expressive-code wrapper containing <pre>
        if (parent && index + 1 < parent.children.length) {
          const nextNode = parent.children[index + 1];
          
          if (!nextNode) return;
          
          // Case 1: Direct <pre> element
          if (nextNode.type === 'element' && nextNode.tagName === 'pre') {
            if (!nextNode.properties.className) {
              nextNode.properties.className = [];
            }
            if (!nextNode.properties.className.includes('wire-preview-enabled')) {
              nextNode.properties.className.push('wire-preview-enabled');
              modifiedCount++;
              console.log(`[rehype-wire-previews] Modified <pre> directly (#${modifiedCount})`);
            }
            return;
          }
          
          // Case 2: <div> wrapper (expressive-code) - find <pre> inside
          if (nextNode.type === 'element' && nextNode.tagName === 'div') {
            // Recursively search for <pre> within the div
            const findPreElement = (element) => {
              if (!element.children) return null;
              for (const child of element.children) {
                if (child.type === 'element' && child.tagName === 'pre') {
                  return child;
                }
                if (child.type === 'element' && child.children) {
                  const result = findPreElement(child);
                  if (result) return result;
                }
              }
              return null;
            };
            
            const preElement = findPreElement(nextNode);
            if (preElement) {
              if (!preElement.properties.className) {
                preElement.properties.className = [];
              }
              if (!preElement.properties.className.includes('wire-preview-enabled')) {
                preElement.properties.className.push('wire-preview-enabled');
                modifiedCount++;
                console.log(`[rehype-wire-previews] Modified <pre> inside <div> (#${modifiedCount})`);
              }
            }
          }
        }
      }
    });
    
    if (foundCount > 0) {
      console.log(`[rehype-wire-previews] TOTAL: Found ${foundCount} markers, modified ${modifiedCount} pre blocks`);
    }
  };
}

