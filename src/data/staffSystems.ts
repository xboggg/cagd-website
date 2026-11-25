import {
  BarChart3,
  Mail,
  CreditCard,
  Globe,
  Building,
  FileText,
  Shield,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

/**
 * The eight systems the staff portal links out to.
 *
 * `status` controls how a system is shown:
 *   "ready"   — normal link, opens in a new tab
 *   "confirm" — link works, but something about it is unverified (shown with a note)
 *   "not-set" — no working address yet, so it is NOT rendered as a link at all.
 *               Nobody should be sent to a dead page.
 *
 * A system with status "not-set" must have `url: null`.
 */

export type SystemStatus = "ready" | "confirm" | "not-set";

export interface StaffSystem {
  label: string;
  description: string;
  url: string | null;
  icon: LucideIcon;
  status: SystemStatus;
  /** Shown under the label when the status is not "ready". */
  note?: string;
}

export const staffSystems: StaffSystem[] = [
  {
    label: "GIFMIS Portal",
    description: "Financial management",
    url: "https://gifmis.gov.gh",
    icon: BarChart3,
    status: "ready",
  },
  {
    label: "Payroll System",
    description: "Salary & payslips",
    url: null,
    icon: CreditCard,
    status: "not-set",
    note: "Address not set yet",
  },
  {
    label: "Webmail",
    description: "Staff email",
    url: "https://mail.cagd.gov.gh",
    icon: Mail,
    status: "confirm",
    note: "Works on the office network",
  },
  {
    label: "CAGD Website",
    description: "Official website",
    url: "https://cagd.gov.gh",
    icon: Globe,
    status: "ready",
  },
  {
    label: "Meeting Rooms",
    description: "Room booking",
    url: "https://booking.cagd.gov.gh",
    icon: Building,
    status: "ready",
  },
  {
    label: "MoF Portal",
    description: "Ministry of Finance",
    url: "https://mofep.gov.gh",
    icon: FileText,
    status: "ready",
  },
  {
    label: "Audit Service",
    description: "Ghana Audit Service",
    url: "https://ghaudit.org",
    icon: Shield,
    status: "ready",
  },
  {
    label: "PFM Handbook",
    description: "PFM resources",
    url: "https://mofep.gov.gh/pfm",
    icon: BookOpen,
    status: "ready",
  },
];

/** How many of the eight have a confirmed, working address. */
export const readySystemCount = staffSystems.filter((s) => s.status !== "not-set").length;

/** Look one up by label — used for the shortcut row on the Today tab. */
export function findSystem(label: string): StaffSystem | undefined {
  return staffSystems.find((s) => s.label === label);
}
