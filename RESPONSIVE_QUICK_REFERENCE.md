# 📱 Responsive Design Quick Reference

**TL;DR - Responsive Classes You'll Use Daily**

---

## Breakpoint Quick Reference

```
Default (Mobile)  | sm:640px | md:768px | lg:1024px | xl:1280px
```

---

## Copy-Paste Ready Templates

### Template 1: Section Container
```jsx
<section className="px-4 sm:px-6 md:px-8 py-8 md:py-12 lg:py-16">
  <div className="max-w-6xl mx-auto">
    {/* Your content */}
  </div>
</section>
```

### Template 2: Responsive Grid
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {/* Grid items */}
</div>
```

### Template 3: Responsive Flex
```jsx
<div className="flex flex-col md:flex-row gap-4 md:gap-8">
  {/* Flex items */}
</div>
```

### Template 4: Responsive Typography
```jsx
<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold">
  Big Title
</h1>
```

### Template 5: Responsive Card
```jsx
<div className="p-4 md:p-6 lg:p-8 rounded-lg md:rounded-xl bg-white shadow">
  <h3 className="text-lg md:text-xl font-bold">Card Title</h3>
  <p className="text-sm md:text-base text-gray-600">Card content</p>
</div>
```

### Template 6: Responsive Image
```jsx
<Image
  src={url}
  alt="description"
  fill
  className="object-cover"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
/>
```

### Template 7: Responsive Button
```jsx
<button className="px-4 sm:px-6 md:px-8 py-2 md:py-3 text-sm md:text-base rounded-full">
  Click me
</button>
```

### Template 8: Mobile Menu Toggle
```jsx
<button className="md:hidden">
  {menuOpen ? <X /> : <Menu />}
</button>
```

### Template 9: Mobile/Desktop Toggle
```jsx
{/* Show only on mobile */}
<div className="md:hidden">Mobile content</div>

{/* Show only on desktop */}
<div className="hidden md:block">Desktop content</div>
```

---

## Most Used Classes

### Padding
```
p-4      → padding all sides (1rem)
px-4     → horizontal padding (1rem)
py-4     → vertical padding (1rem)
pt-4     → padding-top (1rem)
pb-4     → padding-bottom (1rem)
pl-4     → padding-left (1rem)
pr-4     → padding-right (1rem)
```

**Responsive**: `px-4 md:px-8` → 1rem on mobile, 2rem on desktop

### Margin
```
m-4      → margin all sides (1rem)
mx-auto  → horizontal auto (center)
mt-4     → margin-top (1rem)
mb-4     → margin-bottom (1rem)
```

**Responsive**: `mb-4 md:mb-8` → 1rem on mobile, 2rem on desktop

### Gap (Flexbox/Grid)
```
gap-4    → 1rem gap between items
gap-6    → 1.5rem gap between items
gap-8    → 2rem gap between items
```

**Responsive**: `gap-4 md:gap-8`

### Width
```
w-full   → 100% width
max-w-md → max 28rem (448px)
max-w-lg → max 32rem (512px)
max-w-2xl → max 42rem (672px)
max-w-6xl → max 72rem (1152px)
```

### Display
```
flex                 → display: flex
flex-col             → flex-direction: column
flex-col md:flex-row → column on mobile, row on desktop
grid                 → display: grid
grid-cols-1          → 1 column
grid-cols-2          → 2 columns
```

**Responsive**: `grid-cols-1 sm:grid-cols-2 md:grid-cols-3`

### Text Size
```
text-xs   → 0.75rem (12px)
text-sm   → 0.875rem (14px)
text-base → 1rem (16px)
text-lg   → 1.125rem (18px)
text-xl   → 1.25rem (20px)
text-2xl  → 1.5rem (24px)
text-3xl  → 1.875rem (30px)
text-4xl  → 2.25rem (36px)
text-5xl  → 3rem (48px)
text-6xl  → 3.75rem (60px)
```

**Responsive**: `text-xl md:text-2xl lg:text-3xl`

### Rounded Corners
```
rounded      → 0.25rem
rounded-lg   → 0.5rem
rounded-xl   → 0.75rem
rounded-2xl  → 1rem
rounded-full → 9999px (circle/pill)
```

### Shadow
```
shadow     → small shadow
shadow-lg  → large shadow
shadow-xl  → extra large shadow
```

---

## Responsive Utilities

### Hidden/Visible
```jsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="md:hidden">Mobile only</div>
```

### Hover/Active States
```jsx
<button className="hover:bg-blue-600 active:scale-95">
  Hover me
</button>
```

### Transitions
```jsx
<div className="transition-all duration-300">
  Smooth transition
</div>
```

### Opacity
```jsx
<div className="opacity-50">
  Semi-transparent
</div>
```

---

## Common Responsive Patterns

### Pattern A: Mobile-First Layout
```jsx
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/2">Sidebar</div>
  <div className="w-full md:w-1/2">Content</div>
</div>
```

### Pattern B: Grid Scaling
```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Pattern C: Typography Scaling
```jsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

### Pattern D: Container Max-Width
```jsx
<div className="px-4 md:px-6">
  <div className="max-w-6xl mx-auto">
    {/* Content never wider than max-w-6xl */}
  </div>
</div>
```

### Pattern E: Responsive Spacing
```jsx
<section className="py-8 md:py-12 lg:py-16 px-4 md:px-6">
  {/* Content */}
</section>
```

---

## Testing Checklist

- [ ] Looks good on 375px (iPhone SE)
- [ ] Looks good on 768px (iPad)
- [ ] Looks good on 1440px (Desktop)
- [ ] No horizontal scrolling
- [ ] Touch targets >= 44px on mobile
- [ ] Text readable without zoom
- [ ] Buttons clickable on mobile
- [ ] Images load correctly
- [ ] Animations smooth
- [ ] Forms mobile-friendly

---

## What NOT to Do

```jsx
❌ NEVER do this:
<div style={{ width: '500px' }}>  // Hardcoded width
<div className="p-10">            // Same padding everywhere
<h1 className="text-6xl">         // Same size everywhere
<button className="p-1">          // Too small for mobile

✅ DO THIS INSTEAD:
<div className="max-w-md">
<div className="p-4 md:p-8">
<h1 className="text-2xl md:text-6xl">
<button className="p-3 md:p-2">
```

---

## Browser DevTools Trick

In Chrome/Firefox DevTools:
1. Press `F12` to open DevTools
2. Click the device toggle: **Ctrl+Shift+M** (Windows) or **Cmd+Shift+M** (Mac)
3. Select device or enter custom viewport width
4. Test your changes live

---

## Quick Links

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Responsive Design Guide](./RESPONSIVE_BEST_PRACTICES_GUIDE.md)
- [Full Audit Report](./RESPONSIVENESS_OPTIMIZATION_AUDIT.md)

---

**Remember**: Mobile-first, test on real devices, use Tailwind utilities! 🎉

