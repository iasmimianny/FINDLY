import type { ItemKind } from "./items";

export type DashboardRecord = {
  kind: ItemKind;
  public_code: string;
  title: string;
  category: string;
  status: string;
  location: string;
  occurred_at: string;
  created_at: string;
};

export type DashboardSummary = {
  user: { full_name: string };
  counts: { found: number; lost: number; openLost: number; returnedFound: number };
  recent: DashboardRecord[];
  points: { count: number; results: { id: number; name: string; address: string; opening_hours: string }[] } | null;
};
