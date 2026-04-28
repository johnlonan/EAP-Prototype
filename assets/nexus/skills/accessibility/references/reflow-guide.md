# Reflow Accessibility Guide

## Core Requirement

**Pages must reflow down to 320px wide without loss of content or functionality.**

This meets WCAG 2.2 Success Criterion 1.4.10 (Reflow) Level AA, which requires content to be presentable without loss of information or functionality, and without requiring scrolling in two dimensions.

### Why 320px?

320px represents:

- 1280px viewport at 400% zoom
- Common mobile device width in portrait orientation
- Equivalent to a user zooming to 400% on desktop

---

## Top-Line Rules

### 1. Primary Breakpoint at 640px

Set your main responsive breakpoint at 640px (40rem). This is where layouts should transition from desktop to mobile patterns.

```css
/* Mobile-first approach */
.container {
  /* Mobile styles (default) */
}

@media (min-width: 640px) {
  .container {
    /* Desktop styles */
  }
}
```

### 2. No Sticky Headers or Footers Below 640px

**Rule:** Remove `position: sticky` and `position: fixed` from headers and footers on viewports below 640px.

**Why:** Sticky elements consume valuable vertical space on small screens and can obscure content or create scrolling issues.

```css
/* Default: No sticky positioning */
.header,
.footer {
  position: static;
}

/* Only sticky on larger screens */
@media (min-width: 640px) {
  .header {
    position: sticky;
    top: 0;
  }

  .footer {
    position: sticky;
    bottom: 0;
  }
}
```

### 3. Avoid Vertical Scrolling Regions Within the Page

**Rule:** Avoid nested vertical scrolling regions (scrollable divs within the main page). Users should only need to scroll the main page vertically.

**Why:**

- Multiple scrolling regions are confusing
- Hard to discover on mobile
- Difficult for keyboard navigation
- Creates two-dimensional scrolling

**Exceptions:**

- Canvas-based tools (drawing, diagramming applications)
- List views with large datasets
- Time-based charts (Gantt charts, timelines)
- 2D necessary interfaces (WYSIWYG editors, spreadsheets)
- Data tables (when horizontal scrolling is unavoidable)

```css
/* AVOID THIS on small screens: */
.scrollable-sidebar {
  height: 500px;
  overflow-y: auto; /* Creates nested scroll region */
}

/* PREFER THIS: */
.sidebar {
  /* Let it flow naturally with the page */
  /* No fixed height, no overflow */
}

/* Exception: Only use when truly necessary */
@media (min-width: 640px) {
  .data-table-wrapper {
    overflow-x: auto; /* Horizontal scroll acceptable for tables */
  }
}
```

### 4. Use Long Scrolling Pages

**Rule:** Embrace long scrolling pages on mobile rather than trying to constrain content height.

**Why:**

- Mobile users are comfortable with vertical scrolling
- Eliminates need for nested scroll regions
- Simpler interaction model
- More content accessible without tapping
- Natural reading flow

```css
/* Good: Let content flow naturally */
.content {
  /* No fixed height */
  /* No overflow properties */
  padding-bottom: 2rem; /* Space at bottom */
}

/* Avoid: Constrained containers on mobile */
@media (max-width: 639px) {
  .content {
    /* Don't do this: */
    /* height: 100vh; */
    /* overflow-y: auto; */
  }
}
```

### 5. Use Full Column Width with Minimal Side Padding

**Rule:** On viewports below 640px, use full or near-full width with minimal horizontal padding.

**Why:**

- Maximizes usable screen space
- More room for content and touch targets
- Easier to read full-width text
- Better use of limited screen real estate

```css
/* Mobile: Minimal side padding */
.container {
  padding: 1rem 0.75rem; /* Small horizontal padding */
  width: 100%;
}

.content {
  width: 100%;
  /* No max-width constraint on mobile */
}

/* Desktop: Add more padding and constraints */
@media (min-width: 640px) {
  .container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .content {
    max-width: 800px;
  }
}
```

