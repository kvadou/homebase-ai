import {
  LayoutDashboard,
  Users,
  DollarSign,
  LifeBuoy,
  Megaphone,
  BarChart3,
  Settings,
  FileText,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

export interface NavChild {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavChild[];
}

export const adminSections: NavSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    id: "users",
    label: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    id: "revenue",
    label: "Revenue",
    href: "/admin/revenue",
    icon: DollarSign,
  },
  {
    id: "support",
    label: "Support",
    href: "/admin/support",
    icon: LifeBuoy,
  },
  {
    id: "marketing",
    label: "Marketing",
    href: "/admin/marketing",
    icon: Megaphone,
    children: [
      { href: "/admin/marketing", label: "Overview", icon: Megaphone },
      { href: "/admin/marketing/campaigns", label: "Campaigns", icon: BarChart3 },
      { href: "/admin/marketing/content", label: "Content Studio", icon: FileText },
    ],
  },
  {
    id: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

/** Given a pathname, return the active section */
export function getActiveSection(pathname: string): NavSection | undefined {
  // Exact match first
  const exact = adminSections.find((s) => s.href === pathname);
  if (exact && !pathname.startsWith("/admin/marketing") && !pathname.startsWith("/admin/support/")) {
    return exact;
  }

  // Prefix match (longest wins)
  return adminSections
    .filter((s) => s.id !== "dashboard" && pathname.startsWith(s.href))
    .sort((a, b) => b.href.length - a.href.length)[0]
    ?? adminSections.find((s) => s.href === "/admin");
}
