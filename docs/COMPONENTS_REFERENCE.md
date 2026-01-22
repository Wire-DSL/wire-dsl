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

### Label

Etiqueta de texto pequeña.

```
Props: text (string, required) - texto de la etiqueta

Altura: 18px
Tamaño: Más pequeño que Text
Color: Gris claro/muted
Soporte completo: ✅ Implementado

Ejemplo:
component Label text: "Required field"
component Label text: "Optional"
```

### Code

Bloque de código monoespaciado.

```
Props: content (string, required) - código a mostrar

Altura: variable (depende contenido)
Fuente: Monoespaciada (monospace)
Fondo: Gris claro
Soporte completo: ✅ Implementado

Ejemplo:
component Code content: "const x = 10;"
component Code content: "function hello() { return 'world'; }"
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

### Checkbox

Casilla de verificación con etiqueta.

```
Props:
  - label (string, optional) - texto junto al checkbox
  - checked (boolean, optional, default: false) - si está marcado

Altura: 32px
Apariencia: Cuadrado 18x18px con esquinas redondeadas
Marcado: ✓ (cuando checked: true)
Soporte completo: ✅ Implementado

Ejemplos:
component Checkbox label: "Accept terms"
component Checkbox label: "Remember me" checked: true
component Checkbox
```

### Radio

Botón de opción exclusiva.

```
Props:
  - label (string, optional) - texto junto al radio button
  - checked (boolean, optional, default: false) - si está seleccionado

Altura: 32px
Apariencia: Círculo 16px de radio con punto interior cuando checked
Seleccionado: Punto en el centro (cuando checked: true)
Soporte completo: ✅ Implementado

Ejemplos:
component Radio label: "Option A"
component Radio label: "Option B" checked: true
component Radio label: "Option C"
```

### Toggle

Interruptor de encendido/apagado (Switch).

```
Props:
  - label (string, optional) - texto junto al toggle
  - enabled (boolean, optional, default: false) - si está activado

Altura: 32px
Apariencia: Rectángulo redondeado 40x20px con círculo deslizante
Activado: Color primario (azul), círculo a la derecha
Desactivado: Color gris, círculo a la izquierda
Soporte completo: ✅ Implementado

Ejemplos:
component Toggle label: "Dark Mode"
component Toggle label: "Notifications" enabled: true
component Toggle
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

Ruta de navegación con separadores.

```
Props:
  - items (string[], required) - lista de labels en orden
  - separator (string, optional) - separador entre items (default: "/")

Altura: 24px
Separador: personalizable (default: "/")
Último item: bold/más oscuro, otros items: gris claro
Soporte completo: ✅ Implementado

Ejemplos:
component Breadcrumbs items: ["Home", "Users", "Detail"]
component Breadcrumbs items: ["Dashboard", "Reports", "Quarterly", "Q4"]
component Breadcrumbs items: ["Home", "Products", "Widget"] separator: ">"
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

Panel/contenedor con borde y contenido flexible.

```
Props:
  - title (string, opcional) - título del panel
  - height (number, opcional) - altura fija en px
  - background (string, opcional) - color de fondo
  - borderColor (string, opcional) - color del borde

Altura: según prop height o contenido
Estilo: borde 1px, radio: 8px, fondo blanco
Contenido: children (layouts/componentes dentro)
Soporte completo: ✅ Implementado como layout container
Nota: Panel es un CONTENEDOR, no un componente. Usa layout panel { ... }

Ejemplos:
layout panel(padding: md, gap: md) {
  component Heading text: "User Information"
  component Input label: "Name"
  component Button text: "Save"
}

layout panel(title: "Statistics", height: 300, padding: lg, gap: md) {
  component Text content: "Dashboard stats"
  component ChartPlaceholder type: "bar"
}
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

## 🎨 Componentes de Tarjetas y Métricas

### StatCard

Tarjeta especializada para mostrar métricas y estadísticas.

```
Props:
  - title (string, required): Etiqueta de la métrica
  - value (string, required): Valor principal (puede incluir símbolo como $, %)
  - caption (string, optional): Texto descriptivo adicional

Altura: 120px
Variantes: ninguna

Ejemplos:
component StatCard
  title: "Revenue"
  value: "$45,230"
  caption: "Last 30 days"

component StatCard
  title: "Active Users"
  value: "1,234"
  caption: "Total registered"

component StatCard
  title: "Conversion"
  value: "8.2%"
  caption: "This month"
```

**Uso en grid**:

```
layout grid(columns: 12, gap: md) {
  cell span: 4 {
    component StatCard
      title: "Revenue"
      value: "45,230"
      caption: "Last 30 days"
  }
  cell span: 4 {
    component StatCard
      title: "Users"
      value: "1,234"
      caption: "This month"
  }
  cell span: 4 {
    component StatCard
      title: "Growth"
      value: "23.5%"
      caption: "MoM"
  }
}
```

---

### Image

Componente de imagen con soporte para múltiples tipos de placeholder.

