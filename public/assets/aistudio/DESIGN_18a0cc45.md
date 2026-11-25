---
name: ASATEK Industrial Precision
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5e3f3a'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#926e69'
  outline-variant: '#e8bdb6'
  surface-tint: '#c00000'
  primary: '#9e0000'
  on-primary: '#ffffff'
  primary-container: '#cc0000'
  on-primary-container: '#ffdad4'
  inverse-primary: '#ffb4a8'
  secondary: '#b41d11'
  on-secondary: '#ffffff'
  secondary-container: '#d83828'
  on-secondary-container: '#fffbff'
  tertiary: '#005a1d'
  on-tertiary: '#ffffff'
  tertiary-container: '#007528'
  on-tertiary-container: '#83fc8e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad4'
  primary-fixed-dim: '#ffb4a8'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#930000'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#ffb4a8'
  on-secondary-fixed: '#410000'
  on-secondary-fixed-variant: '#930000'
  tertiary-fixed: '#83fc8e'
  tertiary-fixed-dim: '#66df75'
  on-tertiary-fixed: '#002106'
  on-tertiary-fixed-variant: '#00531a'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-hero:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-hero-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-uppercase:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.08em
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  spec-code:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-trust, engineering-grade commerce identity tailored for the Pakistani energy and hardware infrastructure landscape. It positions the brand as an authoritative local manufacturer delivering durable power electronics—solar charge controllers, pure sine wave inverters/UPS units, industrial battery chargers, and replacement components.

The aesthetic fuses **Corporate/Modern** reliability with **Industrial Precision**:
- **Clarity & Utility:** Every surface, label, and metric communicates rugged reliability, operational efficiency, and transparency in product specifications.
- **National Pride & Trust:** A modern Pakistani industrial aesthetic balancing English technical clarity with indigenous Urdu support (`اردو`) via specialized script rendering.
- **Tactile Feedback:** Crisp physical borders, subtle tactile button presses, and prominent mechanical spec tables that mirror industrial front-panel displays.

## Colors

The palette balances urgent industrial reds with neutral architectural whites and grays, accented by deliberate signaling colors:

- **Primary (`#CC0000`):** Core brand actions, primary CTAs, active states, price points, and key spec highlights.
- **Dark Red (`#990000`):** Hover/press states for primary elements, prominent navbar accents, and structural headers.
- **Tertiary / WhatsApp Green (`#28A745`):** Reserved for purchase confirmation, stock availability, solar efficiency badges, and the dedicated direct-inquiry WhatsApp CTA.
- **Neutrals:**
  - **Surface Canvas (`#F5F5F5`):** Ground background providing comfortable contrast against pure white cards.
  - **Surface Elevated (`#FFFFFF`):** Containers, input fields, cards, and modal panels.
  - **Borders & Dividers (`#E0E0E0`):** Precise 1px structural boundaries defining form factors without heavy visual weight.
  - **Dark Neutral (`#1A1A1A`):** High-legibility text for headlines, specs, and critical figures.
  - **Medium Neutral (`#666666`):** Secondary metadata, voltage ratings, SKU numbers, and body descriptions.
- **Alert States:**
  - **Warning Yellow (`#FFC107`):** Low inventory, caution notes regarding wiring polarity and load balance.
  - **Danger Red (`#DC3545`):** Overload warnings, error notifications, and critical safety cutoffs.

## Typography

The typographic hierarchy prioritizes systematic scanning and technical legibility across multi-lingual demands:

- **Primary Interface (Latin):** `Inter` provides neutral, grotesque precision with tall x-heights ensuring technical specifications (Amperage, Wattage, Voltage) remain razor-sharp on mobile and low-density screens.
- **Technical Readouts:** `JetBrains Mono` is deployed for model serials, pinout schematics, and SKU codes.
- **Urdu Localization:** When `[lang="ur"]` or Urdu script is engaged, typography shifts dynamically to **Noto Nastaliq Urdu** with a baseline line-height multiplier of `1.8x` to prevent clipping of diacritics and descending ligatures.
- **Labels & Badges:** `label-uppercase` demands strict uppercase styling with positive tracking (`0.08em`) to delineate operational categories like `MPPT`, `PWM`, `HYBRID`, or `IN-STOCK`.

## Layout & Spacing

A responsive 12-column grid anchors the hardware catalog:
- **Desktop (1024px+):** 12-column fluid grid, `2rem` outer margins, `1.5rem` gutters, max-width capped at `1280px` for optimal scanning.
- **Tablet (768px – 1023px):** 8-column layout, `1.5rem` outer margins, `1rem` gutters.
- **Mobile (320px – 767px):** 4-column layout, `1rem` outer canvas padding, `1rem` gutters.

