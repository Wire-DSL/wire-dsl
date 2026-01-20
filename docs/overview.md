# WireDSL - Visión General

## Propósito

WireDSL es una plataforma para **crear wireframes/prototipos low-fidelity de forma declarativa**, similar a Mermaid, donde:

- Se definen **pantallas** como bloques
- Cada pantalla contiene **layouts** (split / stack / grid)
- Dentro de los layouts se colocan **componentes wireframe** (tabla, formulario, cards, inputs, etc.)
- El output se renderiza como **mock navegable** y puede exportarse (SVG/PNG/PDF/JSON)

## Objetivo Principal

El formato debe ser **estable, determinístico y AI-friendly**, de modo que una IA pueda generar prototipos siguiendo patrones predecibles.

## Principios de Diseño

### 1. Declaratividad Total

- No se "dibuja"; se **declara estructura**
- El lenguaje describe **intención**, no posiciones absolutas

### 2. Pipeline Determinístico

```
Entrada declarativa → Parser → AST → IR normalizado → Layout engine → Render → Export
```

### 3. AI-Friendly

- Sintaxis repetible
- Defaults consistentes
- Validación estricta con errores claros

### 4. Separación de Responsabilidades

- DSL/Parser desacoplado del render
- Layout engine independiente del renderer
- Modelo de dominio estable (IR versionado)

## Alcance Funcional

### MVP

- Definir `project`, `screen`, `layout`, `component`
- Layouts: `stack`, `grid`, `split`
- Render Web (React/HTML) estático
- Export JSON del IR

### Evolución

- Navegación declarativa (hotspots, `goto(screenId)`)
- Componentes avanzados (Tabs, Forms, Tables con columnas)
- Export SVG/PNG/PDF
- Inspector/Debug overlay (cajas, padding, grid)

## Flujo de Trabajo

1. **Escribir**: Desarrollador/IA escribe archivo `.wire` en DSL
2. **Parsear**: El parser genera AST
3. **Normalizar**: El normalizador produce IR aplicando defaults
4. **Layout**: El layout engine calcula posiciones
5. **Renderizar**: Se genera HTML/React interactivo
6. **Exportar**: Se puede exportar a múltiples formatos

## Casos de Uso

- **Prototipado rápido**: Diseñadores crean wireframes sin herramientas visuales
- **Generación por IA**: LLMs generan prototipos completos desde descripciones
- **Documentación**: Los wireframes son código versionable
- **Comunicación**: Formato legible para compartir entre equipos
