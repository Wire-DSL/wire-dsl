# Plan de Implementación: Wire Live

## Introducción
Este documento detalla el plan de implementación para el paquete `web` que contiene la aplicación web **Wire Live**. La aplicación permitirá a los usuarios escribir y editar código `.wire`, renderizarlo en tiempo real como SVG, gestionar errores y diagnósticos, trabajar con múltiples pantallas y persistir el trabajo localmente.

## Historias de Usuario
El plan se basa en las siguientes historias de usuario:

### WL-01 — Editor de Wire DSL con resaltado y ergonomía básica
- **Frontend**:
  - Integrar un editor de texto con:
    - Numeración de líneas
    - Resaltado de sintaxis para Wire DSL (reutilizar la extensión de VS Code en Monaco o implementar un módulo para CodeMirror 6).
    - Indentación automática y soporte para tab/shift-tab.
    - Búsqueda básica (Ctrl/Cmd+F).
  - Implementar soporte para múltiples archivos (opcional, mínimo: un archivo en pantalla + importar/abrir otros).
  - Implementar funcionalidad de abrir archivos locales `.wire`.
  - Implementar funcionalidad de pegar código en un documento vacío.
  - Mostrar el nombre del archivo actual y el estado (modificado/guardado localmente).
  - Mantener el cursor/selección estable al re-renderizar.
- **Infra/DevEx**:
  - Configurar el repositorio para OSS (build, lint, CI).
- **QA**:
  - Probar con código largo, archivos grandes y atajos de teclado.

### WL-02 — Renderizado live a SVG con preview estable
- **Frontend**:
  - Integrar el renderer local de `@wire-dsl/core` con debounce para evitar renders por cada pulsación de tecla.
  - Implementar un panel de previsualización de SVG con:
    - Controles de zoom in/out.
    - Fit to view.
    - Pan/scroll.
  - Implementar un indicador de estado (Rendering… / Up to date).
  - Manejar estados de error de renderizado de forma no intrusiva.
- **QA**:
  - Probar renders con errores, renders frecuentes y archivos grandes.

### WL-03 — Panel de Problemas (diagnostics) con navegación
- **Frontend**:
  - Implementar un panel inferior (drawer) para mostrar diagnósticos.
  - Mostrar severidad, mensaje, archivo, línea y columna en cada diagnóstico.
  - Implementar navegación desde el panel al editor (posicionar el cursor en el lugar del error).
  - Implementar persistencia local del estado del drawer (abierto/cerrado).
- **QA**:
  - Probar navegación, múltiples archivos y mensajes largos.

### WL-04 — Multi-screen: canvas en grilla a partir de las `screen`
- **Frontend**:
  - Interpretar la salida del core para detectar múltiples `screen`.
  - Renderizar frames (cards) en un canvas con layout de grilla.
  - Implementar selección de frames.
  - Implementar filtro para mostrar una sola screen (opcional).
- **QA**:
  - Probar con 1 screen y múltiples screens, incluyendo nombres largos.

### WL-05 — Persistencia local del trabajo (IndexedDB) y “Open/Export”
- **Frontend**:
  - Implementar modelo de persistencia en IndexedDB para guardar:
    - Contenido `.wire` (uno o varios archivos).
    - Estado UI mínimo (archivo activo, estado del drawer).
  - Implementar auto-save con throttling.
  - Implementar exportación de SVG.
  - (Opcional) Implementar exportación/importación de proyectos (zip o JSON).
- **QA**:
  - Probar persistencia, límites de almacenamiento y modo incógnito.

### WL-06 — Página de ejemplos y plantillas básicas
- **Frontend**:
  - Crear una librería de ejemplos embebidos.
  - Implementar un selector de ejemplos que cargue snippets y actualice la previsualización.
- **QA**:
  - Verificar que los ejemplos siempre se rendericen correctamente.

## Decisión sobre el Editor
### Opción 1: Monaco Editor
- **Ventajas**:
  - Reutilización de la extensión existente para VS Code.
  - Soporte robusto para TypeScript y personalización avanzada.
- **Desventajas**:
  - Más pesado en términos de tamaño y rendimiento.

### Opción 2: CodeMirror 6
- **Ventajas**:
  - Más ligero y rápido.
  - Mejor rendimiento en navegadores con recursos limitados.
- **Desventajas**:
  - Requiere reescribir la extensión de VS Code como un módulo para CodeMirror.

**Propuesta**: Optar por **Monaco Editor** inicialmente para aprovechar la extensión existente y acelerar el desarrollo. Evaluar migrar a CodeMirror 6 en el futuro si el rendimiento es un problema.

## Stack Tecnológico
- **Framework**: React
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Bundler**: Vite (por su rapidez y simplicidad)

## Entregables
1. Implementación de las historias de usuario WL-01 a WL-06.
2. Configuración del repositorio para OSS (build, lint, CI).
3. Documentación de uso y contribución.
4. Pruebas unitarias y de integración para las funcionalidades clave.

## Plan de Trabajo
1. **Configuración inicial**:
   - Configurar Vite con React, TypeScript y Tailwind.
   - Configurar herramientas de desarrollo (ESLint, Prettier, CI/CD).
2. **WL-01**: Implementar el editor de Wire DSL.
3. **WL-02**: Implementar el renderizado live a SVG.
4. **WL-03**: Implementar el panel de problemas.
5. **WL-04**: Implementar el soporte para múltiples pantallas.
6. **WL-05**: Implementar la persistencia local y exportación.
7. **WL-06**: Implementar la página de ejemplos.
8. **QA y pruebas finales**.
9. **Documentación y entrega final**.

## Notas
- Priorizar la experiencia del usuario y el rendimiento.
- Mantener el código modular y reutilizable.
- Iterar con el equipo para validar decisiones clave (e.g., elección del editor).

---

**Fecha de creación:** 31 de enero de 2026