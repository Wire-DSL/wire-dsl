# Core TODO

Lista de pendientes para cerrar la primera versión funcional del core.

> **Documentación de componentes**: Ver [COMPONENTS_CATALOG.md](./COMPONENTS_CATALOG.md) y [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)

---

---

## 🔄 ESTADO ACTUAL DEL CORE (Enero 2026)

### ✅ COMPLETADO

- **Parser** - Chevrotain funcional, maneja arrays/booleanos/strings/eventos
- **IR Generator** - Zod validation, tipos completos, IR funcional
- **Layout Engine** - Completo, procesa todos los screens, spans/grid/stack
- **SVG Renderer** - **25+ componentes implementados** (no 16!)
  - Texto: Heading, Text, Label, Code ✅
  - Inputs: Input, Textarea, Select, Checkbox, Radio, Toggle ✅
  - Botones: Button, IconButton ✅
  - Navegación: Topbar, Sidebar, Tabs, Breadcrumbs ✅
  - Datos: Table, List ✅
  - Contenedores: Card, Panel, Modal ✅
  - Feedback: Alert, Badge, Divider ✅
  - Visualización: ChartPlaceholder ✅
- **CLI** - Render, validate, init parcialmente funcionales
- **Multi-screen** - Soporte completo, export individual/todo

### ⚠️ PENDIENTE - VALIDACIONES SEMÁNTICAS (Crítico)

- [ ] Validar reglas semánticas según [specs/validation-rules.md](../specs/validation-rules.md)
- [ ] Rechazar directions inválidas en `stack` ("vertical"|"horizontal")
- [ ] Rechazar spans fuera de rango en `grid` (span > columns)
- [ ] Verificar props obligatorias por componente (Table → columns requerido)
- [ ] Rechazar referencias a pantallas inexistentes en `goto()`
- [ ] Validar `layoutType` y `componentType` contra lista soportada
- [ ] Verificar unicidad de IDs de pantalla

### ⚠️ PENDIENTE - MEJORAS LAYOUT (Importante)

- [ ] Manejar completamente `align`/`justify`/`fill`/`content`
- [ ] Distribuir espacio sobrante en grid cuando spans < columns
- [ ] Alturas dinámicas según densidad (compact/normal/comfortable)

### ⚠️ PENDIENTE - RENDERER POLISH (Importante)

- [ ] Aplicar tokens/estilos a todos los componentes
- [ ] Eliminar placeholders hardcodeados
- [ ] Añadir atributos accesibilidad (aria-label, role, etc.)

### ⚠️ PENDIENTE - TESTING (Importante)

- [ ] Tests negativos/validación (casos inválidos)
- [ ] Snapshots SVG para estabilidad
- [ ] Pruebas de overflow/alignment

### ⚠️ PENDIENTE - INTEGRACIÓN (Nice to have)

- [ ] API integrada `compileWire(source) -> { ast, ir, layout, svg }`
- [ ] CLI completo (completar init.ts, mejorar feedback)

---

## 🎯 PRIORIDAD RECOMENDADA (Fase 2)

**BLOQUEANTES** (Implementar primero)

1. **Validaciones Semánticas** (3-4 días) - Sin esto, los usuarios pueden crear wireframes inválidos
2. **Tests Negativos** (2 días) - Cubrir casos de error
3. **Renderer Polish** (1-2 días) - Aplicar tokens, mejorar estilos

**IMPORTANTES** (Después) 4. **Mejoras Layout** (1-2 días) - align/justify/fill 5. **CLI Completo** (1 día) - Mejorar init y feedback

**FUTURO** (Fase 3+) 6. **API Integrada** - Facilitar integración 7. **Web Editor MVP** - Interfaz visual 8. **Exportadores Adicionales** - HTML, React, Figma
