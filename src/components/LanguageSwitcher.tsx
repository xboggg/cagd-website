import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "mobile" }) {
  const { i18n } = useTranslation();
  const currentLang = i18n.language === "tw" ? "tw" : "en";

  const toggle = () => {
    i18n.changeLanguage(currentLang === "en" ? "tw" : "en");
  };

  if (variant === "mobile") {
    return (
      <button
        onClick={toggle}
        className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLang === "en" ? "Twi" : "English"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border hover:bg-muted transition-colors"
      title={currentLang === "en" ? "Switch to Twi" : "Switch to English"}
    >
      <Globe className="w-3.5 h-3.5" />
      <span>{currentLang === "en" ? "Twi" : "EN"}</span>
    </button>
  );
}
