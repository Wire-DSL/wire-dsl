import { parseWireDSL, generateIR } from '@wire-dsl/engine';

type ValidationError = {
  message: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
};

export async function handleValidate({ wire_code }: { wire_code: string }) {
  const errors: ValidationError[] = [];

  let ast: ReturnType<typeof parseWireDSL>;
  try {
    ast = parseWireDSL(wire_code);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lineMatch = msg.match(/line[:\s]+(\d+)/i);
    const colMatch = msg.match(/col(?:umn)?[:\s]+(\d+)/i);
    errors.push({
      message: msg,
      line: lineMatch ? parseInt(lineMatch[1], 10) : 0,
      column: colMatch ? parseInt(colMatch[1], 10) : 0,
      severity: 'error',
    });
    return toResult({ valid: false, errors });
  }

  try {
    generateIR(ast);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    errors.push({ message: msg, line: 0, column: 0, severity: 'error' });
    return toResult({ valid: false, errors });
  }

  return toResult({ valid: true, errors });
}

function toResult({ valid, errors }: { valid: boolean; errors: ValidationError[] }) {
  return {
    content: [
      {
        type: 'text' as const,
        text: JSON.stringify({
          valid,
          errors,
          summary: valid ? 'Wire DSL code is valid.' : `Found ${errors.length} error(s).`,
        }),
      },
    ],
  };
}
