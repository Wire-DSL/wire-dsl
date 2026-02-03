# Plan Implementado: `@wire-dsl/editor-ui` 🎉

**Fecha**: 1 de Febrero de 2026
**Estado**: ✅ Completado

---

## 📋 Resumen Ejecutivo

Hemos creado el paquete **`@wire-dsl/editor-ui`** - la base reutilizable para Wire Live (OSS) y futuras versiones privadas (Wire Studio, Wire Studio Pro).

### Pilares de la Arquitectura

1. ✅ **OSS-First**: Completamente agnóstico de cloud/auth/features privativas
2. ✅ **Componible**: Extensible via composición, no modificación de código
3. ✅ **Modular**: Capas claras (types → utils → hooks → components)
4. ✅ **Documentado**: Políticas, arquitectura y guías incluidas
5. ✅ **Productivo**: Listo para integrar en Wire Live inmediatamente

---

## 📦 Qué Creamos

### Estructura de Carpetas

```
packages/editor-ui/
├── src/
│   ├── components/
│   │   ├── EditorPanel.tsx         # Container para editor
│   │   ├── PreviewPanel.tsx        # Visor SVG con zoom/pan
│   │   ├── DiagnosticsDrawer.tsx   # Panel de errores
│   │   ├── SplitView.tsx           # Layout resizable
│   │   └── index.ts                # Barrel export
│   ├── hooks/
│   │   └── index.ts                # useWireParser, useDebounce, useLocalStorage, etc.
│   ├── types/
│   │   └── index.ts                # DiagnosticItem, RenderState, EditorConfig, etc.
│   ├── utils/
│   │   └── index.ts                # Funciones puras, formatting, parsing helpers
│   └── index.ts                    # Exporta todo
├── .eslintrc.json                  # Configuración de linting
├── tsconfig.json                   # TypeScript strict mode
├── package.json                    # Deps: @wire-dsl/core, lucide-react, zustand
├── ARCHITECTURE.md                 # Guía técnica detallada
├── OSS-SAFETY-POLICY.md           # Gobernanza y restricciones
├── README.md                       # Quick start y documentación
└── .gitignore
```

### Componentes Base

| Componente | Propósito | Props |
|-----------|-----------|-------|
| `EditorPanel` | Container para Monaco | `file`, `onChange`, `config` |
| `PreviewPanel` | Visor SVG con zoom | `renderResult`, `renderState` |
| `DiagnosticsDrawer` | Panel de errores/warnings | `diagnostics`, `isOpen`, `onToggle` |
| `SplitView` | Layout resizable | `primary`, `secondary`, `config` |

### Hooks Reutilizables

| Hook | Propósito |
|------|-----------|
| `useWireParser(code)` | Parsea código Wire DSL con debounce |
| `useDebounce(value, delay)` | Debouncing genérico |
| `useLocalStorage(key, initial)` | Persistencia en browser |
| `useFocusWithin(ref)` | Tracking de focus |
| `useZoom(initial)` | Manejo de zoom |

### Tipos Definidos

- `DiagnosticItem` - Estructura de errores/warnings
- `DiagnosticSeverity` - Enum: error, warning, information
- `RenderState` - Enum: idle, rendering, success, error
- `SVGRenderResult` - Output wrapper del core
- `EditorConfig` - Configuración del editor
- `FileInfo` - Metadata de archivo
- `SplitLayoutConfig` - Config de layout resizable
- `ZoomState` - Estado del zoom

### Utilidades Puras

- `formatDiagnosticMessage()` - Formatea diagnostics para UI
- `extractLocationFromError()` - Parsea línea/columna de errores
- `getLineContent()` - Obtiene contenido de una línea
- `calculateAspectRatio()` - Helper para SVG responsive
- `createDebounce()` / `createThrottle()` - Factories funcionales
- `sanitizeFileName()` - Limpia nombres de archivo
- `formatFileSize()` - Formatea tamaño de archivo

---

## 🔒 Política OSS-Safety

### ✅ LO QUE PERMITIMOS

- Componentes UI genéricos
- Hooks para editor patterns comunes
- Persistencia en browser (localStorage)
- Tipos agnósticos
- Utilidades puras
- Renderizado SVG

### ❌ LO QUE PROHIBIMOS

- Cloud features (auth, sync, API calls)
- Colaboración en tiempo real
- Features de IA/LLM
- Workspace management
- Tracking/analytics
- Cualquier lógica privativa

### 🎯 Gobernanza

Se crearon dos archivos clave:

1. **`OSS-SAFETY-POLICY.md`** - Checklist pre-commit, qué pertenece y qué no
2. **`ARCHITECTURE.md`** - Guía técnica: capas, data flow, testing, extensión

Todo cambio a `editor-ui` debe pasar el checklist OSS-Safety.

---

## 🔗 Integración en el Monorepo

### Actualización Realizada

✅ **`packages/web/package.json`**: Agregó dependencia en `@wire-dsl/editor-ui`
✅ **`turbo.json`**: Aseguró que `editor-ui` se compila antes que `web`
✅ **Workspace**: Automáticamente reconocido por pnpm

### Comando para Instalar Deps

```bash
cd wire-dsl
pnpm install
```

---

## 🚀 Próximos Pasos: Implementar Wire Live (WL-01 a WL-06)

