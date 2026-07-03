import { createContext, useContext, useEffect, useState, useCallback, useRef, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { logAudit, clearAuditCache } from "@/lib/auditLog";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  role: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isEditor: boolean;
  refreshRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const roleCache = useRef<Record<string, string>>({});
  const fetchingRole = useRef(false);

  const fetchRole = useCallback(async (userId: string) => {
    // Return cached role instantly if available
    if (roleCache.current[userId]) {
      setRole(roleCache.current[userId]);
      return;
    }

    // Prevent duplicate concurrent fetches
    if (fetchingRole.current) return;
    fetchingRole.current = true;

    try {
      const { data, error } = await supabase
        .from("cagd_user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

      if (!error && data?.role) {
        roleCache.current[userId] = data.role;
        setRole(data.role);
      } else {
        setRole(null);
      }
    } catch {
      setRole(null);
    } finally {
      fetchingRole.current = false;
    }
  }, []);

  const refreshRole = useCallback(async () => {
    if (user?.id) {
      roleCache.current = {};
      fetchingRole.current = false;
      await fetchRole(user.id);
    }
  }, [user?.id, fetchRole]);

  useEffect(() => {
    let mounted = true;

    // Get initial session first — this is the primary source of truth on page load
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      if (initialSession?.user) {
        await fetchRole(initialSession.user.id);
      }
      if (mounted) setLoading(false);
    });

    // Listen for subsequent auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          // Use cached role if available, fetch only if not cached
          if (roleCache.current[newSession.user.id]) {
            setRole(roleCache.current[newSession.user.id]);
          } else {
            fetchRole(newSession.user.id);
          }
        } else {
          setRole(null);
          roleCache.current = {};
        }
        // Ensure loading is false after any auth event
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      logAudit({ action: "login", resourceType: "auth", resourceTitle: email });
    }
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error };
  };

  const signOut = async () => {
    logAudit({ action: "logout", resourceType: "auth" });
    clearAuditCache();
    roleCache.current = {};
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        signIn,
        signUp,
        signOut,
        isAdmin: role === "admin",
        isEditor: role === "editor",
        refreshRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
