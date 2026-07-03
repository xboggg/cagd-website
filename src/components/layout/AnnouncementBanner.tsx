import { useState, useEffect } from "react";
import { X, AlertTriangle, Info, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BannerConfig {
  active: boolean;
  text: string;
  type: "info" | "warning" | "error" | "success";
  link?: string;
  link_label?: string;
}

const DISMISSED_KEY = "cagd_banner_dismissed";

const STYLES = {
  info:    { bg: "bg-blue-600",  text: "text-white", Icon: Info },
  warning: { bg: "bg-amber-500", text: "text-white", Icon: AlertTriangle },
  error:   { bg: "bg-red-600",   text: "text-white", Icon: AlertCircle },
  success: { bg: "bg-green-600", text: "text-white", Icon: CheckCircle2 },
};

export default function AnnouncementBanner() {
  const [config, setConfig] = useState<BannerConfig | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("cagd_site_settings")
        .select("value")
        .eq("key", "announcement_banner")
        .maybeSingle();
      if (!data?.value) return;
      try {
        const parsed: BannerConfig = JSON.parse(data.value);
        if (parsed.active) {
          setConfig(parsed);
          if (sessionStorage.getItem(DISMISSED_KEY) === parsed.text) setDismissed(true);
        }
      } catch {}
    };
    load();
  }, []);

  if (!config || !config.active || dismissed) return null;

  const { bg, text, Icon } = STYLES[config.type] ?? STYLES.info;

  return (
    <div className={`${bg} ${text} py-2.5 px-4 flex items-center justify-center gap-3 text-sm relative z-[70]`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="text-center leading-snug">{config.text}</span>
      {config.link && (
        <a
          href={config.link}
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold whitespace-nowrap flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          {config.link_label || "Learn more"} <ExternalLink className="h-3 w-3" />
        </a>
      )}
      <button
        onClick={() => { sessionStorage.setItem(DISMISSED_KEY, config.text); setDismissed(true); }}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Dismiss announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
