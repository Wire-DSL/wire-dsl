# Tokens de Estilo

## Propósito

Los **tokens** son valores predefinidos que garantizan **consistencia visual** en todos los wireframes, sin llegar a ser un "diseño final".

Los tokens controlan:

- Espaciado
- Bordes y radios
- Densidad de UI
- Tipografía base
- **Colores (fondos, backgrounds)**

---

## Background (Color de Fondo)

Controla el color de fondo **por defecto** para todas las pantallas.

| Token      | Descripción                    | Valor  |
| ---------- | ------------------------------ | ------ |
| `white`    | Blanco                         | #FFFFFF |
| `black`    | Negro                          | #000000 |
| `gray`     | Gris estándar                  | #6B7280 |
| Custom     | Colores personalizados         | Custom |

**Precedencia**:

1. **Screen parameter** (más específico): `screen Dashboard(background: lightBlue)`
2. **Project token** (default global): `tokens background: lightGray`
3. **Theme default** (fallback): blanco (#FFFFFF)

**Ejemplo DSL**:

```
project "App" {
  colors {
    lightGray: #F3F4F6
    lightBlue: #DBEAFE
  }
  
  tokens background: lightGray  // Default para todas las pantallas
  
  screen Dashboard {
    // Usa background: lightGray (del token)
  }
  
  screen Custom(background: lightBlue) {
    // Override: usa lightBlue en lugar del token
  }
}
```

**En IR**:

```json
{
  "tokens": {
    "background": "lightGray"  // Token nivel proyecto
  },
  "screens": [
    {
      "name": "Dashboard",
      "background": null  // Usa token
    },
    {
      "name": "Custom",
      "background": "lightBlue"  // Override de token
    }
  ]
}
```

---

## Spacing (Espaciado)

Controla `gap`, `padding`, y márgenes.

| Token | Valor | Uso                              |
| ----- | ----- | -------------------------------- |
| `xs`  | 4px   | Espaciado mínimo                 |
| `sm`  | 8px   | Espaciado pequeño                |
| `md`  | 16px  | **Default** - Espaciado estándar |
| `lg`  | 24px  | Espaciado grande                 |
| `xl`  | 32px  | Espaciado extra grande           |

**Ejemplo DSL**:

```
layout stack(gap: md, padding: lg) { ... }
```

**En IR**:

```json
{
  "style": {
    "gap": "md",
    "padding": "lg"
  }
}
```

**Resolución**:

```
gap: "md" → 16px
padding: "lg" → 24px
```

---

## Radius (Bordes redondeados)

Controla el radio de los bordes.

| Token  | Valor | Uso                             |
| ------ | ----- | ------------------------------- |
| `none` | 0     | Sin redondeo                    |
| `sm`   | 2px   | Redondeo sutil                  |
| `md`   | 4px   | **Default** - Redondeo estándar |
| `lg`   | 8px   | Redondeo pronunciado            |

**Aplicación**:

- Botones, inputs, cards, panels

**Ejemplo**:

```json
{
  "tokens": {
    "radius": "md"
  }
}
```

---

## Stroke (Grosor de bordes)

Controla el grosor de los bordes.

| Token    | Valor | Uso                           |
| -------- | ----- | ----------------------------- |
| `thin`   | 1px   | Bordes sutiles                |
| `normal` | 2px   | **Default** - Bordes estándar |

**Aplicación**:

- Bordes de componentes
- Separadores

**Ejemplo**:

```json
{
  "tokens": {
    "stroke": "normal"
  }
}
```

---

## Density (Densidad de UI)

Controla el espaciado general de la interfaz.

| Token         | Descripción            | Efecto                        |
| ------------- | ---------------------- | ----------------------------- |
| `compact`     | UI compacta            | Reduce padding y gap en ~25%  |
| `normal`      | **Default** - Estándar | Valores base                  |
| `comfortable` | UI espaciosa           | Aumenta padding y gap en ~25% |

**Efecto sobre spacing**:

**Normal** (base):

- `md` = 16px

**Compact**:

- `md` = 12px (~25% menos)

**Comfortable**:

- `md` = 20px (~25% más)

**Ejemplo**:

```json
{
  "tokens": {
    "density": "compact"
  }
}
```

---

## Font (Tipografía)

Controla la fuente base utilizada.

| Token   | Descripción                                |
| ------- | ------------------------------------------ |
| `base`  | **Default** - Fuente estándar (sans-serif) |
| `title` | Fuente para títulos (serif o display)      |
| `mono`  | Fuente monoespaciada (código)              |

**Nota**: En wireframes, esto es principalmente decorativo. El renderer puede ignorarlo o aplicar variaciones sutiles.

**Ejemplo**:

```json
{
  "tokens": {
    "font": "base"
  }
}
```

---

## Configuración Global

Los tokens se definen a nivel de `project`:

**DSL**:

```
project "My App" {
  tokens density: comfortable
  tokens spacing: lg
  tokens radius: sm
  tokens stroke: thin
  tokens font: base

  screen Home { ... }
}
```

**IR**:

```json
{
  "project": {
    "tokens": {
      "density": "comfortable",
      "spacing": "lg",
      "radius": "sm",
      "stroke": "thin",
      "font": "base"
    }
  }
}
```

---

## Defaults

Si no se especifican, se usan estos valores:

```json
{
  "density": "normal",
  "spacing": "md",
  "radius": "md",
  "stroke": "normal",
  "font": "base"
}
```

---

## Resolución de Tokens

El **normalizador** (al generar IR) resuelve los tokens a valores concretos cuando es necesario, pero los mantiene como tokens en el IR para permitir temas o ajustes posteriores.

El **layout engine** convierte tokens a píxeles:

```
"gap": "md" → 16px (con density: normal)
"gap": "md" → 12px (con density: compact)
```

---

## Extensibilidad Futura

Potenciales tokens adicionales:

- **Color palette**: esquema de colores wireframe
- **Shadows**: sombras predefinidas
- **Typography scale**: escala de tamaños de fuente
- **Animation speed**: velocidad de transiciones

---

## Uso en AI Generation

Los tokens son especialmente útiles para IA:

- **Consistencia**: la IA usa siempre los mismos valores
- **Predictibilidad**: patrones repetibles
- **Semántica**: `gap: lg` es más semántico que `gap: 24`

**Ejemplo de prompt a IA**:

```
"Crea un dashboard con density comfortable y spacing lg"
```

La IA genera:

```
project "Dashboard" {
  tokens density: comfortable
  tokens spacing: lg

  screen Main {
    layout stack(gap: lg, padding: xl) { ... }
  }
}
```
