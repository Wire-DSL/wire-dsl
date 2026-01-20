# Roadmap de WireDSL

## Visión General

Este roadmap describe las fases de desarrollo del proyecto WireDSL, desde el MVP hasta funcionalidades avanzadas.

---

## Fase 1: MVP Determinístico ✅

**Objetivo**: Crear la base funcional mínima con DSL, parser, IR y render básico.

### Entregables

#### 1.1 DSL + Parser

- [ ] Tokenizer para DSL
- [ ] Parser para bloques: `project`, `screen`, `layout`, `component`
- [ ] Generación de AST con ubicaciones (línea/columna)
- [ ] Mensajes de error descriptivos

#### 1.2 IR (Intermediate Representation)

- [ ] Definir esquema JSON del IR (versión 1.0)
- [ ] Normalizador AST → IR
- [ ] Aplicación de defaults
- [ ] Validaciones semánticas básicas
- [ ] Serialización/deserialización IR

#### 1.3 Layout Engine

- [ ] Implementar layout **Stack** (vertical/horizontal)
- [ ] Implementar layout **Grid** (12 columnas)
- [ ] Implementar layout **Split** (sidebar + main)
- [ ] Cálculo de bounding boxes
- [ ] Resolución de Size modes (fill/content/fixed/percent)

#### 1.4 Componentes Básicos

- [ ] Heading, Text
- [ ] Input, Textarea, Select
- [ ] Button, IconButton
- [ ] Panel, Card
- [ ] Divider

#### 1.5 Renderer Web

- [ ] Renderer React para componentes
- [ ] Aplicación de estilos wireframe (low-fidelity)
- [ ] Render de layouts (stack/grid/split)
- [ ] Vista estática (sin interacción)

#### 1.6 Export

- [ ] Export IR a JSON
- [ ] Validación de IR exportado

#### 1.7 CLI Básico

- [ ] `wiredsl validate <file>` - Validar sintaxis y semántica
- [ ] `wiredsl build <file>` - Generar IR
- [ ] `wiredsl render <file>` - Generar HTML estático

### Tests

- [ ] Tests unitarios para parser
- [ ] Tests para layout engine
- [ ] Tests de validación
- [ ] Tests de normalización

### Documentación

- [x] Arquitectura completa
- [x] Sintaxis DSL
- [x] Contrato IR
- [x] Especificación de componentes
- [ ] Guía de desarrollo

---

## Fase 2: Interacción y Navegación 🔄

**Objetivo**: Hacer el prototipo interactivo con navegación entre pantallas.

### Entregables

#### 2.1 Eventos

- [ ] Soporte para `onClick` en componentes
- [ ] Soporte para `onRowClick` en Table
- [ ] Sistema de eventos genérico

#### 2.2 Navegación

- [ ] Implementar acción `goto(screenId)`
- [ ] Mini-router para cambiar entre screens
- [ ] Historial de navegación (back/forward)
- [ ] Validación de referencias de navegación

#### 2.3 Hotspots

- [ ] Áreas clicables en componentes
- [ ] Indicadores visuales de interactividad
- [ ] Tooltips con destino de navegación

#### 2.4 Componentes de Navegación

- [ ] SidebarMenu funcional
- [ ] Topbar con navegación
- [ ] Breadcrumbs dinámicos
- [ ] Tabs con cambio de contenido

#### 2.5 Renderer Interactivo

- [ ] Modo wireframe + interactivo
- [ ] Estados hover en elementos clicables
- [ ] Transiciones entre pantallas
- [ ] Indicador de pantalla actual

### Tests

- [ ] Tests de navegación
- [ ] Tests de eventos
- [ ] Tests end-to-end de flujos

---

## Fase 3: Componentes Avanzados 📊

**Objetivo**: Expandir la biblioteca de componentes con elementos más complejos.

### Entregables

#### 3.1 Table Completa

- [ ] Configuración de columnas detallada
- [ ] Ordenamiento visual
- [ ] Paginación mock
- [ ] Filas seleccionables
- [ ] Acciones por fila

#### 3.2 Forms

- [ ] Form group (contenedor de inputs)
- [ ] Validación visual mock
- [ ] Botones de submit/cancel
- [ ] Layouts de formulario (horizontal/vertical)

