export type Relationship =
  | "janmashtami-child"
  | "radha-krishna-couple"
  | "mother-child"
  | "father-child"
  | "grandparent-grandchild"
  | "brother-sister";

export type Occasion =
  | "just-because"
  | "birthday"
  | "janmashtami"
  | "raksha-bandhan"
  | "diwali"
  | "wedding-blessings";

export type PortraitTemplate =
  | "janmashtami-krishna-makhan-001"
  | "janmashtami-radha-krishna-couple-001"
  | "janmashtami-little-krishna-001"
  | "janmashtami-wish-flute-001"
  | "janmashtami-wish-portrait-001"
  | "rakhi-brother-sister-traditional-001";

export type GenerationJobStatus =
  | "draft"
  | "uploading"
  | "queued"
  | "generating"
  | "preview-ready"
  | "payment-pending"
  | "paid"
  | "failed"
  | "expired";

export interface PortraitFlowState {
  relationship?: Relationship;
  occasion?: Occasion;
  template?: PortraitTemplate;
  sourcePhotoIds: readonly [string, string] | readonly [];
  jobId?: string;
  updatedAt: string;
}
