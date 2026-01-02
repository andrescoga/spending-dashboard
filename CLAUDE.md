# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production
npm run build

# Run ESLint
npm run lint

# Preview production build
npm run preview
```

## Project Overview

This is a React-based spending dashboard that visualizes personal spending data across multiple categories for the year 2025. The application uses Vite as the build tool and Recharts for data visualization.

## Tech Stack

- **Framework**: React 19.2.0 (with Vite 7.2.4)
- **Charting**: Recharts 3.6.0
- **Build Tool**: Vite with @vitejs/plugin-react (uses Babel for Fast Refresh)
- **Linting**: ESLint 9.39.1 with React Hooks and React Refresh plugins

## Architecture

### Single-File Application Structure

The entire application is contained in `src/App.jsx` (~1100 lines after refactoring). This is intentional for this data visualization project.

**Refactored file organization:**

1. **Lines 1-15**: Imports (React hooks, Recharts components)
2. **Lines 16-204**: Data constants (MONTHS, subcategory data, color palettes)
3. **Lines 205-424**: Design system constants (NEW - see below)
4. **Lines 425-510**: Utility functions and reusable chart components
5. **Lines 511-616**: Insight UI components
6. **Lines 617-724**: CategoryTab component
7. **Lines 725-971**: OverviewTab and GivingTab components
8. **Lines 972-1180**: Shared components (Panel, StatBox, Tag, etc.)
9. **Lines 1181+**: Main SpendingDashboard component

**Key architectural elements:**

1. **Data Layer** (Lines 18-204): Static data constants organized by category
   - `MONTHS`: Main spending categories by month
   - Category-specific subcategory data (e.g., `FOOD_DINING_SUBCATS`, `TRAVEL_SUBCATS`)
   - Color palettes for each category (maintained for backwards compatibility)

2. **Design System** (Lines 205-424): Comprehensive constants for maintainability
   - `FONT_SIZE`: Typography scale (xs → 3xl)
   - `SPACING`: 4px-based spacing scale
   - `RADIUS`: Border radius values
   - `CHART`: Chart dimensions and configurations
   - `COLORS`: Semantic color system with gray scale and accents
   - `OPACITY`: Consistent transparency values for surfaces, borders, fills
   - `CHART_STYLES`: Reusable chart styling configurations
   - `THRESHOLDS`: Analysis thresholds (spike detection, top N categories)
   - `INSIGHTS`: Helper functions for calculating insights from data
   - `A11Y`: Accessibility labels and descriptions

3. **Reusable Components**:
   - **Chart Components** (Lines 443-510): `CategoryBarChart`, `CategoryLineChart`
     - Memoized with `React.memo` for performance
     - Use design system constants throughout
     - Support both absolute and percent scales
   - **Insight Components** (Lines 514-616): `InsightRow`, `InsightSection`, `HighlightBox`, `SubcategorySummaryCard`
     - Eliminate code duplication (30+ repeated patterns consolidated)
     - Consistent styling through design system
   - **Shared Components** (Lines 974-1180): `Panel`, `StatBox`, `Tag`, `ControlPill`, `TooltipBox`
     - All refactored to use design system constants
     - Memoized for performance

4. **Component Hierarchy**:
   - `SpendingDashboard` (main component): Tab navigation and top-level state
   - `OverviewTab`: Multi-category overview with filtering
   - `CategoryTab`: Generic category detail view (reused for most tabs)
   - `GivingTab`: Specialized tab with Family Care toggle

5. **State Management & Performance**:
   - All state is local component state using `useState`
   - Expensive calculations wrapped in `useMemo` hooks
   - Event handlers wrapped in `useCallback` to prevent unnecessary re-renders
   - Components memoized with `React.memo`
   - `excludeFamily` toggle filters Family Care spending across Overview and Giving tabs

### Data Structure Conventions

- All monetary values are in dollars (NET spending after credits)
- Month format: "MMM YYYY" (e.g., "Jan 2025")
- Categories have subcategories with consistent naming
- Each category has an associated color palette object

### Component Patterns

**CategoryTab**: Generic reusable component for category detail views
- Props: `title`, `data`, `subcats`, `palette`, `insights`
- Renders: stacked/grouped bar chart, line chart, stat cards, insights panel
- Controls: view mode toggle (stacked/grouped)

**OverviewTab**: Special handling for multi-category analysis
- Additional controls: top N slider, focus category dropdown, scale toggle (absolute/percent)
- Spike detection algorithm using median-based threshold (1.4x median)
- Dynamic "Other" category aggregation

## Key Features to Understand

1. **Family Care Exclusion**: Toggle that filters out large Family Care payments from Giving category, propagating to Overview tab
2. **Dynamic Top N**: Overview shows top N categories by total spending with remaining grouped as "Other"
3. **Scale Modes**: Charts support absolute dollars or percentage views
4. **Stacked vs Grouped**: All category charts toggle between stacked (composition) and grouped (comparison) views

## Development Notes

- Color generation uses simple hash function for deterministic category colors (line 365)
- Currency formatting handles values >= $1000 differently (rounds to whole dollars) (line 206-211)
- Recharts ResponsiveContainer pattern used consistently for responsive charts
- Dark theme with gradient background: `linear-gradient(145deg, #0d0d12 0%, #1a1a24 100%)`

## ESLint Configuration

Custom rule: `'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }]`
- Allows unused constants with uppercase names (useful for data constants)

## Design System Usage

### Adding New Styling

When adding or modifying styles, **always use the design system constants**:

```javascript
// ❌ BAD: Hardcoded values
<div style={{ padding: "16px", borderRadius: 12, fontSize: 14 }}>

// ✅ GOOD: Design system constants
<div style={{
  padding: SPACING['3xl'],
  borderRadius: RADIUS.xl,
  fontSize: FONT_SIZE.lg
}}>
```

### Common Patterns

**Spacing:**
```javascript
gap: SPACING['2xl']              // 14px
marginBottom: SPACING['5xl']     // 22px
padding: `${SPACING.md}px`       // 8px
```

**Colors:**
```javascript
color: COLORS.white
color: COLORS.gray[600]          // #888
color: COLORS.accent.red         // #ff6b6b
background: COLORS.background.primary  // gradient
```

**Opacity:**
```javascript
background: `rgba(255,255,255,${OPACITY.surface.level0})`  // 0.02
border: `1px solid rgba(255,255,255,${OPACITY.border.default})`  // 0.08
```

**Charts:**
```javascript
height: CHART.height.default     // 380px
margin: CHART.margin.default     // { top: 10, right: 22, left: 6, bottom: 8 }
{...CHART_STYLES.grid}          // Spread operator for consistent grid styling
{...CHART_STYLES.xAxis}         // Spread operator for consistent axis styling
```

### Performance Best Practices

1. **Wrap expensive calculations in `useMemo`:**
```javascript
const totals = useMemo(() => {
  // expensive calculation
  return result;
}, [dependencies]);
```

2. **Wrap event handlers in `useCallback`:**
```javascript
const handleClick = useCallback((value) => {
  setValue(value);
}, []);
```

3. **Memoize components with `React.memo`:**
```javascript
const MyComponent = React.memo(({ prop1, prop2 }) => {
  return <div>...</div>;
});
MyComponent.displayName = 'MyComponent';
```

### Creating New Components

When creating new components:
1. Use design system constants for all styling
2. Wrap with `React.memo` if the component renders frequently
3. Add `displayName` for better debugging
4. Use semantic prop names
5. Extract repeated patterns into reusable components

Example:
```javascript
const MyNewComponent = React.memo(({ title, value, color }) => {
  return (
    <div style={{
      padding: SPACING['2xl'],
      borderRadius: RADIUS.lg,
      background: `rgba(255,255,255,${OPACITY.surface.level1})`,
      border: `1px solid rgba(255,255,255,${OPACITY.surface.level3})`
    }}>
      <div style={{ color: color, fontSize: FONT_SIZE.base }}>
        {title}
      </div>
      <div style={{ color: COLORS.white, fontSize: FONT_SIZE['2xl'] }}>
        {value}
      </div>
    </div>
  );
});
MyNewComponent.displayName = 'MyNewComponent';
```
