import {
  Archive,
  BarChart3,
  Bell,
  Bookmark,
  Clapperboard,
  Compass,
  Flag,
  Folder,
  Home,
  Image,
  MessageCircle,
  PlusSquare,
  Radio,
  Search,
  Settings,
  Shield,
  User,
  UserPlus,
  Users,
} from "lucide-react";

export const navItems = [
  {
    label: "Home",
    path: "/",
    icon: Home,
    end: true,
  },
  {
    label: "Search",
    path: "/search",
    icon: Search,
  },
  {
    label: "Explore",
    path: "/explore",
    icon: Compass,
  },
  {
    label: "Reels",
    path: "/reels",
    icon: Clapperboard,
  },
  {
    label: "Messages",
    path: "/messages",
    icon: MessageCircle,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Create",
    path: "/create",
    icon: PlusSquare,
  },
  {
    label: "Profile",
    path: "/profile/me",
    icon: User,
  },
  {
    label: "Requests",
    path: "/follow-requests",
    icon: UserPlus,
  },
  {
    label: "Saved",
    path: "/saved",
    icon: Bookmark,
  },
  {
    label: "Archive",
    path: "/archive",
    icon: Archive,
  },
  {
    label: "Collections",
    path: "/collections",
    icon: Folder,
  },
  {
    label: "Live",
    path: "/live",
    icon: Radio,
  },
  {
    label: "Analytics",
    path: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export const adminNavItems = [
  {
    label: "Admin",
    path: "/admin",
    icon: Shield,
  },
  {
    label: "Admin Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Admin Posts",
    path: "/admin/posts",
    icon: Image,
  },
  {
    label: "Admin Reels",
    path: "/admin/reels",
    icon: Clapperboard,
  },
  {
    label: "Reports",
    path: "/admin/reports",
    icon: Flag,
  },
];

export const mobilePrimaryPaths = new Set([
  "/",
  "/search",
  "/create",
  "/reels",
  "/messages",
  "/profile/me",
]);