#### 3.3 Tabs Funcionales

- [ ] Cambio de contenido por tab
- [ ] Tabs con contenido declarativo
- [ ] Indicador de tab activa

#### 3.4 Componentes Adicionales

- [ ] List con items complejos
- [ ] ChartPlaceholder con tipos (bar/line/pie)
- [ ] Avatar/Image placeholder
- [ ] Badge/Tag
- [ ] Modal placeholder
- [ ] Tooltip
- [ ] Alert/Notification

### Tests

- [ ] Tests para cada componente nuevo
- [ ] Tests de integración

---

## Fase 4: Export Avanzado 🎨

**Objetivo**: Permitir exportación de prototipos a múltiples formatos.

### Entregables

#### 4.1 Export SVG

- [ ] Renderer SVG para componentes
- [ ] Export de screens individuales
- [ ] Export de flujo completo (múltiples screens)
- [ ] Optimización de SVG

#### 4.2 Export PNG

- [ ] Conversión SVG → PNG
- [ ] Configuración de resolución
- [ ] Export batch de screens

#### 4.3 Export PDF

- [ ] Generación de PDF multipágina
- [ ] Índice de navegación
- [ ] Anotaciones de interacciones

#### 4.4 Export HTML Standalone

- [ ] Bundle HTML + CSS + JS
- [ ] Navegación funcional offline
- [ ] Optimización de tamaño

#### 4.5 CLI Extendido

- [ ] `wiredsl export <file> --svg`
- [ ] `wiredsl export <file> --png --resolution 2x`
- [ ] `wiredsl export <file> --pdf`
- [ ] `wiredsl export <file> --html --standalone`

### Tests

- [ ] Tests de cada formato de export
- [ ] Validación de calidad de output

---

## Fase 5: AI Patterns y Tooling 🤖

**Objetivo**: Optimizar para generación por IA y mejorar developer experience.

### Entregables

#### 5.1 Templates

- [ ] Template: List view (tabla + filtros)
- [ ] Template: Detail view (info + tabs)
- [ ] Template: Create/Edit form
- [ ] Template: Dashboard (cards + charts)
- [ ] CLI: `wiredsl init --template list`

#### 5.2 Linter

- [ ] Reglas de best practices
- [ ] Detección de patrones inconsistentes
- [ ] Sugerencias de mejora
- [ ] Fix automático de issues comunes

#### 5.3 AI Generation

- [ ] Prompt templates para LLMs
- [ ] Ejemplos de generación
- [ ] Validación de output generado
- [ ] Refinamiento iterativo

#### 5.4 Debug Tools

- [ ] Inspector overlay (bounding boxes)
- [ ] Grid overlay
- [ ] Medidas y espaciado
- [ ] Árbol de componentes
- [ ] Hot reload en development

#### 5.5 VS Code Extension

- [ ] Syntax highlighting
- [ ] Autocomplete
- [ ] Snippets
- [ ] Live preview
- [ ] Error highlighting

#### 5.6 Documentation Site

- [ ] Sitio con ejemplos interactivos
- [ ] Playground online
- [ ] Galería de componentes
- [ ] Tutoriales

### Tests

- [ ] Tests de templates
- [ ] Tests de linter rules
- [ ] Tests de tooling

---

## Fase 6: Optimización y Performance ⚡

**Objetivo**: Mejorar performance y escalabilidad.

### Entregables

#### 6.1 Performance

- [ ] Optimización de parser
- [ ] Cache de IR
- [ ] Render incremental
- [ ] Lazy loading de screens
- [ ] Virtual scrolling en listas largas

#### 6.2 Escalabilidad

- [ ] Soporte para proyectos grandes (100+ screens)
- [ ] Importación de módulos
- [ ] Componentización y reuso
- [ ] Librerías compartidas

#### 6.3 Tooling Avanzado

- [ ] Watch mode (rebuild automático)
- [ ] Diff de IRs
- [ ] Merge de cambios
- [ ] Versionado de prototipos

---

## Fase 7: Extensibilidad (EXPRESIÓN DE DESEO) 🌟

**Objetivo**: Comunidad crea y comparte componentes y temas.

