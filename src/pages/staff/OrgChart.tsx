import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { GitBranch, Search, ChevronDown, ChevronRight, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import SEOHead from "@/components/SEOHead";
import Breadcrumbs from "@/components/Breadcrumbs";
import { resolveImagePath } from "@/lib/utils";

interface StaffNode {
  id: string;
  name: string;
  title: string | null;
  division: string | null;
  photo: string | null;
  reports_to: string | null;
  children: StaffNode[];
}

function TreeNode({ node, level, expandedIds, toggleExpand, highlightId }: {
  node: StaffNode;
  level: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
  highlightId: string | null;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isHighlighted = highlightId === node.id;
  const photoUrl = node.photo ? resolveImagePath(node.photo) : null;

  return (
    <div className={level > 0 ? "ml-6 border-l border-border pl-4" : ""}>
      <div
        className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all mb-1 ${
          isHighlighted
            ? "bg-primary/10 border border-primary/40 ring-2 ring-primary/20"
            : "hover:bg-muted/50"
        }`}
        onClick={() => hasChildren && toggleExpand(node.id)}
      >
        {hasChildren ? (
          isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <div className="w-4 h-4 shrink-0" />
        )}

        {photoUrl ? (
          <img src={photoUrl} alt={node.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
            {node.name.charAt(0)}
          </div>
        )}

        <div className="min-w-0">
          <p className="font-heading font-semibold text-sm leading-tight">{node.name}</p>
          {node.title && <p className="text-xs text-muted-foreground">{node.title}</p>}
        </div>

        {node.division && <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto shrink-0">{node.division}</Badge>}

        {hasChildren && (
          <span className="text-[10px] text-muted-foreground shrink-0">({node.children.length})</span>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
              highlightId={highlightId}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrgChart() {
  const [search, setSearch] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const { data: staff = [], isLoading } = useQuery({
    queryKey: ["org-chart-staff"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cagd_staff_directory")
        .select("id, name, title, division, photo, reports_to")
        .eq("is_active", true)
        .order("order_position", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const tree = useMemo(() => {
    const map = new Map<string, StaffNode>();
    staff.forEach((s: any) => map.set(s.id, { ...s, children: [] }));

    const roots: StaffNode[] = [];
    staff.forEach((s: any) => {
      const node = map.get(s.id)!;
      if (s.reports_to && map.has(s.reports_to)) {
        map.get(s.reports_to)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }, [staff]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Find path to a person and expand all ancestors
  const handleSearch = useCallback(() => {
    if (!search.trim()) {
      setHighlightId(null);
      return;
    }

    const q = search.toLowerCase();
    const match = staff.find((s: any) =>
      s.name.toLowerCase().includes(q) || (s.title || "").toLowerCase().includes(q)
    );

    if (!match) {
      setHighlightId(null);
      return;
    }

    // Find all ancestors and expand them
    const toExpand = new Set(expandedIds);
    let current: any = match;
    while (current?.reports_to) {
      toExpand.add(current.reports_to);
      current = staff.find((s: any) => s.id === current.reports_to);
    }

    setExpandedIds(toExpand);
    setHighlightId(match.id);
  }, [search, staff, expandedIds]);

  const expandAll = () => {
    setExpandedIds(new Set(staff.map((s: any) => s.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
    setHighlightId(null);
  };

  return (
    <>
      <SEOHead title="Org Chart" description="CAGD organizational chart" path="/staff/org-chart" />

      <section className="relative py-16 md:py-24 text-white" style={{ backgroundImage: `url('/images/hero/hero-6.webp')`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-primary/80" />
        <div className="container max-w-6xl relative z-10">
          <Breadcrumbs items={[{ label: "Staff Portal", href: "/staff" }, { label: "Org Chart" }]} />
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-3xl md:text-5xl font-heading font-bold mb-3">
            Organizational Chart
          </motion.h1>
          <p className="text-white/80">View the CAGD organizational hierarchy.</p>
        </div>
      </section>

      <section className="py-10 bg-background">
        <div className="container max-w-4xl">
          {/* Search + controls */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <button onClick={handleSearch} className="text-xs text-primary font-medium hover:underline">Find</button>
            <span className="text-muted-foreground">|</span>
            <button onClick={expandAll} className="text-xs text-muted-foreground hover:text-foreground">Expand All</button>
            <button onClick={collapseAll} className="text-xs text-muted-foreground hover:text-foreground">Collapse All</button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tree.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No organizational data available. Add staff members and set their "Reports To" relationships in the admin panel.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-4">
              {tree.map((root) => (
                <TreeNode
                  key={root.id}
                  node={root}
                  level={0}
                  expandedIds={expandedIds}
                  toggleExpand={toggleExpand}
                  highlightId={highlightId}
                />
              ))}
              <p className="text-center text-xs text-muted-foreground mt-4 pt-3 border-t border-border">
                {staff.length} staff member{staff.length !== 1 ? "s" : ""} in organization
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
