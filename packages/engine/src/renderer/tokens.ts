/**
 * Design Tokens System
 *
 * Visual properties organized by density levels.
 * These tokens are read from ir.project.style (density, spacing, radius, stroke, font)
 * and used by all renderers to maintain consistent visual styling.
 */

export interface DesignTokens {
  // Spacing
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };

  // Component dimensions
  button: {
    paddingX: number;
    paddingY: number;
    radius: number;
    fontSize: number;
    fontWeight: number;
  };

  input: {
    paddingX: number;
    paddingY: number;
    radius: number;
    fontSize: number;
  };

  card: {
    padding: number;
    radius: number;
    strokeWidth: number;
  };

  heading: {
    fontSize: number;
    fontWeight: number;
    marginBottom: number;
  };

  text: {
    fontSize: number;
    lineHeight: number;
  };

  badge: {
    paddingX: number;
    paddingY: number;
    radius: number | 'pill';
    fontSize: number;
  };

  table: {
    cellPaddingX: number;
    cellPaddingY: number;
    headerFontWeight: number;
    borderWidth: number;
  };
}

/**
 * Token sets for each density level
 */
export const DENSITY_TOKENS: Record<'compact' | 'normal' | 'comfortable', DesignTokens> = {
  compact: {
    spacing: {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 12,
    },
    button: {
      paddingX: 8,
      paddingY: 4,
      radius: 4,
      fontSize: 12,
      fontWeight: 500,
    },
    input: {
      paddingX: 8,
      paddingY: 4,
      radius: 4,
      fontSize: 12,
    },
    card: {
      padding: 8,
      radius: 6,
      strokeWidth: 1,
    },
    heading: {
      fontSize: 16,
      fontWeight: 600,
      marginBottom: 6,
    },
    text: {
      fontSize: 12,
      lineHeight: 1.4,
    },
    badge: {
      paddingX: 6,
      paddingY: 2,
      radius: 'pill',
      fontSize: 10,
    },
    table: {
      cellPaddingX: 8,
      cellPaddingY: 4,
      headerFontWeight: 600,
      borderWidth: 1,
    },
  },

  normal: {
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
    },
    button: {
      paddingX: 12,
      paddingY: 6,
      radius: 6,
      fontSize: 14,
      fontWeight: 500,
    },
    input: {
      paddingX: 12,
      paddingY: 6,
      radius: 6,
      fontSize: 14,
    },
    card: {
      padding: 12,
      radius: 8,
      strokeWidth: 1,
    },
    heading: {
      fontSize: 20,
      fontWeight: 600,
      marginBottom: 8,
    },
    text: {
      fontSize: 14,
      lineHeight: 1.5,
    },
    badge: {
      paddingX: 8,
      paddingY: 3,
      radius: 'pill',
      fontSize: 12,
    },
    table: {
      cellPaddingX: 12,
      cellPaddingY: 6,
      headerFontWeight: 600,
      borderWidth: 1,
    },
  },

  comfortable: {
    spacing: {
      xs: 6,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    },
    button: {
      paddingX: 16,
      paddingY: 8,
      radius: 8,
      fontSize: 16,
      fontWeight: 500,
    },
    input: {
      paddingX: 16,
      paddingY: 8,
      radius: 8,
      fontSize: 16,
    },
    card: {
      padding: 16,
      radius: 12,
      strokeWidth: 1,
    },
    heading: {
      fontSize: 24,
      fontWeight: 600,
      marginBottom: 12,
    },
    text: {
      fontSize: 16,
      lineHeight: 1.6,
    },
    badge: {
      paddingX: 12,
      paddingY: 4,
      radius: 'pill',
      fontSize: 14,
    },
    table: {
      cellPaddingX: 16,
      cellPaddingY: 8,
      headerFontWeight: 600,
      borderWidth: 1,
    },
  },
};

/**
 * Resolve design tokens based on IRStyle
 */
export function resolveTokens(style: any): DesignTokens {
  const density = style.density || 'normal';
  return DENSITY_TOKENS[density as keyof typeof DENSITY_TOKENS] || DENSITY_TOKENS.normal;
}