> **Nota**: Esta fase representa nuestra visión de un ecosistema WireDSL robusto y comunitario. Es un diferenciador clave pero no bloqueante para el MVP.

### 7.1 Sistema de Plugins

#### Plugin API

- [ ] `ComponentPlugin` TypeScript interface
- [ ] JSON Schema validation para props
- [ ] WebComponent + SVGRenderer
- [ ] Validación semántica de componentes
- [ ] Dimensiones intrínsecas declarables

#### Component Registry

- [ ] Registro global de componentes
- [ ] API: `register()`, `get()`, `list()`, `findByTag()`
- [ ] Soporte para componentes built-in + custom

#### DSL Extension

- [ ] Bloque `plugins { import "..." }` en DSL
- [ ] Auto-completion de componentes registrados
- [ ] Validación de props según schema

**Ejemplo:**

```
project "Dashboard" {
  plugins {
    import "@wiredsl-community/kanban-board@1.0.0"
  }

  screen Board {
    layout stack {
      component KanbanBoard
        columns: ["Todo", "Done"]
        cardsMock: 5
    }
  }
}
```

### 7.2 Sistema de Temas Personalizados

#### Token System Avanzado

- [ ] Temas en DSL (light/dark/custom)
- [ ] Token overrides por tema
- [ ] CSS variables auto-generadas
- [ ] Theme selector en visor
- [ ] Soporte para temas de accesibilidad

#### Theme Engine

- [ ] `ThemeEngine` para resolver tokens
- [ ] Herencia de temas
- [ ] Hot-reload de temas

**Ejemplo:**

```
project "E-commerce" {
  tokens {
    colors {
      primary: #ff6b35
      secondary: #004e89
    }
    spacing { gutter: 20px }
  }

  theme "dark" {
    colors {
      primary: #ff9966
      bg: #0d1117
    }
  }
}
```

### 7.3 WireDSL Registry

#### Registry Online

- [ ] Plataforma: registry.wiredsl.io
- [ ] Búsqueda y discovery de componentes
- [ ] Información: ratings, downloads, documentación
- [ ] Verificación de calidad

#### CLI Tools

- [ ] `wiredsl add @namespace/component`
- [ ] `wiredsl update @namespace/component`
- [ ] `wiredsl list --plugins`
- [ ] `wiredsl publish ./my-component`

#### Package Format

- [ ] Estándar npm: `@wiredsl-community/*`
- [ ] Metadata: componentId, type, dependencies
- [ ] Versionado semántico

### 7.4 Developer Experience

#### Documentación

- [ ] Guía de desarrollo de plugins
- [ ] Plantillas de componentes
- [ ] Ejemplos paso-a-paso

#### Testing

- [ ] Testing utilities para plugins
- [ ] Validación automática en CI/CD
- [ ] Linter de plugins

#### Tooling

- [ ] Scaffold: `wiredsl plugin create`
- [ ] Preview de componentes
- [ ] Debug helpers

### 7.5 Mercado de Componentes

#### GitHub Marketplace

- [ ] Integración con GitHub
- [ ] Búsqueda y filtrado
- [ ] Sistema de reviews

#### Community

- [ ] Ejemplos destacados
- [ ] Best practices
- [ ] Concursos/rewards

---

## 🌟 Futuras Ideas (BACKLOG)

### Colaboración Comunitaria

- [ ] Real-time collaboration
- [ ] Comentarios en prototipos
- [ ] Versionado con Git integrado
- [ ] Review de cambios

### Integraciones

- [ ] Import desde Figma (bridge)
- [ ] Export a Figma
- [ ] Integración con Storybook
- [ ] Integración con design systems
- [ ] Integración con TypeScript

### IA Avanzada

- [ ] Generación desde screenshots
- [ ] Generación desde descripciones de usuario
- [ ] Optimización automática de layouts
- [ ] Sugerencias contextuales

### Testing & QA

- [ ] Generación de tests visuales
- [ ] Screenshot testing
- [ ] Accessibility testing
- [ ] Performance testing

### Futuras Ideas 💡

### Colaboración Comunitaria

- [ ] Real-time collaboration
- [ ] Comentarios en prototipos
- [ ] Versionado con Git integrado
- [ ] Review de cambios

