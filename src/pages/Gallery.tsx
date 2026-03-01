import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera, Loader2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import { resolveImagePath } from "@/lib/utils";

const PHOTOS_PER_PAGE = 24;

export default function Gallery() {
  const { t } = useTranslation();
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [browsingParentId, setBrowsingParentId] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: albums = [], isLoading: albumsLoading } = useQuery({
    queryKey: ["public-albums"],
    queryFn: async () => {
      const { data, error } = await supabase.from("cagd_gallery_albums").select("*, cagd_gallery_photos(count)").order("album_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: photos = [] } = useQuery({
    queryKey: ["public-photos", selectedAlbumId],
    queryFn: async () => {
      if (!selectedAlbumId) return [];
      const { data, error } = await supabase.from("cagd_gallery_photos").select("*").eq("album_id", selectedAlbumId).order("display_order");
      if (error) throw error;
      return data;
    },
    enabled: !!selectedAlbumId,
  });

  const selectedAlbum = albums.find((a: any) => a.id === selectedAlbumId);
  const browsingParent = albums.find((a: any) => a.id === browsingParentId);
  const colors = ["from-primary/30 to-accent/30", "from-secondary/30 to-primary/30", "from-accent/30 to-secondary/30", "from-primary/20 to-secondary/20"];

  // Derive top-level and sub-albums
  const topLevelAlbums = albums.filter((a: any) => !a.parent_id);
  const getSubAlbums = (parentId: string) => albums.filter((a: any) => a.parent_id === parentId);

  // Pagination
  const totalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const paginatedPhotos = photos.slice((currentPage - 1) * PHOTOS_PER_PAGE, currentPage * PHOTOS_PER_PAGE);

  // When lightbox navigates, adjust to global index
  const globalLightboxIdx = lightboxIdx !== null ? (currentPage - 1) * PHOTOS_PER_PAGE + lightboxIdx : null;

  const handleAlbumClick = (album: any) => {
    const subAlbums = getSubAlbums(album.id);
    if (subAlbums.length > 0 && !album.parent_id) {
      // Parent album with sub-albums -> show sub-album listing
      setBrowsingParentId(album.id);
      setSelectedAlbumId(null);
    } else {
      // Leaf album (no sub-albums, or is itself a sub-album) -> show photos
      setSelectedAlbumId(album.id);
    }
    setCurrentPage(1);
    setLightboxIdx(null);
  };

  const handleBackToAlbums = () => {
    setSelectedAlbumId(null);
    setBrowsingParentId(null);
    setLightboxIdx(null);
    setCurrentPage(1);
  };

  const handleBackToParent = () => {
    setSelectedAlbumId(null);
    setLightboxIdx(null);
    setCurrentPage(1);
    // If we were viewing photos of a sub-album, go back to parent's sub-album listing
    if (selectedAlbum?.parent_id) {
      setBrowsingParentId(selectedAlbum.parent_id);
    }
  };

  return (
    <>
      <SEOHead title={t("galleryPage.title")} description={t("galleryPage.description")} path="/gallery" />

      <section
        className="relative py-16 md:py-24 text-white"
        style={{
          backgroundImage: `url('/new-site/images/hero/news-hero.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-accent/80" />
        <div className="container relative z-10">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-4">
            {t("galleryPage.title")}
          </motion.h1>
          <p className="text-white/80 max-w-2xl">
            {t("galleryPage.description")}
          </p>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container">
          {albumsLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>

          ) : selectedAlbum ? (
            /* -- Photo View -- */
            <>
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" onClick={selectedAlbum.parent_id ? handleBackToParent : handleBackToAlbums}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> {selectedAlbum.parent_id ? browsingParent?.title || t("galleryPage.back") : t("galleryPage.allAlbums")}
                </Button>
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">{selectedAlbum.title}</h2>
                  <p className="text-sm text-muted-foreground">{photos.length} {t("galleryPage.photos")}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
                {paginatedPhotos.map((photo, idx) => (
                  <motion.button
                    key={photo.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.03 }}
                    onClick={() => setLightboxIdx(idx)}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all duration-300 hover:scale-105"
                  >
                    <img src={resolveImagePath(photo.image_url)!} alt={photo.caption || ""} className="w-full h-full object-cover" loading="lazy" />
                  </motion.button>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() => { setCurrentPage(p => p - 1); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                  >
                    <ChevronLeft className="w-4 h-4" /> {t("common.previous")}
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      className="w-9 h-9 p-0"
                      onClick={() => { setCurrentPage(page); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                    >
                      {page}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === totalPages}
                    onClick={() => { setCurrentPage(p => p + 1); window.scrollTo({ top: 300, behavior: "smooth" }); }}
                  >
                    {t("common.next")} <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>

          ) : browsingParent ? (
            /* -- Sub-Album View (inside a parent album) -- */
            <>
              <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" onClick={handleBackToAlbums}>
                  <ChevronLeft className="w-4 h-4 mr-1" /> {t("galleryPage.allAlbums")}
                </Button>
                <div>
                  <h2 className="text-xl font-heading font-bold text-foreground">{browsingParent.title}</h2>
                  <p className="text-sm text-muted-foreground">{getSubAlbums(browsingParent.id).length} {t("galleryPage.subAlbums")}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {getSubAlbums(browsingParent.id).map((sub: any, i: number) => {
                  const photoCount = sub.cagd_gallery_photos?.[0]?.count || 0;
                  return (
                    <motion.button
                      key={sub.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      onClick={() => handleAlbumClick(sub)}
                      className="card-elevated overflow-hidden text-left group"
                    >
                      <div className={`h-48 overflow-hidden ${sub.cover_image ? "" : `bg-gradient-to-br ${colors[i % colors.length]}`} flex items-center justify-center`}>
                        {sub.cover_image ? (
                          <img src={resolveImagePath(sub.cover_image)!} alt={sub.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                        ) : (
                          <Camera className="w-12 h-12 text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-heading font-bold text-foreground">{sub.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                          <span>{photoCount} {t("galleryPage.photos")}</span>
                          <span>{sub.album_date ? new Date(sub.album_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ""}</span>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </>

          ) : (
            /* -- Top-Level Albums View -- */
            <>
              <h2 className="section-heading mb-8">{t("galleryPage.allAlbums")}</h2>
              {topLevelAlbums.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">{t("galleryPage.noAlbums")}</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {topLevelAlbums.map((album: any, i: number) => {
                    const photoCount = album.cagd_gallery_photos?.[0]?.count || 0;
                    const subAlbums = getSubAlbums(album.id);
                    return (
                      <motion.button
                        key={album.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        onClick={() => handleAlbumClick(album)}
                        className="card-elevated overflow-hidden text-left group"
                      >
                        <div className={`h-48 overflow-hidden ${album.cover_image ? "" : `bg-gradient-to-br ${colors[i % colors.length]}`} flex items-center justify-center`}>
                          {album.cover_image ? (
                            <img src={resolveImagePath(album.cover_image)!} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                          ) : (
                            <Camera className="w-12 h-12 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className="font-heading font-bold text-foreground flex items-center gap-2">
                            {album.title}
                            {subAlbums.length > 0 && (
                              <FolderOpen className="w-4 h-4 text-primary/60" />
                            )}
                          </h3>
                          <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                            <span>
                              {subAlbums.length > 0
                                ? `${subAlbums.length} ${t("galleryPage.subAlbums")}`
                                : `${photoCount} ${t("galleryPage.photos")}`}
                            </span>
                            <span>{album.album_date ? new Date(album.album_date).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : ""}</span>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Lightbox -- uses global index across all photos */}
      <AnimatePresence>
        {globalLightboxIdx !== null && photos[globalLightboxIdx] && (
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newGlobal = globalLightboxIdx > 0 ? globalLightboxIdx - 1 : photos.length - 1;
                const newPage = Math.floor(newGlobal / PHOTOS_PER_PAGE) + 1;
                setCurrentPage(newPage);
                setLightboxIdx(newGlobal - (newPage - 1) * PHOTOS_PER_PAGE);
              }}
              className="absolute left-4 text-white/80 hover:text-white"
            >
              <ChevronLeft className="w-10 h-10" />
            </button>
            <div className="max-w-3xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
              <img src={resolveImagePath(photos[globalLightboxIdx].image_url)!} alt={photos[globalLightboxIdx].caption || ""} className="w-full max-h-[80vh] object-contain rounded-lg" />
              <p className="text-center text-white/80 mt-4 text-sm">
                {photos[globalLightboxIdx].caption} ({globalLightboxIdx + 1}/{photos.length})
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newGlobal = globalLightboxIdx < photos.length - 1 ? globalLightboxIdx + 1 : 0;
                const newPage = Math.floor(newGlobal / PHOTOS_PER_PAGE) + 1;
                setCurrentPage(newPage);
                setLightboxIdx(newGlobal - (newPage - 1) * PHOTOS_PER_PAGE);
              }}
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
