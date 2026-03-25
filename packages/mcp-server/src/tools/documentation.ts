import {
  DOCS_SYNTAX,
  DOCS_COMPONENTS,
  DOCS_CONTAINERS,
  DOCS_EXAMPLES,
  DOCS_BEST_PRACTICES,
  DOCS_MCP_RENDER,
  DOCS_ALL,
} from '../docs.js';

const SECTION_MAP: Record<string, string> = {
  syntax: DOCS_SYNTAX,
  components: DOCS_COMPONENTS,
  containers: DOCS_CONTAINERS,
  theme: DOCS_SYNTAX, // design tokens live in core-syntax
  examples: DOCS_EXAMPLES,
  best_practices: DOCS_BEST_PRACTICES,
  mcp_render: DOCS_MCP_RENDER,
  all: DOCS_ALL,
};

export async function handleDocumentation({
  section = 'all',
}: {
  section?: 'syntax' | 'components' | 'containers' | 'theme' | 'examples' | 'best_practices' | 'mcp_render' | 'all';
}) {
  const content = SECTION_MAP[section] ?? DOCS_ALL;
  return {
    content: [{ type: 'text' as const, text: JSON.stringify({ content, section }) }],
  };
}
