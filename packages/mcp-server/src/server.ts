import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { handleDocumentation } from './tools/documentation.js';
import { handleValidate } from './tools/validate.js';
import { handleRender, initSvgRenderer } from './tools/render.js';
import { handleGetWireframeWidget, WIREFRAME_VIEWER_HTML } from './tools/html.js';

export { initSvgRenderer };

export function createServer(): McpServer {
  const server = new McpServer({ name: 'wire-dsl', version: '0.1.0' });

  server.registerTool(
    'get_documentation',
    {
      description:
        'Returns Wire DSL reference documentation. Call this before generating .wire code to learn available syntax, components, and containers.',
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
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
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      inputSchema: {
        wire_code: z.string().max(50_000).describe('Wire DSL source code to validate'),
      },
    },
    handleValidate
  );

  server.registerTool(
    'render_wire',
    {
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      description:
        'Renders Wire DSL source code into a visual wireframe. ' +
        'For Claude.ai: always use format "svg", then pass the returned SVG markup directly to your built-in Visualizer tool (show_widget) to display it inline in the chat. Do NOT use format "png" on Claude.ai — the image won\'t render. ' +
        'For other clients that support image/png tool results: use format "png". When format is "png", the tool returns an image/png content block — display it directly in your response so the user can see it. Do not describe or summarize the image; just show it. ' +
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

  server.registerResource(
    'wireframe-viewer',
    'ui://widget/wireframe-viewer',
    {
      title: 'Wire DSL Wireframe Viewer',
      description: 'Interactive HTML widget that renders Wire DSL wireframes. Loaded by MCP clients (e.g. ChatGPT) as an embedded iframe; receives screen SVG data from the render_wire_widget tool via the MCP Apps bridge.',
      mimeType: 'text/html;profile=mcp-app',
      // CSP: widget is fully self-contained — no external fetch, scripts, fonts or frames needed.
      // connectDomains / resourceDomains / frameDomains are intentionally empty.
      _meta: {
        ui: {
          csp: {
            connectDomains: [] as string[],
            resourceDomains: [] as string[],
          },
        },
      },
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.toString(),
          mimeType: 'text/html;profile=mcp-app',
          text: WIREFRAME_VIEWER_HTML,
        },
      ],
    })
  );

  server.registerTool(
    'render_wire_widget',
    {
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      description:
        'Renders Wire DSL source code as an interactive wireframe widget. ' +
        'Clients that support MCP Apps (e.g. ChatGPT) will embed the widget as an HTML iframe — the user sees the wireframe rendered directly in the chat. ' +
        'Returns SVG screen data as structuredContent and links the registered wireframe-viewer resource via _meta.ui.resourceUri. ' +
        'For showing a static image in the chat (all clients), use render_wire with format: "png" instead.',
      _meta: {
        ui: { resourceUri: 'ui://widget/wireframe-viewer' },
      },
      inputSchema: {
        wire_code: z.string().max(50_000).describe('Wire DSL source code to render'),
        screen: z
          .string()
          .optional()
          .describe('Render a specific screen by name. Omit to render all screens.'),
        device: z
          .enum(['mobile', 'tablet', 'desktop'])
          .optional()
          .describe('Viewport preset: mobile (375px), tablet (768px), desktop (1280px). Overrides the device set in the DSL style block.'),
        renderer: z
          .enum(['standard', 'skeleton', 'sketch'])
          .optional()
          .default('standard')
          .describe('"standard" (default), "skeleton" (loading placeholders), "sketch" (hand-drawn).'),
        theme: z
          .enum(['light', 'dark'])
          .optional()
          .describe('Color theme. Overrides the theme set in the DSL style block. Defaults to "light".'),
      },
    },
    handleGetWireframeWidget
  );

  return server;
}
