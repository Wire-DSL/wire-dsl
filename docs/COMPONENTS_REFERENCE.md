# 📦 Componentes WireDSL - Guía de Referencia Rápida

**Última actualización**: Enero 2026  
**Total de componentes**: 16

---

## 🎯 Guía Rápida por Caso de Uso

### Quiero un formulario

```
component Input label: "Name" placeholder: "Your name"
component Input label: "Email" placeholder: "user@example.com"
component Textarea label: "Message" rows: 4
component Button text: "Submit" variant: primary
```

### Quiero un dashboard con navegación

```
component Topbar title: "Analytics"
component SidebarMenu items: ["Dashboard", "Reports", "Users", "Settings"]
component Tabs items: ["Overview", "Detailed", "Export"]
```

### Quiero mostrar datos en tabla

```
component Table
  columns: ["ID", "Name", "Email", "Status", "Action"]
  rowsMock: 10
  onRowClick: goto("UserDetail")
```

### Quiero un panel con contenido

```
component Panel title: "User Statistics" height: 300
component ChartPlaceholder type: "line" height: 250
```

### Quiero una navegación en breadcrumbs

```
component Breadcrumbs items: ["Dashboard", "Users", "John Doe"]
```

---

## 🔤 Componentes de Texto

### Heading

Títulos grandes y destacados.

```
Props: text (string, required)
Altura: 32px
Variantes: ninguna

Ejemplo:
component Heading text: "Dashboard"
```

### Text

Párrafos y bloques de texto normal.

```
Props: content (string, required)
Altura: variable (depende contenido)
Variantes: ninguna

Ejemplo:
component Text content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
```

---

## 📝 Componentes de Input

### Input

Campo de texto de una línea.

```
Props:
  - label (string, opcional)
  - placeholder (string, opcional)

Altura: 40px
Variantes: ninguna

Ejemplos:
component Input
component Input label: "Username"
component Input placeholder: "Enter your email..."
component Input label: "Email" placeholder: "user@example.com"
```

### Textarea

Campo de texto multi-línea.

```
Props:
  - label (string, opcional)
  - placeholder (string, opcional)
  - rows (number, default: 4)

Altura: rows * 20px
Variantes: ninguna

Ejemplos:
component Textarea
component Textarea label: "Description"
component Textarea rows: 6
component Textarea label: "Comments" placeholder: "Add your thoughts..." rows: 8
```

### Select

Lista desplegable.

```
Props:
  - label (string, opcional)
  - placeholder (string, opcional)
  - options (string[], opcional - solo visual)

Altura: 40px
Variantes: ninguna

Ejemplos:
component Select label: "Role"
component Select label: "Country" options: ["USA", "Canada", "Mexico"]
component Select placeholder: "Choose an option..."
```

---

## 🔘 Componentes de Botón

### Button

Botón de acción principal.

```
Props:
  - text (string, required)
  - variant (string, default: "secondary")
    - "primary" → fondo oscuro, texto claro
    - "secondary" → borde, fondo claro
    - "ghost" → sin borde, solo texto

Altura: 36px
Eventos: onClick

Ejemplos:
component Button text: "Save"
component Button text: "Submit" variant: primary
component Button text: "Cancel" variant: ghost
component Button text: "Edit" variant: secondary onClick: goto("EditScreen")
```

### IconButton

Botón con solo ícono.

```
Props:
  - icon (string, required) - nombre del ícono

Altura: 32px
Tamaño: 32x32px
Eventos: onClick

Ejemplos:
component IconButton icon: "search"
component IconButton icon: "settings"
component IconButton icon: "edit"
```

---

## 🧭 Componentes de Navegación

### SidebarMenu

Menú lateral de navegación.

```
Props:
  - items (string[], required) - lista de labels
    - Nota: Los items pueden ser strings o objetos con { label, active, action }

Altura: variable (depende de items)
Ancho: típicamente 200-250px
Variantes: ninguna

Ejemplos:
component SidebarMenu items: ["Dashboard", "Users", "Reports"]
component SidebarMenu items: ["Home", "Products", "Orders", "Settings"]
```

