import { motion } from "framer-motion";
import { ArrowUpRight, Info } from "lucide-react";
import { staffSystems, readySystemCount, type StaffSystem } from "@/data/staffSystems";

function SystemIcon({ system, muted }: { system: StaffSystem; muted?: boolean }) {
  const Icon = system.icon;
  return (
    <div
      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
        muted ? "bg-muted" : "bg-primary/10"
      }`}
    >
      <Icon className={`w-5 h-5 ${muted ? "text-muted-foreground" : "text-primary"}`} />
    </div>
  );
}

function SystemRow({ system, index }: { system: StaffSystem; index: number }) {
  const unavailable = system.status === "not-set";

  const inner = (
    <>
      <SystemIcon system={system} muted={unavailable} />
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm font-semibold truncate ${
            unavailable ? "text-muted-foreground" : "text-foreground group-hover:text-primary transition-colors"
          }`}
        >
          {system.label}
        </p>
        <p className="text-xs text-muted-foreground truncate">{system.description}</p>
      </div>

      {unavailable ? (
        <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase text-muted-foreground bg-background border border-border rounded px-2 py-1">
          Not set
        </span>
      ) : system.status === "confirm" ? (
        <span className="shrink-0 text-[10px] font-bold tracking-wide uppercase text-secondary-foreground bg-secondary/25 rounded px-2 py-1">
          Check
        </span>
      ) : (
        <ArrowUpRight className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
      )}
    </>
  );

  // No working address — deliberately NOT a link, so nobody lands on a dead page.
  if (unavailable) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className="flex items-center gap-3 p-3.5 rounded-xl border border-dashed border-border bg-muted/30"
      >
        {inner}
        {system.note && <span className="sr-only">{system.note}</span>}
      </motion.div>
    );
  }

  return (
    <motion.a
      href={system.url ?? undefined}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-center gap-3 p-3.5 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
    >
      {inner}
    </motion.a>
  );
}

export default function QuickLinks() {
  const notSet = staffSystems.filter((s) => s.status === "not-set");
  const needsCheck = staffSystems.filter((s) => s.status === "confirm");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">The eight systems</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Everything the portal links out to. {readySystemCount} of {staffSystems.length} have a
            working address.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-1.5">
            <span className="w-2 h-2 rounded-full bg-primary" aria-hidden="true" />
            {readySystemCount} ready
          </span>
          {notSet.length > 0 && (
            <span className="border border-dashed border-border rounded-lg px-2.5 py-1.5">
              {notSet.length} not set
            </span>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2.5">
        {staffSystems.map((system, i) => (
          <SystemRow key={system.label} system={system} index={i} />
        ))}
      </div>

      {(notSet.length > 0 || needsCheck.length > 0) && (
        <div className="mt-5 flex gap-3 rounded-xl bg-primary/5 p-4">
          <Info className="w-4 h-4 text-primary shrink-0 mt-1" aria-hidden="true" />
          <div className="text-sm text-foreground leading-relaxed space-y-1.5">
            {notSet.map((s) => (
              <p key={s.label}>
                <strong className="font-semibold">{s.label}</strong> has no working address yet, so
                it is shown greyed out and cannot be clicked. That is deliberate — it stops you
                landing on a broken page.
              </p>
            ))}
            {needsCheck.map((s) => (
              <p key={s.label}>
                <strong className="font-semibold">{s.label}</strong> is marked{" "}
                <em className="not-italic font-semibold">Check</em> because its secure connection
                could not be verified from outside the office. It should open normally on the office
                network.
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
