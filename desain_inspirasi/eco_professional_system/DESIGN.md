---
name: Eco-Professional System
colors:
  surface: '#f9f9f9'
  surface-dim: '#dadada'
  surface-bright: '#f9f9f9'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f3'
  surface-container: '#eeeeee'
  surface-container-high: '#e8e8e8'
  surface-container-highest: '#e2e2e2'
  on-surface: '#1a1c1c'
  on-surface-variant: '#3d4947'
  inverse-surface: '#2f3131'
  inverse-on-surface: '#f1f1f1'
  outline: '#6d7a78'
  outline-variant: '#bcc9c7'
  surface-tint: '#006a64'
  primary: '#006761'
  on-primary: '#ffffff'
  primary-container: '#00837b'
  on-primary-container: '#f3fffc'
  inverse-primary: '#6fd8ce'
  secondary: '#006a64'
  on-secondary: '#ffffff'
  secondary-container: '#96efe6'
  on-secondary-container: '#006f68'
  tertiary: '#535e5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#6b7776'
  on-tertiary-container: '#f3fffe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#8cf4ea'
  primary-fixed-dim: '#6fd8ce'
  on-primary-fixed: '#00201e'
  on-primary-fixed-variant: '#00504b'
  secondary-fixed: '#99f2e9'
  secondary-fixed-dim: '#7dd6cd'
  on-secondary-fixed: '#00201e'
  on-secondary-fixed-variant: '#00504b'
  tertiary-fixed: '#d9e5e4'
  tertiary-fixed-dim: '#bdc9c8'
  on-tertiary-fixed: '#131d1d'
  on-tertiary-fixed-variant: '#3e4948'
  background: '#f9f9f9'
  on-background: '#1a1c1c'
  surface-variant: '#e2e2e2'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  display-time:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 20px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for the modern workforce, emphasizing reliability, efficiency, and a clean "eco-professional" aesthetic. It targets corporate environments that value transparency and ease of use in administrative tasks.

The visual style is a blend of **Corporate Modern** and **Minimalism**. It utilizes a spacious layout with significant white space to reduce cognitive load during the clock-in/out process. The interface feels approachable yet disciplined, using high-quality typography and a sophisticated teal-centric palette to evoke a sense of professional calm and environmental consciousness. Visual cues are direct, favoring clarity over decorative flourish, ensuring the "Green" identity is felt through color and structural precision rather than complex imagery.

## Colors
The palette is anchored by a deep **Primary Teal**, representing growth and stability. This is supported by a darker shade for hover/active states and a very light teal tint for subtle surface highlighting.

- **Primary:** Use for main actions, active navigation states, and branding.
- **Surface & Neutrals:** A light gray surface color distinguishes cards and input backgrounds from the pure white page background.
- **Functional Colors:** Success Green and Error Red are reserved strictly for status indicators (e.g., successful clock-in, invalid credentials) to maintain high semantic clarity.
- **Contrast:** Ensure all text on teal backgrounds uses pure white to meet accessibility standards.

## Typography
This design system utilizes **Inter** for its exceptional legibility and neutral, modern character. The hierarchy is designed to highlight the most critical data points in an attendance app: the current time and status.

Large, bold display sizes are used for the clock and greeting, while labels use a slightly increased letter spacing and uppercase styling to provide clear categorization without occupying much vertical space. Body text maintains a comfortable line height to ensure readability of logs and history lists.

## Layout & Spacing
The layout follows a **fluid grid** model optimized for mobile devices. 
- **Safe Zones:** A 20px horizontal margin is maintained on all mobile screens to prevent content from touching the edges.
- **Vertical Rhythm:** Elements are stacked using a 4px baseline. Most components are separated by 16px (stack-md), while major sections use 32px (stack-lg).
- **Reflow:** On tablet devices, the single-column mobile view transitions into a 2-column dashboard layout, where the primary clock-in action occupies the left column and the attendance history/team list occupies the right.

## Elevation & Depth
Hierarchy is established through **Tonal Layers** supplemented by **Ambient Shadows**. 

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards/Inputs):** Light Gray (#F5F5F5) or subtle teal tints. No shadow.
- **Level 2 (Floating Actions/Modals):** Pure white surfaces with a soft, diffused shadow (0px 8px 24px rgba(0, 0, 0, 0.05)). This depth is used to separate active modals from the dimmed background.
- **Active State:** Primary buttons use a saturated teal to appear "lifted" and ready for interaction.

## Shapes
The design system uses a very high roundedness factor to create a friendly, approachable feel that counteracts the potentially rigid nature of "monitoring" software. 

Major containers like cards and primary action areas use a 24px (2xl) radius. Smaller interactive components like input fields and list items use a 12px-16px radius. Selection indicators (checkboxes) remain slightly rounded (4px) to maintain their functional identity while fitting the system's language.

## Components
- **Primary Action Button:** Large, 16px rounded corners, filled with Primary Teal. The "Check In/Out" button is a centered, circular floating element to provide a clear focal point.
- **Input Fields:** Soft gray background (#F5F5F5) with no border in default state. On focus, a 2px Primary Teal border is applied. Labels are positioned above the field in `label-md` style.
- **Status Chips:** Small, highly rounded badges using a 10% opacity background of the status color (Success or Error) with 100% opacity text for high contrast and soft appearance.
- **Attendance Cards:** Use a Level 2 elevation style. They feature a vertical color-coded bar on the left edge to denote "Late," "On-Time," or "Absent" status instantly.
- **Bottom Navigation:** A clean, white bar with a subtle top border and active icons highlighted in Primary Teal. Icons should be line-art style with a 2px stroke.
- **Modals:** Centered overlays with a heavy backdrop blur (12px) and 24px rounded corners.