/** Minimal typing for the (non-standard) Battery Status API. */
export interface BatteryManager extends EventTarget {
  readonly charging: boolean;
  readonly level: number;
}

export type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};
