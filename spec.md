# CloudSphere Platform

## Current State

A cloud computing marketing website with:
- Five sections: Hero, About, Services, Features, Upload
- Navbar and Footer
- File upload section that allows any visitor (anonymous or authenticated) to upload files to on-chain blob storage
- Internet Identity hook (`useInternetIdentity`) already present in the codebase but not used for access control
- Backend: `uploadFile`, `listFiles`, `getFile`, `getUploadCount` -- all accessible without authentication checks

## Requested Changes (Diff)

### Add
- Login/logout button in the Navbar showing the user's logged-in state
- A login gate in the Upload section: unauthenticated visitors see a prompt to log in via Internet Identity before they can upload
- Backend guard on `uploadFile` that traps (rejects) calls from anonymous principals

### Modify
- `Navbar.tsx`: add a Login/Logout button that calls `login` / `clear` from `useInternetIdentity`
- `UploadSection.tsx`: read auth state from `useInternetIdentity`; if not authenticated, show a "Sign in to upload" UI instead of the drop zone
- `App.tsx`: wrap the app with `InternetIdentityProvider`
- `main.mo`: add anonymous-principal check at the top of `uploadFile`

### Remove
- Nothing removed

## Implementation Plan

1. Update `main.mo` backend to reject `uploadFile` calls from anonymous principals using `Principal.isAnonymous(caller)`
2. Wrap `<App />` in `<InternetIdentityProvider>` inside `main.tsx` or `App.tsx`
3. Update `Navbar.tsx` to show a Login / Logout button using `useInternetIdentity`
4. Update `UploadSection.tsx` to check `identity` from `useInternetIdentity`; render a login-prompt card when unauthenticated, and the existing drop zone when authenticated
5. Regenerate backend, then delegate frontend changes to the frontend subagent
