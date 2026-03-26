#!/usr/bin/env node
import { createServer, initSvgRenderer } from './server.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createServer as createHttpServer } from 'node:http';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

// Auto-init WASM rasterizer for Node.js — resolves the .wasm file from the
// installed package so it works regardless of where the package is installed.
const require = createRequire(import.meta.url);
const wasmPath = require.resolve('@resvg/resvg-wasm/index_bg.wasm');
await initSvgRenderer(readFileSync(wasmPath));

const useHttp = process.argv.includes('--http');
const port = parseInt(process.env['PORT'] ?? '3000', 10);

if (useHttp) {
  const CORS_HEADERS: Record<string, string> = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, MCP-Protocol-Version',
  };

  const httpServer = createHttpServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
      res.end();
      return;
    }
    if (req.url === '/mcp' && req.method === 'POST') {
      // Stateless mode: new transport + server instance per request
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      const mcpServer = createServer();
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res);
      await mcpServer.close();
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ name: 'wire-dsl-mcp', version: '0.1.0' }));
  });

  httpServer.listen(port, () => {
    console.error(`[wire-dsl-mcp] HTTP server listening on http://localhost:${port}/mcp`);
  });
} else {
  const transport = new StdioServerTransport();
  await createServer().connect(transport);
  console.error('[wire-dsl-mcp] Running on stdio');
}
