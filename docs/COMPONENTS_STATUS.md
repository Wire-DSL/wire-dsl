# 📊 Estado del Catálogo de Componentes WireDSL - Enero 2026

**Documento de referencia rápida del estado de implementación**

---

## 🎯 Resumen Ejecutivo

| Métrica                             | Valor             |
| ----------------------------------- | ----------------- |
| **Componentes en Spec Original**    | 17                |
| **Implementados del Spec**          | 13/17 = 76%       |
| **Componentes BONUS** (extras)      | 9                 |
| **Total Implementados en Renderer** | 22 componentes ✅ |
| **Status del Proyecto**             | MVP FUNCIONAL 🚀  |

El proyecto tiene **más componentes implementados de los especificados** originalmente, incluyendo muchos componentes bonus útiles.

---

## ✅ Componentes Plenamente Funcionales

Estos componentes están **100% implementados y verificados** en [`packages/core/src/renderer/index.ts`](../packages/core/src/renderer/index.ts):

### Del Spec Original (13/17 = 76%)

1. **Heading** - Títulos grandes, bold, gris oscuro ✅
2. **Text** - Párrafos normales, gris medio ✅
3. **Input** - Campo texto con label/placeholder ✅
4. **Textarea** - Campo multilínea configurable ✅
5. **Select** - Dropdown con opciones ✅
6. **Button** - Variantes: primary, secondary, ghost ✅
7. **Topbar** - Barra superior de navegación ✅
8. **Tabs** - Pestañas con items ✅
9. **Table** - Tabla con filas simuladas ✅
10. **List** - Listas de items ✅
11. **Card** - Tarjeta con título ✅
12. **Divider** - Línea separadora ✅
13. **ChartPlaceholder** - Bar, Line, Pie ✅

### Componentes BONUS (9 extras no en spec)

14. **Label** - Labels genéricos ✅
15. **Code** - Bloques de código ✅
16. **Checkbox** - Checkboxes ✅
17. **Radio** - Radio buttons ✅
18. **Toggle** - Switch toggles ✅
19. **Sidebar** - Menú lateral (diferente de SidebarMenu spec) ✅
20. **Alert** - Alertas con tipos (info, warning, error, success) ✅
21. **Badge** - Etiquetas/badges con variantes ✅
22. **Modal** - Diálogos modales con overlay ✅

---

## ❌ NO Implementados (Del spec original)

Estos componentes están en el spec pero **NO están implementados** aún:

- [ ] **IconButton** - Botón con solo ícono
- [ ] **SidebarMenu** - Menú lateral con array de items (nota: existe "Sidebar" que es diferente)
- [ ] **Breadcrumbs** - Ruta de navegación (Home / Users / Detail)
- [ ] **Panel** - Panel con título y altura configurable

**Total pendiente del spec**: 4/17 componentes

---

## 🚀 Cómo Usar Los Componentes

### Básico: En archivos `.wire`

```
project MyApp

screen Dashboard
  layout stack direction: vertical gap: md {
    component Heading text: "Welcome"
    component Button text: "Start" variant: primary
  }
```

### Multi-screen: Proyectos con múltiples pantallas

```
project MyApp

screen Dashboard
  layout stack direction: vertical gap: md {
    component Heading text: "Dashboard"
    component Table columns: ["Name", "Status"]
  }

screen UserList
  layout stack direction: vertical {
    component Heading text: "Users"
    component List items: ["User 1", "User 2"]
  }
```

### Con datos: Simulados

```
component Table
  columns: ["ID", "Name", "Status", "Action"]
  rowsMock: 10

component List items: ["Apple", "Banana", "Orange"]
```

---

## ⚠️ Características NO Implementadas (Fase 2)

### Eventos Interactivos ❌

Los eventos están documentados en las specs pero **NO están implementados** todavía. Están en el roadmap para Fase 2:

```
❌ NO FUNCIONA (aún):
component Button text: "Go" onClick: goto("UserList")
component Table columns: ["Name"] onRowClick: goto("Detail")
```

