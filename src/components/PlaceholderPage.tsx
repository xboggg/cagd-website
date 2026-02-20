import { useLocation } from "react-router-dom";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const location = useLocation();
  return (
    <div className="container py-16 md:py-24">
      <h1 className="section-heading mb-6">{title}</h1>
      {description && <p className="text-muted-foreground max-w-2xl">{description}</p>}
      <div className="mt-8 p-8 rounded-lg bg-muted text-center">
        <p className="text-sm text-muted-foreground">
          This page is under construction. Content will be added soon.
        </p>
        <p className="text-xs text-muted-foreground mt-2">Path: {location.pathname}</p>
      </div>
    </div>
  );
}