### Rhythmic Rules
- **Component Packaging:** Product cards, spec blocks, and checkout containers use internal padding of `space-md` (`1rem`) on mobile and `space-lg` (`1.5rem`) on desktop.
- **Data Densification:** Technical specification tables use compressed vertical paddings (`space-xs` to `space-sm`) to maximize visible comparison attributes above the fold.

## Elevation & Depth

Visual hierarchy is maintained through sharp surface separation, crisp 1px borders, and ultra-subtle ambient drop shadows:

- **Level 0 (Canvas Base):** Background `#F5F5F5` provides grounded contrast. Zero elevation.
- **Level 1 (Default Containers & Product Cards):** Background `#FFFFFF`, 1px solid border in `#E0E0E0`, subtle diffuse shadow: `0 2px 4px rgba(0, 0, 0, 0.04)`.
- **Level 2 (Interactive Hover / Dropdowns):** Subtle upward translation (`-2px`), border color shifting to `#CCCCCC`, shadow: `0 8px 16px rgba(0, 0, 0, 0.08)`.
- **Level 3 (Modals / Cart Drawer / Sticky Elements):** Background `#FFFFFF`, shadow: `0 16px 32px rgba(0, 0, 0, 0.12)`.
- **Floating Utility (WhatsApp Quick Connect):** Fixed position elevated via `0 4px 12px rgba(40, 167, 69, 0.35)` to guarantee thumb-reach distinction over product grids.

## Shapes

The design language uses controlled, industrial geometry. Curves are intentional and subtle, rejecting both extreme sharp brutalism and overly soft consumer curves:

- **Base Radius (6px):** Form inputs, buttons, and badges share a calibrated 6px corner radius (`rounded-md`), reflecting precision sheet-metal tooling.
- **Container Radius (8px):** Product cards, diagnostic panels, and alert banners use 8px (`rounded-lg`) to soften larger functional blocks.
- **Pill Radius (9999px):** Status badges (e.g., `12V / 24V Auto`, `In Stock`) and the floating WhatsApp action button utilize full pills to differentiate status and communication channels from transactional rectilinearity.

## Components

### Buttons
- **Primary:** Solid `#CC0000` background, `#FFFFFF` text, 6px border-radius, font-weight 600. Hover: `#990000`. Active: transform scale `0.98`.
- **Secondary:** `#FFFFFF` background, 1.5px solid `#CC0000`, text `#CC0000`, 6px border-radius. Hover: `#F5F5F5` surface with `#990000` border and text.
- **Ghost:** Transparent background, `#1A1A1A` text. Hover: `#F5F5F5` surface.
- **Urgent WhatsApp CTA:** Solid `#28A745` background, `#FFFFFF` text, full-pill radius, accompanied by the WhatsApp icon.

### Form Inputs
- **Base Input:** `#FFFFFF` fill, 1px solid `#E0E0E0`, 6px border-radius, text `#1A1A1A`, placeholder `#666666`.
- **Focus State:** 1px solid `#CC0000` with an outer focus-ring `0 0 0 3px rgba(204, 0, 0, 0.15)`. No default browser outlines.
- **Error State:** 1px solid `#DC3545` with focus-ring `0 0 0 3px rgba(220, 53, 69, 0.15)`.

### Cards & Product Modules
- **Structure:** Pure white `#FFFFFF` surface, 8px radius, 1px solid `#E0E0E0`.
- **Layout:** High-contrast technical photo area on top, followed by uppercase category badge, bold product headline, dual-pricing (Trade / Retail in PKR), and technical attribute chips (e.g., `60A`, `Voc 150V`).
- **Footer:** Add to Cart (Red) accompanied by Quick WhatsApp Inquiry icon button.

### Badges & Technical Chips
- **Chips:** Monospaced/condensed uppercase text, `#F5F5F5` background, 1px solid `#E0E0E0`, `#1A1A1A` text, 4px radius.
- **Status Indicators:** 
  - *Active / Ready:* `#28A745` text over `#EAF6EC` background.
  - *Caution / Low Stock:* `#856404` text over `#FFF3CD` background.

### Navigation Header
- **Top Bar:** Pure `#FFFFFF` background, 1px bottom border in `#E0E0E0`, height 72px.
- **Brand Mark:** High-visibility ASATEK logotype in Primary Red `#CC0000` with bold industrial tracking.
- **Language Switcher:** Segregated segmented switch: `EN` | `اردو` with active state outlined in `#CC0000`.
- **Search:** Centered high-legibility search input with category filter dropdown for immediate component lookups.

### Technical Data Tables
- Alternating `#FFFFFF` and `#F5F5F5` row striping, 1px borders in `#E0E0E0`, left-aligned parameters with bold right-aligned technical values in `JetBrains Mono`.