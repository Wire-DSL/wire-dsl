# Registro de Correcciones de Documentación

**Fecha**: 21 Enero 2026  
**Motivo**: Sincronización de sintaxis DSL después de descubrir errores generados por ChatGPT

## Errores identificados y corregidos

### 1. Sintaxis de `tokens` (CRÍTICO)

**Error**: `tokens density: normal spacing: md` en una sola línea
**Corrección**: Debe estar en líneas separadas:

```
tokens density: normal
tokens spacing: md
```

**Archivos corregidos**:

- ✅ `llm-prompting.md` - Líneas 15, 96, 107, 134, 165, 200
- ✅ `dsl-syntax.md` - Ya estaba correcto en la sección "Configuración Global" (línea 210)

### 2. Sintaxis de `split` (CRÍTICO)

**Error**: Uso de `left: sidebar { ... }` y `right: stack { ... }`
**Corrección**: No llevar etiquetas; solo dos layouts anidados consecutivos:

```
layout split(sidebar: 240, gap: md) {
  layout stack { ... }  // sidebar
  layout stack { ... }  // contenido principal
}
```

**Archivos corregidos**:

- ✅ `llm-prompting.md`:
  - Línea 74: Validaciones clave (removió mención de `left:` y `right:`)
  - Ejemplo 1 (Dashboard): Líneas 136-155
  - Ejemplo 2 (Formulario): Lineas 158-184
  - Ejemplo 3 (Alert+Tabs): Lineas 187-201
- ✅ `dsl-syntax.md`:
  - Línea 42-50: Ejemplo en sección "Screen"
  - Línea 105-120: Explicación de `Split` layout
  - Línea 280-295: Ejemplo completo en "Componentes de Entrada"

## Impacto en LLM

Estas correcciones son **críticas** para que ChatGPT (u otros LLMs) generen archivos `.wire` válidos sin errores de parsing. La documentación `llm-prompting.md` es el punto de entrada para prompts de LLM, así que ahora es la "fuente de verdad" correcta.

## Verificación

Archivo generado por ChatGPT: `examples/gpt-dashboard.wire`

- Estado original: ❌ Parser errors (tokens en una línea, split con left:/right:)
- Estado después de correcciones manuales: ✅ Renderiza correctamente

## Próximos pasos

- Usar `llm-prompting.md` como única referencia para prompts de LLM
- Otros archivos de documentación (`dsl-syntax.md`) son para referencia humana y ahora están sincronizados
