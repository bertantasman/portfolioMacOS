import { CalendarDays, Clock, FolderKanban, Mail, SlidersHorizontal, CloudSun } from "lucide-react";
import type { WidgetDefinition } from "../types/widgets";

/** Every kind of widget. The gallery, the layout code and the persistence checks all read this list. */
export const widgetRegistry: readonly WidgetDefinition[] = [
  {
    type: "clock",
    title: "Clock",
    description: "The current time in your time zone.",
    icon: Clock,
    supportedSizes: ["small", "medium", "large"],
    defaultSize: "small",
  },
  {
    type: "calendar",
    title: "Calendar",
    description: "A real calendar for any month. It shows dates only; there are no events.",
    icon: CalendarDays,
    supportedSizes: ["small", "medium", "large"],
    defaultSize: "medium",
  },
  {
    type: "projects",
    title: "Projects",
    description: "Shortcuts to the projects in this portfolio.",
    icon: FolderKanban,
    supportedSizes: ["small", "medium", "large"],
    defaultSize: "medium",
  },
  {
    type: "contact",
    title: "Contact",
    description: "Say hello: opens a new message in Mail.",
    icon: Mail,
    supportedSizes: ["small", "medium"],
    defaultSize: "small",
  },
  {
    type: "weather",
    title: "Weather",
    description: "Current weather for a city you choose, from Open-Meteo. Nothing is shown unless it loads.",
    icon: CloudSun,
    supportedSizes: ["small", "medium"],
    defaultSize: "small",
  },
  {
    type: "quick-settings",
    title: "Quick Settings",
    description: "Appearance, Do Not Disturb and Reduce Motion, shared with System Settings.",
    icon: SlidersHorizontal,
    supportedSizes: ["small", "medium", "large"],
    defaultSize: "medium",
  },
];

export const getWidgetDefinition = (type: string) => widgetRegistry.find((w) => w.type === type);
export const supportedSizesOf = (type: string) => getWidgetDefinition(type)?.supportedSizes ?? [];
