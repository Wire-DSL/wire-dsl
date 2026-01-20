# Reglas de Validación

## Propósito

Las validaciones aseguran que el DSL/IR sea **no ambiguo** y **renderable**.

Se realizan en dos fases:

1. **Sintáctica**: durante el parsing (estructura del DSL)
2. **Semántica**: durante la normalización (lógica y consistencia)

---

## Validaciones Sintácticas

Realizadas por el **parser**.

### Estructura de bloques

- ✅ Un `project` debe tener al menos un `screen`
- ✅ Un `screen` debe tener exactamente un layout raíz
- ✅ Los bloques `layout` deben estar correctamente cerrados
- ✅ Las propiedades deben seguir el formato `key: value`

**Ejemplo inválido**:

```
project "App" {
  // ERROR: sin screens
}
```

---

### Sintaxis de propiedades

- ✅ Las propiedades deben tener formato válido
- ✅ Los arrays deben usar `[...]`
- ✅ Los strings pueden estar entre comillas o sin ellas (si no tienen espacios)

**Ejemplo válido**:

```
component Button text: "Click me" variant: primary
component List items: ["A", "B", "C"]
```

**Ejemplo inválido**:

```
component Button text Click me  // ERROR: falta comillas
```

---

## Validaciones Semánticas

Realizadas por el **normalizador** al generar IR.

### Screens

- ✅ Los IDs de screen deben ser únicos
- ✅ Cada screen debe tener exactamente un layout raíz
- ✅ Los IDs no pueden contener espacios ni caracteres especiales

**Ejemplo inválido**:

```
screen Users List {  // ERROR: espacio en ID
  ...
}
```

**Correcto**:

```
screen UsersList {
  ...
}
```

---

### Layouts

#### Stack

- ✅ `direction` debe ser `vertical` o `horizontal`
- ✅ `gap` debe ser un token de spacing válido

**Ejemplo inválido**:

```
layout stack(direction: diagonal) {  // ERROR: dirección inválida
  ...
}
```

---

#### Grid

- ✅ Debe especificar `columns` (o usar default 12)
- ✅ `columns` debe ser un número > 0
- ✅ Cada celda debe tener `span` válido (entre 1 y columns)

**Ejemplo inválido**:

```
layout grid(columns: 12) {
  cell span: 15 {  // ERROR: span > columns
    ...
  }
}
```

---

#### Split

- ✅ Debe especificar `sidebar` (ancho del panel izquierdo)
- ✅ `sidebar` debe ser un número > 0
- ✅ Debe tener exactamente dos slots: `left` y `right`

**Ejemplo inválido**:

```
layout split(sidebar: 260) {
  left: stack { ... }
  // ERROR: falta slot right
}
```

---

### Componentes

#### General

- ✅ `componentType` debe ser un tipo válido (ver biblioteca)
- ✅ Las props requeridas deben estar presentes

---

#### Table

- ✅ Debe especificar `columns` (array de strings)
- ✅ `rowsMock` debe ser un número >= 0

**Ejemplo inválido**:

```
component Table rowsMock: 5  // ERROR: falta columns
```

**Correcto**:

```
component Table columns: ["Name", "Email"] rowsMock: 5
```

---

#### Input, Textarea, Select

- ✅ Si tiene `label`, debe ser string
- ✅ Si tiene `placeholder`, debe ser string

---

#### Button

- ✅ Debe tener `text`
- ✅ `variant` (si se especifica) debe ser `primary`, `secondary`, o `ghost`

**Ejemplo inválido**:

```
component Button variant: danger  // ERROR: variant inválido
```

---

### Eventos

#### onClick, onRowClick

- ✅ La acción debe ser válida
- ✅ `goto()` debe referenciar un screen existente

**Ejemplo inválido**:

```
component Button
  text: "Go"
  onClick: goto("NonExistentScreen")  // ERROR: screen no existe
```

**Correcto**:

```
screen Home { ... }

screen Dashboard {
  layout stack {
    component Button text: "Home" onClick: goto("Home")  // ✅ screen existe
  }
}
```

---

### Referencias

#### Node References

- ✅ Todas las referencias (`ref`) deben apuntar a nodos existentes en `nodes`
- ✅ No pueden haber referencias circulares

**Ejemplo inválido (IR)**:

```json
{
  "children": [
    { "ref": "nonexistent_node" } // ERROR: nodo no existe
  ]
}
```

---

### Tokens

- ✅ Los valores de spacing deben ser válidos: `xs`, `sm`, `md`, `lg`, `xl`
- ✅ Los valores de radius deben ser válidos: `none`, `sm`, `md`, `lg`
- ✅ Los valores de density deben ser válidos: `compact`, `normal`, `comfortable`
- ✅ Los valores de stroke deben ser válidos: `thin`, `normal`
- ✅ Los valores de font deben ser válidos: `base`, `title`, `mono`

**Ejemplo inválido**:

```
tokens spacing: huge  // ERROR: token inválido
```

---

## Validaciones de Layout Engine

Realizadas durante el cálculo de layout.

### Dimensiones

- ⚠️ **Warning** si el contenido excede el viewport
- ⚠️ **Warning** si un elemento tiene ancho/alto = 0
- ❌ **Error** si no se puede calcular la posición de un elemento

---

### Overflow

- ⚠️ **Warning** si hay overflow (contenido > contenedor)
- El renderer debe manejar esto con scroll o truncado

---

## Validaciones Opcionales (Linter)

Recomendaciones de mejores prácticas (no bloquean el render):

### Estructura

- 💡 **Sugerencia**: evitar layouts anidados innecesariamente
- 💡 **Sugerencia**: usar grid en lugar de stacks horizontales complejos

---

### Navegación

- 💡 **Sugerencia**: toda screen debe ser alcanzable desde Home
- 💡 **Sugerencia**: evitar navegaciones circulares sin salida

---

### Componentes

- 💡 **Sugerencia**: tablas con >10 columnas pueden ser difíciles de leer
- 💡 **Sugerencia**: textos >200 caracteres deberían usar Textarea

---

## Mensajes de Error

Los errores deben ser:

1. **Claros**: indicar qué está mal
2. **Ubicables**: mostrar línea/columna (si es del parser)
3. **Accionables**: sugerir cómo corregir

**Ejemplo**:

```
Error en línea 12, columna 5:
  layout grid(columns: 12) {
    cell span: 15 {
           ^^
Error: 'span' (15) excede el número de columnas (12)
Sugerencia: Usa un valor entre 1 y 12
```

---

## Testing de Validaciones

Cada regla debe tener:

1. **Test positivo**: caso válido pasa
2. **Test negativo**: caso inválido falla con error esperado

**Ejemplo**:

```typescript
test("Table debe tener columns", () => {
  const dsl = `
    component Table rowsMock: 5
  `;

  expect(() => parse(dsl)).toThrow('Table requires "columns" property');
});
```

---

## Prioridad de Validaciones

1. **Críticas** (bloquean render): sintaxis, referencias rotas
2. **Importantes** (pueden causar problemas): dimensiones, overflow
3. **Sugerencias** (mejoras): linter, best practices

---

## Futuras Validaciones

- **Accesibilidad**: verificar que inputs tengan labels
- **Performance**: advertir sobre grids muy grandes
- **Consistencia**: detectar patrones inconsistentes (diferentes tokens en screens similares)
