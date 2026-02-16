/**
 * Device viewport presets for multi-device wireframe rendering
 *
 * Defines standard viewport widths and minimum heights for different device
 * categories. Final render height remains dynamic and grows with content.
 */

export interface DevicePreset {
  name: string;
  width: number;
  minHeight: number;
  category: 'mobile' | 'desktop' | 'tablet' | 'print';
  description: string;
}

/**
 * Standard device viewport presets
 *
 * `minHeight` is used as the baseline viewport height. Renderers still
 * expand dynamically when content exceeds this value.
 */
export const DEVICE_PRESETS: Record<string, DevicePreset> = {
  mobile: {
    name: 'iPhone SE',
    width: 375,
    minHeight: 812,
    category: 'mobile',
    description: 'iPhone SE (baseline mobile viewport)',
  },
  tablet: {
    name: 'Tablet Portrait',
    width: 768,
    minHeight: 1024,
    category: 'tablet',
    description: 'Tablet portrait viewport baseline',
  },
  desktop: {
    name: 'Desktop HD',
    width: 1280,
    minHeight: 720,
    category: 'desktop',
    description: 'Standard desktop viewport',
  },
  print: {
    name: 'Print A4',
    width: 794,
    minHeight: 1123,
    category: 'print',
    description: 'A4 portrait at 96 DPI',
  },
  a4: {
    name: 'Print A4',
    width: 794,
    minHeight: 1123,
    category: 'print',
    description: 'A4 alias at 96 DPI',
  },
};

/**
 * Resolve device preset name to viewport dimensions
 *
 * @param device - Device preset name (case-insensitive)
 * @returns Viewport width and minimum height in pixels
 */
export function resolveDevicePreset(device: string): { width: number; minHeight: number } {
  const preset = DEVICE_PRESETS[device.toLowerCase()];
  if (!preset) {
    // Fallback to desktop default for unknown devices
    return { width: 1280, minHeight: 720 };
  }
  return { width: preset.width, minHeight: preset.minHeight };
}

/**
 * Check if a device preset name is valid
 *
 * @param device - Device preset name to validate
 * @returns True if device preset exists
 */
export function isValidDevice(device: string): boolean {
  return device.toLowerCase() in DEVICE_PRESETS;
}
