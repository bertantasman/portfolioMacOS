import type { WidgetComponent } from "../types/widgets";
import { CalendarWidget } from "./calendar-widget";
import { ClockWidget } from "./clock-widget";
import { ContactWidget } from "./contact-widget";
import { ProjectsWidget } from "./projects-widget";
import { QuickSettingsWidget } from "./quick-settings-widget";
import { WeatherWidget } from "./weather-widget";

/** Which component draws each widget type. The registry describes widgets; this draws them. */
export const widgetComponents: Record<string, WidgetComponent> = {
  clock: ClockWidget,
  calendar: CalendarWidget,
  projects: ProjectsWidget,
  contact: ContactWidget,
  weather: WeatherWidget,
  "quick-settings": QuickSettingsWidget,
};
