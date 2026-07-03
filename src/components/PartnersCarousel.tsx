import { useEffect, useRef } from "react";
import { motion, useAnimationFrame } from "framer-motion";

interface Partner {
  name: string;
  logo: string;
  url?: string;
}

const defaultPartners: Partner[] = [
  { name: "Ministry of Finance", logo: "/images/partners/mof-logo.png", url: "https://mofep.gov.gh" },
  { name: "Bank of Ghana", logo: "/images/partners/bog-logo.png", url: "https://bog.gov.gh" },
  { name: "Ghana Revenue Authority", logo: "/images/partners/gra-logo.png", url: "https://gra.gov.gh" },
  { name: "Audit Service", logo: "/images/partners/audit-logo.png", url: "https://ghaudit.org" },
  { name: "Public Services Commission", logo: "/images/partners/psc-logo.png", url: "https://psc.gov.gh" },
  { name: "Office of the President", logo: "/images/partners/presidency-logo.png", url: "https://presidency.gov.gh" },
];

interface PartnersCarouselProps {
  partners?: Partner[];
  speed?: number;
  className?: string;
}

export default function PartnersCarousel({
  partners = defaultPartners,
  speed = 30,
  className = "",
}: PartnersCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef(0);

  useAnimationFrame((t, delta) => {
    if (!containerRef.current) return;

    scrollRef.current += (delta / 1000) * speed;

    const containerWidth = containerRef.current.scrollWidth / 2;
    if (scrollRef.current >= containerWidth) {
      scrollRef.current = 0;
    }

    containerRef.current.style.transform = `translateX(-${scrollRef.current}px)`;
  });

  // Double the partners array for seamless loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className={`py-12 bg-muted/30 overflow-hidden ${className}`}>
      <div className="container mb-8">
        <h2 className="text-2xl font-heading font-bold text-center text-foreground">
          Our Partners & Affiliates
        </h2>
      </div>

      <div className="relative">
        {/* Gradient overlays for fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-muted/30 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-muted/30 to-transparent z-10" />

        <div
          ref={containerRef}
          className="flex items-center gap-16 whitespace-nowrap"
          style={{ willChange: "transform" }}
        >
          {duplicatedPartners.map((partner, index) => (
            <a
              key={`${partner.name}-${index}`}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center justify-center h-20 w-40 grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-300"
              title={partner.name}
            >
              <img
                src={partner.logo}
                alt={partner.name}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `<span class="text-sm font-medium text-muted-foreground text-center">${partner.name}</span>`;
                  }
                }}
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