### Topbar

Barra superior de navegación.

```
Props:
  - title (string, opcional)

Altura: 56px
Ancho: 100%
Variantes: ninguna

Ejemplos:
component Topbar
component Topbar title: "Analytics Dashboard"
```

### Breadcrumbs

Ruta de navegación.

```
Props:
  - items (string[], required) - lista de labels en orden

Altura: 24px
Separador: " / "
Último item: bold

Ejemplos:
component Breadcrumbs items: ["Home", "Users", "Detail"]
component Breadcrumbs items: ["Dashboard", "Reports", "Quarterly", "Q4"]
```

### Tabs

Pestañas de navegación.

```
Props:
  - items (string[], required) - lista de labels
  - activeIndex (number, default: 0) - índice de pestaña activa

Altura: 40px
Pestaña activa: subrayada
Variantes: ninguna

Ejemplos:
component Tabs items: ["Profile", "Settings", "Logs"]
component Tabs items: ["All", "Pending", "Completed", "Archived"]
```

---

## 📊 Componentes de Datos

### Table

Tabla de datos.

```
Props:
  - columns (string[], required) - nombres de columnas
  - rowsMock (number, default: 5) - número de filas simuladas
  - rowHeight (number, default: 40) - altura de cada fila

Altura: headerHeight(40) + rowsMock * rowHeight
Eventos: onRowClick

Ejemplos:
component Table columns: ["Name", "Email", "Status"]
component Table
  columns: ["ID", "User", "Email", "Role", "Status"]
  rowsMock: 10
  onRowClick: goto("UserDetail")
```

### List

Lista de items.

```
Props:
  - items (string[], required) - lista de items

Altura: variable (depende de items)
Separador: sí
Variantes: ninguna

Ejemplos:
component List items: ["Item 1", "Item 2", "Item 3"]
component List items: ["Apple", "Banana", "Orange", "Grape"]
```

---

## 📦 Componentes de Contenedor

### Panel

Panel/tarjeta con título y contenido.

```
Props:
  - title (string, opcional)
  - height (number, opcional) - altura fija

Altura: según prop height o variable
Contenido: simulado (líneas grises)
Variantes: ninguna

Ejemplos:
component Panel title: "User Information"
component Panel title: "Statistics" height: 300
component Panel height: 200
```

### Card

Tarjeta simple.

```
Props:
  - title (string, opcional)

Altura: content
Contenido: simulado
Estilo: sombra sutil
Variantes: ninguna

Ejemplos:
component Card
component Card title: "Recent Activity"
component Card title: "Quick Stats"
```

---

## 🔧 Otros Componentes

### Divider

Separador visual horizontal.

```
Props: ninguna

Altura: 1px
Ancho: 100%
Color: gris claro
Variantes: ninguna

Ejemplos:
component Divider
```

### ChartPlaceholder

Placeholder para gráficos.

```
Props:
  - type (string, default: "bar")
    - "bar" → gráfico de barras
    - "line" → gráfico de líneas
    - "pie" → gráfico circular
  - height (number, default: 200)

Altura: según prop height
Contenido: esquema del tipo de gráfico
Variantes: 3 tipos

Ejemplos:
component ChartPlaceholder
component ChartPlaceholder type: "line"
component ChartPlaceholder type: "pie" height: 250
component ChartPlaceholder type: "bar" height: 300
```

---

## 📐 Tabla de Dimensiones Intrínsecas

Cuando `height: content`, se usan estos valores:

| Componente       | Altura                        |
| ---------------- | ----------------------------- |
| Heading          | 32px                          |
| Text             | variable                      |
| Input            | 40px                          |
| Textarea         | `rows * 20px` (default: 80px) |
| Select           | 40px                          |
| Button           | 36px                          |
| IconButton       | 32px                          |
| Topbar           | 56px                          |
| Breadcrumbs      | 24px                          |
| Tabs             | 40px                          |
| SidebarMenu      | variable                      |
| List             | variable                      |
| Table            | `40 + rowsMock * 40`          |
| Panel            | según prop o variable         |
| Card             | variable                      |
| Divider          | 1px                           |
| ChartPlaceholder | 200px (default)               |