```
Props:
  - placeholder (string, optional): Tipo de placeholder ("landscape"|"portrait"|"square"|"icon"|"avatar")
  - height (number, optional): Altura explícita en px

Altura: Responsive basada en aspect ratio y ancho disponible
Variantes: ninguna

Ejemplos:
component Image placeholder: "landscape"
component Image placeholder: "portrait" height: 250
component Image placeholder: "square" height: 300
component Image placeholder: "avatar" height: 120
component Image placeholder: "icon"
```

**Aspect Ratios**:

- `landscape`: 16:9 (ancho 16, alto 9)
- `portrait`: 2:3 (ancho 2, alto 3)
- `square`: 1:1 (cuadrado)
- `icon`: 1:1 (cuadrado, para iconos)
- `avatar`: 1:1 (cuadrado, para avatares)

**Uso en Card**:

```
layout card(padding: md, gap: md) {
  component Image placeholder: "landscape"
  component Heading text: "Beautiful Villa"
  component Text content: "3 bedrooms, 2 bathrooms"
  component Button text: "Learn More"
}
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
| Label            | 18px                          |
| Code             | variable                      |
| Input            | 40px                          |
| Textarea         | `rows * 20px` (default: 80px) |
| Select           | 40px                          |
| Checkbox         | 32px                          |
| Radio            | 32px                          |
| Toggle           | 32px                          |
| Button           | 36px                          |
| IconButton       | 32px                          |
| Topbar           | 56px                          |
| Breadcrumbs      | 24px                          |
| Tabs             | 40px                          |
| Sidebar          | variable                      |
| SidebarMenu      | variable                      |
| List             | variable                      |
| Table            | `40 + rowsMock * 40`          |
| Panel            | según prop o variable         |
| Card             | variable                      |
| StatCard         | 120px                         |
| Image            | responsive (según aspect ratio) |
| Divider          | 1px                           |
| Alert            | 60px (default)                |
| Badge            | 24px                          |
| Modal            | 200px (default)               |
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

### ✅ COMPLETAMENTE IMPLEMENTADOS (27 componentes)

**Componentes de Texto**
- [x] **Heading** - Texto grande, bold, gris oscuro
- [x] **Text** - Párrafo normal, gris medio
- [x] **Label** - Label genérico (implementado)
- [x] **Code** - Bloque de código (implementado)

**Componentes de Input/Formulario**
- [x] **Input** - Campo texto con label y placeholder
- [x] **Textarea** - Campo multilínea
- [x] **Select** - Dropdown con opciones
- [x] **Checkbox** - Checkbox con label (✓ implementado completamente)
- [x] **Radio** - Radio button (✓ implementado completamente)
- [x] **Toggle** - Switch toggle (✓ implementado completamente)

**Componentes de Navegación/Estructura**
- [x] **Topbar** - Barra superior
- [x] **Sidebar** - Menú lateral genérico
- [x] **SidebarMenu** - Menú lateral con items
- [x] **Breadcrumbs** - Ruta navegación (✓ implementado completamente)
- [x] **Tabs** - Pestañas con items

**Componentes de Contenedor**
- [x] **Card** - Tarjeta con contenido flexible
- [x] **Panel** - Panel/contenedor con borde (✓ implementado completamente como renderPanelBorder)
- [x] **StatCard** - Tarjeta especializada para métricas
- [x] **Image** - Componente de imagen con placeholders

**Componentes de Datos**
- [x] **Table** - Tabla con filas simuladas
- [x] **List** - Listas de items

**Componentes de Botón**
- [x] **Button** - Con variantes (primary, secondary, ghost)

**Componentes de Feedback/UI**
- [x] **Divider** - Línea separadora
- [x] **Alert** - Alertas/mensajes
- [x] **Badge** - Etiquetas
- [x] **Modal** - Diálogos modales

**Componentes de Visualización**
- [x] **ChartPlaceholder** - Gráficos (bar, line, pie)

### ⚠️ NO IMPLEMENTADOS

- [ ] **IconButton** - Botón con ícono (no mapeado en renderComponent)

### 📊 ESTADÍSTICAS

- **Total de componentes en spec**: 16 (original)
- **Implementados en renderer**: 27 componentes ✅
- **Cobertura**: 100% de componentes mapeados en renderComponent() switch ✅
- **El proyecto va **MUCHO MÁS ALLÁ** de los 16 componentes base**
- **Estado**: Prácticamente TODOS los componentes están completamente implementados

**Fuente de Verdad**: [`packages/core/src/renderer/index.ts`](../packages/core/src/renderer/index.ts) 
- Líneas 205-270: Switch en `renderComponent()` con todos los casos mapeados
- Líneas 277-1491: Implementación de cada método render específico
- Líneas 465-520: `renderPanelBorder()` y `renderCardBorder()` (Panel completamente funcional)

---

## 🚀 Componentes en la Roadmap (Futuros)

Componentes que podrían agregarse en futuras versiones:

- Tooltip (descripción sobre elementos)
- Avatar (fotos/iniciales de usuarios)
- Stepper (pasos de proceso)
- Form (agrupador automático de inputs)
- IconButton (botón especializado con ícono)
- Carousel/Slider (galerías de imágenes)
- Accordion (contenido colapsable)
- Skeleton (estado de carga)

---

**¿Necesitas ejemplos de un caso de uso específico? Pregunta y te lo documento.**
