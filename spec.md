# CloudSphere – Authentication Fix

## Current State

The app uses Internet Identity (ICP's decentralised, passwordless auth) — there is no traditional password database. Registration is handled by calling `registerUser(email)` on the backend after a successful II login.

Root causes of "User not register" / auth errors:

1. **App.tsx auto-redirect bug**: When a user is already authenticated (identity in localStorage) and visits the login or signup page, `App.tsx` immediately redirects them to `dashboard` — bypassing the `registerUser` call in `LoginPage`/`SignUpPage`. The backend has no record of the user, so all profile/file queries trap.

2. **DashboardPage does not auto-register**: If a user arrives at the dashboard with a valid identity but without a backend record, the page fails silently (queries return null) rather than auto-registering.

3. **Error messages are generic**: Backend traps say "User not found"; frontend catches are silent or show generic "Registration failed" text — not the specific messages requested.

4. **Validation gaps**: Email field is not required before login; password fields on the UI are cosmetic only (auth is via II) but validation should prevent empty email submission.

## Requested Changes (Diff)

### Add
- Auto-registration hook: a `useEnsureRegistered` hook that, after identity + actor are ready, calls `registerUser` if the user doesn't yet have a backend record (checking `getCallerUserProfile` first), then resolves role and routes.
- Clear contextual error toasts for each failure state:
  - "Account not found. Please create an account." (user not in DB after login)
  - "Email already exists." (duplicate registration attempt)
  - "Invalid password." (wrong credentials — maps to II auth failure)
  - Empty email/password validation warnings
- Console logging on registration success, login success, and DB insert status.

### Modify
- **App.tsx**: Remove the auto-redirect that skips registration. When identity is already present and the user is on login/signup, still call `registerUser` (idempotent) before routing to dashboard.
- **LoginPage.tsx**: Add required email validation before triggering II login. Improve error handling with specific messages. Add console.log for login/registration steps.
- **SignUpPage.tsx**: Require email field; add password length check (min 8 chars); add console.log for registration steps. Fix duplicate-email error to show "Email already exists."
- **DashboardPage.tsx**: On mount, if actor is ready and `userProfile` is null (not loading), call `registerUser` with saved email to auto-recover unregistered sessions.

### Remove
- Fallback `registerUser("user@cloudsphere.app")` placeholder email — always require a real email before proceeding.

## Implementation Plan

1. Fix `App.tsx`: Remove early redirect for authenticated users on login/signup pages — let those pages handle the registration flow.
2. Fix `LoginPage.tsx`:
   - Validate email is non-empty before calling `login()`
   - Add `console.log` at registration start, success, and on routing
   - Show specific error: "Account not found. Please create an account." on registration failure that isn't already-registered
3. Fix `SignUpPage.tsx`:
   - Validate email is required (not just checked for truthiness)
   - Password: require min 8 chars even if cosmetic (show inline error)
   - Add `console.log` for registration start, DB insert success, routing
   - On catch: distinguish "already registered" → navigate to login with toast "Email already exists. Please sign in."
4. Fix `DashboardPage.tsx`:
   - After actor is ready, if `getUserProfile()` throws "User not found", call `registerUser` with stored email and refetch profile
   - Show clear loading state during this auto-recovery
