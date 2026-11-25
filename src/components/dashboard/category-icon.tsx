import {
  BriefcaseBusiness,
  Car,
  ChartLine,
  Clapperboard,
  HeartPulse,
  House,
  Laptop,
  Package,
  ShoppingBag,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "../ui";

const ICONS: Record<string, { icon: LucideIcon; tone: string }> = {
  Food: { icon: Utensils, tone: "bg-coral-50 text-coral-600" },
  Rent: { icon: House, tone: "bg-amber-50 text-amber-600" },
  Transport: { icon: Car, tone: "bg-sky-50 text-sky-600" },
  Utilities: { icon: Zap, tone: "bg-yellow-50 text-yellow-600" },
  Shopping: { icon: ShoppingBag, tone: "bg-pink-50 text-pink-600" },
  Entertainment: { icon: Clapperboard, tone: "bg-violet-50 text-violet-600" },
  Health: { icon: HeartPulse, tone: "bg-rose-50 text-rose-600" },
  Others: { icon: Package, tone: "bg-zinc-100 text-zinc-600" },
  Salary: { icon: BriefcaseBusiness, tone: "bg-emerald-50 text-emerald-600" },
  Freelance: { icon: Laptop, tone: "bg-teal-50 text-teal-600" },
  Investment: { icon: ChartLine, tone: "bg-green-50 text-green-600" },
  "Other income": { icon: Wallet, tone: "bg-lime-50 text-lime-700" },
};

export function CategoryIcon({ category, className }: { category: string; className?: string }) {
  const { icon: Icon, tone } = ICONS[category] ?? ICONS.Others;
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", tone, className)}>
      <Icon className="size-4" strokeWidth={2} />
    </span>
  );
}