### Integraciones Avanzadas

- [ ] Import desde Figma (bridge)
- [ ] Export a Figma
- [ ] Integración con Storybook
- [ ] Integración con design systems
- [ ] Integración con TypeScript

### IA Avanzada

- [ ] Generación desde screenshots
- [ ] Generación desde descripciones de usuario
- [ ] Optimización automática de layouts
- [ ] Sugerencias contextuales

### Testing & QA

- [ ] Generación de tests visuales
- [ ] Screenshot testing
- [ ] Accessibility testing
- [ ] Performance testing

---

## Timeline Estimado

| Fase                             | Duración        | Estado                    |
| -------------------------------- | --------------- | ------------------------- |
| Fase 1: MVP                      | 8-10 semanas    | 📋 Planeado               |
| Fase 2: Interacción              | 4-6 semanas     | 📋 Planeado               |
| Fase 3: Componentes              | 4-6 semanas     | 📋 Planeado               |
| Fase 4: Export                   | 3-4 semanas     | 📋 Planeado               |
| Fase 5: AI Tooling               | 6-8 semanas     | 📋 Planeado               |
| Fase 6: Performance              | 2-3 semanas     | 💭 Futuro                 |
| **Fase 7: Extensibilidad (MVP)** | **4-6 semanas** | **🌟 Expresión de Deseo** |
| Fases 8+: Backlog                | TBD             | 💭 Long-term              |

---

## Priorización

### Must Have (MVP)

- DSL + Parser
- IR + Validación
- Layout Engine (stack/grid/split)
- Componentes básicos
- Render web estático

### Should Have (Post-MVP)

- Navegación interactiva
- Export SVG/PNG/PDF
- Componentes avanzados
- CLI completo

### Nice to Have (Expresión de Deseo)

- **Fase 7: Extensibilidad** (Plugin system, temas, registry)
- Templates de IA
- Linter
- VS Code extension

### Backlog (Long-term)

- Colaboración comunitaria
- Integraciones avanzadas (Figma, Storybook)
- IA generativa
- Testing avanzado

---

## 💰 Oportunidades Comerciales

### Fase 1-2 (MVP Base)

- **Modelo**: Open source + documentación
- **Target**: Desarrolladores, startups, consultoras UX

### Fase 3-4 (Componentes + Export)

- **Modelo**: Tiered SaaS
  - Free: Uso personal, open source
  - Pro: Equipos pequeños, colaboración básica
  - Enterprise: Equipos grandes, soporte

### Fase 5+ (AI + Extensibilidad)

- **Modelo**: Tokens de IA (pay-as-you-go)
- **Modelo**: Marketplace de componentes (comisión 20-30%)
- **Modelo**: Consultoría y formación

---

## 🎯 Métricas de Éxito

| Fase  | KPI                   | Target | Timeline |
| ----- | --------------------- | ------ | -------- |
| **1** | GitHub stars          | 1K     | Q4 2024  |
| **2** | Proyectos públicos    | 100    | Q1 2025  |
| **3** | Componentes built-in  | 20+    | Q2 2025  |
| **4** | Exportaciones/mes     | 10K    | Q3 2025  |
| **5** | AI generations/mes    | 5K     | Q4 2025  |
| **7** | Componentes community | 50+    | Q2 2026  |

---

**Última actualización**: Enero 2026  
**Versión del roadmap**: 1.1

---

## Notas de Actualización (v1.1)

### Cambios principales:

1. **Nueva Fase 7: Extensibilidad** 🌟
   - Elevada a "Expresión de Deseo" clave del proyecto
   - Incluye Plugin System, Themes, y Registry de componentes
   - No bloqueante para MVP pero diferenciador importante

2. **Reorganización de secciones**
   - Futuras Ideas → ahora "Backlog" más claro
   - Timeline: agregada Fase 7 con estado 🌟
   - Priorización: actualizada para reflejar extensibilidad

3. **Nuevas secciones**
   - Oportunidades comerciales (modelos por fase)
   - Métricas de éxito expandidas con timeline

4. **Enfoque estratégico**
   - MVP (Fases 1-4) como base sólida
   - Fases 5-7 como diferenciadores
   - Backlog para long-term vision
