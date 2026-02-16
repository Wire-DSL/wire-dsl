/**
 * SourceMap Usage Example
 * 
 * Demonstrates complete SourceMap workflow:
 * - Parsing with SourceMap generation
 * - Building SourceMapResolver for efficient queries
 * - Bidirectional code ↔ canvas mapping
 * - Navigation and hierarchy traversal
 * - Property-level source tracking
 * 
 * Run with: tsx examples/sourcemap-usage-example.ts
 */

import { parseWireDSLWithSourceMap } from '../packages/engine/src/parser/index';
import { generateIR } from '../packages/engine/src/ir/index';
import { calculateLayout } from '../packages/engine/src/layout';
import { renderToSVG } from '../packages/engine/src/renderer/index';
import { SourceMapResolver } from '../packages/engine/src/sourcemap/resolver';

// ============================================================================
// Example 1: Basic Parsing with SourceMap
// ============================================================================

const wireCode = `
project "Interactive Dashboard" {
  style {
    density: compact
    spacing: md
    radius: lg
  }

  screen Main {
    layout grid(columns: 12, gap: lg) {
      // Header section
      component Topbar 
        title: "Dashboard" 
        span: 12
      
      // Stats section
      component StatCard
        title: "Revenue"
        value: "$45,230"
        change: "+12.5%"
        variant: success
        span: 4
      
      component StatCard
        title: "Users"
        value: "1,234"
        change: "+5.2%"
        variant: info
        span: 4
      
      component StatCard
        title: "Orders"
        value: "856"
        change: "-2.1%"
        variant: danger
        span: 4
      
      // Content section
      layout panel(padding: lg) {
        layout stack(gap: md) {
          component Heading text: "Recent Activity"
          component Table 
            columns: "User,Action,Time" 
            rows: 8
        }
      }
    }
  }
}
`;

console.log('='.repeat(80));
console.log('EXAMPLE 1: Parse Wire DSL with SourceMap');
console.log('='.repeat(80));

// Parse with SourceMap generation
const { ast, sourceMap } = parseWireDSLWithSourceMap(wireCode, 'Main.wire');

console.log(`✓ Parsed ${sourceMap.length} nodes with source locations`);
console.log(`✓ AST root type: ${ast.type}`);
console.log(`✓ Project name: ${ast.name}`);
console.log(`✓ Screens: ${ast.screens.length}`);

// ============================================================================
// Example 2: Build Resolver for Efficient Queries
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 2: Build SourceMapResolver');
console.log('='.repeat(80));

const resolver = new SourceMapResolver(sourceMap);

const stats = resolver.getStats();
console.log(`\n📊 SourceMap Statistics:`);
console.log(`   Total nodes:     ${stats.totalNodes}`);
console.log(`   Max depth:       ${stats.maxDepth}`);
console.log(`   By type:`);
Object.entries(stats.byType)
  .sort(([, a], [, b]) => b - a)
  .forEach(([type, count]) => {
    console.log(`     - ${type.padEnd(20)} ${count}`);
  });

// ============================================================================
// Example 3: Code → Canvas (Click in Code → Highlight in Canvas)
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 3: Code → Canvas Mapping');
console.log('='.repeat(80));

// Simulate clicking at line 24 (first StatCard component)
const clickLine = 24;
const clickColumn = 8;
console.log(`\n🖱️  User clicks in editor at line ${clickLine}, column ${clickColumn}`);

const nodeAtClick = resolver.getNodeByPosition(clickLine, clickColumn);

if (nodeAtClick) {
  console.log(`\n✓ Found node: ${nodeAtClick.nodeId}`);
  console.log(`  Type:       ${nodeAtClick.type}`);
  console.log(`  Range:      line ${nodeAtClick.range.start.line}-${nodeAtClick.range.end.line}`);
  
  // Get parent for context
  const parent = resolver.getParent(nodeAtClick.nodeId);
  if (parent) {
    console.log(`  Parent:     ${parent.nodeId} (${parent.type})`);
  }
  
  // Get siblings for navigation
  const siblings = resolver.getSiblings(nodeAtClick.nodeId);
  console.log(`  Siblings:   ${siblings.length} other nodes`);
  
  // Navigate to IR and Layout to get canvas position
  const ir = generateIR(ast);
  const layout = calculateLayout(ir);
  
  // Find corresponding IR node (by type and index)
  const irNodeId = `component-statcard-${0}`; // First StatCard
  const canvasPos = layout[irNodeId];
  
  if (canvasPos) {
    console.log(`\n📍 Canvas position:`);
    console.log(`  x: ${canvasPos.x}px`);
    console.log(`  y: ${canvasPos.y}px`);
    console.log(`  width: ${canvasPos.width}px`);
    console.log(`  height: ${canvasPos.height}px`);
  }
}

