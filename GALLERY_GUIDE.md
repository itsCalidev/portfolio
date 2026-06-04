# Sistema de Galería de Proyectos — Guía de Integración

## Estructura de carpetas

```
/
├── public/
│   └── projects/               ← imágenes de proyectos (servidas estáticamente)
│       ├── cine-hub/
│       │   ├── 1.webp          ← captura de pantalla 1
│       │   ├── 2.webp
│       │   ├── 3.webp
│       │   └── 4.webp
│       └── otro-proyecto/
│           ├── 1.webp
│           └── 2.webp
│
└── src/
    ├── types/
    │   └── projects.ts         ← interfaces + type guards
    ├── data/
    │   └── projects.ts         ← array de proyectos (datos)
    └── components/
        ├── ProjectVisual.astro ← renderiza icono O galería (no ambos)
        ├── Lightbox.astro      ← modal global (1 instancia por página)
        └── ProjectCard.astro   ← tarjeta completa actualizada
```

---

## Migración desde el sistema anterior

### Antes (campo `icon` plano):
```ts
{
  title: "My Project",
  icon: "⚓",
  // ...
}
```

### Después (campo `visual` discriminado):
```ts
{
  title: "My Project",
  visual: {
    visualType: "icon",
    icon: "⚓",         // ← mismo emoji, misma UI
  },
  // ...
}
```

**Cambios en ProjectCard existente:**
- Reemplaza `{project.icon}` por `<ProjectVisual visual={project.visual} projectId={id} />`
- Añade `<Lightbox />` al final de tu `Layout.astro`
- El resto del diseño no cambia.

---

## Rendimiento — buenas prácticas aplicadas

| Técnica | Dónde | Efecto |
|---|---|---|
| `loading="lazy"` en thumbnails | `ProjectVisual` | No bloquea el LCP |
| `loading="eager"` en img del lightbox | `Lightbox` | Carga rápida al abrir |
| `decoding="async"` | ambos | No bloquea el hilo principal |
| `width` y `height` explícitos en thumbnails | `ProjectVisual` | Elimina layout shift (CLS) |
| Preload de imagen siguiente | `Lightbox` script | Navegación sin parpadeo |
| `object-fit: contain` en lightbox | `Lightbox` | Sin recorte sin importar la orientación |
| `aspect-video` en preview | `ProjectVisual` | Reserva espacio antes de cargar |
| Skeleton visible hasta `onload` | `Lightbox` | Sin flash de imagen rota |
| `max-h-[75vh]` en lightbox | `Lightbox` | No desborda en pantallas pequeñas |

### Formato de imágenes recomendado

```bash
# Convierte tus capturas a WebP con calidad alta
# (instala cwebp: brew install webp / apt install webp)

cwebp -q 85 captura.png -o public/projects/cine-hub/1.webp

# Para generar varias a la vez:
for f in capturas/*.png; do
  cwebp -q 85 "$f" -o "public/projects/cine-hub/$(basename "${f%.png}").webp"
done
```

**Dimensiones recomendadas:** 1280×720px (16:9) para consistencia con `aspect-video`.

---

## Añadir un nuevo proyecto con galería

1. Coloca las imágenes en `/public/projects/{slug}/`
2. Añade el objeto en `src/data/projects.ts`:

```ts
{
  title:       "Mi Nuevo Proyecto",
  subtitle:    "Subtítulo técnico",
  description: "Descripción...",
  techStack:   ["React", "Node.js"],
  liveUrl:     "https://...",
  visual: {
    visualType: "gallery",
    images: [
      "/projects/mi-nuevo-proyecto/1.webp",
      "/projects/mi-nuevo-proyecto/2.webp",
    ],
    alt: [
      "Descripción imagen 1",
      "Descripción imagen 2",
    ],
  },
}
```

3. Listo. Sin tocar ningún componente.

---

## Flujo del CustomEvent

```
Click en thumbnail / botón "Ver imágenes"
  └─ ProjectVisual.astro (script)
       └─ window.dispatchEvent("cinehub:lightbox:open", { images, alts, index })
            └─ Lightbox.astro (script)
                 ├─ goTo(index)        → carga imagen
                 ├─ buildDots()        → renderiza indicadores
                 └─ open()             → muestra backdrop
```

Ventaja: ProjectVisual y Lightbox están completamente desacoplados.
Puedes mover el Lightbox a cualquier parte del DOM sin que ProjectVisual lo sepa.
