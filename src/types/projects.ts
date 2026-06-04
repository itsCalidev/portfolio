// src/types/projects.ts
// ─────────────────────────────────────────────────────────────────────────────
// Interfaces del sistema de visualización de proyectos.
// Diseñadas para ser discriminadas por `visualType`, lo que elimina
// condicionales complejos y permite exhaustive checking con TypeScript.
// ─────────────────────────────────────────────────────────────────────────────

// ── Modo 1: Icono (comportamiento original, 100% compatible) ─────────────────
export interface ProjectIconVisual {
  visualType: "icon";
  /** Emoji o carácter unicode. Ej: '🎬', '⚓', '🛒' */
  icon: string;
}

// ── Modo 2: Galería de imágenes ──────────────────────────────────────────────
export interface ProjectGalleryVisual {
  visualType: "gallery";
  /**
   * Rutas absolutas desde /public o imports de assets.
   * Mínimo 1 imagen. Sin límite superior (el lightbox es dinámico).
   * Convención de ruta: /projects/{slug}/{n}.webp
   */
  images: string[];
  /**
   * Texto alternativo para accesibilidad.
   * Si es un array, se aplica por índice; si es string se aplica a todas.
   */
  alt?: string | string[];
}

// ── Tipo discriminado: la unión que usarás en ProjectCard ───────────────────
export type ProjectVisual = ProjectIconVisual | ProjectGalleryVisual;

// ── Helper guards (evitan castings manuales en los componentes) ──────────────
export const isIconVisual    = (v: ProjectVisual): v is ProjectIconVisual    => v.visualType === "icon";
export const isGalleryVisual = (v: ProjectVisual): v is ProjectGalleryVisual => v.visualType === "gallery";

// ── Interfaz completa de un proyecto ────────────────────────────────────────
export interface Project {
  title:       string;
  subtitle:    string;
  description: string;
  techStack:   string[];
  liveUrl?:    string;
  githubUrl?:  string;
  /** Campo único que reemplaza el antiguo `icon: string` */
  visual:      ProjectVisual;
}
