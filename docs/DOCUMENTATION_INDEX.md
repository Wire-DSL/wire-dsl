# 📖 Índice de Documentación WireDSL

Guía rápida para navegar toda la documentación del proyecto.

---

## ⭐ EMPIEZA AQUÍ (Updated 21 Jan)

1. **[RECOMMENDATION.md](./RECOMMENDATION.md)** - Qué hacer próximo (con nuevas features)
2. **[ACTION_PLAN.md](./ACTION_PLAN.md)** - Plan 2 semanas
3. **[QUICK_START.md](./QUICK_START.md)** - Acceso rápido a documentación

---

## 🚀 Comienza Aquí (General)

1. **[START_HERE.txt](./START_HERE.txt)** - Introducción general
2. **[QUICKSTART.md](./QUICKSTART.md)** - Primeros pasos rápidos
3. **[README.md](../README.md)** - Descripción del proyecto

---

## 📚 Guías Principales

### Componentes

- **[COMPONENTS_STATUS.md](./COMPONENTS_STATUS.md)** ⭐ **EMPIEZA AQUÍ**
  - Estado actual de implementación
  - 25+ componentes disponibles
  - Próximos pasos recomendados

- **[COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)** 📖 Referencia Completa
  - Guía detallada de cada componente
  - Ejemplos de uso
  - Props y eventos
  - Dimensiones intrínsecas

### Arquitectura

- **[architecture.md](./architecture.md)** - Visión general de la arquitectura
- **[ARCHITECTURE_DETAILED.md](./ARCHITECTURE_DETAILED.md)** - Análisis detallado
- **[arquitectura_wire_dsl_wireframes_declarativos_tipo_mermaid.md](../arquitectura_wire_dsl_wireframes_declarativos_tipo_mermaid.md)** - Diagrama con Mermaid

### Características del DSL

- **[dsl-syntax.md](./dsl-syntax.md)** - Sintaxis del lenguaje
- **[domain-model.md](./domain-model.md)** - Modelo de datos conceptual

### Especificaciones Técnicas

- **[specs/](../specs/)** - Carpeta de especificaciones
  - `components.md` - Spec de componentes
  - `layout-engine.md` - Motor de layout
  - `ir-contract.md` - Contrato de IR (intermediate representation)
  - `validation-rules.md` - Reglas de validación
  - `tokens.md` - Sistema de tokens/espaciado

### Roadmap

- **[roadmap.md](./roadmap.md)** - Plan de desarrollo futuro
- **[core-todo.md](./core-todo.md)** - TODO list del core (actualizado)

### Stack Técnico

- **[technical-stack.md](./technical-stack.md)** - Tecnologías utilizadas

---

## 🛠️ Referencia por Componente

**Quiero conocer/usar un componente específico:**

1. Abre **[COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)**
2. Busca el componente por nombre
3. Copia el ejemplo DSL
4. Pégalo en tu archivo `.wire`

**Componentes disponibles**: 25+ (ver [COMPONENTS_STATUS.md](./COMPONENTS_STATUS.md))

---

## 💻 Estructura del Proyecto

```
wireframes/
├── docs/
│   ├── COMPONENTS_STATUS.md      ← ⭐ EMPIEZA AQUÍ para componentes
│   ├── COMPONENTS_REFERENCE.md   ← Referencia completa
│   ├── architecture.md
│   ├── core-todo.md              ← Estado del core
│   ├── dsl-syntax.md
│   ├── roadmap.md
│   └── ...
├── packages/
│   ├── core/                     ← Motor principal (parser, IR, layout, renderer)
│   ├── cli/                      ← Interfaz de línea de comandos
│   ├── web/                      ← Web editor
│   └── ai-backend/               ← Backend IA (experimental)
├── specs/                        ← Especificaciones formales
│   ├── components.md
│   ├── layout-engine.md
│   ├── tokens.md
│   └── ...
├── examples/                     ← Ejemplos .wire
└── README.md
```

---

## 🎯 Guías por Caso de Uso

### "Quiero aprender qué componentes existen"

1. Lee [COMPONENTS_STATUS.md](./COMPONENTS_STATUS.md) (5 min)
2. Lee [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md) (20 min)

### "Quiero crear un wireframe"

1. [QUICKSTART.md](../QUICKSTART.md)
2. [dsl-syntax.md](./dsl-syntax.md)
3. [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md)
4. Ver ejemplos en `examples/*.wire`

### "Quiero entender la arquitectura"

1. [architecture.md](./architecture.md) (rápido)
2. [ARCHITECTURE_DETAILED.md](./ARCHITECTURE_DETAILED.md) (profundo)
3. [arquitectura_wire_dsl_wireframes_declarativos_tipo_mermaid.md](../arquitectura_wire_dsl_wireframes_declarativos_tipo_mermaid.md) (visual)

### "Quiero contribuir al core"

1. [core-todo.md](./core-todo.md) - Qué falta
2. [specs/validation-rules.md](../specs/validation-rules.md)
3. [specs/layout-engine.md](../specs/layout-engine.md)

### "Quiero ver el roadmap"

1. [roadmap.md](./roadmap.md)

---

## 📝 Documentación por Fase

### MVP Core (FASE 1 - Completada ✅)

- Parser ✅
- IR Generator ✅
- Layout Engine ✅
- SVG Renderer ✅
- 25+ Componentes ✅
- CLI básico ✅

**Ver**: [core-todo.md](./core-todo.md)

### Fase 2 - Validaciones & Pulido

- Validar inputs semántica
- Mejorar CLI
- Web editor mejorado
- Documentación

**Ver**: [roadmap.md](./roadmap.md)

### Fase 3+ - Expansión

- Exportadores (HTML, React, Figma)
- Componentes avanzados
- Integración IA

---

## 🔗 Links Rápidos

| Acción                 | Archivo                                              |
| ---------------------- | ---------------------------------------------------- |
| Ver estado componentes | [COMPONENTS_STATUS.md](./COMPONENTS_STATUS.md)       |
| Usar un componente     | [COMPONENTS_REFERENCE.md](./COMPONENTS_REFERENCE.md) |
| Entender sintaxis DSL  | [dsl-syntax.md](./dsl-syntax.md)                     |
| Crear proyecto nuevo   | [QUICKSTART.md](../QUICKSTART.md)                    |
| Ver ejemplos           | [examples/](../examples/)                            |
| Entender arquitectura  | [architecture.md](./architecture.md)                 |
| Contribuir             | [core-todo.md](./core-todo.md)                       |

---

## 📊 Actualización: 21 de Enero 2026

- ✅ Documentación de componentes completada
- ✅ Estado real del proyecto analizado
- ✅ 25+ componentes identificados
- ✅ Guías creadas y centralizadas

**Próxima actualización**: Cuando se completen validaciones semánticas

---

**¿Necesitas ayuda con algo específico? Consulta el índice anterior o pregunta en los issues.**
