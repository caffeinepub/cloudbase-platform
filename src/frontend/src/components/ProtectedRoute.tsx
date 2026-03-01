import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface ProtectedRouteProps {
  children: React.ReactNode;
  onNavigate: (page: string) => void;
}

export default function ProtectedRoute({
  children,
  onNavigate,
}: ProtectedRouteProps) {
  const { identity, isInitializing } = useInternetIdentity();

  useEffect(() => {
    if (!isInitializing && !identity) {
      onNavigate("login");
    }
  }, [identity, isInitializing, onNavigate]);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>Loading…</span>
        </div>
      </div>
    );
  }

  if (!identity) return null;

  return <>{children}</>;
}
