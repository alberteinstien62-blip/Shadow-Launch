# @aleo-privacy-suite/ui

Cyberpunk-themed UI component library for Aleo Privacy Suite. Built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- Dark cyberpunk theme with purple/pink gradient accents
- Smooth animations and transitions
- Glass morphism effects
- Glow effects on hover/focus
- Fully typed with TypeScript
- Accessible components (WCAG compliant)
- Tree-shakeable exports

## Installation

```bash
npm install @aleo-privacy-suite/ui
# or
yarn add @aleo-privacy-suite/ui
# or
pnpm add @aleo-privacy-suite/ui
```

## Setup

1. Import the global styles in your main app file:

```tsx
import '@aleo-privacy-suite/ui/styles/globals.css';
```

2. Ensure your Tailwind config extends the theme (if using Tailwind in your app):

```js
// tailwind.config.js
export default {
  darkMode: 'class',
  // ... your config
}
```

## Components

### Button

Gradient CTA buttons with hover glow effects.

```tsx
import { Button } from '@aleo-privacy-suite/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Launch App
</Button>

<Button variant="outline" leftIcon={<Icon />} isLoading>
  Connect Wallet
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- `isLoading`: boolean
- `leftIcon`, `rightIcon`: ReactNode

### Card

Glass morphism cards with optional header/footer.

```tsx
import { Card } from '@aleo-privacy-suite/ui';

<Card variant="glass" glowEffect padding="lg">
  <h3>Privacy Pool</h3>
  <p>Your private transactions</p>
</Card>

<Card
  header={<h3>Card Header</h3>}
  footer={<Button>Action</Button>}
>
  Card content
</Card>
```

**Props:**
- `variant`: 'default' | 'glass' | 'bordered' | 'elevated'
- `glowEffect`: boolean
- `padding`: 'none' | 'sm' | 'md' | 'lg'
- `header`, `footer`: ReactNode

### Input

Cyberpunk-styled inputs with glow focus effects.

```tsx
import { Input } from '@aleo-privacy-suite/ui';

<Input
  label="Amount"
  placeholder="0.00"
  type="number"
  error="Invalid amount"
  leftIcon={<DollarIcon />}
/>
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`, `rightIcon`: ReactNode
- `inputSize`: 'sm' | 'md' | 'lg'

### Badge

Status badges with optional pulsing dot.

```tsx
import { Badge } from '@aleo-privacy-suite/ui';

<Badge variant="success" dot pulse>
  Active
</Badge>

<Badge variant="purple" size="lg">
  New
</Badge>
```

**Props:**
- `variant`: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'pink'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean
- `pulse`: boolean

### Modal

Animated modal with glass background.

```tsx
import { Modal } from '@aleo-privacy-suite/ui';

<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Confirm Transaction"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={handleClose}>Cancel</Button>
      <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    </>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

**Props:**
- `isOpen`: boolean (required)
- `onClose`: () => void (required)
- `title`: string
- `footer`: ReactNode
- `size`: 'sm' | 'md' | 'lg' | 'xl' | 'full'
- `closeOnOverlayClick`: boolean

### LoadingSpinner

Animated loading indicator.

```tsx
import { LoadingSpinner } from '@aleo-privacy-suite/ui';

<LoadingSpinner size="md" variant="gradient" />
<LoadingSpinner size="lg" variant="dots" />
```

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `variant`: 'default' | 'gradient' | 'dots'

### ConnectWalletButton

Wallet connection button with dropdown.

```tsx
import { ConnectWalletButton } from '@aleo-privacy-suite/ui';

<ConnectWalletButton
  onConnect={handleConnect}
  onDisconnect={handleDisconnect}
  isConnected={isConnected}
  address={walletAddress}
  isConnecting={isConnecting}
/>
```

### PrivacyBadge

Privacy level indicator with shield icon.

```tsx
import { PrivacyBadge } from '@aleo-privacy-suite/ui';

<PrivacyBadge level="high" showLabel />
<PrivacyBadge level="maximum" size="lg" />
```

**Props:**
- `level`: 'none' | 'low' | 'medium' | 'high' | 'maximum'
- `showLabel`: boolean
- `size`: 'sm' | 'md' | 'lg'

### CountdownTimer

Countdown timer for launch phases.

```tsx
import { CountdownTimer } from '@aleo-privacy-suite/ui';

<CountdownTimer
  targetDate={new Date('2024-12-31')}
  onComplete={handleLaunch}
  showLabels
  size="md"
/>
```

### ProgressBar

Animated progress bar with gradient fill.

```tsx
import { ProgressBar } from '@aleo-privacy-suite/ui';

<ProgressBar
  value={75}
  max={100}
  label="Upload Progress"
  showPercentage
  variant="gradient"
  animated
/>
```

## Animations

Pre-built Framer Motion variants for consistent animations:

```tsx
import { fadeIn, slideUp, scaleIn, pageTransition } from '@aleo-privacy-suite/ui';
import { motion } from 'framer-motion';

<motion.div
  variants={fadeIn}
  initial="hidden"
  animate="visible"
>
  Content
</motion.div>
```

Available variants:
- `fadeIn` - Fade in/out
- `slideUp` - Slide up from bottom
- `scaleIn` - Scale in from 0.8
- `staggerChildren` - Stagger child animations
- `pageTransition` - Page enter/exit
- `glowPulse` - Pulsing glow effect
- `buttonHover` - Button hover/tap
- `modalOverlay` - Modal overlay fade
- `modalContent` - Modal content animation

## Utility Functions

### cn()

Merge Tailwind classes with conflict resolution:

```tsx
import { cn } from '@aleo-privacy-suite/ui';

<div className={cn('px-2 py-1', 'px-4', className)}>
  // Results in: 'py-1 px-4' + className
</div>
```

## Theming

The library uses a dark cyberpunk theme:

- Background: `#0a0a0f`
- Surface: `#1a1a2e`
- Accent gradient: `purple-500` to `pink-500`
- Border glow: `#a855f7`

All colors are customizable via Tailwind config.

## Accessibility

All components follow WCAG 2.1 AA standards:
- Keyboard navigation support
- ARIA labels and roles
- Focus indicators with glow effects
- Semantic HTML
- Screen reader friendly

## Performance

- Tree-shakeable exports
- Lazy-loaded animations
- Optimized re-renders with React.memo
- CSS-based animations where possible
- Sub-3s load time target

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT
