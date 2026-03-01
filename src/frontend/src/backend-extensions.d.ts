// Augment backendInterface and Backend class to include authorization mixin methods.
// These methods are injected at runtime by MixinAuthorization but absent from
// the auto-generated backend.d.ts type definitions.
// Use interface declaration merging (interface with same name as class) to extend Backend.
import type { Principal } from "@icp-sdk/core/principal";

declare module "./backend" {
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

  // Interface merging with the Backend class adds these methods to the class type.
  // TypeScript merges interface and class declarations of the same name in the same module.
  interface Backend {
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
