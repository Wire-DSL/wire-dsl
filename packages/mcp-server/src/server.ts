import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { handleDocumentation } from './tools/documentation.js';
import { handleValidate } from './tools/validate.js';
import { handleRender, initSvgRenderer } from './tools/render.js';

export { initSvgRenderer };

export function createServer(): McpServer {
  const server = new McpServer({ name: 'wire-dsl', version: '0.1.0' });

  server.registerTool(
    'get_documentation',
    {
      description:
        'Returns Wire DSL reference documentation. Call this before generating .wire code to learn available syntax, components, and containers.',
      inputSchema: {
        section: z
          .enum(['syntax', 'components', 'containers', 'theme', 'examples', 'best_practices', 'mcp_render', 'all'])
          .optional()
          .default('all')
          .describe(
            'Documentation section: syntax | components | containers | theme | examples | best_practices | mcp_render | all. ' +
            'Use "mcp_render" to get the render_wire tool parameter reference (format, device, renderer, theme).'
          ),
      },
    },
    handleDocumentation
  );

  server.registerTool(
    'validate_wire',
    {
      description: 'Validates Wire DSL source code. Returns errors with line/column positions.',
      inputSchema: {
        wire_code: z.string().max(50_000).describe('Wire DSL source code to validate'),
      },
    },
    handleValidate
  );

  server.registerTool(
    'render_wire',
    {
      description:
        'Renders Wire DSL source code into a visual wireframe. ' +
        'When format is "png", the tool returns an image/png content block — display it directly in your response so the user can see it. ' +
        'Do not describe or summarize the image; just show it. ' +
        'Use format: "svg" only when you need to inspect or reason about the markup (returns raw SVG text, not visible to the user). ' +
        'Always use format: "png" when the goal is to show the wireframe to the user. ' +
        'Use "device" to set the viewport (mobile/tablet/desktop). ' +
        'Use "renderer" to change the visual style: standard (default), skeleton (loading placeholders), or sketch (hand-drawn look). ' +
        'Use "theme" to switch between light and dark mode; overrides the DSL style block.',
      inputSchema: {
        wire_code: z.string().max(50_000).describe('Wire DSL source code to render'),
        screen: z
          .string()
          .optional()
          .describe('Render a specific screen by name. Omit to render all screens.'),
        format: z
          .enum(['svg', 'png'])
          .optional()
          .default('svg')
          .describe(
            '"png" returns a base64 image visible to the user in the chat. ' +
            '"svg" returns raw SVG markup as text for inspection or further processing.'
          ),
        device: z
          .enum(['mobile', 'tablet', 'desktop'])
          .optional()
          .describe(
            'Viewport preset: mobile (375px), tablet (768px), desktop (1280px). ' +
            'Overrides the device set in the DSL style block.'
          ),
        renderer: z
          .enum(['standard', 'skeleton', 'sketch'])
          .optional()
          .default('standard')
          .describe(
            '"standard" — normal wireframe render (default). ' +
            '"skeleton" — loading-state style with grey placeholder blocks. ' +
            '"sketch" — hand-drawn appearance with rougher strokes.'
          ),
        theme: z
          .enum(['light', 'dark'])
          .optional()
          .describe(
            'Color theme. Overrides the theme set in the DSL style block. ' +
            'Defaults to "light" if not set in either place.'
          ),
      },
    },
    handleRender
  );

  return server;
}
