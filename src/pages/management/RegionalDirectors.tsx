import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MapPin, Phone, Mail, User, X } from "lucide-react";
import { cn } from "@/lib/utils";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay }} className={className}>
      {children}
    </motion.div>
  );
}

interface RegionalDirector {
  region: string;
  name: string;
  phone: string;
  email: string;
  location: string;
  bio?: string;
}

const directors: RegionalDirector[] = [
  { region: "Ashanti", name: "Victoria Affum", phone: "0322-22903", email: "cagdkumasi@yahoo.com", location: "Kumasi", bio: "Married, devoted Christian. Leads CAGD operations across the Ashanti Region." },
  { region: "Bono", name: "Bennett Akantoa", phone: "0330-27269", email: "ba.cagd.gov@gmail.com", location: "Sunyani", bio: "Regional Director overseeing public financial management in the Bono Region." },
  { region: "Bono East", name: "Mr. Richard A. Akolgo", phone: "—", email: "be.cagdrd@gmail.com", location: "Techiman", bio: "Chartered Accountant with 14 years post-qualification experience." },
  { region: "Central", name: "Ignatius Kwame Otoo", phone: "03321-32551", email: "central.directorate@cagd.gov.gh", location: "Cape Coast", bio: "28 years of dedicated service with CAGD." },
  { region: "Eastern", name: "Mustapha Ayornu", phone: "03420-22571", email: "—", location: "Koforidua", bio: "IPS graduate who joined CAGD in 1990." },
  { region: "Greater Accra", name: "Mr. Patrick Peprah Appiagyei", phone: "0302-228721", email: "—", location: "Accra", bio: "Current Regional Director for the Greater Accra Region." },
  { region: "Northern", name: "Genevieve T. Fuseini", phone: "03720-22604", email: "cagdnrtle@gmail.com", location: "Tamale", bio: "Results-oriented Chartered Accountant leading northern operations." },
  { region: "North East", name: "Seidu Yussif", phone: "—", email: "cagdnortheastdirectorate@gmail.com", location: "Nalerigu", bio: "Chartered Accountant with 11 years of experience." },
  { region: "Ahafo", name: "Kumah-Abrefa C.K", phone: "0322-22903", email: "ahaforegionaltreausry@gmail.com", location: "Goaso", bio: "58 years old with 29 years of service with CAGD." },
  { region: "Western", name: "Mr. Joseph Kweku Agyei", phone: "03120-46007", email: "westernregional.treasury@gmail.com", location: "Takoradi", bio: "Former Municipal Finance Officer." },
  { region: "Upper East", name: "TBD", phone: "03820-22213", email: "cagdupperastbolga@gmail.com", location: "Bolgatanga" },
  { region: "Upper West", name: "TBD", phone: "03920-22030", email: "upperwestregionaldirectorate@gmail.com", location: "Wa" },
  { region: "Volta", name: "TBD", phone: "03620-26271", email: "—", location: "Ho" },
  { region: "Oti", name: "TBD", phone: "—", email: "cagotiregioncn@gmail.com", location: "Dambai" },
  { region: "Savannah", name: "TBD", phone: "—", email: "srcagd1@gmail.com", location: "Damongo" },
  { region: "Western North", name: "TBD", phone: "—", email: "—", location: "—" },
];

// Simplified Ghana map SVG paths for each region (approximate)
const regionPaths: Record<string, { d: string; cx: number; cy: number }> = {
  "Upper West":    { d: "M60,30 L120,25 L125,70 L100,90 L55,85 Z", cx: 88, cy: 55 },
  "Upper East":    { d: "M120,25 L185,30 L180,75 L125,70 Z", cx: 150, cy: 48 },
  "North East":    { d: "M180,75 L210,65 L215,110 L175,115 Z", cx: 195, cy: 90 },
  "Northern":      { d: "M100,90 L175,75 L175,115 L185,140 L145,165 L80,155 L70,120 Z", cx: 130, cy: 120 },
  "Savannah":      { d: "M55,85 L100,90 L70,120 L80,155 L40,160 L30,120 Z", cx: 62, cy: 125 },
  "Bono East":     { d: "M145,165 L185,140 L200,170 L170,195 L140,185 Z", cx: 168, cy: 172 },
  "Bono":          { d: "M80,155 L145,165 L140,185 L115,200 L65,195 L55,175 Z", cx: 100, cy: 178 },
  "Ahafo":         { d: "M55,175 L65,195 L80,215 L55,225 L35,210 L40,185 Z", cx: 55, cy: 200 },
  "Ashanti":       { d: "M80,215 L65,195 L115,200 L140,185 L170,195 L175,220 L140,245 L95,240 Z", cx: 125, cy: 218 },
  "Oti":           { d: "M200,170 L230,155 L245,195 L225,225 L195,215 L185,195 Z", cx: 215, cy: 190 },
  "Volta":         { d: "M195,215 L225,225 L235,260 L220,290 L200,280 L190,250 Z", cx: 212, cy: 255 },
  "Eastern":       { d: "M140,245 L175,220 L195,215 L190,250 L200,280 L175,290 L150,270 Z", cx: 172, cy: 255 },
  "Greater Accra": { d: "M150,270 L175,290 L180,310 L145,315 L135,295 Z", cx: 158, cy: 295 },
  "Central":       { d: "M95,240 L140,245 L150,270 L135,295 L100,305 L80,285 L75,260 Z", cx: 110, cy: 275 },
  "Western":       { d: "M35,210 L55,225 L80,215 L95,240 L75,260 L80,285 L55,295 L25,275 L20,240 Z", cx: 55, cy: 258 },
  "Western North": { d: "M40,185 L55,175 L55,225 L35,210 Z", cx: 46, cy: 200 },
};

