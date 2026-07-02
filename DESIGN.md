---
name: Quarry
description: Minimalist monochromatic document RAG interface
colors:
  primary: "#000000"
  neutral-bg: "#ffffff"
  neutral-fg: "#000000"
  border: "#e5e5e5"
  muted: "#737373"
typography:
  display:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3.5rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "var(--font-sans), system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "2px"
  md: "4px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
---

# Design System: Quarry

## 1. Overview

**Creative North Star: "The Minimalist Slate"**

Quarry is designed around the philosophy of absolute visual restraint and pure value contrast. By stripping away colorful distractions, gradients, and rounded cards, the interface functions as a stark, high-fidelity research tool. Visual structure is carried entirely by typography, grid alignment, and intentional empty space, putting the document contents and generated answers at the center of the user's attention.

### Key Characteristics:
- Pure monochromatic color palette (black, white, and stepped neutral grays).
- Tight, sharp borders (1px) and small corner radii (2px/4px) instead of soft pill shapes.
- High-contrast visual hierarchy that guides the eye using font weights and sizes.
- Flat surface design with zero decorative shadows or glass effects.

## 2. Colors

The color system uses a strict Restrained Monochromatic strategy. Colors are limited to pure black, pure white, and a neutral scale.

### Primary
- **Ink Black** (#000000): Used for all primary actions, titles, text, and dominant borders.

### Neutral
- **Paper White** (#ffffff): The canvas background for all screens and sheets.
- **Slate Gray** (#737373): Used for secondary text, descriptions, and placeholder labels.
- **Divider Gray** (#e5e5e5): Used for structural borders and grid separators.

**The Absolute Monochromatic Rule.** No decorative colors or gradients are allowed. Contrast is achieved exclusively by shifting values between white, gray, and black. Colored accents are prohibited except for critical functional status alerts (such as destructive actions).

## 3. Typography

**Display Font:** Geist Sans (with system-ui, sans-serif fallback)
**Body Font:** Geist Sans (with system-ui, sans-serif fallback)
**Label/Mono Font:** Geist Mono (for citations and metadata)

The typography pairing relies on a single clean sans-serif family, using weight, tracking, and scale to create a crisp, editorial feel.

### Hierarchy
- **Display** (600, clamp(2rem, 5vw, 3.5rem), 1.1): Used for main page headers.
- **Headline** (600, 1.5rem, 1.2): Used for document titles and section group headings.
- **Title** (500, 1.125rem, 1.3): Used for sidebar items and table row headers.
- **Body** (400, 1rem, 1.6): Used for RAG query answers, message history, and paragraphs (max line length 70ch).
- **Label** (500, 0.75rem, +0.05em letter-spacing): Used for tags, metadata, and timestamps.

**The Typography Over Lines Rule.** Grids and sections are separated by typographic hierarchy and empty space rather than adding horizontal lines or background containers.

## 4. Elevation

Quarry is flat by default. Depth is communicated through layout layering and high-contrast borders rather than drop shadows or blurs.

**The Flat Surface Rule.** drop-shadows, box-shadows, and backdrop blurs are forbidden. Dropdowns, popovers, and dialogs are bounded by 1px solid black borders and sit directly above the white page layer.

## 5. Components

### Buttons
- **Shape:** Sharp corners (2px radius).
- **Primary:** Ink Black background with Paper White text. Padding (8px 16px).
- **Hover:** Paper White background with Ink Black text, bordered by a solid 1px black stroke.
- **Ghost:** Paper White background, no borders, Slate Gray text turning Ink Black on hover.

### Cards / Containers
- **Corner Style:** Sharp corners (4px radius).
- **Background:** Pure White background.
- **Border:** 1px solid Divider Gray.
- **Internal Padding:** Spacing medium (16px) or large (32px) depending on density.

### Inputs / Fields
- **Style:** 1px solid Divider Gray border, Paper White background, 2px corner radius.
- **Focus:** 1px solid Ink Black border. No color glow or shadow offsets.

### Navigation
- **Style:** Flat side nav with clean text layout. Active document has an Ink Black background and White text, while inactive documents have plain text with a Slate Gray color.

## 6. Do's and Don'ts

### Do:
- **Do** maintain a strict black-and-white color palette with at least 4.5:1 text-to-background contrast.
- **Do** use Geist Mono for citations and code references.
- **Do** rely on whitespace (layout rhythm) to separate sections.
- **Do** keep button and container corners sharp and geometric.

### Don't:
- **Don't** use drop-shadows or glassmorphism (backdrop blurs).
- **Don't** add colored accents (purple, blue, or red gradients).
- **Don't** use decorative side-stripe borders on card headers or containers.
- **Don't** include tiny, all-caps kickers or arbitrary section numbers (01 / 02 / 03) by default.
