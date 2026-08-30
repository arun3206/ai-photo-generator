import type { Relationship } from "@/features/portrait-flow/types";

export interface AnalyticsEvents {
  relationship_page_viewed: Record<string, never>;
  relationship_selected: { relationship: Relationship };
  relationship_continue_clicked: { relationship: Relationship };
}

export interface AnalyticsAdapter {
  track<EventName extends keyof AnalyticsEvents>(
    eventName: EventName,
    properties: AnalyticsEvents[EventName],
  ): void;
}

export const analytics: AnalyticsAdapter = {
  track: () => {
    // Intentionally empty until a privacy-reviewed analytics service is selected.
  },
};
