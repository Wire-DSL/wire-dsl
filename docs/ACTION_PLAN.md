# 🚀 Plan de Acción - Próximas 2 Semanas

**Prioridades ordenadas, tareas concretas, estimaciones realistas**

---

## 📋 Semana 1: Validaciones Semánticas (Bloqueante)

### Día 1: Audit de Validaciones Existentes

**Objetivo**: Entender qué ya existe vs qué falta  
**Tiempo**: 3-4 horas

- [ ] Revisar [packages/core/src/ir/index.ts](../packages/core/src/ir/index.ts)
  - Qué validaciones Zod ya existen
  - Qué está solo en tipos sin validación
- [ ] Revisar [specs/validation-rules.md](../specs/validation-rules.md)
  - Lista de todas las reglas que deberían validarse
- [ ] Crear lista de validaciones faltantes

**Deliverable**: Documento con gaps identificados

---

### Días 2-3: Implementar Validaciones Críticas (2 días)

**Priority 1 - Validaciones de Componentes**:

- [ ] Validar props obligatorias por componentType
  - `Table` → requiere `columns[]`
  - `Input` → props genéricas
  - Todos los demás → validar contra spec
- [ ] Validar `variant` enum válido (primary|secondary|ghost)
- [ ] Validar `type` enum válido (bar|line|pie para ChartPlaceholder)

**Priority 2 - Validaciones de Layout**:

- [ ] Rechazar `direction` inválida (no sea "vertical"|"horizontal")
- [ ] Rechazar `span` > columns en grid
- [ ] Validar `gap` válido (xs|sm|md|lg|xl)

**Priority 3 - Validaciones de Navegación**:

- [ ] Rechazar `goto()` a screens inexistentes
- [ ] Verificar unicidad de IDs de screen

**Ubicación**: Todos en [packages/core/src/ir/index.ts](../packages/core/src/ir/index.ts)

**Tiempo**: 2 días  
**Deliverable**: Suite de validaciones implementada

---

### Día 4: Tests Negativos (1 día)

- [ ] Test caso: Input sin `placeholder` → debe ser válido
- [ ] Test caso: Table sin `columns` → error
- [ ] Test caso: Stack con direction inválida → error
- [ ] Test caso: Span > columns → error
- [ ] Test caso: goto() a screen inexistente → error

**Ubicación**: [packages/core/src/ir/index.test.ts](../packages/core/src/ir/index.test.ts)

**Tiempo**: 1 día  
**Deliverable**: +10-15 tests negativos

---

### Día 5: Verificación & Documentación

- [ ] Verificar que `wire render` rechaza wireframes inválidos
- [ ] Actualizar mensajes de error (hacerlos útiles)
- [ ] Documentar validaciones en [core-todo.md](./core-todo.md)

**Tiempo**: 0.5 día  
**Deliverable**: CLI con validaciones funcionales

---

## 📋 Semana 2: Renderer Polish & Layout Mejoras

### Días 6-7: Aplicar Tokens & Estilos (2 días)

**Qué hacer**:

- [ ] Verificar que todos los componentes usan `this.theme` colores
- [ ] Aplicar `gap` desde tokens en layouts
- [ ] Aplicar `spacing` desde tokens en componentes
- [ ] Verificar densidades (compact|normal|comfortable) se aplican

**Ubicación**: [packages/core/src/renderer/index.ts](../packages/core/src/renderer/index.ts)

**Tiempo**: 2 días  
**Deliverable**: Renderer 100% consistente con tokens

---

### Día 8: Mejoras Layout (1 día)

- [ ] Implementar `fill: true` para expandir elementos
- [ ] Implementar `align`/`justify` correctamente
- [ ] Distribuir espacio sobrante en grid cuando suma spans < columns

**Ubicación**: [packages/core/src/layout/index.ts](../packages/core/src/layout/index.ts)

**Tiempo**: 1 día  
**Deliverable**: Layouts más correctos visualmente

---

### Días 9-10: CLI Completo & Web Editor Básico (2 días)

**CLI - Completar init.ts**:

- [ ] Crear estructura base de proyecto
- [ ] Generar archivos ejemplo
- [ ] Documentación en proyecto nuevo

**Web Editor**:

- [ ] Hot reload en vivo
- [ ] Mejor visual del preview
- [ ] Export directo desde UI

**Ubicación**:

- CLI: [packages/cli/src/commands/init.ts](../packages/cli/src/commands/init.ts)
- Web: [packages/web/](../packages/web/)

**Tiempo**: 2 días  
**Deliverable**: MVP CLI + Web funcional

---

## 📊 Resumen de Cambios por Componente

### [packages/core/src/ir/index.ts](../packages/core/src/ir/index.ts)

**Cambios**: +200-300 líneas

- Agregar validaciones Zod por cada componentType
- Agregar validaciones de layout (direction, span, gap)
- Agregar validaciones de navegación (goto refs, screen IDs)

### [packages/core/src/ir/index.test.ts](../packages/core/src/ir/index.test.ts)

**Cambios**: +150-200 líneas (tests negativos)

- 10-15 tests nuevos de casos inválidos

### [packages/core/src/renderer/index.ts](../packages/core/src/renderer/index.ts)

**Cambios**: +100-150 líneas

- Aplicar tokens en render methods
- Mejorar estilos globales

### [packages/core/src/layout/index.ts](../packages/core/src/layout/index.ts)

**Cambios**: +100 líneas

- Implementar fill/align/justify
- Distribuir espacios

### [packages/cli/src/commands/init.ts](../packages/cli/src/commands/init.ts)

**Cambios**: Completo (50+ líneas)

- Crear estructura de proyecto
- Generar archivos ejemplo

---

## 🎯 Métrica de Éxito

Al final de 2 semanas, podrías:

✅ Validar wireframes inválidos y rechazarlos con errores claros  
✅ Renderizar los 25+ componentes con estilos consistentes  
✅ Crear nuevos proyectos con `wire init`  
✅ Ver preview en vivo en web editor  
✅ Tener suite de tests completa

**Estado del proyecto**: De MVP a Beta Ready 🚀

---

## 💡 Consejos

1. **Tests primero**: Escribe tests para lo que vas a validar
2. **Mensajes claros**: Los errores de validación deben ser entendibles
3. **Ejemplos**: Cada validación nueva → actualiza ejemplos
4. **Incremental**: Valida 1-2 cosas por día, ve testeando constantemente

---

## 📌 Checklist de Inicio

- [ ] Leí [COMPONENTS_CATALOG.md](./COMPONENTS_CATALOG.md)
- [ ] Reviré [core-todo.md](./core-todo.md)
- [ ] Entiendo qué validaciones faltan
- [ ] Listo para empezar con `packages/core/src/ir/index.ts`

---

**¿Necesitas help con cualquiera de estos puntos? Pregunta antes de comenzar.**
