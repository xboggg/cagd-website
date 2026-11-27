import { useTranslation } from "react-i18next";

/**
 * Shown for the moment a page's code is being fetched.
 *
 * Pages are no longer bundled into one giant file — each arrives on demand —
 * so there is a short gap on a slow connection. This fills it with something
 * calm and roughly page-shaped rather than a blank screen, and announces
 * itself to screen readers.
 */
export default function RouteFallback() {
  const { t } = useTranslation();

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={t("common.loading")}
      className="min-h-[60vh] flex items-center justify-center px-4 py-20"
    >
      <div className="w-full max-w-3xl space-y-5" aria-hidden="true">
        <div className="h-9 w-2/3 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-full rounded bg-muted animate-pulse" />
        <div className="h-4 w-11/12 rounded bg-muted animate-pulse" />
        <div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
        <div className="grid gap-4 pt-4 sm:grid-cols-3">
          <div className="h-28 rounded-xl bg-muted animate-pulse" />
          <div className="h-28 rounded-xl bg-muted animate-pulse" />
          <div className="h-28 rounded-xl bg-muted animate-pulse" />
        </div>
      </div>
      <span className="sr-only">{t("common.loading")}</span>
    </div>
  );
}
