import { ReactNode } from "react";
import { FileText, Image, Calendar, Newspaper, Users, Building2, MapPin, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyStateType = "news" | "events" | "reports" | "gallery" | "users" | "divisions" | "regional" | "generic";

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  children?: ReactNode;
}

const icons: Record<EmptyStateType, typeof FileText> = {
  news: Newspaper,
  events: Calendar,
  reports: FileText,
  gallery: Image,
  users: Users,
  divisions: Building2,
  regional: MapPin,
  generic: FolderOpen,
};

const defaultContent: Record<EmptyStateType, { title: string; description: string }> = {
  news: { title: "No news articles", description: "There are no news articles to display at the moment." },
  events: { title: "No events", description: "There are no upcoming events scheduled." },
  reports: { title: "No reports", description: "There are no reports available in this category." },
  gallery: { title: "No photos", description: "This album doesn't have any photos yet." },
  users: { title: "No users", description: "No users have been added yet." },
  divisions: { title: "No divisions", description: "Division information is not available." },
  regional: { title: "No regional offices", description: "Regional office data is not available." },
  generic: { title: "No data", description: "There is no data to display." },
};

export default function EmptyState({ type = "generic", title, description, action, children }: EmptyStateProps) {
  const Icon = icons[type];
  const content = defaultContent[type];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="p-6 rounded-full bg-muted mb-6">
        <Icon className="w-12 h-12 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-heading font-semibold text-foreground mb-2">
        {title || content.title}
      </h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description || content.description}
      </p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
      {children}
    </div>
  );
}