---

## 🎨 Variantes de Estilo

### Button

- `variant: "primary"` → Fondo oscuro, texto claro (acción principal)
- `variant: "secondary"` → Borde, fondo claro (acción secundaria)
- `variant: "ghost"` → Sin borde, solo texto (acción ligera)

### ChartPlaceholder

- `type: "bar"` → Representación de gráfico de barras
- `type: "line"` → Representación de gráfico de líneas
- `type: "pie"` → Representación de gráfico circular

---

## 🔗 Eventos

Solo dos componentes soportan eventos (por ahora):

### Button & IconButton

```
onClick: goto("ScreenId")
```

### Table

```
onRowClick: goto("DetailScreenId")
```

**Sintaxis**:

```
onClick: goto("ScreenName")
onRowClick: goto("ScreenName")
```

Donde `ScreenName` debe ser el ID de una pantalla existente en el proyecto.

---

## 💡 Tips de Uso

1. **Layouts**: Los componentes se organizan con `stack` y `grid` en el DSL

   ```
   layout stack direction: vertical gap: md {
     component Heading text: "Form"
     component Input label: "Name"
     component Textarea label: "Message" rows: 4
     component Button text: "Submit" variant: primary
   }
   ```

2. **Responsive**: Usa `span` en grid para controlar ancho

   ```
   layout grid columns: 12 {
     component Input label: "First Name" span: 6
     component Input label: "Last Name" span: 6
   }
   ```

3. **Spacing**: Usa `gap` para control de espaciado
   ```
   layout stack direction: vertical gap: lg {
     component Heading text: "Dashboard"
     component Tabs items: ["Tab1", "Tab2"]
   }
   ```

---

## 📋 Checklist: Estado Real en Renderer (Enero 2026)

### ✅ COMPLETAMENTE IMPLEMENTADOS

- [x] **Heading** - Texto grande, bold, gris oscuro
- [x] **Text** - Párrafo normal, gris medio
- [x] **Input** - Campo texto con label y placeholder
- [x] **Textarea** - Campo multilínea
- [x] **Select** - Dropdown con opciones
- [x] **Button** - Con variantes (primary, secondary, ghost)
- [x] **Card** - Tarjeta con título
- [x] **Topbar** - Barra superior
- [x] **Table** - Tabla con filas simuladas
- [x] **ChartPlaceholder** - Gráficos (bar, line, pie)
- [x] **Tabs** - Pestañas con items
- [x] **Sidebar** - Menú lateral
- [x] **Divider** - Línea separadora
- [x] **Alert** - Alertas/mensajes
- [x] **Badge** - Etiquetas
- [x] **Modal** - Diálogos modales
- [x] **List** - Listas de items

### ⚠️ PARCIALMENTE / STUBS

- [ ] **Label** - Label genérico
- [ ] **Code** - Bloque de código
- [ ] **Checkbox** - Checkbox
- [ ] **Radio** - Radio button
- [ ] **Toggle** - Switch toggle
- [ ] **IconButton** - Botón con ícono (probablemente stub)
- [ ] **Breadcrumbs** - Ruta navegación (probablemente stub)
- [ ] **Panel** - Panel con título (probablemente stub)

### 📊 ESTADÍSTICAS

- **Total de componentes en spec**: 16
- **Implementados en renderer**: ~17+
- **Cobertura**: 80-90% ✅
- **El proyecto va **MUCHO MÁS ALLÁ** de los 16 componentes base**

**Fuente**: [`packages/core/src/renderer/index.ts`](../packages/core/src/renderer/index.ts) - Verifica `renderComponent()` para lista completa.

---

## 🚀 Próximos Componentes (Futuros)

En la roadmap para próximas versiones:

- Modal
- Tooltip
- Avatar
- Badge
- Stepper
- Form (agrupador automático)

---

**¿Necesitas ejemplos de un caso de uso específico? Pregunta y te lo documento.**
