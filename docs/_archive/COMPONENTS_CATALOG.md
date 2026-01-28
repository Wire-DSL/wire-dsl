# 🎨 Catálogo Visual de Componentes WireDSL

**Catálogo con estado real de implementación (22/26)**

---

## ✅ COMPONENTES TEXTUALES

| #   | Componente  | Estado  | Props Clave | Ejemplo DSL                         | Altura   |
| --- | ----------- | ------- | ----------- | ----------------------------------- | -------- |
| 1   | **Heading** | ✅ 100% | `text`      | `component Heading text: "Title"`   | 32px     |
| 2   | **Text**    | ✅ 100% | `content`   | `component Text content: "..."`     | variable |
| 3   | **Label**   | ✅ 100% | `text`      | `component Label text: "Name:"`     | -        |
| 4   | **Code**    | ✅ 100% | `content`   | `component Code content: "code..."` | variable |

---

## ✅ COMPONENTES DE ENTRADA (FORM)

| #   | Componente   | Estado  | Props Clave                       | Ejemplo DSL                                                 | Altura    |
| --- | ------------ | ------- | --------------------------------- | ----------------------------------------------------------- | --------- |
| 5   | **Input**    | ✅ 100% | `label`, `placeholder`            | `component Input label: "Name" placeholder: "..."`          | 40px      |
| 6   | **Textarea** | ✅ 100% | `label`, `placeholder`, `rows`    | `component Textarea rows: 6`                                | rows×20px |
| 7   | **Select**   | ✅ 100% | `label`, `options`, `placeholder` | `component Select label: "Role" options: ["Admin", "User"]` | 40px      |
| 8   | **Checkbox** | ✅ 100% | `label`, `checked`                | `component Checkbox label: "Accept"`                        | 20px      |
| 9   | **Radio**    | ✅ 100% | `label`, `value`                  | `component Radio label: "Option"`                           | 20px      |
| 10  | **Toggle**   | ✅ 100% | `label`, `checked`                | `component Toggle label: "Dark mode"`                       | 32px      |

---

## ✅ COMPONENTES DE BOTÓN & ACCIÓN

| #   | Componente     | Estado             | Props Clave       | Ejemplo DSL                                      | Altura |
| --- | -------------- | ------------------ | ----------------- | ------------------------------------------------ | ------ |
| 11  | **Button**     | ✅ 100%            | `text`, `variant` | `component Button text: "Save" variant: primary` | 36px   |
| 12  | **IconButton** | ❌ No implementado | `icon`            | —                                                | 32px   |

---

## ✅ COMPONENTES DE NAVEGACIÓN

| #   | Componente      | Estado             | Props Clave            | Ejemplo DSL                                  | Altura   |
| --- | --------------- | ------------------ | ---------------------- | -------------------------------------------- | -------- |
| 13  | **Topbar**      | ✅ 100%            | `title`                | `component Topbar title: "Dashboard"`        | 56px     |
| 14  | **Sidebar**     | ✅ 100%            | `items`                | `component Sidebar items: ["Home", "Users"]` | variable |
| 15  | **SidebarMenu** | ❌ No implementado | `items`                | —                                            | variable |
| 16  | **Tabs**        | ✅ 100%            | `items`, `activeIndex` | `component Tabs items: ["Tab1", "Tab2"]`     | 40px     |
| 17  | **Breadcrumbs** | ❌ No implementado | `items`                | —                                            | 24px     |

---

## ✅ COMPONENTES DE DATOS

| #   | Componente | Estado  | Props Clave                        | Ejemplo DSL                                               | Altura   |
| --- | ---------- | ------- | ---------------------------------- | --------------------------------------------------------- | -------- |
| 17  | **Table**  | ✅ 100% | `columns`, `rowsMock`, `rowHeight` | `component Table columns: ["Name", "Email"] rowsMock: 10` | 40+10×40 |
| 18  | **List**   | ✅ 100% | `items`                            | `component List items: ["Item 1", "Item 2"]`              | variable |

---

## ✅ COMPONENTES DE CONTENEDOR

| #   | Componente | Estado             | Props Clave        | Ejemplo DSL                        | Altura   |
| --- | ---------- | ------------------ | ------------------ | ---------------------------------- | -------- |
| 19  | **Card**   | ✅ 100%            | `title`            | `component Card title: "Stats"`    | content  |
| 20  | **Panel**  | ❌ No implementado | `title`, `height`  | —                                  | variable |
| 21  | **Modal**  | ✅ 100%            | `title`, `content` | `component Modal title: "Confirm"` | variable |

---

## ✅ COMPONENTES DE FEEDBACK

| #   | Componente  | Estado  | Props Clave       | Ejemplo DSL                                    | Altura |
| --- | ----------- | ------- | ----------------- | ---------------------------------------------- | ------ |
| 22  | **Alert**   | ✅ 100% | `type`, `message` | `component Alert type: "info" message: "Info"` | 48px   |
| 23  | **Badge**   | ✅ 100% | `text`, `variant` | `component Badge text: "New" variant: primary` | 20px   |
| 24  | **Divider** | ✅ 100% | -                 | `component Divider`                            | 1px    |

---

## ✅ COMPONENTES DE DATOS (VISUALIZACIÓN)

