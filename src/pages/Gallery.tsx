import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";

const albums = [
  {
    id: 1,
    title: "Regional Directors Conference 2025",
    date: "November 2025",
    photos: Array.from({ length: 8 }, (_, i) => ({
      id: `1-${i}`,
      caption: `Conference proceedings - Photo ${i + 1}`,
    })),
  },
  {
    id: 2,
    title: "IPSAS Training Workshop",
    date: "September 2025",
    photos: Array.from({ length: 6 }, (_, i) => ({
      id: `2-${i}`,
      caption: `Workshop session - Photo ${i + 1}`,
    })),
  },
  {
    id: 3,
    title: "World Bank Mission Visit",
    date: "August 2025",
    photos: Array.from({ length: 5 }, (_, i) => ({
      id: `3-${i}`,
      caption: `Delegation meeting - Photo ${i + 1}`,
    })),
  },
  {
    id: 4,
    title: "Staff Durbar 2025",
    date: "June 2025",
    photos: Array.from({ length: 10 }, (_, i) => ({
      id: `4-${i}`,
      caption: `Durbar event - Photo ${i + 1}`,
    })),
  },
];

// Palette of placeholder colors for gallery items
const colors = [
  "from-primary/30 to-accent/30",
  "from-secondary/30 to-primary/30",
  "from-accent/30 to-secondary/30",
  "from-primary/20 to-secondary/20",
];

export default function Gallery() {
  const [selectedAlbum, setSelectedAlbum] = useState<typeof albums[0] | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const allPhotos = selectedAlbum?.photos || [];

  return (
    <>
      <section className="bg-accent text-accent-foreground py-12 md:py-20">
        <div className="container">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl md:text-5xl font-heading font-bold mb-4"
          >
            Gallery
          </motion.h1>
          <p className="text-accent-foreground/80 max-w-2xl">
            Browse photos from CAGD events, conferences, workshops, and official engagements.
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          {!selectedAlbum ? (
            <>
              <h2 className="section-heading mb-8">Albums</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album, i) => (
                  <motion.button
                    key={album.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => setSelectedAlbum(album)}
                    className="card-elevated overflow-hidden text-left group"
                  >
                    <div className={`h-48 bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center
                      grayscale group-hover:grayscale-0 transition-all duration-500`}>
                      <Camera className="w-12 h-12 text-muted-foreground/40" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-heading font-bold text-foreground">{album.title}</h3>
                      <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                        <span>{album.date}</span>
                        <span className="flex items-center gap-1"><Grid3X3 className="w-3 h-3" /> {album.photos.length} photos</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" onClick={() => setSelectedAlbum(null)}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> All Albums
                </Button>
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">{selectedAlbum.title}</h2>
                  <p className="text-sm text-muted-foreground">{selectedAlbum.date} • {allPhotos.length} photos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allPhotos.map((photo, idx) => (
                  <motion.button
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setLightboxIdx(idx)}
                    className={`aspect-square rounded-lg bg-gradient-to-br ${colors[idx % colors.length]}
                      flex items-center justify-center cursor-pointer
                      grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105`}
                  >
                    <Camera className="w-8 h-8 text-muted-foreground/40" />
                  </motion.button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIdx(null)}
          >
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx(null); }}
              className="absolute top-4 right-4 text-white/80 hover:text-white"
            >
              <X className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((prev) => (prev! > 0 ? prev! - 1 : allPhotos.length - 1)); }}
              className="absolute left-4 text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>

            <div className="max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <div className={`aspect-video rounded-lg bg-gradient-to-br ${colors[lightboxIdx % colors.length]}
                flex items-center justify-center`}>
                <Camera className="w-20 h-20 text-white/30" />
              </div>
              <p className="text-center text-white/80 mt-4 text-sm">
                {allPhotos[lightboxIdx]?.caption} ({lightboxIdx + 1}/{allPhotos.length})
              </p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIdx((prev) => (prev! < allPhotos.length - 1 ? prev! + 1 : 0)); }}
              className="absolute right-4 text-white/80 hover:text-white"
            >
              <ChevronRight className="w-10 h-10" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
