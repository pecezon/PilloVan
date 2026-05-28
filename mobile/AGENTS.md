<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Mobile App Stack

- Expo Router is used for navigation.
- Gluestack UI + NativeWind are used for UI styling.
- Clerk handles authentication.
- Convex handles backend data, auth-aware functions, and realtime backend features.
- Shared domain enums/validators live in `shared/` when they are used by both Convex and Expo.

## Auth And Routing

- Root `app/_layout.tsx` owns the app-level route gate.
- `useCurrentUser` derives the frontend session state from Clerk + Convex.
- Do not add duplicated auth redirects inside nested layouts unless there is a specific local routing reason.
- Convex functions must derive auth server-side with `ctx.auth.getUserIdentity()`.
- Do not accept frontend-provided user IDs for authorization.
- Use `identity.tokenIdentifier` as the stable auth lookup key.

## UI Direction

- Keep screens mobile-first with centered constrained layouts by default.
- Preserve light/dark theme support.
- Prefer existing Gluestack UI components before adding custom primitives.
- Use lucide icons directly when Gluestack icon wrappers render incorrectly on web.
