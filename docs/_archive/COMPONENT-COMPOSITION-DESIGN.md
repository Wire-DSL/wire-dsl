# Component Composition System Design

This documentation has been merged into [DSL-SYNTAX.md](./DSL-SYNTAX.md) under the "Defined Components" section.

## 🎯 Ejemplo Visual

### Actual (Sin composición)
```wire
project "Form" {
  screen LoginScreen {
    layout stack {
      component Button text: "OK" variant: primary
      component Button text: "Cancel"
    }
    
    // Para cada lugar donde necesites estos botones,
    // tienes que repetir el código
    layout stack {
      component Button text: "OK" variant: primary
      component Button text: "Cancel"
    }
  }
}
```

### Propuesta (Con composición)
```wire
project "Form" {
  // Definir el componente reutilizable
  define Component "ButtonGroup" {
    layout stack(direction: horizontal, gap: md) {
      component Button text: "OK" variant: primary
      component Button text: "Cancel"
    }
  }

  screen LoginScreen {
    layout stack {
      // Ahora simplemente usamos el componente definido
      component ButtonGroup
      
      // Podemos usarlo en múltiples lugares
      component ButtonGroup
    }
  }
}
```

---

## 🏗️ Sintaxis: Opción Final

**Decisión: `define Component` (Component con mayúscula)**

```wire
define Component "ComponentName" {
  // Contenido: layout, componentes, etc.
}
```

**Por qué esta sintaxis:**
- ✅ Muy clara: `define` = crear definición, `Component` = es un tipo/componente
- ✅ LLM-friendly: ChatGPT entiende claramente la intención
- ✅ VS Code-friendly: Auto-completado inteligente
- ✅ Paralela a estándares: TypeScript `type`, Java `class`, Python `class`
- ✅ Escalable: Permite `define Theme`, `define Layout` en futuro

---

## 🏗️ Arquitectura: Compile-Time

### **Compile-Time (IMPLEMENTACIÓN)**

**¿Cómo funciona?**
1. Parser lee la definición: `component Group "ButtonGroup" { ... }`
2. Registra la definición en una tabla (symbol table)
3. Cuando encuentra `component ButtonGroup`, **expande** la definición
4. El IR final contiene el layout expandido (sin referencias)

**Ventajas:**
- ✅ No necesita cambios en renderer (ya renderiza lo expandido)
- ✅ Rendimiento: sin overhead en runtime
- ✅ Depuración más fácil (ves el código expandido)
- ✅ Compatible con exporters (generan código real)

**Desventajas:**
- ❌ No puedes tener "instancias" diferentes del componente
- ❌ No hay estado dinámico

**Ejemplo de IR generado:**
```json
{
  "kind": "container",
  "containerType": "stack",
  "children": [
    { "kind": "component", "componentType": "Button", "props": { "text": "OK" } },
    { "kind": "component", "componentType": "Button", "props": { "text": "Cancel" } }
  ]
}
```

---

### **Opción B: Runtime (Más flexible)**

**¿Cómo funciona?**
1. Parser crea un "custom component" type
2. El IR contiene referencias: `{ kind: "component", componentType: "ButtonGroup" }`
3. El renderer **resuelve la referencia** en tiempo de renderizado

**Ventajas:**
- ✅ Puedes parametrizar componentes (props)
- ✅ Dinámico y flexible

**Desventajas:**
- ❌ Renderer más complejo
- ❌ Overhead en runtime
- ❌ Exporters necesitan manejo especial

**Ejemplo con parámetros:**
```wire
component Group "ButtonGroup" {
  props: {
    okText: string = "OK",
    cancelText: string = "Cancel"
  }
  
  layout stack(direction: horizontal) {
    component Button text: ${okText}
    component Button text: ${cancelText}
  }
}

screen Login {
  component ButtonGroup okText: "Login" cancelText: "Back"
  component ButtonGroup okText: "Save" cancelText: "Discard"
}
```

---

## 🎯 Fases de Implementación