| #   | Componente           | Estado  | Props Clave      | Ejemplo DSL                                          | Altura |
| --- | -------------------- | ------- | ---------------- | ---------------------------------------------------- | ------ |
| 25  | **ChartPlaceholder** | ✅ 100% | `type`, `height` | `component ChartPlaceholder type: "bar" height: 200` | 200px  |

---

## 📊 ESTADÍSTICAS DE COBERTURA

```
┌─────────────────────────────────────┐
│  COMPONENTES IMPLEMENTADOS: 22/26   │
│  COBERTURA: ~85% ✅                 │
│  Pendientes (del spec): 4           │
└─────────────────────────────────────┘
```

---

## 🎯 COMPONENTES RECOMENDADOS POR ESCENARIO

### Dashboard Ejecutivo

```
component Topbar title: "Executive Dashboard"
component Tabs items: ["Overview", "Detailed", "Export"]
component Card title: "KPIs"
component ChartPlaceholder type: "line" height: 300
component Table columns: ["Metric", "Value", "Change"] rowsMock: 8
```

### Formulario de Contacto

```
component Heading text: "Contact Us"
component Input label: "Name" placeholder: "Your name"
component Input label: "Email" placeholder: "your@email.com"
component Textarea label: "Message" rows: 6 placeholder: "Your message..."
component Button text: "Send" variant: primary
```

### Admin Panel

```
component Sidebar items: ["Dashboard", "Users", "Roles", "Settings"]
component Topbar title: "Admin Panel"
component Tabs items: ["Active", "Inactive", "Archived"]
component Table columns: ["ID", "Name", "Email", "Role", "Status", "Action"] rowsMock: 15
```

### Configuración de Usuario

```
component Heading text: "Settings"
component Divider
component Label text: "Preferences"
component Toggle label: "Dark Mode"
component Toggle label: "Email Notifications"
component Divider
component Label text: "Account"
component Button text: "Change Password" variant: secondary
component Button text: "Logout" variant: ghost
```

### Catálogo de Productos

```
component Topbar title: "Products"
component Select label: "Category" options: ["All", "Electronics", "Books"]
component List items: ["Product 1", "Product 2", "Product 3"]
component Badge text: "NEW" variant: primary
component Button text: "View Details" variant: primary
```

---

## 📐 TABLA DE DIMENSIONES RÁPIDA

| Altura   | Componentes                                                                                           |
| -------- | ----------------------------------------------------------------------------------------------------- |
| 1px      | Divider                                                                                               |
| 20px     | Badge, Checkbox, Radio                                                                                |
| 24px     | Breadcrumbs (no implementado)                                                                         |
| 32px     | Heading, IconButton (no implementado)                                                                 |
| 36px     | Button                                                                                                |
| 40px     | Input, Select, Tabs, Table Header                                                                     |
| 48px     | Alert                                                                                                 |
| 56px     | Topbar                                                                                                |
| 80px     | Textarea (default: 4 rows)                                                                            |
| 200px    | ChartPlaceholder (default)                                                                            |
| variable | Text, Label, Code, Card, Panel (no implementado), Modal, Sidebar, List, SidebarMenu (no implementado) |

---

## 🎨 VARIANTES DE ESTILO DISPONIBLES

### Button

```
variant: "primary"    → Fondo oscuro, texto blanco (acción principal)
variant: "secondary"  → Borde, fondo claro (acción secundaria)
variant: "ghost"      → Sin borde, solo texto (acción ligera)
```

### ChartPlaceholder

```
type: "bar"   → Gráfico de barras
type: "line"  → Gráfico de líneas
type: "pie"   → Gráfico circular
```

### Alert

```
type: "info"    → Información (azul)
type: "success" → Éxito (verde)
type: "warning" → Advertencia (amarillo)
type: "error"   → Error (rojo)
```

### Badge

```
variant: "primary"   → Fondo principal
variant: "secondary" → Fondo secundario
variant: "neutral"   → Fondo neutro
```

---

## 🚀 CÓMO USAR UN COMPONENTE

**Paso 1**: Busca el componente en esta guía  
**Paso 2**: Copia el ejemplo DSL  
**Paso 3**: Pégalo en tu archivo `.wire`  
**Paso 4**: Ajusta props según necesidad

**Ejemplo completo**:

```
project MyApp
  tokens: spacing: "default"

screen Dashboard
  layout stack direction: vertical gap: md {
    component Topbar title: "My Dashboard"

    layout grid columns: 12 gap: md {
      component Card title: "Card 1" span: 4
      component Card title: "Card 2" span: 4
      component Card title: "Card 3" span: 4
    }

    component Button text: "Save" variant: primary
  }
```

---

## ✨ CONCLUSIÓN

**22 componentes funcionales listos para producción (85%).**

El motor de wireframes está listo para:

- ✅ Crear diseños rápidamente
- ✅ Exportar a SVG
- ✅ Visualizar prototipos estáticos
- ⚠️ Interacción/navegación pendiente (eventos Fase 2)

**Próximos pasos**: Validaciones semánticas, web editor mejorado, exportadores adicionales, eventos (`onClick`, `onRowClick`, `goto`).

---

**¿Necesitas ayuda con un componente específico? Consulta [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md) para detalles completos.**
