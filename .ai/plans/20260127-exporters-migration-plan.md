# Plan: Migrar Exportadores PDF/PNG a Core Package

**Status**: In Progress  
**Branch**: `feature/migrate-exporters-to-core`  
**Objective**: Mover las funciones de exportación (SVG, PNG, PDF) del CLI al Core para permitir que otros sistemas reutilicen esta funcionalidad.

---

## 📋 Overview

Actualmente, el CLI posee toda la lógica de exportación. Otros sistemas que consumen Core (web, studio, ai-backend) tienen que reimplementar esta funcionalidad. El objetivo es mover literalmente la implementación de exportadores al Core sin cambios significativos, manteniendo 100% backward compatibility en el CLI.

### Scope

- Exportación a **SVG** (una o todas las pantallas)
- Exportación a **PNG** (una o todas las pantallas)
- Exportación a **PDF** (todas las pantallas)
- Funciones helper para procesamiento de SVG

### No Incluido

- Cambios en la API del CLI (mismos comandos, opciones, comportamiento)
- Over-engineering o refactoring de la arquitectura
- Configuración avanzada (DPI, compresión, márgenes)

---

## 📁 Arquitectura Actual

### CLI Structure
```
packages/cli/src/
├── commands/
│   ├── exporters.ts          ← Lógica de exportación (a mover)
│   ├── render.ts             ← Orquestación CLI
│   └── ...
└── ...
```

### Funciones a Mover

| Función | Líneas | Tipo | Mover A |
|---------|--------|------|---------|
| `exportPNG()` | ~60 | Pública | Core |
| `exportMultipagePDF()` | ~95 | Pública | Core |
| `exportSVG()` | ~8 | Pública | Core |
| `extractSVGDimensions()` | ~12 | Helper | Core (privada) |
| `hexToRgba()` | ~16 | Helper | Core (privada) |
| `preprocessSVGColors()` | ~8 | Helper | Core (privada) |

### Dependencias a Mover

```json
{
  "pdfkit": "0.17.2",
  "sharp": "0.34.5",
  "svg-to-pdfkit": "0.1.8"
}
```

---

## 🔄 Pasos de Implementación

### Step 1: Crear módulo exporters en Core

**Archivo**: `packages/core/src/renderer/exporters.ts`

Copiar literalmente:
- Las 3 funciones públicas (exportPNG, exportMultipagePDF, exportSVG)
- Las 3 funciones helper (extractSVGDimensions, hexToRgba, preprocessSVGColors)
- Imports (fs/promises, path, sharp, pdfkit, svg-to-pdfkit)
- JSDoc comments

**Status**: ⬜ Not Started

### Step 2: Agregar dependencias a Core

**Archivo**: `packages/core/package.json`

Agregar en `dependencies`:
```json
{
  "pdfkit": "0.17.2",
  "sharp": "0.34.5",
  "svg-to-pdfkit": "0.1.8"
}
```

**Status**: ⬜ Not Started

### Step 3: Exportar nuevos métodos en Core API

**Archivo**: `packages/core/src/renderer/index.ts`

Agregar export:
```typescript
export { exportSVG, exportPNG, exportMultipagePDF } from './exporters';
```

**Status**: ⬜ Not Started

### Step 4: Crear tests para exportadores

**Archivo**: `packages/core/src/renderer/exporters.test.ts`

Tests necesarios:
- ✅ `exportPNG` - Genera PNG válido con dimensiones correctas
- ✅ `exportMultipagePDF` - Genera PDF con múltiples páginas
- ✅ `exportSVG` - Guarda SVG con contenido correcto
- ✅ `extractSVGDimensions` - Extrae dimensiones correctamente
- ✅ `hexToRgba` - Convierte hex a rgba correctamente
- ✅ `preprocessSVGColors` - Reemplaza colores hex en SVG

**Status**: ⬜ Not Started

### Step 5: Compilar Core

**Command**: `cd packages/core && npm run build`

Verificar que:
- ✅ TypeScript compile sin errores
- ✅ Nuevas funciones son accesibles
- ✅ Tests pasen (91 existing + 6 new tests)

