import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { ShieldAlert, Loader2 } from "lucide-react";

interface RequireRoleProps {
  roles: string[];
  children: ReactNode;
}

export default function RequireRole({ roles, children }: RequireRoleProps) {
  const { role, loading, user } = useAuth();

  // Show spinner while auth is loading OR role hasn't been fetched yet
  if (loading || (user && role === null)) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!role || !roles.includes(role)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="w-12 h-12 text-destructive/40 mb-4" />
        <h2 className="text-lg font-heading font-semibold text-destructive">Access Denied</h2>
        <p className="text-sm text-muted-foreground mt-1">
          You need <strong>{roles.join(" or ")}</strong> privileges to access this page.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
