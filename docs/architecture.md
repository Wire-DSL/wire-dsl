# Arquitectura de WireDSL

## Arquitectura Lógica (Capas)

### Capa A — DSL (Lenguaje Declarativo)

WireDSL provee un formato "estilo Mermaid", humano y estructurado.

**Requisitos**:

- Fácil de leer/escribir
- Fácil de parsear
- Fácil de generar por IA

**Estrategia**: DSL híbrido (bloques + propiedades `key: value`)

---

### Capa B — Parser + AST

- El parser transforma el DSL en un **AST** (lo que el usuario escribió)
- Se preservan ubicaciones (línea/columna) para errores y tooling
- El AST es la representación directa del código fuente

---

### Capa C — IR (Modelo Interno Normalizado)

El AST se convierte a un **IR estable**, aplicando:

- Defaults
- Normalización (tokens, sizes)
- Validaciones semánticas

El IR es la **fuente de verdad técnica** para el render.

---

### Capa D — Layout Engine

Responsable de calcular posiciones y tamaños finales a partir de constraints declarativas.

Layouts soportados (core):

- **Stack** (vertical/horizontal)
- **Grid** (columnas + spans)
- **Split panes** (sidebar + main)

El layout engine opera sobre el IR y produce un **Render Tree** con bounding boxes.

---

### Capa E — Renderer

Implementación principal:

- **React + HTML/CSS** (rápido, extensible)

Modos de render:

- Wireframe (gris, low fidelity)
- Interactivo (click → navegación)

---

### Capa F — Interaction Layer

Interacciones declarativas:

- `onClick: goto("UserDetail")`
- Hotspots y navegación entre pantallas

---

### Capa G — Exporters

- JSON (IR)
- SVG (diagramas)
- PNG
- PDF

---

## Arquitectura Técnica (Paquetes)

### `wiredsl-core`

**Responsabilidad**: Tipos de dominio y lógica de negocio

- Tipos de dominio (AST/IR)
- Validación semántica
- Normalización y defaults
- Versionado de IR

---

### `wiredsl-parser`

**Responsabilidad**: Análisis sintáctico

- Tokenizer + Parser DSL
- Mensajes de error (línea/columna)
- Generación de AST

---

### `wiredsl-layout`

**Responsabilidad**: Cálculo de layout

- Stack/Grid/Split
- Cálculo de bounding boxes
- Resolución de constraints

---

### `wiredsl-render-web`

**Responsabilidad**: Renderizado web

- Renderer React/HTML
- Navegación y hotspots
- Inspector overlay (debug)
- Componentes visuales wireframe

---

### `wiredsl-export`

**Responsabilidad**: Exportación

- Exporters SVG/PNG/PDF
- Export IR JSON
- Serialización

---

### `wiredsl-cli`

**Responsabilidad**: Interfaz de línea de comandos

Comandos:

```bash
wiredsl validate input.wire
wiredsl build input.wire --out out/
wiredsl export input.wire --pdf
```

---

## Diagrama de Flujo de Datos

```
┌─────────────┐
│ DSL (.wire) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Parser    │──── AST (lo escrito)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Normalizer  │──── IR (normalizado, con defaults)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Layout    │──── Render Tree (con posiciones)
│   Engine    │
└──────┬──────┘
       │
       ├────────────────┬────────────┐
       ▼                ▼            ▼
┌─────────────┐  ┌──────────┐  ┌─────────┐
│  Renderer   │  │ Exporter │  │  Debug  │
│ (React/Web) │  │(SVG/PDF) │  │Inspector│
└─────────────┘  └──────────┘  └─────────┘
```

---

## Principios de Implementación

1. **Inmutabilidad**: El IR es inmutable una vez generado
2. **Validación temprana**: Errores detectados en fase de parsing/normalización
3. **Separación de concerns**: Cada capa tiene responsabilidad única
4. **Testabilidad**: Cada capa es testeable independientemente
5. **Extensibilidad**: Nuevos componentes/layouts vía plugins
