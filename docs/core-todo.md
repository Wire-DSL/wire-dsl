# Core TODO

Lista de pendientes para cerrar la primera versión funcional del core.

## Validación del DSL e IR
- [ ] Validar reglas semánticas completas según specs/validation-rules.md y specs/components.md.
- [ ] Rechazar direcciones inválidas en `stack` y spans fuera de rango en `grid`.
- [ ] Exigir `sidebar` en `split` y validar slots (left/right).
- [ ] Verificar props obligatorias por componente (p.ej., `Table` requiere `columns`).
- [ ] Rechazar referencias a pantallas inexistentes en `goto()`.
- [ ] Catalogar y validar `layoutType` y `componentType` contra la lista soportada.
- [ ] Verificar unicidad de IDs de pantalla y constraints (span <= columns, variant válida, etc.).

## Parser / Gramática
- [ ] Cubrir arrays, booleanos, strings sin comillas y eventos en la gramática.
- [ ] Incluir posiciones (línea/columna) para mejores mensajes de error.
- [ ] Obligar a que exista al menos un `screen`.

## Generador de IR
- [ ] Normalizar y validar props tipadas (arrays, enums, variantes) antes de emitir IR.
- [ ] Aplicar estilos/tokens a nodos (no solo almacenarlos).
- [ ] Tipar y validar slots de `split` (left/right) y otros contenedores.

## Layout Engine
- [ ] Procesar todos los screens, no solo el primero.
- [ ] Manejar `align`/`justify`, `fill`/`content`, overflow y warnings especificados en specs/layout-engine.md.
- [ ] Validar y ajustar `span` cuando sobrepase columnas; distribuir espacio sobrante de forma definida.
- [ ] Usar alturas dinámicas según contenido/densidad en lugar de alturas fijas.

## Renderer
- [ ] Renderizar el catálogo completo de componentes (Text, Textarea, Select, Sidebar, Tabs, etc.).
- [ ] Usar `viewport` real y `width/height` provenientes del layout.
- [ ] Eliminar placeholders hardcodeados; derivar estilos desde tokens.
- [ ] Añadir atributos de accesibilidad básicos.

## Pruebas
- [ ] Tests de error/validación para casos inválidos del DSL (negativos).
- [ ] Snapshots del SVG para estabilidad visual.
- [ ] Pruebas de layout para overflow/alignment y spans fuera de rango.

## API integrada
- [ ] Exponer helper end-to-end `compileWire(source) -> { ast, ir, layout, svg }` para consumo por CLI y web.

## Prioridad sugerida
1) Validaciones semánticas + cobertura de gramática.
2) Layout (align/justify/fill/overflow y spans).
3) Renderer con catálogo completo + tokens.
4) Pruebas negativas y snapshots.
5) API integrada end-to-end.
