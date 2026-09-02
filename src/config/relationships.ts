import type { Occasion, Relationship } from "@/features/portrait-flow/types";

export interface RelationshipOption {
  id: Relationship;
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  firstPersonLabel: string;
  secondPersonLabel: string;
  photoCount: 1 | 2;
  featured: boolean;
  badge?: string;
  suggestedOccasion?: Occasion;
  displayOrder: number;
  enabled: boolean;
}

export interface SeasonalCampaign {
  enabled: boolean;
  message: string;
  featuredRelationshipId: Relationship;
  suggestedOccasion?: Occasion;
  badge?: string;
}

export const relationships: ReadonlyArray<RelationshipOption> = [
  {
    id: "janmashtami-child",
    title: "Little Krishna",
    description: "Transform one child photo into a beautiful Bal Krishna portrait.",
    image: "/templates/krishna-makhan-chor-v1.webp",
    imageAlt: "A child dressed as Little Krishna for Janmashtami",
    firstPersonLabel: "Child’s Photo",
    secondPersonLabel: "",
    photoCount: 1,
    featured: true,
    badge: "Janmashtami Special",
    suggestedOccasion: "janmashtami",
    displayOrder: 1,
    enabled: true,
  },
  {
    id: "mother-child",
    title: "Mother & Child",
    description: "A bond of endless warmth.",
    image: "/images/relationships/mother-child.jpg",
    imageAlt: "An Indian mother and child laughing together at home",
    firstPersonLabel: "Mother’s Photo",
    secondPersonLabel: "Child’s Photo",
    photoCount: 2,
    featured: false,
    suggestedOccasion: "just-because",
    displayOrder: 2,
    enabled: true,
  },
  {
    id: "father-child",
    title: "Father & Child",
    description: "Strength, guidance and love.",
    image: "/images/relationships/father-child.jpg",
    imageAlt: "An Indian father sharing a warm moment with his child",
    firstPersonLabel: "Father’s Photo",
    secondPersonLabel: "Child’s Photo",
    photoCount: 2,
    featured: false,
    suggestedOccasion: "just-because",
    displayOrder: 4,
    enabled: true,
  },
  {
    id: "grandparent-grandchild",
    title: "Grandparent & Grandchild",
    description: "Generations of stories and love.",
    image: "/images/relationships/grandparent-grandchild.jpg",
    imageAlt: "An Indian grandparent sharing a story with their grandchild",
    firstPersonLabel: "Grandparent’s Photo",
    secondPersonLabel: "Grandchild’s Photo",
    photoCount: 2,
    featured: false,
    suggestedOccasion: "wedding-blessings",
    displayOrder: 3,
    enabled: true,
  },
  {
    id: "brother-sister",
    title: "Brother & Sister",
    description: "Create a Raksha Bandhan memory to treasure forever.",
    image: "/images/relationships/brother-sister.jpg",
    imageAlt: "An Indian brother and sister smiling together in traditional attire",
    firstPersonLabel: "Brother’s Photo",
    secondPersonLabel: "Sister’s Photo",
    photoCount: 2,
    featured: false,
    badge: "Raksha Bandhan Special",
    suggestedOccasion: "raksha-bandhan",
    displayOrder: 2,
    enabled: true,
  },
];

export const seasonalCampaign: Readonly<SeasonalCampaign> = {
  enabled: true,
  message:
    "This Janmashtami, transform one cherished photo into a Little Krishna memory.",
  featuredRelationshipId: "janmashtami-child",
  suggestedOccasion: "janmashtami",
  badge: "Janmashtami Special",
};

export interface RelationshipPresentation extends RelationshipOption {
  isFeatured: boolean;
  displayBadge?: string;
}

export function getRelationshipPresentation(
  campaign: Readonly<SeasonalCampaign> = seasonalCampaign,
): readonly RelationshipPresentation[] {
  const enabledRelationships = relationships
    .filter((relationship) => relationship.enabled)
    .sort((first, second) => first.displayOrder - second.displayOrder);

  const configuredFeatured = enabledRelationships.filter(
    (relationship) => relationship.featured,
  );

  if (configuredFeatured.length > 1) {
    throw new Error("Only one relationship can be configured as featured.");
  }

  const featuredId = campaign.enabled
    ? campaign.featuredRelationshipId
    : configuredFeatured[0]?.id;

  return enabledRelationships
    .map((relationship) => ({
      ...relationship,
      isFeatured: relationship.id === featuredId,
      displayBadge:
        campaign.enabled && relationship.id === campaign.featuredRelationshipId
          ? (campaign.badge ?? relationship.badge)
          : relationship.badge,
    }))
    .sort((first, second) => {
      if (first.isFeatured !== second.isFeatured) {
        return first.isFeatured ? -1 : 1;
      }

      return first.displayOrder - second.displayOrder;
    });
}
