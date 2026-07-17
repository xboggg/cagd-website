import { useState, useRef, useEffect } from "react";
import { Upload, X, FileText, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  bucket: string;
  accept?: string;
  maxSize?: number; // in MB
  onUpload: (url: string, fileName: string, fileSize: number) => void;
  currentUrl?: string;
  label?: string;
  id?: string;
}

// Small images fall back to inline base64 (stored directly in the DB column)
// when the network path to Supabase Storage is blocked — e.g. VPN interception,
// gov-network egress filtering. 800 KB source cap keeps the base64 (~1.1 MB)
// under Postgres text column limits and page-render weight sensible.
const INLINE_FALLBACK_MAX_BYTES = 800 * 1024;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error ?? new Error("FileReader failed"));
    r.readAsDataURL(file);
  });
}

export default function FileUpload({
  bucket,
  accept = "image/*,application/pdf",
  maxSize = 10,
  onUpload,
  currentUrl,
  label = "Upload File",
  id,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const base = file.name
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9]/g, "-")
      .toLowerCase()
      .slice(0, 50);
    const path = `${base}-${Date.now()}.${ext}`;

    // Confirm the admin has a valid Supabase session — an unauthenticated
    // upload will fail RLS with "new row violates row-level security policy"
    // regardless of the network path. Surface that specifically.
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      console.error("[FileUpload] No Supabase session — user is not authenticated.");
      toast({
        title: "Not signed in",
        description: "Your admin session expired. Please sign in again from /admin, then retry the upload.",
        variant: "destructive",
      });
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Primary path: Supabase Storage upload.
    let uploadedPublicUrl: string | null = null;
    let primaryFailureReason: string | null = null;
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (error) {
        // Log the full shape for DevTools — Supabase JS wraps the fetch/HTTP
        // failure in a StorageError with these fields, and knowing which
        // one is populated tells us if the request reached the server or not.
        console.error("[FileUpload] Storage upload error", {
          name: error.name,
          message: error.message,
          status: (error as { status?: number }).status,
          statusCode: (error as { statusCode?: string }).statusCode,
          cause: (error as { cause?: unknown }).cause,
        });
        primaryFailureReason = `${error.name}: ${error.message}`;
      } else {
        const { data: pub } = supabase.storage.from(bucket).getPublicUrl(data.path);
        uploadedPublicUrl = pub.publicUrl;
      }
    } catch (thrown: unknown) {
      // Raw fetch failure — browser couldn't reach db.techtrendi.com. Most
      // common causes for CAGD's network: VPN TLS interception, gov-network
      // egress filtering, browser extension blocking cross-origin, DNS block.
      const err = thrown instanceof Error ? thrown : new Error(String(thrown));
      console.error("[FileUpload] Storage upload threw (network layer)", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });
      primaryFailureReason = `${err.name}: ${err.message}`;
    }

    if (uploadedPublicUrl) {
      setPreview(uploadedPublicUrl);
      onUpload(uploadedPublicUrl, file.name, file.size);
      toast({ title: "Upload complete", description: `${file.name} uploaded to storage.` });
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Fallback path: inline base64 for small images. The admin can still
    // save the article; the image lives in the DB column instead of Storage.
    // Only offered for images (not PDFs) and only under the size cap.
    const isSmallImage = file.type.startsWith("image/") && file.size <= INLINE_FALLBACK_MAX_BYTES;
    if (isSmallImage) {
      try {
        const dataUrl = await fileToDataUrl(file);
        setPreview(dataUrl);
        onUpload(dataUrl, file.name, file.size);
        toast({
          title: "Saved inline (fallback)",
          description: `Storage upload failed (${primaryFailureReason ?? "unknown"}). Saved the image inline instead — it will still display correctly.`,
        });
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      } catch (readErr) {
        console.error("[FileUpload] Base64 fallback also failed", readErr);
      }
    }

    // Nothing worked. Show the real reason so we know what to fix.
    toast({
      title: "Upload failed",
      description:
        primaryFailureReason && primaryFailureReason.toLowerCase().includes("failed to fetch")
          ? "Browser could not reach db.techtrendi.com. If you're on a VPN, try disabling it briefly and retry. Otherwise your network may be blocking the storage host."
          : primaryFailureReason ?? "Unknown error. Check browser console for details.",
      variant: "destructive",
    });
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("", "", 0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isPdf = preview && (preview.includes(".pdf") || accept === "application/pdf");

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        id={`file-upload-${id || bucket}`}
      />

      {preview ? (
        <div className="relative border rounded-lg overflow-hidden">
          {isPdf ? (
            <div className="flex items-center gap-3 p-4 bg-muted">
              <FileText className="w-8 h-8 text-primary" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">PDF Document</p>
                <a href={preview} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">
                  View file
                </a>
              </div>
            </div>
          ) : (
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          )}
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={`file-upload-${id || bucket}`}
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              {accept.includes("image") ? (
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
              ) : (
                <Upload className="w-8 h-8 text-muted-foreground mb-2" />
              )}
              <span className="text-sm text-muted-foreground">{label}</span>
              <span className="text-xs text-muted-foreground mt-1">Max {maxSize}MB</span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
