import { describe, expect, it } from 'vitest';
import { DEVICE_PRESETS, isValidDevice, resolveDevicePreset } from './device-presets';

describe('device presets', () => {
  it('should expose tablet and print presets with minHeight', () => {
    expect(DEVICE_PRESETS.tablet).toBeDefined();
    expect(DEVICE_PRESETS.tablet.width).toBe(768);
    expect(DEVICE_PRESETS.tablet.minHeight).toBe(1024);

    expect(DEVICE_PRESETS.print).toBeDefined();
    expect(DEVICE_PRESETS.print.width).toBe(794);
    expect(DEVICE_PRESETS.print.minHeight).toBe(1123);
  });

  it('should resolve preset dimensions case-insensitively', () => {
    expect(resolveDevicePreset('TaBlEt')).toEqual({ width: 768, minHeight: 1024 });
    expect(resolveDevicePreset('PRINT')).toEqual({ width: 794, minHeight: 1123 });
  });

  it('should validate known presets and reject unknown aliases', () => {
    expect(isValidDevice('tablet')).toBe(true);
    expect(isValidDevice('print')).toBe(true);
    expect(isValidDevice('a4')).toBe(false);
  });

  it('should fallback to desktop dimensions for unknown device', () => {
    expect(resolveDevicePreset('unknown')).toEqual({ width: 1280, minHeight: 720 });
    expect(isValidDevice('unknown')).toBe(false);
  });
});
