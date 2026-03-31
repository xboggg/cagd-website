import { createContext, useContext, useEffect, useState, ReactNode } from "react";
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const fetchRole = async (userId: string) => {
    const { data } = await supabase
      .from("cagd_user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    setRole(data?.role || null);
  };

  useEffect(() => {
    // onAuthStateChange handles subsequent auth events (login/logout/token refresh).
    // Do NOT await Supabase calls inside this callback — it causes a deadlock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchRole(session.user.id);
        } else {
          setRole(null);
        }
      }
    );

    // getSession handles the initial page load — safe to await here.
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
