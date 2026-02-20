import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Grid3X3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";

export default function Gallery() {
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ["public-albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_albums").select("*").order("album_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["public-photos", selectedAlbumId],
    queryFn: async () => {
      if (!selectedAlbumId) return [];
      const { data, error } = await supabase.from("gallery_photos").select("*").eq("album_id", selectedAlbumId).order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedAlbumId,
  });

  const selectedAlbum = albums.find((a) => a.id === selectedAlbumId);
  const colors = ["from-primary/30 to-accent/30", "from-secondary/30 to-primary/30", "from-accent/30 to-secondary/30", "from-primary/20 to-secondary/20"];

  return (
    <>
      <SEOHead title="Gallery" description="Browse photos from CAGD events, conferences, workshops, and official engagements." path="/gallery" />

      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-4">
            Gallery
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Browse photos from CAGD events, conferences, workshops, and official engagements.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          {albumsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : !selectedAlbum ? (
            <>
              <h2 className="section-heading mb-8">Albums</h2>
              {albums.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">No albums yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map((album, i) => (
                    <motion.button
                      key={album.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => setSelectedAlbumId(album.id)}
                      className="card-elevated overflow-hidden text-left group"
                    >
                      <div className={`h-48 overflow-hidden ${album.cover_image ? "" : `bg-gradient-to-br ${colors[i % colors.length]}`} flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-500`}>
                        {album.cover_image ? (
                          <img src={album.cover_image} alt={album.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <Camera className="w-12 h-12 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-bold text-foreground">{album.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>{album.album_date ? new Date(album.album_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ""}</span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" onClick={() => { setSelectedAlbumId(null); setLightboxIdx(null); }}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> All Albums
                </Button>
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">{selectedAlbum.title}</h2>
                  <p className="text-sm text-muted-foreground">{photos.length} photos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo, idx) => (
                  <motion.button
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setLightboxIdx(idx)}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105"
                  >
                    <img src={photo.image_url} alt={photo.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && photos[lightboxIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIdx(null)}
          >
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }} className="absolute top-4 right-4 text-white/80 hover:text-white">
              <X className="w-8 h-8" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1)); }} className="absolute left-4 text-white/80 hover:text-white">
              <ChevronLeft className="w-10 h-10" />
            </button>
            <div className="max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <img src={photos[lightboxIdx].image_url} alt={photos[lightboxIdx].caption || ""} className="w-full max-h-[80vh] object-contain rounded-lg" />
              <p className="text-center text-white/80 mt-4 text-sm">
                {photos[lightboxIdx].caption} ({lightboxIdx + 1}/{photos.length})
              </p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setLightboxIdx((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0)); }} className="absolute right-4 text-white/80 hover:text-white">
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
