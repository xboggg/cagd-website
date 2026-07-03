import { Skeleton } from "@/components/ui/skeleton";

interface LoadingSkeletonProps {
  type: "card" | "table" | "article" | "list" | "grid";
  count?: number;
}

export default function LoadingSkeleton({ type, count = 3 }: LoadingSkeletonProps) {
  const items = Array.from({ length: count });

  if (type === "card") {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((_, i) => (
          <div key={i} className="card-elevated overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <div className="p-5 space-y-3">
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {items.map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (type === "article") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    );
  }

  if (type === "list") {
    return (
      <div className="space-y-4">
        {items.map((_, i) => (
          <div key={i} className="flex gap-4 items-start">
            <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // grid
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  );
}