// ============================================================================
// Example 4: Canvas → Code (Click in Canvas → Jump to Code)
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 4: Canvas → Code Mapping');
console.log('='.repeat(80));

// Simulate clicking on SVG element with data-node-id="component-statcard-1"
const canvasClickNodeId = 'component-statcard-1';  // Second StatCard
console.log(`\n🖱️  User clicks on canvas element: ${canvasClickNodeId}`);

// Find in SourceMap (use component type search)
const statCards = resolver.getNodesByType('component', 'StatCard');
const secondStatCard = statCards.find((node) => 
  node.range.start.line > 24  // After first StatCard (get second one)
);

if (secondStatCard) {
  console.log(`\n✓ Found in source code:`);
  console.log(`  File:       ${secondStatCard.filePath}`);
  console.log(`  Lines:      ${secondStatCard.range.start.line}-${secondStatCard.range.end.line}`);
  console.log(`  Column:     ${secondStatCard.range.start.column}`);
  console.log(`  Node ID:    ${secondStatCard.nodeId}`);
  
  // Extract code snippet
  const lines = wireCode.split('\n');
  const codeSnippet = lines
    .slice(secondStatCard.range.start.line - 1, secondStatCard.range.end.line)
    .join('\n');
  
  console.log(`\n📝 Source code:`);
  console.log(codeSnippet);
}

// ============================================================================
// Example 5: Property-Level Tracking
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 5: Property-Level Source Tracking');
console.log('='.repeat(80));

// Find first StatCard again
const firstStatCard = resolver.getNodesByType('component', 'StatCard')[0];

if (firstStatCard && firstStatCard.type === 'component') {
  console.log(`\n🔍 Inspecting StatCard properties:`);
  console.log(`   Node: ${firstStatCard.nodeId}`);
  
  // Access properties from SourceMapEntry.properties (PropertySourceMap)
  const props = firstStatCard.properties || {};
  console.log(`\n   Properties (${Object.keys(props).length}):`);
  
  Object.entries(props).forEach(([key, propMap]) => {
    console.log(`     - ${key.padEnd(15)} = "${propMap.value}"`);
  });
  
  // Show property ranges (already in PropertySourceMap)
  if (Object.keys(props).length > 0) {
    console.log(`\n   Property source ranges:`);
    Object.entries(props).forEach(([key, propMap]) => {
      console.log(`     - ${key.padEnd(15)} line ${propMap.range.start.line}:${propMap.range.start.column}`);
    });
  }
}

// ============================================================================
// Example 6: Hierarchy Navigation
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 6: Hierarchy Navigation');
console.log('='.repeat(80));

// Get project root
const project = resolver.getNodeById('project');

if (project) {
  console.log(`\n🌳 Project hierarchy:`);
  
  // Build tree view
  const printTree = (nodeId: string, indent: number = 0) => {
    const node = resolver.getNodeById(nodeId);
    if (!node) return;
    
    const prefix = '  '.repeat(indent) + (indent > 0 ? '└─ ' : '');
    const nodeType = node.type === 'component'
      ? `${node.type} (${node.componentType})`
      : node.type === 'layout'
      ? `${node.type} (${node.layoutType})`
      : node.type;
    
    console.log(`${prefix}${nodeId} [${nodeType}]`);
    
    const children = resolver.getChildren(nodeId);
    children.forEach((entry) => printTree(entry.nodeId, indent + 1));
  };
  
  printTree('project');
}

// ============================================================================
// Example 7: Complete Pipeline (End-to-End)
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 7: Complete Pipeline (Parse → IR → Layout → Render)');
console.log('='.repeat(80));

