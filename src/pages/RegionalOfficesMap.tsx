import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Phone, Mail, User, Loader2, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import SEOHead from "@/components/SEOHead";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icon broken in bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Office {
  id: string;
  region: string;
  address: string | null;
  phone: string | null;
  email: string | null;
  director_name: string | null;
  director_photo: string | null;
  latitude: number | null;
  longitude: number | null;
}

export default function RegionalOfficesMap() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("cagd_regional_offices")
      .select("*")
      .order("region")
      .then(({ data }) => { setOffices((data as Office[]) || []); setLoading(false); });
  }, []);

  const mappable = offices.filter(o => o.latitude && o.longitude);

  return (
    <>
      <SEOHead title="Regional Offices — CAGD" description="Find CAGD regional offices across all 16 regions of Ghana. Get contact details and directions." />

      {/* Header */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/5 border-b border-border py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6 text-primary" />
            <span className="text-sm font-heading font-semibold text-primary uppercase tracking-wider">Contact</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-extrabold text-foreground mb-2">Regional Offices</h1>
          <p className="text-muted-foreground max-w-xl">CAGD has offices across all 16 regions of Ghana. Click a marker to view office details.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading offices...
          </div>
        ) : (
          <>
            {/* Map */}
            {mappable.length > 0 && (
              <div className="rounded-2xl overflow-hidden border border-border shadow-lg mb-10" style={{ height: "480px" }}>
                <MapContainer
                  center={[7.9, -1.0]}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mappable.map(office => (
                    <Marker
                      key={office.id}
                      position={[office.latitude!, office.longitude!]}
                      eventHandlers={{ click: () => setSelected(office.id) }}
                    >
                      <Popup>
                        <div className="text-sm min-w-[180px]">
                          <p className="font-bold text-base mb-1">{office.region} Region</p>
                          {office.director_name && <p className="text-gray-600 mb-1">🧑‍💼 {office.director_name}</p>}
                          {office.address && <p className="text-gray-600 mb-1">📍 {office.address}</p>}
                          {office.phone && <p className="text-gray-600 mb-1">📞 {office.phone}</p>}
                          {office.email && <p className="text-gray-600 mb-2">✉️ {office.email}</p>}
                          <a
                            href={`https://www.google.com/maps/search/${encodeURIComponent((office.address || office.region + " CAGD Ghana"))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-xs"
                          >
                            Get Directions →
                          </a>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            )}

            {/* Office Cards */}
            <h2 className="text-xl font-heading font-bold text-foreground mb-5">All Regional Offices ({offices.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {offices.map((office, i) => (
                <motion.div
                  key={office.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`bg-card border rounded-xl p-5 transition-all duration-200 hover:shadow-md hover:border-primary/30 ${selected === office.id ? "border-primary shadow-md" : "border-border"}`}
                  onClick={() => setSelected(office.id)}
                >
                  {office.director_photo && (
                    <img src={office.director_photo} alt={office.director_name || ""} className="w-12 h-12 rounded-full object-cover mb-3 border-2 border-border" />
                  )}
                  <h3 className="font-heading font-bold text-base text-foreground mb-0.5">{office.region} Region</h3>
                  {office.director_name && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
                      <User className="w-3 h-3" /> {office.director_name}
                    </p>
                  )}
                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {office.address && (
                      <p className="flex items-start gap-1.5">
                        <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-primary" /> {office.address}
                      </p>
                    )}
                    {office.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 shrink-0 text-primary" />
                        <a href={`tel:${office.phone}`} className="hover:underline hover:text-primary">{office.phone}</a>
                      </p>
                    )}
                    {office.email && (
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3 h-3 shrink-0 text-primary" />
                        <a href={`mailto:${office.email}`} className="hover:underline hover:text-primary">{office.email}</a>
                      </p>
                    )}
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent((office.address || office.region + " CAGD Ghana"))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    onClick={e => e.stopPropagation()}
                  >
                    <Navigation className="w-3 h-3" /> Get Directions
                  </a>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
