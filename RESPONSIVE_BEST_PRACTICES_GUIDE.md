# Responsive Design Best Practices Guide

**For**: Buscando Amor Eterno Development Team  
**Purpose**: Maintain responsive design excellence in future updates

---

## Core Principles

Your codebase follows these principles - **maintain them**:

### 1. Mobile-First Approach
Write styles for mobile first, then add breakpoints:

```jsx
❌ WRONG:
<div className="text-4xl md:text-2xl"> // Desktop first

✅ CORRECT:
<div className="text-2xl md:text-4xl"> // Mobile first
```

### 2. Responsive Spacing Pattern
Always include responsive padding and margins:

```jsx
✅ GOOD:
<section className="px-4 py-12 md:py-16 md:px-6 lg:px-8">

❌ BAD:
<section className="px-4 py-4">
```

### 3. Typography Scaling
Scale typography properly across devices:

```jsx
✅ GOOD:
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">

❌ BAD:
<h1 className="text-6xl">
```

---

## Tailwind CSS Breakpoints Reference

Always use these standard breakpoints:

```
Mobile-First:
- Default styles (0px and up)
- sm:  640px   - Small devices
- md:  768px   - Tablets
- lg:  1024px  - Desktops
- xl:  1280px  - Large desktops
- 2xl: 1536px  - Ultra-wide
```

**Pattern**: Start with default, add `sm:`, `md:`, `lg:` as needed.

---

## Component Responsive Checklist

When creating new components, ensure:

- [ ] Mobile layout defined (default styles)
- [ ] Tablet layout defined (sm: or md:)
- [ ] Desktop layout defined (md: or lg:)
- [ ] All text is readable on mobile (min font-size: 16px)
- [ ] Touch targets are >= 44x44px on mobile
- [ ] Images use responsive sizing
- [ ] No horizontal scrolling on any device
- [ ] Padding/margins scale with breakpoints
- [ ] Links are finger-friendly on mobile
- [ ] Forms are mobile-optimized

---

## Specific Patterns to Follow

### Pattern 1: Responsive Grid

```jsx
✅ FOLLOW THIS PATTERN:

// 1 column mobile, 2 tablets, 3 desktop
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

### Pattern 2: Responsive Flex Layout

```jsx
✅ FOLLOW THIS PATTERN:

// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4 md:gap-8">
```

### Pattern 3: Responsive Typography

```jsx
✅ FOLLOW THIS PATTERN:

// Scale title from mobile to desktop
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold">
```

### Pattern 4: Responsive Images

```jsx
✅ FOLLOW THIS PATTERN:

<Image
  src={imageUrl}
  alt="description"
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Pattern 5: Responsive Padding

```jsx
✅ FOLLOW THIS PATTERN:

// Small padding on mobile, large on desktop
<div className="px-4 sm:px-6 md:px-8 py-8 md:py-12 lg:py-16">
```

### Pattern 6: Responsive Hidden/Visible

```jsx
✅ FOLLOW THIS PATTERN:

// Hide on mobile, show on desktop
<button className="hidden md:block">Desktop Button</button>

// Show on mobile, hide on desktop
<button className="md:hidden">Mobile Button</button>
```

---

## Common Mistakes to Avoid

### ❌ Mistake 1: Hardcoded Pixel Values
```jsx
❌ DON'T:
<div style={{ fontSize: '16px' }}>

✅ DO:
<div className="text-base sm:text-lg md:text-xl">
```

### ❌ Mistake 2: Missing Responsive Containers
```jsx
❌ DON'T:
<div className="w-full">
  <div className="w-full px-4">

✅ DO:
<div className="w-full max-w-6xl mx-auto px-4">
```

### ❌ Mistake 3: Non-responsive Images
```jsx
❌ DON'T:
<img src={url} className="w-full h-96" />

✅ DO:
<Image
  src={url}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### ❌ Mistake 4: Inconsistent Spacing
```jsx
❌ DON'T:
<div className="p-4 my-10">

✅ DO:
<div className="p-4 md:p-8 my-4 md:my-8">
```

### ❌ Mistake 5: Unresponsive Breakpoints
```jsx
❌ DON'T:
<div className="md:grid-cols-4">

✅ DO:
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
```

---

## Mobile-Specific Considerations

### Touch Targets
All clickable elements must be at least **44x44px** on mobile:

```jsx
✅ GOOD:
<button className="p-3 md:p-2">Touch-friendly</button>

❌ BAD:
<button className="p-1">Too small</button>
```

### Text Readability
Ensure readable text on all devices:

```jsx
✅ GOOD:
<p className="text-base sm:text-lg">Readable</p>

