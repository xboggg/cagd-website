import { supabase } from "@/integrations/supabase/client";

interface AuditEntry {
  action: "create" | "update" | "delete" | "login" | "logout";
  resourceType: string;
  resourceId?: string;
  resourceTitle?: string;
  details?: Record<string, unknown>;
}

let cachedRole: string | null = null;

export function logAudit(entry: AuditEntry) {
  // Fire-and-forget — don't block the UI
  (async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      if (!cachedRole) {
        const { data } = await supabase
          .from("cagd_user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        cachedRole = data?.role || "unknown";
      }

      await supabase.from("cagd_audit_trail" as any).insert({
        user_id: session.user.id,
        user_email: session.user.email || "unknown",
        user_role: cachedRole,
        action: entry.action,
        resource_type: entry.resourceType,
        resource_id: entry.resourceId || null,
        resource_title: entry.resourceTitle || null,
        details: entry.details || null,
      });
    } catch {
      // Silent fail — audit logging should never break the app
    }
  })();
}

export function clearAuditCache() {
  cachedRole = null;
}