**Padding Guidelines:**

- **Mobile (< 640px):** 0.75rem to 1rem side padding
- **Tablet (640px+):** 1.5rem to 2rem side padding
- **Desktop (1024px+):** 2rem to 3rem side padding

### 6. Stack Items in Source Order

**Rule:** When reflowing to mobile, stack elements in the order they appear in the HTML source.

**Why:**

- Maintains logical reading order
- Predictable for screen readers
- Easier to implement and maintain
- Preserves content hierarchy

```css
/* Mobile: Natural stacking (source order) */
.layout {
  display: block;
}

.item {
  width: 100%;
  margin-bottom: 1rem;
}

/* Desktop: Can rearrange visually if needed */
@media (min-width: 640px) {
  .layout {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }

  /* Visual order can differ from source order on desktop */
  .item.sidebar {
    order: 2;
  }
}
```

**Best Practice:**

- Don't use CSS to significantly reorder content on mobile
- If visual order needs to change, consider adjusting HTML source order
- Use `order` property sparingly and only on larger screens

---

## Reflow Techniques

### 1. Vertical Navigation → Horizontal Placement

**Pattern:** Convert vertical sidebars to horizontal sections above main content on small screens. Ensure there is no horizontal scrolling within the horizontally placed navigation. Use overflow dropdown menu if needed.

```css
/* Mobile: Horizontal above content */
.sidebar {
  width: 100%;
  margin-bottom: 1rem;
}

.main-content {
  width: 100%;
}
```

### 2. Drawers with Pull Tabs

**Pattern:** Hide non-essential content off-screen with a button/tab to reveal it when needed.

```html
<button
  class="drawer-toggle"
  aria-expanded="false"
  aria-controls="drawer-content"
>
  Filters
</button>

<aside id="drawer-content" class="drawer" hidden>
  <!-- Filter content -->
</aside>
```

### 3. Stacking Content

**Pattern:** Stack previously side-by-side elements vertically on small screens.

```css
/* Mobile: Stack vertically */
.card-grid {
  display: block;
}

.card {
  width: 100%;
  margin-bottom: 1rem;
}
```

### 4. Moving Left Labels to Top Labels

**Pattern:** Position form labels above inputs instead of beside them on small screens.

```css
/* Mobile: Labels above inputs */
.form-field {
  display: block;
}

.form-field label {
  display: block;
  margin-bottom: 0.25rem;
}

.form-field input {
  width: 100%;
}
```

### 5. Transform Vertical Content to Horizontal

**Pattern:** Convert vertically-stacked desktop toolbars and button groups to horizontal layouts on mobile. Never include scrolling within horizontal nav bars. Avoid wrapping if possible. Favor overflow menus with 3-dot icon.

```css
/* Desktop: Vertical toolbar */
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.toolbar-button {
  width: 100%;
}

/* Mobile: Horizontal toolbar */
@media (max-width: 639px) {
  .toolbar {
    flex-direction: row;
    justify-content: space-around;
    gap: 0.25rem;
  }

  .toolbar-button {
    flex: 1;
    min-width: 44px; /* Minimum touch target */
  }
}
```

---

## Data Table Reflow

```css
/* Mobile: Responsive table (card view) */
.table-wrapper {
  overflow-x: auto; /* Allowed exception for tables */
}

table {
  width: 100%;
  min-width: 600px; /* Ensure table doesn't break */
}

/* Alternative: Card view on mobile */
@media (max-width: 639px) {
  .responsive-table thead {
    display: none;
  }

  .responsive-table tr {
    display: block;
    margin-bottom: 1rem;
    border: 1px solid #ccc;
  }

  .responsive-table td {
    display: block;
    text-align: right;
    padding: 0.5rem;
  }

  .responsive-table td::before {
    content: attr(data-label);
    float: left;
    font-weight: bold;
  }
}
```
