# 🎨 Styling & Design System Guide

Comprehensive documentation for the design system, Tailwind CSS configuration, and styling patterns used in the Smart Chat Frontend.

## 📋 Table of Contents

- [🎯 Design Philosophy](#-design-philosophy)
- [🎨 Design System](#-design-system)
- [⚙️ Tailwind CSS Configuration](#️-tailwind-css-configuration)
- [🌈 Color Palette](#-color-palette)
- [📝 Typography](#-typography)
- [📐 Spacing & Layout](#-spacing--layout)
- [📱 Responsive Design](#-responsive-design)
- [🧩 Component Patterns](#-component-patterns)
- [✨ Animation & Transitions](#-animation--transitions)
- [🌙 Dark Mode Support](#-dark-mode-support)
- [♿ Accessibility](#-accessibility)

## 🎯 Design Philosophy

### Core Principles

1. **Simplicity First**: Clean, uncluttered interfaces that focus on content
2. **Consistency**: Uniform spacing, colors, and patterns throughout the application
3. **Accessibility**: WCAG 2.1 compliant design with proper contrast and focus states
4. **Mobile-First**: Responsive design that works on all screen sizes
5. **Performance**: Optimized CSS with minimal bundle size impact

### Visual Hierarchy

```
Primary Actions (Blue 600)
├── Secondary Actions (Gray 600)
├── Tertiary Actions (Gray 400)
└── Disabled States (Gray 300)

Text Hierarchy
├── Headings (Gray 900)
├── Body Text (Gray 700)
├── Secondary Text (Gray 500)
└── Placeholder Text (Gray 400)
```

## 🎨 Design System

### Color System

#### Primary Palette
- **Blue**: Primary brand color for actions and highlights
- **Gray**: Neutral tones for backgrounds, borders, and text
- **Green**: Success states and positive actions
- **Red**: Error states and destructive actions
- **Yellow**: Warning states and attention
- **Purple**: Special features and AI-related elements

#### Semantic Colors

```css
/* Success */
.text-success { @apply text-green-600; }
.bg-success { @apply bg-green-100; }
.border-success { @apply border-green-300; }

/* Error */
.text-error { @apply text-red-600; }
.bg-error { @apply bg-red-100; }
.border-error { @apply border-red-300; }

/* Warning */
.text-warning { @apply text-yellow-600; }
.bg-warning { @apply bg-yellow-100; }
.border-warning { @apply border-yellow-300; }

/* Info */
.text-info { @apply text-blue-600; }
.bg-info { @apply bg-blue-100; }
.border-info { @apply border-blue-300; }
```

### Component Tokens

```css
/* Button Variants */
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500; }
.btn-secondary { @apply bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500; }
.btn-outline { @apply border-2 border-gray-300 text-gray-700 hover:bg-gray-50; }
.btn-ghost { @apply text-gray-600 hover:bg-gray-100; }

/* Card Styles */
.card { @apply bg-white rounded-lg shadow-sm border border-gray-200; }
.card-hover { @apply hover:shadow-md transition-shadow duration-200; }

/* Input Styles */
.input { @apply border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500; }
.input-error { @apply border-red-300 focus:ring-red-500 focus:border-red-500; }
```

## ⚙️ Tailwind CSS Configuration

### Complete Configuration

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      // Color Palette
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
      },
      
      // Typography
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      
      // Spacing
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Border Radius
      borderRadius: {
        'none': '0px',
        'sm': '0.125rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        'full': '9999px',
      },
      
      // Shadows
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      },
      
      // Animation
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      
      // Z-Index Scale
      zIndex: {
        'dropdown': '1000',
        'sticky': '1020',
        'fixed': '1030',
        'modal-backdrop': '1040',
        'modal': '1050',
        'popover': '1060',
        'tooltip': '1070',
        'toast': '1080',
      },
      
      // Grid Template Columns
      gridTemplateColumns: {
        'sidebar': '280px 1fr',
        'sidebar-collapsed': '64px 1fr',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Custom plugin for component utilities
    function({ addUtilities, addComponents, theme }) {
      // Add custom utilities
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.text-balance': {
          'text-wrap': 'balance',
        },
      });
      
      // Add custom components
      addComponents({
        '.btn': {
          padding: theme('spacing.2') + ' ' + theme('spacing.4'),
          borderRadius: theme('borderRadius.md'),
          fontWeight: theme('fontWeight.medium'),
          fontSize: theme('fontSize.sm'),
          transition: 'all 0.2s ease-in-out',
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:disabled': {
            opacity: '0.5',
            cursor: 'not-allowed',
          },
        },
        '.card': {
          backgroundColor: theme('colors.white'),
          borderRadius: theme('borderRadius.lg'),
          padding: theme('spacing.6'),
          boxShadow: theme('boxShadow.sm'),
          border: '1px solid ' + theme('colors.gray.200'),
        },
        '.input': {
          padding: theme('spacing.2') + ' ' + theme('spacing.3'),
          borderRadius: theme('borderRadius.md'),
          border: '1px solid ' + theme('colors.gray.300'),
          fontSize: theme('fontSize.sm'),
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.primary.500'),
            boxShadow: '0 0 0 3px ' + theme('colors.primary.100'),
          },
        },
      });
    },
  ],
};
```

### PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}),
  },
};
```

## 🌈 Color Palette

### Brand Colors

```css
/* Primary Blue */
.bg-primary-50 { background-color: #eff6ff; }
.bg-primary-100 { background-color: #dbeafe; }
.bg-primary-500 { background-color: #3b82f6; }
.bg-primary-600 { background-color: #2563eb; }
.bg-primary-700 { background-color: #1d4ed8; }

/* Neutral Gray */
.bg-gray-50 { background-color: #f9fafb; }
.bg-gray-100 { background-color: #f3f4f6; }
.bg-gray-500 { background-color: #6b7280; }
.bg-gray-700 { background-color: #374151; }
.bg-gray-900 { background-color: #111827; }
```

### Usage Guidelines

| Color | Usage | Example |
|-------|-------|---------|
| `primary-600` | Primary buttons, links | CTA buttons, navigation |
| `gray-700` | Body text | Paragraph text, labels |
| `gray-500` | Secondary text | Timestamps, metadata |
| `gray-200` | Borders | Input borders, dividers |
| `gray-50` | Backgrounds | Page background, cards |
| `green-600` | Success states | Success messages |
| `red-600` | Error states | Error messages |
| `yellow-600` | Warning states | Warning alerts |

### Color Contrast

```css
/* High Contrast Text */
.text-high-contrast { @apply text-gray-900; }
.text-medium-contrast { @apply text-gray-700; }
.text-low-contrast { @apply text-gray-500; }

/* Background Contrasts */
.bg-high-contrast { @apply bg-white; }
.bg-medium-contrast { @apply bg-gray-50; }
.bg-low-contrast { @apply bg-gray-100; }
```

## 📝 Typography

### Font Stack

```css
/* Primary Font */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;

/* Monospace Font */
font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
```

### Type Scale

| Class | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 12px | 16px | Small labels, captions |
| `text-sm` | 14px | 20px | Body text, buttons |
| `text-base` | 16px | 24px | Default body text |
| `text-lg` | 18px | 28px | Large body text |
| `text-xl` | 20px | 28px | Small headings |
| `text-2xl` | 24px | 32px | Medium headings |
| `text-3xl` | 30px | 36px | Large headings |

### Typography Components

```css
/* Heading Styles */
.heading-1 { @apply text-3xl font-bold text-gray-900 leading-tight; }
.heading-2 { @apply text-2xl font-semibold text-gray-900 leading-tight; }
.heading-3 { @apply text-xl font-semibold text-gray-900 leading-snug; }
.heading-4 { @apply text-lg font-medium text-gray-900 leading-snug; }

/* Body Text Styles */
.body-large { @apply text-lg text-gray-700 leading-relaxed; }
.body-regular { @apply text-base text-gray-700 leading-relaxed; }
.body-small { @apply text-sm text-gray-600 leading-relaxed; }

/* Special Text Styles */
.text-caption { @apply text-xs text-gray-500 leading-normal; }
.text-code { @apply font-mono text-sm bg-gray-100 px-1 py-0.5 rounded; }
.text-link { @apply text-primary-600 hover:text-primary-700 underline; }
```

## 📐 Spacing & Layout

### Spacing Scale

```css
/* Spacing Scale (based on 4px) */
.space-0 { spacing: 0px; }
.space-1 { spacing: 4px; }
.space-2 { spacing: 8px; }
.space-3 { spacing: 12px; }
.space-4 { spacing: 16px; }
.space-6 { spacing: 24px; }
.space-8 { spacing: 32px; }
.space-12 { spacing: 48px; }
.space-16 { spacing: 64px; }
.space-24 { spacing: 96px; }
```

### Layout Patterns

```css
/* Container Patterns */
.container-sm { @apply max-w-2xl mx-auto px-4; }
.container-md { @apply max-w-4xl mx-auto px-4; }
.container-lg { @apply max-w-6xl mx-auto px-4; }
.container-xl { @apply max-w-7xl mx-auto px-4; }

/* Flex Patterns */
.flex-center { @apply flex items-center justify-center; }
.flex-between { @apply flex items-center justify-between; }
.flex-start { @apply flex items-center justify-start; }
.flex-end { @apply flex items-center justify-end; }

/* Grid Patterns */
.grid-2 { @apply grid grid-cols-2 gap-4; }
.grid-3 { @apply grid grid-cols-3 gap-4; }
.grid-4 { @apply grid grid-cols-4 gap-4; }
.grid-auto { @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4; }
```

### Component Spacing

```css
/* Card Spacing */
.card-padding { @apply p-6; }
.card-padding-sm { @apply p-4; }
.card-padding-lg { @apply p-8; }

/* Section Spacing */
.section-y { @apply py-16; }
.section-y-sm { @apply py-8; }
.section-y-lg { @apply py-24; }

/* Element Spacing */
.stack > * + * { @apply mt-4; }
.stack-sm > * + * { @apply mt-2; }
.stack-lg > * + * { @apply mt-6; }
```

## 📱 Responsive Design

### Breakpoint System

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Small tablets |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small desktops |
| `xl` | 1280px | Large desktops |
| `2xl` | 1536px | Extra large screens |

### Responsive Utilities

```css
/* Mobile First Approach */
.responsive-text {
  @apply text-sm sm:text-base md:text-lg lg:text-xl;
}

.responsive-spacing {
  @apply p-4 sm:p-6 md:p-8 lg:p-12;
}

.responsive-grid {
  @apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4;
}

/* Hide/Show on Different Screens */
.mobile-only { @apply block sm:hidden; }
.desktop-only { @apply hidden lg:block; }
.tablet-up { @apply hidden sm:block; }
```

### Responsive Patterns

```jsx
// Example: Responsive Chat Layout
<div className="flex flex-col lg:flex-row h-screen">
  {/* Sidebar - Full width on mobile, fixed width on desktop */}
  <aside className="w-full lg:w-80 bg-white border-b lg:border-r border-gray-200">
    <SessionList />
  </aside>
  
  {/* Main content - Full width on mobile, flexible on desktop */}
  <main className="flex-1 flex flex-col">
    <ChatInterface />
  </main>
</div>
```

## 🧩 Component Patterns

### Button Variations

```jsx
// Primary Button
<button className="btn bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500">
  Primary Action
</button>

// Secondary Button
<button className="btn bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500">
  Secondary Action
</button>

// Outline Button
<button className="btn border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500">
  Outline Action
</button>

// Ghost Button
<button className="btn text-gray-600 hover:bg-gray-100 focus:ring-gray-500">
  Ghost Action
</button>
```

### Card Patterns

```jsx
// Basic Card
<div className="card">
  <h3 className="heading-3 mb-4">Card Title</h3>
  <p className="body-regular">Card content goes here.</p>
</div>

// Interactive Card
<div className="card hover:shadow-md transition-shadow duration-200 cursor-pointer">
  <div className="flex items-center justify-between mb-4">
    <h3 className="heading-4">Interactive Card</h3>
    <span className="text-caption">Action</span>
  </div>
  <p className="body-small text-gray-600">Click me!</p>
</div>

// Card with Header
<div className="card">
  <div className="border-b border-gray-200 pb-4 mb-4">
    <h3 className="heading-3">Card with Header</h3>
    <p className="text-caption text-gray-500">Subtitle</p>
  </div>
  <div className="space-y-4">
    <p className="body-regular">Content section 1</p>
    <p className="body-regular">Content section 2</p>
  </div>
</div>
```

### Form Patterns

```jsx
// Input Field
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Field Label
  </label>
  <input 
    type="text" 
    className="input w-full"
    placeholder="Enter value..."
  />
  <p className="text-caption text-gray-500">Helper text</p>
</div>

// Input with Error
<div className="space-y-2">
  <label className="block text-sm font-medium text-gray-700">
    Field Label
  </label>
  <input 
    type="text" 
    className="input input-error w-full"
    placeholder="Enter value..."
  />
  <p className="text-caption text-error-600">Error message</p>
</div>
```

### Message Bubble Patterns

```jsx
// User Message
<div className="flex justify-end mb-4">
  <div className="bg-primary-600 text-white px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
    <p className="text-sm">User message content</p>
    <span className="text-xs opacity-75 mt-1 block">12:34 PM</span>
  </div>
</div>

// Assistant Message
<div className="flex justify-start mb-4">
  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg max-w-xs lg:max-w-md">
    <p className="text-sm">Assistant response</p>
    <span className="text-xs text-gray-500 mt-1 block">12:35 PM</span>
  </div>
</div>

// System Message
<div className="flex justify-center mb-4">
  <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs italic">
    System notification
  </div>
</div>
```

## ✨ Animation & Transitions

### Transition Classes

```css
/* Basic Transitions */
.transition-all { @apply transition-all duration-200 ease-in-out; }
.transition-colors { @apply transition-colors duration-200 ease-in-out; }
.transition-transform { @apply transition-transform duration-200 ease-in-out; }
.transition-opacity { @apply transition-opacity duration-200 ease-in-out; }

/* Hover Effects */
.hover-lift { @apply transition-transform duration-200 hover:-translate-y-1; }
.hover-scale { @apply transition-transform duration-200 hover:scale-105; }
.hover-fade { @apply transition-opacity duration-200 hover:opacity-75; }

/* Focus Effects */
.focus-ring { @apply focus:outline-none focus:ring-2 focus:ring-offset-2; }
.focus-visible { @apply focus-visible:ring-2 focus-visible:ring-offset-2; }
```

### Animation Examples

```jsx
// Fade In Animation
<div className="animate-fade-in">
  Content that fades in
</div>

// Slide Up Animation
<div className="animate-slide-up">
  Content that slides up
</div>

// Loading Spinner
<div className="animate-spin w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full">
</div>

// Pulse Effect
<div className="animate-pulse-slow">
  Pulsing content
</div>
```

### Micro-interactions

```jsx
// Button with hover effect
<button className="btn bg-primary-600 text-white hover:bg-primary-700 hover:scale-105 transform transition-all duration-200">
  Hover me
</button>

// Card with hover effect
<div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
  Interactive card
</div>

// Input with focus effect
<input className="input focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200" />
```

## 🌙 Dark Mode Support

### Dark Mode Configuration

```css
/* Dark mode color scheme */
.dark {
  --color-bg-primary: #111827;
  --color-bg-secondary: #1f2937;
  --color-text-primary: #f9fafb;
  --color-text-secondary: #d1d5db;
  --color-border: #374151;
}

/* Dark mode utilities */
.dark\:bg-dark { @apply dark:bg-gray-900; }
.dark\:text-dark { @apply dark:text-gray-100; }
.dark\:border-dark { @apply dark:border-gray-700; }
```

### Dark Mode Components

```jsx
// Dark mode toggle
<button className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
  <SunIcon className="w-5 h-5 block dark:hidden" />
  <MoonIcon className="w-5 h-5 hidden dark:block" />
</button>

// Dark mode card
<div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
  <h3 className="text-gray-900 dark:text-gray-100">Card Title</h3>
  <p className="text-gray-600 dark:text-gray-300">Card content</p>
</div>
```

## ♿ Accessibility

### Focus Management

```css
/* Focus styles */
.focus-visible { 
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2; 
}

/* Skip links */
.skip-link {
  @apply absolute -top-10 left-4 bg-primary-600 text-white px-4 py-2 rounded;
  @apply focus:top-4 transition-all duration-200;
}
```

### Screen Reader Support

```jsx
// Accessible button
<button 
  className="btn"
  aria-label="Send message"
  aria-describedby="send-help-text"
>
  <SendIcon className="w-4 h-4" aria-hidden="true" />
</button>
<span id="send-help-text" className="sr-only">
  Press Enter to send your message
</span>

// Accessible form
<div className="space-y-4">
  <label htmlFor="message-input" className="block text-sm font-medium">
    Message
  </label>
  <textarea
    id="message-input"
    className="input w-full"
    aria-describedby="message-help"
    placeholder="Type your message..."
  />
  <p id="message-help" className="text-caption text-gray-500">
    Press Ctrl+Enter to send
  </p>
</div>
```

### Color Contrast

```css
/* High contrast mode */
@media (prefers-contrast: high) {
  .btn-primary {
    @apply bg-black text-white border-2 border-white;
  }
  
  .text-secondary {
    @apply text-black;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

**This design system provides a comprehensive foundation for consistent, accessible, and beautiful user interfaces in the Smart Chat Frontend. Use these patterns and tokens to maintain design consistency across all components.**