export default function RegionalDirectors() {
  const [selected, setSelected] = useState<string | null>(null);
  const selectedDirector = directors.find(d => d.region === selected);

  return (
    <>
      {/* Hero */}
      <section className="bg-accent text-accent-foreground py-16 md:py-24">
        <div className="container">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl font-heading font-extrabold text-white">
              Regional Directors
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              CAGD operates across all 16 regions of Ghana. Click a region on the map to view the director's profile.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Map + Detail */}
      <section className="py-16 md:py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* SVG Map */}
            <FadeIn>
              <div className="card-elevated p-6">
                <h2 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Interactive Map of Ghana
                </h2>
                <svg viewBox="0 0 270 340" className="w-full max-w-md mx-auto">
                  {Object.entries(regionPaths).map(([region, { d, cx, cy }]) => {
                    const isSelected = selected === region;
                    const hasDirector = directors.find(dr => dr.region === region)?.name !== "TBD";
                    return (
                      <g key={region} onClick={() => setSelected(region)} className="cursor-pointer">
                        <motion.path
                          d={d}
                          fill={isSelected ? "hsl(152, 95%, 27%)" : hasDirector ? "hsl(152, 95%, 27%, 0.15)" : "hsl(0, 0%, 90%)"}
                          stroke="hsl(152, 95%, 27%)"
                          strokeWidth={isSelected ? 2 : 1}
                          whileHover={{ scale: 1.03, fill: "hsl(152, 95%, 27%, 0.4)" }}
                          transition={{ duration: 0.15 }}
                          className="origin-center"
                        />
                        <text
                          x={cx}
                          y={cy}
                          textAnchor="middle"
                          className={cn(
                            "text-[6px] font-semibold pointer-events-none select-none",
                            isSelected ? "fill-white" : "fill-foreground"
                          )}
                        >
                          {region.length > 10 ? region.split(" ").map((w, i) => (
                            <tspan key={i} x={cx} dy={i === 0 ? 0 : 8}>{w}</tspan>
                          )) : region}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <p className="text-xs text-muted-foreground text-center mt-3">Click a region to view details</p>
              </div>
            </FadeIn>

            {/* Detail Panel */}
            <div className="lg:sticky lg:top-24">
              <AnimatePresence mode="wait">
                {selectedDirector ? (
                  <motion.div
                    key={selectedDirector.region}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="card-elevated overflow-hidden"
                  >
                    <div className="bg-primary/10 p-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-heading font-bold text-primary uppercase tracking-wider">{selectedDirector.region} Region</p>
                        <h3 className="font-heading font-bold text-xl mt-1">{selectedDirector.name}</h3>
                        <p className="text-sm text-muted-foreground">Regional Director</p>
                      </div>
                      <button onClick={() => setSelected(null)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      {selectedDirector.bio && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{selectedDirector.bio}</p>
                      )}
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{selectedDirector.location}</span>
                        </div>
                        {selectedDirector.phone !== "—" && (
                          <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-primary shrink-0" />
                            <a href={`tel:${selectedDirector.phone}`} className="text-muted-foreground hover:text-primary transition-colors">{selectedDirector.phone}</a>
                          </div>
                        )}
                        {selectedDirector.email !== "—" && (
                          <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-primary shrink-0" />
                            <a href={`mailto:${selectedDirector.email}`} className="text-muted-foreground hover:text-primary transition-colors">{selectedDirector.email}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="card-elevated p-12 text-center"
                  >
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <MapPin className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-heading font-semibold text-lg mb-2">Select a Region</h3>
                    <p className="text-sm text-muted-foreground">Click on any region on the map to view the Regional Director's profile and contact information.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* Directors Grid */}
      <section className="py-16 md:py-20 bg-muted">
        <div className="container">
          <FadeIn>
            <h2 className="section-heading mb-10">All Regional Directors</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {directors.map((d, i) => (
              <FadeIn key={d.region} delay={i * 0.04}>
                <button
                  onClick={() => { setSelected(d.region); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                  className={cn(
                    "card-elevated p-4 w-full text-left hover:border-primary/30 transition-colors",
                    selected === d.region && "border-primary ring-1 ring-primary/20"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-semibold text-sm truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.region} • {d.location}</p>
                    </div>
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
