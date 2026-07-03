import { Newspaper } from "lucide-react";

interface DigestCoverProps {
  title: string;
  date?: string;
  className?: string;
}

/**
 * Auto-generated branded cover for CAGD Digest issues
 * that don't have an uploaded featured_image.
 */
export default function DigestCover({ title, date, className = "" }: DigestCoverProps) {
  // Extract issue number from title (e.g. "CAGD Digest - Issue 208" → "208")
  const issueMatch = title.match(/issue\s*(\d+)/i);
  const issueNum = issueMatch ? issueMatch[1] : null;

  return (
    <div className={`relative w-full h-full bg-gradient-to-br from-primary via-primary/90 to-accent overflow-hidden ${className}`}>
      {/* Decorative background pattern */}
      <div className="absolute inset-0 opacity-[0.07]" style={{
        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 21px)`,
      }} />

      {/* Large watermark number */}
      {issueNum && (
        <div className="absolute -right-4 -bottom-6 text-[120px] font-heading font-extrabold text-white/[0.08] leading-none select-none">
          {issueNum}
        </div>
      )}

      {/* Top decorative bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-secondary" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
        {/* Logo area */}
        <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-3 ring-1 ring-white/20">
          <Newspaper className="w-7 h-7 text-white" />
        </div>

        {/* Badge */}
        <span className="inline-block bg-secondary text-white text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full mb-3">
          Weekly Digest
        </span>

        {/* Title */}
        <h4 className="font-heading font-bold text-white text-sm leading-tight line-clamp-2 max-w-[200px]">
          {title}
        </h4>

        {/* Date */}
        {date && (
          <p className="text-white/60 text-[11px] mt-2 font-medium">
            {new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        )}

        {/* Bottom branding */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center">
          <span className="text-white/30 text-[9px] font-medium tracking-wider uppercase">cagd.gov.gh</span>
        </div>
      </div>
    </div>
  );
}