### **Fase 1: Compile-Time (v0.5) - ESTA SEMANA**
- Componentes reutilizables **sin parámetros**
- Expandidos en tiempo de parseo
- 0 cambios en renderer/layout
- Máximo ROI con mínimo esfuerzo

```wire
define Component "ButtonGroup" {
  layout stack(direction: horizontal, gap: md) {
    component Button text: "OK" variant: primary
    component Button text: "Cancel"
  }
}
```

### **Fase 2: Runtime with Props (v1.0)**
- Agregar parámetros (props)
- Resolver en tiempo de renderizado
- Variable substitution

```wire
define Component "ButtonGroup" {
  props: { okText: "OK", cancelText: "Cancel" }
  
  layout stack(direction: horizontal) {
    component Button text: ${okText}
    component Button text: ${cancelText}
  }
}
```

---

## 🔧 Implementación: Compile-Time

### Cambios Necesarios

#### 1. **Parser** (Minimal)
Agregar nuevo elemento en el proyecto:

```typescript
// packages/core/src/parser/index.ts

// Nuevo token
const ComponentDef = createToken({ name: 'ComponentDef', pattern: /component/ });

// Nueva regla gramatical
project = this.RULE('project', () => {
  this.CONSUME(Project);
  this.CONSUME(StringLiteral);
  this.CONSUME(LCurly);
  
  this.MANY(() => {
    this.OR([
      { ALT: () => this.SUBRULE(this.componentDef) },  // NEW
      { ALT: () => this.SUBRULE(this.screen) },
      // ... otros
    ]);
  });
  
  this.CONSUME(RCurly);
});

// Nueva definición
private componentDef = this.RULE('componentDef', () => {
  this.CONSUME(ComponentDef);
  this.CONSUME(StringLiteral, { LABEL: 'componentName' });
  this.CONSUME(LCurly);
  this.SUBRULE(this.layout);
  this.CONSUME(RCurly);
});
```

#### 2. **IR Generator** (Lógica de expansión)

```typescript
// packages/core/src/ir/index.ts

class IRGenerator {
  private componentDefinitions: Map<string, ASTLayout> = new Map();

  // Primera pasada: registrar definiciones
  registerComponentDefinitions(ast: AST) {
    // Si el proyecto tiene definiciones, guardarlas
  }

  // Cuando encuentras `component ButtonGroup`, expandir
  visitComponent(node: ASTComponent): IRNode {
    if (this.componentDefinitions.has(node.componentType)) {
      // Expandir la definición
      const definition = this.componentDefinitions.get(node.componentType);
      return this.visitLayout(definition);
    }
    // Si no, es un componente built-in
    return this.createComponentNode(node);
  }
}
```

#### 3. **No changes needed:**
- ❌ Parser (ya sabe renderizar layouts)
- ❌ Renderer (ya renderiza lo expandido)
- ❌ Tests (nuevos tests para expansión)

---

## 📊 Casos de Uso Prácticos

### **Caso 1: Button Group**
```wire
define Component "ButtonGroup" {
  layout stack(direction: horizontal, gap: md) {
    component Button text: "OK" variant: primary
    component Button text: "Cancel" variant: secondary
  }
}

screen Login {
  layout panel(padding: lg) {
    component ButtonGroup
    // Expande a dos buttons
  }
}
```

### **Caso 2: Card Pattern**
```wire
define Component "ProductCard" {
  layout card(padding: md, gap: sm, radius: md) {
    component Image placeholder: "square" height: 200
    component Heading text: "Product Name"
    component Text content: "Short description"
    component Button text: "View Details" variant: primary
  }
}

screen Shop {
  layout grid(columns: 3, gap: md) {
    cell { component ProductCard }
    cell { component ProductCard }
    cell { component ProductCard }
  }
}
```

### **Caso 3: Form Field**
```wire
define Component "FormField" {
  layout stack(direction: vertical, gap: sm) {
    component Label text: "Field Label"
    component Input placeholder: "Enter value..."
  }
}

screen SignUp {
  layout stack(direction: vertical, gap: md) {
    component FormField
    component FormField
    component FormField
  }
}
```

---

## 🧪 Testing & Validation

### Test: Expansión correcta
```typescript
it('should expand component definition', () => {
  const input = `
    project "Test" {
      define Component "ButtonGroup" {
        layout stack {
          component Button text: "OK"
          component Button text: "Cancel"
        }
      }
      
      screen Main {
        layout stack {
          component ButtonGroup
        }
      }
    }
  `;
  
  const ast = parseWireDSL(input);
  const ir = generateIR(ast);
  
  // El IR debe contener dos Button components (expandidos)
  const buttons = Object.values(ir.project.nodes)
    .filter(n => n.kind === 'component' && n.componentType === 'Button');
  
  expect(buttons).toHaveLength(2);
});
```

---

## 🚀 Roadmap de Implementación

### **Semana 1: Compile-Time (v0.5)**
- [ ] Modificar parser para aceptar `define Component "Name" { ... }`
- [ ] Agregar symbol table en IR generator
- [ ] Implementar expansión en visitComponent()
- [ ] Tests para expansión
- [ ] Documentar nueva sintaxis

**Esfuerzo**: ~20-30 horas

### **Semana 3-4: Runtime (v1.0)**
- [ ] Agregar `props` block al componente
- [ ] Implementar variable substitution (${varName})
- [ ] Actualizar renderer para manejar referencias
- [ ] Tests con parámetros
- [ ] Documentación

**Esfuerzo**: ~40-50 horas

---

## 💡 Ventajas para Usuarios

### **For Designers**
- ✅ Define patterns once
- ✅ Reuse across wireframes
- ✅ Faster prototyping
- ✅ Consistent UX patterns

### **For Developers**
- ✅ Generate real component code
- ✅ Props-based customization (later)
- ✅ Design system documentation
- ✅ Better code organization

### **For Exporters**
- ✅ Generate React components
- ✅ Generate Vue components
- ✅ Create component library stubs
- ✅ Figma components

---

## 🎓 Learning Resources to Create

Once implemented:

1. **Tutorial**: "Building Your First Reusable Component"
   - ButtonGroup example
   - ProductCard example

2. **Video**: "Mastering Component Composition"
   - Design system patterns
   - Real-world examples

3. **Documentation**: "Component Composition Reference"
   - Syntax
   - Best practices
   - Common patterns

---

## 🔮 Future Possibilities

### **Advanced Features (v1.1+)**
1. **Component Props with Defaults**
   ```wire
   define Component "Drawer" {
     props: {
       title: "Drawer Title",
       width: "400px"
     }
     
     layout card(width: ${width}) {
       component Heading text: ${title}
       // ...
     }
   }
   ```

2. **Conditional Content**
   ```wire
   define Component "OptionalButton" {
     props: { showButton: boolean = true }
     
     if ${showButton} {
       component Button text: "Click"
     }
   }
   ```

3. **Slots / Content Projection**
   ```wire
   define Component "Modal" {
     layout card {
       component Heading text: "Modal"
       <slot name="content" />
       component ButtonGroup
     }
   }
   
   screen Main {
     component Modal {
       <content>
         component Text content: "Modal body"
       </content>
     }
   }
   ```

---

## 📝 Summary

**Tu pregunta fue excelente.** Component Composition es:

- ✅ **Muy valuable** (resuelve DRY principle)
- ✅ **Feasible** en compile-time (minimal changes)
- ✅ **Escalable** a runtime después
- ✅ **Alta demanda** entre usuarios

**Recomendación:**
1. **Implementar Compile-Time primero** (v0.5, 20-30 horas)
   - Template expansion en IR generator
   - Máximo ROI, mínimo esfuerzo
   - Users get feature inmediatamente

2. **Agregar Runtime/Props después** (v1.0, cuando sea necesario)
   - Variable substitution
   - Parámetros y defaults

**Impact**: Los usuarios pueden construir design systems, reducir duplication, y reutilizar patterns fácilmente.

---

**¿Quieres que comience con la implementación?** Puedo hacer un plan detallado paso a paso.