// 1. Parse
console.log('\n1️⃣  Parse Wire DSL with SourceMap');
console.log(`   Input:  ${wireCode.length} characters`);
console.log(`   Output: ${sourceMap.length} source-mapped nodes`);

// 2. Generate IR
console.log('\n2️⃣  Generate Intermediate Representation');
const ir = generateIR(ast);
console.log(`   Nodes:  ${Object.keys(ir.project.nodes).length} IR nodes`);
console.log(`   :  ${ir.project.style.density} density, ${ir.project.style.radius} radius`);

// 3. Calculate Layout
console.log('\n3️⃣  Calculate Layout Positions');
const layout = calculateLayout(ir);
console.log(`   Layout: ${Object.keys(layout).length} positioned nodes`);

// 4. Render SVG
console.log('\n4️⃣  Render to SVG');
const svg = renderToSVG(ir, layout);
console.log(`   SVG:    ${svg.length} characters`);
console.log(`   Size:   1280x720px`);

// Verify data-node-id attributes in SVG
const nodeIdMatches = svg.match(/data-node-id="[^"]+"/g);
console.log(`   Linked: ${nodeIdMatches?.length || 0} elements with data-node-id`);

// ============================================================================
// Example 8: Round-Trip Verification
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('EXAMPLE 8: Round-Trip Verification (Code → Canvas → Code)');
console.log('='.repeat(80));

// Pick a component from SourceMap
const testComponent = statCards[0];

console.log(`\n🔄 Round-trip test:`);
console.log(`   1. Start:        Line ${testComponent.range.start.line} (${testComponent.nodeId})`);

// Component info from SourceMapEntry
console.log(`   2. SourceMap:    type=${testComponent.type}, componentType=${testComponent.componentType}`);

// Find in IR (by matching component type and position)
const irComponents = Object.entries(ir.project.nodes)
  .filter(([, node]) => node.kind === 'component' && node.componentType === 'StatCard');
console.log(`   3. IR Nodes:     ${irComponents.length} StatCard components found`);

// Find in Layout
if (irComponents.length > 0) {
  const [irId, _] = irComponents[0];
  const layoutPos = layout[irId];
  console.log(`   4. Layout:       x=${layoutPos?.x}, y=${layoutPos?.y}`);
  
  // Check SVG rendering
  const hasDataNodeId = svg.includes(`data-node-id="${irId}"`);
  console.log(`   5. SVG:          ${hasDataNodeId ? '✓' : '✗'} data-node-id="${irId}"`);
  
  // Back to source via SourceMap
  const backToSource = resolver.getNodeByPosition(
    testComponent.range.start.line,
    testComponent.range.start.column
  );
  console.log(`   6. Back to code: Line ${backToSource?.range.start.line} (${backToSource?.nodeId})`);
  
  const roundTripSuccess = backToSource?.nodeId === testComponent.nodeId;
  console.log(`\n   Result: ${roundTripSuccess ? '✅ Round-trip successful!' : '❌ Round-trip failed'}`);
}

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));

console.log(`
✅ Demonstrated SourceMap capabilities:
   • Parse Wire DSL with source location tracking
   • Build efficient SourceMapResolver for O(1) queries
   • Code → Canvas mapping (editor click → canvas highlight)
   • Canvas → Code mapping (canvas click → editor jump)
   • Property-level source tracking
   • Hierarchy navigation (parents, children, siblings)
   • Complete pipeline integration (Parse → IR → Layout → Render)
   • Round-trip verification (bidirectional mapping)

📦 Key Components:
   • parseWireDSLWithSourceMap() - Parser with SourceMap generation
   • SourceMapResolver            - Efficient query interface
   • PropertySourceMap            - Property-level tracking (optional)
   • data-node-id attributes      - SVG elements linked to source

🎯 Use Cases:
   • Visual editors (Wire Studio)
   • Code navigation (click canvas → jump to code)
   • Error reporting with precise locations
   • Component inspection and manipulation
   • Live preview with bidirectional selection

📚 Documentation:
   • SourceMap API:        packages/engine/src/sourcemap/README.md
   • Integration Guide:    docs/SOURCEMAP-INTEGRATION.md
   • Implementation Notes: packages/engine/SOURCEMAP-IMPLEMENTATION.md
`);

console.log('='.repeat(80));