❌ BAD:
<p className="text-xs">Too small on mobile</p>
```

### Safe Area (Notched Devices)
Consider safe areas for notched devices:

```jsx
✅ GOOD:
<div className="px-4 safe-area-inset-left safe-area-inset-right">
```

---

## Performance Considerations

### Image Optimization
Always use Next.js Image component:

```jsx
import Image from 'next/image'

<Image
  src={url}
  alt="description"
  width={800}
  height={600}
  priority // for above-fold images only
  placeholder="blur"
  sizes="(max-width: 640px) 100vw, 50vw"
/>
```

### CSS Performance
Use Tailwind's utility classes, avoid inline styles:

```jsx
✅ GOOD:
<div className="flex gap-4 p-6">

❌ BAD:
<div style={{ display: 'flex', gap: '1rem', padding: '1.5rem' }}>
```

---

## Testing Responsive Design

### Manual Testing Checklist

- [ ] Test on real mobile device (not just browser emulation)
- [ ] Test on tablet (iPad, Android tablet)
- [ ] Test on desktop (1440px+)
- [ ] Test landscape and portrait orientations
- [ ] Test with zoom at 150% and 200%
- [ ] Test with system fonts (reduced motion, large text)
- [ ] Test with keyboard navigation (Tab key)
- [ ] Test with screen reader (NVDA, JAWS, VoiceOver)
- [ ] Check all links are clickable on mobile
- [ ] Check forms are fillable on mobile
- [ ] Verify no horizontal scrolling

### Browser/Device Testing

```
Minimum Testing Devices:
- iPhone SE (375px) - smallest modern phone
- iPad (768px) - tablet
- Desktop (1440px) - standard width
- Large Desktop (1920px) - ultra-wide
```

---

## Responsive Patterns by Component Type

### Buttons
```jsx
<button className="px-4 sm:px-6 md:px-8 py-2 md:py-3 text-sm md:text-base">
  Click me
</button>
```

### Cards
```jsx
<div className="p-4 md:p-6 rounded-xl md:rounded-2xl">
  <h3 className="text-lg md:text-xl">Title</h3>
  <p className="text-sm md:text-base">Content</p>
</div>
```

### Navigation
```jsx
<nav className="flex flex-col md:flex-row gap-4 md:gap-8">
  <a href="#" className="text-sm md:text-base">Link</a>
</nav>
```

### Forms
```jsx
<form className="space-y-4 md:space-y-6">
  <input className="w-full px-4 py-2 md:py-3 text-sm md:text-base" />
  <button className="w-full md:w-auto px-6 py-2 md:py-3">Submit</button>
</form>
```

### Hero Section
```jsx
<section className="px-4 py-12 md:py-16 lg:py-24 text-center">
  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">Heading</h1>
  <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto">Content</p>
</section>
```

---

## File Organization

Keep responsive considerations in your components:

```
components/
├── button.tsx          # Use Tailwind responsive classes
├── card.tsx            # Use flexible, responsive layouts
├── navigation.tsx      # Mobile menu + desktop nav
├── hero.tsx            # Responsive typography & spacing
└── ...
```

---

## When to Create Mobile-Specific Components

Only create separate mobile components if:
1. Layout is completely different (different DOM structure)
2. Interaction model differs significantly
3. Performance is critical

Otherwise, use responsive utilities.

```jsx
✅ GOOD (responsive utilities):
<div className="grid grid-cols-1 md:grid-cols-2">

❌ RARELY NEEDED (separate components):
{isMobile ? <MobileCard /> : <DesktopCard />}
```

---

## Performance Monitoring

Monitor these Core Web Vitals:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

Use Next.js built-in analytics or external tools.

---

## Common Questions

### Q: Should I use px or rem for spacing?
**A**: Use Tailwind's utility classes (p-4, gap-2, etc). They use rem units internally and scale well.

### Q: How many breakpoints do I need?
**A**: Typically 3-4: sm (640px), md (768px), lg (1024px), and sometimes xl (1280px).

### Q: Should forms be full-width on mobile?
**A**: Yes, unless it's a login form (max-width-sm is fine).

### Q: Should images be full-width on mobile?
**A**: Usually yes, with proper max-width on desktop. Use `sizes` prop for optimization.

---

## Summary

Your codebase is already following these patterns excellently. When making updates:

1. **Think Mobile First**
2. **Use Responsive Utilities** (sm:, md:, lg:)
3. **Scale Everything** (typography, spacing, images)
4. **Test on Real Devices**
5. **Follow Existing Patterns** in your codebase

---

**Result**: A website that works beautifully on all devices! 🚀