**Estado**: En [docs/roadmap.md](./roadmap.md) Fase 2 - Interacción y Navegación

- [ ] Soporte para `onClick` en componentes
- [ ] Soporte para `onRowClick` en Table
- [ ] Sistema de eventos genérico
- [ ] Implementar acción `goto(screenId)`
- [ ] Mini-router para cambiar entre screens

**Estimación**: 1-2 semanas después de completar validaciones semánticas

---

## 📝 Próximos Pasos Recomendados (En Orden)

### 1️⃣ Verificar Completitud (30 min)

```bash
# En packages/core/src/renderer/index.ts
# Revisar renderComponent() y verificar que todos los casos están implementados
```

### 2️⃣ Actualizar Specs (1 hora)

- Agregar los componentes BONUS a [`specs/components.md`](../specs/components.md)
- Documentar cada uno con props y ejemplos

### 3️⃣ Validaciones Semánticas (2-3 días)

- Implementar en [`packages/core/src/ir/index.ts`](../packages/core/src/ir/index.ts):
  - Validar props obligatorias por componente
  - Validar enums (variant, type, etc.)
  - Validar layout constraints (span <= columns)
  - **Nota**: Eventos no están implementados, validarlos será parte de Fase 2

### 4️⃣ Mejorar CLI (1 día)

- [packages/cli/src/commands/init.ts](../packages/cli/src/commands/init.ts) - Completar scaffolding
- [packages/cli/src/commands/render.ts](../packages/cli/src/commands/render.ts) - Mejorar feedback

### 5️⃣ Web Editor Mejorado (2 días)

- [packages/web/src/](../packages/web/src/) - Hot reload, mejor UX
- Integración con los 22 componentes implementados

### 6️⃣ Implementar Componentes Faltantes (1-2 días)

- IconButton, Breadcrumbs, Panel, SidebarMenu (4 componentes del spec)

### 7️⃣ Fase 2 - Eventos e Interactividad (1-2 semanas)

- onClick, onRowClick, goto() - Ver [roadmap.md](./roadmap.md)

---

## 🎯 Componentes Prioritarios (Si Necesitas Priorizar)

Si necesitas implementar más funcionalidad rápidamente, estos son los **más críticos**:

1. **Table** ✅ Ya hecho - Esencial para dashboards
2. **Tabs** ✅ Ya hecho - Importante para navegación
3. **Form elements** ✅ Ya hechos (Input, Textarea, Select)
4. **Button** ✅ Ya hecho - Vital para interacción
5. **Modal** ✅ Bonus - Útil para diálogos

**Conclusión**: Prácticamente todo lo importante ya está implementado. El proyecto está listo para validaciones y pulido.

---

## 📚 Archivos de Referencia

| Archivo                                                                       | Descripción                       |
| ----------------------------------------------------------------------------- | --------------------------------- |
| [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)                          | Guía detallada de cada componente |
| [specs/components.md](../specs/components.md)                                 | Especificación formal             |
| [packages/core/src/renderer/index.ts](../packages/core/src/renderer/index.ts) | Implementación SVG                |
| [packages/core/src/ir/index.ts](../packages/core/src/ir/index.ts)             | Validación y tipos IR             |
| [examples/](../examples/)                                                     | Ejemplos de uso                   |

---

## ✨ Conclusión

**El proyecto tiene un MVP core sólido**. El flujo (parse → IR → layout → render SVG) está completamente funcional con **22 componentes implementados**.

**Estado actual**:

- ✅ 13/17 componentes del spec original
- ✅ 9 componentes bonus
- ❌ 4 componentes del spec pendientes
- ❌ Eventos interactivos (Fase 2)

**Próximos pasos prioritarios**:

1. Validaciones semánticas (bloqueante)
2. Completar componentes faltantes del spec (4 restantes)
3. Eventos e interactividad (Fase 2)
4. Exportadores (HTML, React)

**¿Cuál es tu siguiente enfoque?** 🎯