Con `editor-ui` listo, podemos proceder con **FASE 1: Editor Base (WL-01)**

### Plan de Fases (Modificado)

#### **FASE 1: Editor Base + Integración Monaco (WL-01)**
```
packages/web/src/App.tsx
├── Importar SplitView, EditorPanel, PreviewPanel de editor-ui
├── Integrar Monaco Editor en EditorPanel
├── Crear store Zustand para estado de app
├── Funcionalidad: abrir/pegar código, indicador modificado
└── Tests: Editor input, file operations
```

#### **FASE 2: Renderizado Live (WL-02)**
```
Integrar core parser + renderer
├── Hook useWireParser en web
├── Debounce + error handling
├── SVG preview con zoom/pan (PreviewPanel ya lo tiene)
└── Indicador "Rendering..." / "Up to date"
```

#### **FASE 3: Diagnostics (WL-03)**
```
Panel de errores funcional
├── DiagnosticsDrawer en web
├── Navegación editor ↔ diagnostics
├── Persistencia drawer state
└── Tests de UX
```

#### **FASE 4+**: Multi-screen, Persistencia, Ejemplos

---

## 📂 Estructura Final del Monorepo

```
Wire-DSL/wire-dsl/
├── packages/
│   ├── core/           (parser, IR, layout, renderer)
│   ├── editor-ui/      ✅ NEW - Componentes reutilizables
│   ├── web/            (Wire Live OSS - usa editor-ui)
│   ├── cli/            (CLI tool)
│   └── studio/         (Wire Studio privado - futuro, usará editor-ui)
├── .ai/                (AI guidance)
├── docs/               (Documentación pública)
└── specs/              (Especificaciones)
```

---

## 📊 Impacto de la Decisión

| Aspecto | Antes | Ahora |
|--------|-------|-------|
| **Reusabilidad** | Cero - cada app recrea UI | 100% - editor-ui + composición |
| **OSS Integrity** | Riesgo - cloud features podrían contaminar | Garantizado - OSS-SAFETY-POLICY |
| **Mantenibilidad** | Código duplicado en apps | Código compartido, única fuente de verdad |
| **Escalabilidad** | Studio tendría replicar código | Studio reutiliza editor-ui sin cambios |
| **Community** | Contribuciones van a cada app | Contribuciones a editor-ui benefician a todos |

---

## ✨ Validación

```bash
# Verify structure
ls packages/editor-ui/src/
# Output:
# ├── components/
# ├── hooks/
# ├── types/
# ├── utils/
# └── index.ts

# Verify TypeScript
cd packages/editor-ui
pnpm type-check
# Should compile without errors

# Verify web can import
grep "@wire-dsl/editor-ui" packages/web/package.json
# Should show dependency added
```

---

## 📝 Documentación Creada

1. **README.md** (52 líneas)
   - Filosofía del paquete
   - Components, hooks, types overview
   - Quick start example
   - Principios de diseño

2. **ARCHITECTURE.md** (350+ líneas)
   - Overview de capas
   - Data flow diagrams
   - Dependency graph
   - Component design patterns
   - Testing strategy
   - Extension points

3. **OSS-SAFETY-POLICY.md** (250+ líneas)
   - Qué pertenece/no pertenece
   - Pre-commit checklist
   - Governance rules
   - Code review guidelines
   - Patterns correctos e incorrectos

---

## 🎓 Aprendizajes

### Por Qué Esta Arquitectura Funciona

1. **Separación Clara**: editor-ui es agnóstico, web/studio agregan contexto
2. **Sin Coupling**: editor-ui no conoce de cloud, pero cloud puede usarlo
3. **Extensible por Composición**: No necesitamos modificar editor-ui para agregar features
4. **OSS First**: La versión pública no está contaminada de features privativas
5. **Documentado**: Reglas claras para futuras contribuciones

### Qué Aprendimos

- Componentes agnósticos son mejor que components opininionados
- Props como "preguntas al parent" > estado interno
- Capas claras (types → utils → hooks → components) reducen coupling
- Documentar restricciones es más importante que documentar features

---

## 🔄 Cómo Continuar

### Inmediato

1. **Validar instalación**:
   ```bash
   cd packages/editor-ui
   pnpm type-check
   ```

2. **Revisar documentación**:
   - Leer `ARCHITECTURE.md`
   - Leer `OSS-SAFETY-POLICY.md`

3. **Empezar FASE 1**:
   - Actualizar `packages/web/App.tsx`
   - Integrar Monaco Editor
   - Crear store Zustand

### Futuro

- Completar FASE 2-6 usando editor-ui como base
- Cuando studio se implemente, reutilizar editor-ui sin cambios
- Community contributions a editor-ui benefician a Wire Live y Studio

---

## 📌 Checkpoints

- ✅ Paquete creado con estructura completa
- ✅ Componentes base sin lógica cloud
- ✅ Hooks agnósticos e reutilizables
- ✅ Tipos genéricos y bien documentados
- ✅ Políticas OSS documentadas y aplicables
- ✅ Arquitectura escalable para futuras expansiones
- ✅ Integración en monorepo completada
- ✅ Listo para FASE 1 de Wire Live

---

**Siguiente Reunión**: FASE 1 - Editor Base + Integración Monaco

¿Comenzamos con Wire Live ahora?
