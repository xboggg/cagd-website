import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex items-center gap-2 text-sm flex-wrap">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 text-accent-foreground/70 hover:text-accent-foreground transition-colors"
            aria-label="Home"
          >
            <Home className="w-4 h-4" />
          </Link>
        </li>
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <ChevronRight className="w-4 h-4 text-accent-foreground/50" aria-hidden="true" />
            {item.href ? (
              <Link
                to={item.href}
                className="text-accent-foreground/70 hover:text-accent-foreground transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-accent-foreground font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
