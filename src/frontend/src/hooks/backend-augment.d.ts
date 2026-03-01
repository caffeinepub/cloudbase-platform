// Augment backendInterface and Backend class to include authorization mixin methods.
// These are injected at runtime by MixinAuthorization but absent from the
// auto-generated backend.d.ts type definitions.
import type { Principal } from "@icp-sdk/core/principal";

declare module "../backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    getCallerUserRole(): Promise<
      { __kind__: "admin" } | { __kind__: "user" } | { __kind__: "guest" }
    >;
    isCallerAdmin(): Promise<boolean>;
    assignCallerUserRole(
      user: Principal,
      role:
        | { __kind__: "admin" }
        | { __kind__: "user" }
        | { __kind__: "guest" },
    ): Promise<void>;
  }

  // Augment Backend class so it satisfies the updated backendInterface
  class Backend {
    _initializeAccessControlWithSecret(secret: string): Promise<void>;
    getCallerUserRole(): Promise<
      { __kind__: "admin" } | { __kind__: "user" } | { __kind__: "guest" }
    >;
    isCallerAdmin(): Promise<boolean>;
    assignCallerUserRole(
      user: Principal,
      role:
        | { __kind__: "admin" }
        | { __kind__: "user" }
        | { __kind__: "guest" },
    ): Promise<void>;
  }
}
