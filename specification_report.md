# Aunova Omni-Solution: 7-Stage SPA Prototype Specification (Refined)

This document provides a production-ready specification for the Aunova Omni-Solution. It is structured for direct use by developers using HTML5, Tailwind CSS, and Vanilla JavaScript.

---

## 1. Global Technical Specifications

### A. Liquid Glass Visual Style (Tailwind & CSS)

Apply this utility class to any panel requiring the "Liquid Glass" texture.

```css
/* style.css */
.liquid-glass {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(25px) saturate(160%);
  -webkit-backdrop-filter: blur(25px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.7);
}
```

### B. Advanced Cursor Interaction (Cyan Aura)

Create a `#cursor-aura` div at the end of the body.

```javascript
// cursor.js
const aura = document.getElementById("cursor-aura");
document.addEventListener("mousemove", (e) => {
  aura.style.background = `radial-gradient(circle at ${e.clientX}px ${e.clientY}px, rgba(0, 245, 255, 0.2) 0%, transparent 70%)`;
});
```

### C. SPA Architecture & Routing

Single HTML structure using `hidden` class transitions.

```javascript
// router.js
function navigateTo(pageId) {
  document
    .querySelectorAll(".spa-page")
    .forEach((p) => p.classList.add("hidden"));
  const target = document.getElementById(pageId);
  target.classList.remove("hidden");
  target.classList.add("fade-in"); // CSS animation: opacity 0 to 1
}
```

---

## 2. User flow (1P ~ 5P) Implementation

### 1P: Genesis (Landing & Auth)

- **Intro Seq**: Central 8-pointed star SVG with `@keyframes burst`.
- **Sound UI**: `new Audio('logo_sound.mp3').play()` triggered by user landing.
- **Data Logic**: `localStorage.setItem('paymentRegistered', true)` check during sign-up.

### 2P: Synthesis (Dashboard)

- **Morphing Interaction**: Central image `img` tag with `transition: filter 0.5s ease-in-out`.
- **Live Preview Filter**:
  - Lv.1: `filter: grayscale(100%) opacity(0.5);`
  - Lv.5: `filter: drop-shadow(0 0 10px #00F5FF) brightness(1.2);`
- **Pricing Logic**:
  - Total: `<span>200,000 KRW</span>`
  - Deposit: `<span class="text-nova-cyan font-bold">22,000 KRW</span>`

### 3P: Payment Warning

- **Rollback Logic**: "Back" button calls `navigateTo('page-2')`.
- **State persistence**: Do NOT clear `appState.inputs` on back navigation. Data binding `input.value = appState.inputs.prompt`.

### 4P: Processing

- **Loading Anim**: Spin the 8-pointed star at `animate-spin` (Tailwind) with `duration: 300ms`.
- **Timer**: `setTimeout(() => navigateTo('page-5'), 3000);`

### 5P: Result (Viewer & 2차 결제)

- **Viewer**: Three.js `PerspectiveCamera` with `OrbitControls`.
- **2차 결제**: `total_price - deposit = 178,000 KRW` calculation displayed in a modal before print request.

---

## 3. Admin Flow (ㄱP ~ ㄴP) Implementation

### ㄱP: The Factory (Ops)

- **Print Logic**:
  ```css
  @media print {
    .liquid-glass,
    .cinema-viewer {
      display: none;
    }
    body {
      background: white;
      color: black;
    }
    table {
      width: 100%;
      border: 1px solid #ddd;
    }
  }
  ```

### ㄴP: The Lab (Strategic R&D)

- **Time-Machine Logic**:
  ```javascript
  const slider = document.getElementById("history-slider");
  slider.oninput = function () {
    promptTextArea.value = history[this.value].text;
    // Trigger subtle fade animation on text change
  };
  ```
- **Merge Logic**: Bold/Highlight keywords that appear in multiple selected prompts before merging into the main engineering window.

---

## 4. Development Checklist

- [ ] Tailwind colors extended: `colors: { 'deep-night': '#0A0A0B', 'nova-cyan': '#00F5FF' }`
- [ ] Global `appState` object initialized in `main.js`.
- [ ] All `@media print` rules verified for work orders.
- [ ] Font: 'Inter' or 'Geist' for Digital Genesis aesthetic.

<!-- Contribution graph verification commit at 2026-03-04 02:35 -->
