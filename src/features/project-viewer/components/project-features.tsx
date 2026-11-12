import { Bell, Calendar, Camera, Check, Cloud, Database, Globe, Layout, Lock, Mail, MapPin, Search, Settings, Shield, Smartphone, Users, Zap, type LucideIcon } from "lucide-react";
import type { ProjectFeature } from "@/types/project-content";
import { Section } from "./section";

/** The icons a feature may name. A short allow-list keeps the bundle small and the content file honest. */
const icons: Record<string, LucideIcon> = {
  bell: Bell,
  calendar: Calendar,
  camera: Camera,
  check: Check,
  cloud: Cloud,
  database: Database,
  globe: Globe,
  layout: Layout,
  lock: Lock,
  mail: Mail,
  "map-pin": MapPin,
  search: Search,
  settings: Settings,
  shield: Shield,
  smartphone: Smartphone,
  users: Users,
  zap: Zap,
};

/** Compact feature cards. A feature with only a title (from the older simple list) is shown as a plain card. */
export function ProjectFeatures({ id, features }: { id: string; features: readonly ProjectFeature[] }) {
  return (
    <Section title="Features" id={id}>
      <ul className="grid gap-2 @[520px]:grid-cols-2">
        {features.map((f) => {
          const Icon = (f.icon && icons[f.icon]) || Check;
          return (
            <li key={f.id} className="flex gap-2.5 rounded-lg bg-black/[0.04] p-3 shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.08)] transition-colors hover:bg-black/[0.06]">
              <Icon className="mt-0.5 size-4 shrink-0 text-(--accent)" aria-hidden />
              <div className="min-w-0">
                <h3 className="text-[13px] font-medium text-black/85">{f.title}</h3>
                {f.description && <p className="mt-0.5 text-[12px] leading-[18px] text-black/60">{f.description}</p>}
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
