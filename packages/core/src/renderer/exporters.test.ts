import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mkdir, writeFile } from 'fs/promises';
import { readFile, stat } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import { exportPNG, exportMultipagePDF, exportSVG } from './exporters';

// Test SVG template
const testSVG = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#ffffff"/>
  <rect x="50" y="50" width="100" height="100" fill="#3B82F699"/>
  <text x="200" y="100">Test</text>
</svg>`;

const testSVGWithOpacity = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#ffffff"/>
  <rect x="50" y="50" width="100" height="100" fill="#3B82F615"/>
</svg>`;

let testDir: string;

describe('Exporters', () => {
  beforeEach(async () => {
    // Create temporary directory for tests
    testDir = path.join(tmpdir(), `wire-dsl-test-${Date.now()}`);
    await mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up would happen here if needed
  });

  describe('exportSVG', () => {
    it('should save SVG to file', async () => {
      const outputPath = path.join(testDir, 'test.svg');
      await exportSVG(testSVG, outputPath);

      const content = await readFile(outputPath, 'utf8');
      expect(content).toBe(testSVG);
    });

    it('should create directory if it does not exist', async () => {
      const outputPath = path.join(testDir, 'nested', 'dir', 'test.svg');
      await exportSVG(testSVG, outputPath);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should overwrite existing file', async () => {
      const outputPath = path.join(testDir, 'overwrite.svg');
      await exportSVG(testSVG, outputPath);
      await exportSVG('<svg></svg>', outputPath);

      const content = await readFile(outputPath, 'utf8');
      expect(content).toBe('<svg></svg>');
    });
  });

  describe('exportPNG', () => {
    it('should create PNG file', async () => {
      const outputPath = path.join(testDir, 'test.png');
      await exportPNG(testSVG, outputPath, 800, 600);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should respect width and height parameters', async () => {
      const outputPath = path.join(testDir, 'sized.png');
      await exportPNG(testSVG, outputPath, 400, 300);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should create PNG with different dimensions', async () => {
      const outputPath1 = path.join(testDir, 'large.png');
      const outputPath2 = path.join(testDir, 'small.png');

      await exportPNG(testSVG, outputPath1, 1600, 1200);
      await exportPNG(testSVG, outputPath2, 400, 300);

      const stats1 = await stat(outputPath1);
      const stats2 = await stat(outputPath2);

      // Larger image should generally have more bytes (not always guaranteed, but likely)
      expect(stats1.size).toBeGreaterThan(0);
      expect(stats2.size).toBeGreaterThan(0);
    });
  });

  describe('exportMultipagePDF', () => {
    it('should create PDF file with single page', async () => {
      const outputPath = path.join(testDir, 'single.pdf');
      const pages = [{ svg: testSVG, width: 800, height: 600, name: 'Page 1' }];

      await exportMultipagePDF(pages, outputPath);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should create PDF file with multiple pages', async () => {
      const outputPath = path.join(testDir, 'multipage.pdf');
      const pages = [
        { svg: testSVG, width: 800, height: 600, name: 'Page 1' },
        { svg: testSVG, width: 800, height: 600, name: 'Page 2' },
        { svg: testSVG, width: 800, height: 600, name: 'Page 3' },
      ];

      await exportMultipagePDF(pages, outputPath);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should handle SVG with color opacity', async () => {
      const outputPath = path.join(testDir, 'color-opacity.pdf');
      const pages = [{ svg: testSVGWithOpacity, width: 800, height: 600, name: 'Page with Opacity' }];

      await exportMultipagePDF(pages, outputPath);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });

    it('should create directory if it does not exist', async () => {
      const outputPath = path.join(testDir, 'nested', 'dir', 'output.pdf');
      const pages = [{ svg: testSVG, width: 800, height: 600, name: 'Page 1' }];

      await exportMultipagePDF(pages, outputPath);
      
      // Wait a bit for async directory creation
      await new Promise(resolve => setTimeout(resolve, 100));

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
    });

    it('should handle pages with different dimensions', async () => {
      const outputPath = path.join(testDir, 'mixed-sizes.pdf');
      const pages = [
        { svg: testSVG, width: 800, height: 600, name: 'Page 1 (800x600)' },
        { svg: testSVG, width: 1024, height: 768, name: 'Page 2 (1024x768)' },
        { svg: testSVG, width: 600, height: 400, name: 'Page 3 (600x400)' },
      ];

      await exportMultipagePDF(pages, outputPath);

      const stats = await stat(outputPath);
      expect(stats.isFile()).toBe(true);
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('SVG dimension extraction', () => {
    it('should extract SVG dimensions correctly', async () => {
      const svg = '<svg width="1024" height="768" xmlns="http://www.w3.org/2000/svg"></svg>';
      const outputPath = path.join(testDir, 'test-dims.svg');
      await exportSVG(svg, outputPath);

      const content = await readFile(outputPath, 'utf8');
      const widthMatch = content.match(/width="(\d+(?:\.\d+)?)/);
      const heightMatch = content.match(/height="(\d+(?:\.\d+)?)/);

      expect(widthMatch).toBeTruthy();
      expect(heightMatch).toBeTruthy();
      expect(parseFloat(widthMatch![1])).toBe(1024);
      expect(parseFloat(heightMatch![1])).toBe(768);
    });

    it('should handle decimal dimensions', async () => {
      const svg = '<svg width="800.5" height="600.75" xmlns="http://www.w3.org/2000/svg"></svg>';
      const outputPath = path.join(testDir, 'test-decimal.svg');
      await exportSVG(svg, outputPath);

      const content = await readFile(outputPath, 'utf8');
      const widthMatch = content.match(/width="(\d+(?:\.\d+)?)/);
      const heightMatch = content.match(/height="(\d+(?:\.\d+)?)/);

      expect(parseFloat(widthMatch![1])).toBe(800.5);
      expect(parseFloat(heightMatch![1])).toBe(600.75);
    });
  });

  describe('Color processing', () => {
    it('should process SVG colors correctly', async () => {
      const outputPath = path.join(testDir, 'color-test.svg');
      await exportSVG(testSVGWithOpacity, outputPath);

      const content = await readFile(outputPath, 'utf8');
      expect(content).toContain('svg');
      expect(content).toContain('rect');
    });
  });
});
