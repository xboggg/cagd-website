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

  // Keep preview synced when currentUrl changes (e.g. after upload updates parent form)
  useEffect(() => {
    setPreview(currentUrl || null);
  }, [currentUrl]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      setUploading(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    // Set preview for images
    if (file.type.startsWith("image/")) {
      setPreview(publicUrl);
    } else {
      setPreview(null);
    }

    onUpload(publicUrl, file.name, file.size);
    setUploading(false);

    toast({ title: "Upload complete", description: `${file.name} uploaded successfully.` });
  };

  const handleRemove = async () => {
    setPreview(null);
    onUpload("", "", 0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isPdf = preview?.endsWith(".pdf") || accept === "application/pdf";

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
                <a
                  href={preview}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  View file
                </a>
              </div>
            </div>
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover"
            />
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
