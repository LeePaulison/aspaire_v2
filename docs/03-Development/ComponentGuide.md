# ComponentGuide.md

# AspAIre Component Guide

## Purpose

This document defines frontend component guidance for AspAIre.

The current frontend is inherited from Saigely and is chat-focused. AspAIre should preserve useful platform patterns while evolving the UI into a career platform.

---

# Component Principles

## Feature-First Organization

Keep components close to the feature or domain they serve.

Use shared component folders only when a component is genuinely reused across domains.

Recommended structure:

* `components/ui` for reusable primitives and shell pieces
* Domain component folders for feature-specific UI
* Dedicated renderer folders for specialized rendering, such as Markdown

---

## Keep Durable Data Out of Component State

Component state should handle interaction state:

* Open or closed dialogs
* Form drafts
* Selected tabs
* Temporary upload state
* Local optimistic display where appropriate

Durable product data should come from GraphQL and be persisted through application-owned APIs.

---

## Respect Server and Client Boundaries

Use server components for route-level loading and protected-route checks where possible.

Use client components when the UI needs:

* Browser events
* Local state
* Effects
* WebSocket connections
* Better Auth client hooks
* Theme interaction

Mark client components with `"use client"`.

---

# Current Component Areas

Current inherited component areas include:

* `components/chat`
* `components/markdown`
* `components/ui`

The chat components are expected to become part of AspAIre's AI Workspace foundation or be refactored into that domain later.

---

# Forms and Inputs

Forms should:

* Validate required client-side constraints before submit
* Keep server-side validation authoritative
* Avoid silently discarding user input
* Show stable loading and error states
* Disable submit only when the user action truly cannot proceed

For large or structured product forms, keep field state explicit and easy to inspect.

---

# Buttons and Controls

Controls should use the most familiar UI pattern for the action:

* Icon buttons for clear tool actions
* Select menus for option sets
* Toggles or checkboxes for binary choices
* Tabs for view switching
* Sliders or numeric inputs for numeric settings
* Text buttons for explicit commands

Buttons should have accessible labels when the visible content is only an icon.

---

# Loading, Empty, and Error States

Every major workflow should define:

* Loading state
* Empty state
* Error state
* Success or saved state where relevant

Avoid treating errors as console-only events when the user needs to recover.

---

# Layout

AspAIre is a productivity application, not a marketing site.

Product screens should prioritize:

* Clear navigation
* Dense but readable information
* Predictable actions
* Fast scanning
* Responsive behavior

Avoid oversized hero treatments inside authenticated workflows.

---

# Theme

The app uses `next-themes` and class-based theming.

Components should rely on established theme variables and Tailwind classes instead of hard-coded one-off palettes.

New product UI should preserve dark, light, and system theme support.

---

# Accessibility

Components should include:

* Semantic HTML where possible
* Accessible labels for icon-only controls
* Keyboard-operable actions
* Visible focus behavior
* Status regions for async state where appropriate

Do not use clickable non-button elements for commands.

---

# Current Inheritance Notes

Some inherited UI still uses Saigely product language.

AspAIre should replace branding and product copy intentionally as the relevant screens are brought into the AspAIre domain model.

Do not rename or redesign broad UI areas as unrelated cleanup during domain work unless the change is part of the current vertical slice.

