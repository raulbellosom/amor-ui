# Amor UI 🌹

[![npm version](https://badge.fury.io/js/amor-ui.svg)](https://badge.fury.io/js/amor-ui)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

> **Amor UI** es una librería moderna de componentes React diseñada con amor ❤️, siguiendo la arquitectura atómica para crear interfaces elegantes, accesibles y altamente personalizables.

## ✨ Características

- 🎨 **Diseño Elegante**: Componentes con un diseño moderno y minimalista inspirado en el amor y la simplicidad
- ⚡ **Alto Rendimiento**: Construido con React 18+ y optimizado para máxima velocidad
- 🎭 **Animaciones Suaves**: Integración nativa con Motion para transiciones fluidas
- 📱 **Responsive**: Diseño adaptativo con soporte completo para dispositivos móviles
- ♿ **Accesibilidad**: Cumple con estándares WCAG para una experiencia inclusiva
- 🎯 **TypeScript First**: Tipado completo para una experiencia de desarrollo superior
- 🛠️ **Altamente Personalizable**: Basado en Tailwind CSS para máxima flexibilidad
- 🧩 **Arquitectura Atómica**: Componentes organizados en átomos, moléculas y organismos
- 🌟 **Iconos Integrados**: Soporte nativo para Lucide React icons

## 🚀 Instalación

```bash
npm install amor-ui
```

### Dependencias Requeridas

Asegúrate de tener instaladas estas dependencias en tu proyecto:

```bash
npm install lucide-react motion react react-dom react-responsive tailwindcss
```

## 📖 Uso Rápido

```tsx
import { Button, Avatar, Badge } from "amor-ui";
import "amor-ui/styles.css";

function App() {
  return (
    <div className="p-8">
      <Avatar name="Juan Pérez" size="lg" status="online" className="mb-4" />

      <Button
        variant="primary"
        size="md"
        leftIcon={Heart}
        onClick={() => console.log("¡Te amo!")}
      >
        Enviar Amor
      </Button>

      <Badge variant="success" className="ml-2">
        ❤️ Amor UI
      </Badge>
    </div>
  );
}
```

## 🧬 Arquitectura Atómica

Amor UI sigue la metodología de **Diseño Atómico**, organizando los componentes en tres niveles jerárquicos:

### ⚛️ Átomos (Disponibles)

Los componentes básicos e indivisibles:

| Componente         | Descripción                                  | Estado |
| ------------------ | -------------------------------------------- | ------ |
| **Avatar**         | Representación visual de usuarios            | ✅     |
| **Badge**          | Etiquetas para mostrar información           | ✅     |
| **Breadcrumb**     | Navegación jerárquica                        | ✅     |
| **Button**         | Botones interactivos con múltiples variantes | ✅     |
| **Checkbox**       | Casillas de verificación                     | ✅     |
| **Chip**           | Etiquetas compactas                          | ✅     |
| **Counter**        | Contadores numéricos                         | ✅     |
| **CurrencyInput**  | Entrada de valores monetarios                | ✅     |
| **DateInput**      | Selector de fechas                           | ✅     |
| **DateRangeInput** | Selector de rango de fechas                  | ✅     |
| **Divider**        | Separadores visuales                         | ✅     |
| **FileInput**      | Entrada de archivos                          | ✅     |
| **FilterChip**     | Chips para filtros                           | ✅     |
| **IconButton**     | Botones con iconos                           | ✅     |
| **Link**           | Enlaces estilizados                          | ✅     |
| **NumberInput**    | Entrada numérica                             | ✅     |
| **Pagination**     | Navegación por páginas                       | ✅     |
| **ProgressBar**    | Barras de progreso                           | ✅     |
| **Radio**          | Botones de radio                             | ✅     |
| **RatingStars**    | Sistema de calificación por estrellas        | ✅     |
| **Select**         | Menús desplegables                           | ✅     |
| **Skeleton**       | Placeholders de carga                        | ✅     |
| **Spinner**        | Indicadores de carga                         | ✅     |
| **Tag**            | Etiquetas descriptivas                       | ✅     |
| **TextArea**       | Áreas de texto multilínea                    | ✅     |
| **TextInput**      | Campos de entrada de texto                   | ✅     |
| **Toggle**         | Interruptores                                | ✅     |
| **Tooltip**        | Información contextual                       | ✅     |

### 🧪 Moléculas (Próximamente)

Combinaciones de átomos que forman unidades funcionales más complejas.

### 🏗️ Organismos (Próximamente)

Componentes complejos que combinan múltiples moléculas para crear secciones completas de la interfaz.

## 🎨 Personalización

### Tema y Colores

Amor UI utiliza un sistema de tokens CSS personalizables:

```css
/* Importa los estilos base */
@import "amor-ui/styles.css";

/* Personaliza variables CSS */
:root {
  --amor-primary: #e91e63;
  --amor-secondary: #9c27b0;
  --amor-accent: #ff4081;
}
```

### Tailwind Preset

Incluye un preset de Tailwind CSS optimizado:

```js
// tailwind.config.js
module.exports = {
  presets: [require("amor-ui/tailwind-preset")],
  // ... tu configuración
};
```

## 📚 Ejemplos Avanzados

### Formulario de Amor

```tsx
import { Button, TextInput, Select, Checkbox } from "amor-ui";

function LoveForm() {
  return (
    <form className="space-y-4 max-w-md">
      <TextInput label="Tu Nombre" placeholder="Juan Pérez" required />

      <Select
        label="Tipo de Amor"
        options={[
          { value: "romantico", label: "Romántico" },
          { value: "amistad", label: "Amistad" },
          { value: "familiar", label: "Familiar" },
        ]}
      />

      <Checkbox label="Acepto enviar amor virtual" />

      <Button type="submit" variant="primary" size="lg" className="w-full">
        💕 Enviar Amor
      </Button>
    </form>
  );
}
```

### Card con Avatar y Badge

```tsx
import { Avatar, Badge, Button } from "amor-ui";

function LoveCard({ user }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex items-center space-x-4 mb-4">
        <Avatar src={user.avatar} name={user.name} size="lg" status="online" />
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <Badge variant="secondary">{user.role}</Badge>
        </div>
      </div>

      <p className="text-gray-600 mb-4">{user.bio}</p>

      <Button variant="outline" size="sm">
        ❤️ Conectar
      </Button>
    </div>
  );
}
```

## 🔧 Desarrollo

### Scripts Disponibles

```bash
# Construir la librería
npm run build

# Desarrollo con watch
npm run dev

# Limpiar build
npm run clean
```

### Estructura del Proyecto

```
src/
├── atoms/          # Componentes básicos
├── molecules/      # Combinaciones de átomos
├── organisms/      # Componentes complejos
├── hooks/          # Hooks personalizados
└── styles/         # Estilos y tokens CSS
```

## 🤝 Contribución

¡Las contribuciones son bienvenidas! ❤️

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

### Guías de Contribución

- Sigue la arquitectura atómica
- Mantén la consistencia con TypeScript
- Incluye tests para nuevos componentes
- Actualiza la documentación
- Usa conventional commits

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 🙏 Agradecimientos

- ❤️ Inspirado en el amor y la comunidad open source
- ⚛️ Construido con React y la comunidad
- 🎨 Diseñado con Tailwind CSS
- 🌟 Animaciones con Motion
- 📱 Responsive con react-responsive

---

**Hecho con ❤️ por [Raul Belloso](https://github.com/raulbellosom)**

¡Únete a la comunidad y ayúdanos a construir la librería de componentes más amorosa del mundo! 🌹
