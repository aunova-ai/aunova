# Aunova Omni-Solution: 7-Stage SPA Prototype Specification

This document provides a technical roadmap for implementing the Aunova Omni-Solution prototype. It covers the "Digital Genesis" design theme, SPA architecture, and detailed logic for all 7 pages.

---

## 1. Global Specifications (Digital Genesis)

### Design & Texture

- **Theme**: Digital Genesis (Deep Night Black & Supernova Cyan).
- **Liquid Glass Tooling**:
  - `backdrop-filter: blur(20px) saturate(180%);`
  - `background: rgba(255, 255, 255, 0.05);`
  - `border: 1px solid rgba(255, 255, 255, 0.1);`
  - `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.8);`
- **Advanced Cursor Interaction**:
  1. Create a global div `#cursor-aura`.
  2. Map `mousemove` events to update CSS variables `--mouse-x` and `--mouse-y`.
  3. CSS: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(0, 245, 255, 0.15) 0%, transparent 80%)`.

### SPA Architecture

- **Navigation Engine**: One HTML file with multiple `<section>` tags.
- **Routing Logic**: `function navigateTo(targetId)` handles hiding current sections and showing the new one with a CSS fade-in transition.
- **Global State**:
  ```javascript
  const appState = {
    user: { loggedIn: false, role: "user", depositPaid: false },
    inputs: { title: "", prompt: "", level: 1, images: [] },
    result: { modelId: null, color: null },
  };
  ```

---

## 2. User Page Scenarios (1P ~ 5P)

### 1P: Genesis (Landing & Auth)

- **Intro Seq**: CSS `@keyframes nova-burst` starting from a central 8-pointed star SVG.
- **Sound UI**: `const introAudio = new Audio('logo_sound.mp3');` trigger on first user interaction or auto-play (if allowed).
- **Sign-up Data**: `payment_method` field is mandatory during registration.
- **Logic**: Button click triggers `navigateTo('page-2')` or `navigateTo('admin-page-1')`.

### 2P: Synthesis (Input & Live Morphing)

- **Layout**: CSS Grid `grid-template-columns: 3fr 4fr 3fr;`.
- **Morphing Logic**:
  - Use `mask-image` or Canvas/WebGL to morph the central star into the selected sample image.
  - Level change (`Lv.1` ~ `Lv.5`) updates `brightness` and `contrast` filters in real-time on the center image.
- **Data Action**: `[Start Synthesis]` saves inputs to `appState.inputs` and moves to 3P.

### 3P: Payment Warning (Check & Rollback)

- **Logic**: Display `appState.inputs.deposit` (e.g., 22,000 KRW).
- **Back Button**: `navigateTo('page-2')` without resetting `appState.inputs`. Input fields remain populated via `value="${appState.inputs.prompt}"`.

### 4P: Processing (Compute)

- **Visual**: Rotating 8-pointed star at `animation-duration: 0.5s;`.
- **Logic**: `setTimeout(() => { activateNextButton(); }, 3000);`.

### 5P: Result (Viewer & Finalization)

- **Viewer**: Placeholder for `Three.js` Canvas. `orbitControls` enabled.
- **Color Logic**: Selection of palette updates `material.color` of the 3D model.
- **2차 결제**: 3D Print Request triggers a modal showing `remaining_balance = total_price - deposit`.

---

## 3. Admin Page Scenarios (ㄱP ~ ㄴP)

### ㄱP: The Factory (Operations)

- **Order List**: Responsive HTML Table with Tailwind `overflow-x-auto`.
- **Print Logic (@media print)**:
  ```css
  @media print {
    body {
      background: #fff !important;
      color: #000 !important;
    }
    .no-print,
    .cinematic-viewer {
      display: none;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
  }
  ```
- **Cinema Viewer**: Horizontal scrolling container using `display: flex; overflow-x: scroll;`.

### ㄴP: The Lab (Strategic R&D)

- **Priority Logic**: Drag & Drop sorting (e.g., using `Sortable.js` or Native HTML5 DND API).
- **Time-Machine (Rollback)**:
  - Input `range` slider.
  - `oninput` handler updates the text area with `promptHistory[sliderValue]`.
- **Merge Logic (Tag Cloud)**:
  - JS logic: `keywords.reduce((acc, k) => { acc[k] = (acc[k] || 0) + 1; return acc; }, {})`.
  - CSS: Dynamic `font-size` and `font-weight` based on frequency.

---

## 4. Key Implementation Tips for Developers

- **Tailwind Config**: Extend colors for `night-black` and `nova-cyan`.
- **Animations**: Use `GSAP` or `Framer Motion` (if using React) for smoother Liquid Glass transitions, but Vanilla CSS transitions are sufficient for this prototype.
- **Persistence**: Use `localStorage` to save `appState` for persistence across page refreshes.