**Status**: ⬜ Not Started

### Step 6: Refactorizar CLI

**Archivo**: `packages/cli/src/commands/render.ts`

Cambio de import (línea 7):
```typescript
// Before:
import { exportSVG, exportPNG, exportMultipagePDF } from './exporters';

// After:
import { exportSVG, exportPNG, exportMultipagePDF } from '@wire-dsl/core';
```

**Status**: ⬜ Not Started

### Step 7: Eliminar exporters.ts del CLI

**Acción**: Borrar `packages/cli/src/commands/exporters.ts`

**Status**: ⬜ Not Started

### Step 8: Actualizar package.json del CLI

**Archivo**: `packages/cli/package.json`

Remover de `dependencies`:
- pdfkit
- sharp
- svg-to-pdfkit

(Se heredan transitivamente de Core)

**Status**: ⬜ Not Started

### Step 9: Build y Test CLI

**Commands**:
```bash
cd packages/cli && npm run build
npm test
```

Verificar que:
- ✅ CLI compila sin errores
- ✅ CLI tests pasen
- ✅ `wire render` sigue funcionando igual

**Status**: ⬜ Not Started

### Step 10: Actualizar documentación

**Archivo**: `docs/CLI-REFERENCE.md`

Agregar nota:
> Nota: Los exportadores (PDF, PNG, SVG) están ahora centralizados en el Core package, permitiendo que otros sistemas reutilicen esta funcionalidad.

**Status**: ⬜ Not Started

### Step 11: Commit y Push

**Commands**:
```bash
git add .
git commit -m "feat: migrate PDF/PNG/SVG exporters to Core package"
git push origin feature/migrate-exporters-to-core
```

**Status**: ⬜ Not Started

---

## ✅ Verificación de Backward Compatibility

Todos estos casos deben funcionar idénticamente:

```bash
# Stdout SVG
wire render file.wire

# SVG a archivo
wire render file.wire --svg out.svg

# SVG directorio (múltiples pantallas)
wire render file.wire --svg outdir/

# PNG archivo
wire render file.wire --png out.png

# PNG directorio (múltiples pantallas)
wire render file.wire --png outdir/

# PDF (siempre múltiples pantallas)
wire render file.wire --pdf out.pdf

# Pantalla específica
wire render file.wire --screen Home

# Watch mode
wire render file.wire --watch

# Combinaciones
wire render file.wire --screen Home --png out.png
```

---

## 📊 Progress Tracking

| Step | Task | Status | Time |
|------|------|--------|------|
| 1 | Crear exporters.ts en Core | ⬜ | - |
| 2 | Agregar dependencias a Core | ⬜ | - |
| 3 | Exportar en Core API | ⬜ | - |
| 4 | Crear tests | ⬜ | - |
| 5 | Build Core | ⬜ | - |
| 6 | Refactorizar CLI | ⬜ | - |
| 7 | Eliminar exporters.ts CLI | ⬜ | - |
| 8 | Actualizar CLI package.json | ⬜ | - |
| 9 | Build y Test CLI | ⬜ | - |
| 10 | Actualizar documentación | ⬜ | - |
| 11 | Commit y Push | ⬜ | - |

---

## 🔗 Archivos Involucrados

### Core
- `packages/core/src/renderer/exporters.ts` (new)
- `packages/core/src/renderer/exporters.test.ts` (new)
- `packages/core/src/renderer/index.ts` (update)
- `packages/core/package.json` (update)

### CLI
- `packages/cli/src/commands/render.ts` (update)
- `packages/cli/src/commands/exporters.ts` (delete)
- `packages/cli/package.json` (update)

### Documentation
- `docs/CLI-REFERENCE.md` (update)

---

## 📝 Notes

- Migración literal sin cambios de lógica → minimiza riesgo
- 100% backward compatible → CLI funcionará igual
- Tests garantizan calidad → problemas detectados temprano
- Otros sistemas pueden ahora importar de Core → elimina duplicación

---

**Created**: January 27, 2026  
**Branch**: `feature/migrate-exporters-to-core`
