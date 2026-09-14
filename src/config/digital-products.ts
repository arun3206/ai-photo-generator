export type DigitalProductFileType = "pdf" | "zip" | "images" | "folder";

export type DigitalProductDelivery =
  | {
      kind: "private_object";
      key: string;
      contentType: string;
      downloadName: string;
    }
  | {
      kind: "external_url";
      url: string;
    };

export interface DigitalProduct {
  id: string;
  slug: string;
  active: boolean;
  name: string;
  headline: string;
  description: string;
  shortDescription: string;
  priceMinor: number;
  originalPriceMinor: number;
  currency: "INR" | "USD";
  badge?: string;
  thumbnail: string;
  previewImages: readonly {
    src: string;
    alt: string;
    label: string;
  }[];
  whatYouGet: readonly string[];
  benefitsHeading: string;
  benefits: readonly string[];
  steps: readonly { title: string; description: string }[];
  valueItems: readonly { name: string; valueMinor: number }[];
  audience: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  file: {
    type: DigitalProductFileType;
  } & DigitalProductDelivery;
  seo: {
    title: string;
    description: string;
    openGraphTitle: string;
    openGraphDescription: string;
    openGraphImage: string;
  };
}

const sharedFaqs = [
  {
    question: "How will I receive the product?",
    answer:
      "Immediately after successful payment, you will be taken to a secure download page.",
  },
  {
    question: "Is this a physical product?",
    answer: "No. This is a digital product. Nothing will be shipped.",
  },
  {
    question: "Can I print the PDF more than once?",
    answer: "Yes. You may print it multiple times for your household's personal use.",
  },
  {
    question: "What happens after payment?",
    answer:
      "Once Razorpay confirms and our server verifies your payment, your secure download becomes available instantly.",
  },
  {
    question: "Do I need an account?",
    answer: "No account or signup is required.",
  },
] as const;

export const digitalProducts = [
  {
    id: "14000-kids-worksheets",
    slug: "14000-kids-worksheets",
    active: true,
    name: "14,000+ Kids Worksheets",
    headline: "A Huge Printable Learning Library for Children Aged 2–7",
    description:
      "Get age-organised tracing, handwriting, preschool maths and activity worksheets in one digital bundle. Choose what your child needs, print it and start practicing.",
    shortDescription:
      "Tracing, handwriting, maths and activity worksheets in one printable bundle.",
    priceMinor: 19_900,
    originalPriceMinor: 199_900,
    currency: "INR",
    badge: "14,000+ Worksheets",
    thumbnail: "/products/14000-kids-worksheets/cover.webp",
    previewImages: [
      {
        src: "/products/14000-kids-worksheets/previews/sight-word-circling.png",
        alt: "Sight-word worksheet asking children to circle matching words",
        label: "Sight-word practice",
      },
      {
        src: "/products/14000-kids-worksheets/previews/alphabet-picture-match.webp",
        alt: "Alphabet worksheet matching beginning sounds with pictures",
        label: "Alphabet picture match",
      },
      {
        src: "/products/14000-kids-worksheets/previews/letter-a-tracing.webp",
        alt: "Letter A colouring, vocabulary and tracing worksheet",
        label: "Letter tracing",
      },
      {
        src: "/products/14000-kids-worksheets/previews/animal-parent-match.webp",
        alt: "Animal worksheet matching parents to their babies",
        label: "Animal matching",
      },
      {
        src: "/products/14000-kids-worksheets/previews/under-the-sea-addition.png",
        alt: "Under-the-sea picture addition worksheet",
        label: "Picture addition",
      },
      {
        src: "/products/14000-kids-worksheets/previews/triangle-maze.png",
        alt: "Pink triangle-shaped maze worksheet",
        label: "Maze games",
      },
      {
        src: "/products/14000-kids-worksheets/previews/number-two-tracing.png",
        alt: "Number two counting and handwriting practice worksheet",
        label: "Number tracing",
      },
      {
        src: "/products/14000-kids-worksheets/previews/short-o-words.png",
        alt: "Short O vocabulary worksheet with illustrated words",
        label: "Phonics and vocabulary",
      },
      {
        src: "/products/14000-kids-worksheets/previews/count-and-circle.png",
        alt: "Counting worksheet asking children to circle the correct number",
        label: "Count and circle",
      },
    ],
    whatYouGet: [
      "7,868+ premium kids worksheets",
      "827+ preschool maths worksheets",
      "463+ tracing worksheets",
      "121+ handwriting practice sheets",
      "Age-wise organised learning links",
      "Bonus ebooks and planning resources",
    ],
    benefitsHeading: "A Simpler Way to Plan Screen-Free Practice",
    benefits: [
      "Pick worksheets by age, topic or current skill",
      "Print only the pages you want to use",
      "Keep activities ready for home, travel and holidays",
      "Practice tracing, handwriting and early maths",
    ],
    steps: [
      {
        title: "Choose",
        description: "Open the organised folders and select a worksheet for the day.",
      },
      {
        title: "Print",
        description: "Print the pages you need using your home or local printer.",
      },
      {
        title: "Practice",
        description: "Use a short daily activity to build familiarity and confidence.",
      },
    ],
    valueItems: [
      { name: "Kids worksheet library", valueMinor: 120_000 },
      { name: "Tracing and handwriting packs", valueMinor: 40_000 },
      { name: "Maths and bonus resources", valueMinor: 39_900 },
    ],
    audience: [
      "Children aged 2–7 with adult guidance",
      "Parents planning home learning activities",
      "Preschool and early-years practice",
      "Teachers looking for printable activity options",
    ],
    faqs: sharedFaqs,
    file: {
      kind: "external_url",
      type: "folder",
      url: "https://drive.google.com/drive/folders/1d_QHhuuw0KNVuFHl9vVeGSY0XdEzhFLP",
    },
    seo: {
      title: "14,000+ Kids Worksheets Printable Bundle",
      description:
        "Get a large digital collection of printable tracing, handwriting, preschool maths and activity worksheets for children aged 2–7.",
      openGraphTitle: "14,000+ Printable Kids Worksheets | CherishKit",
      openGraphDescription:
        "One digital bundle with age-organised worksheets for early learning and screen-free practice.",
      openGraphImage: "/products/14000-kids-worksheets/cover.webp",
    },
  },
] as const satisfies readonly DigitalProduct[];

export type DigitalProductId = (typeof digitalProducts)[number]["id"];

export function getActiveDigitalProducts(): DigitalProduct[] {
  return digitalProducts.filter((product) => product.active);
}

export function getDigitalProductBySlug(slug: string): DigitalProduct | null {
  return digitalProducts.find((product) => product.slug === slug) ?? null;
}

export function getDigitalProductById(id: string): DigitalProduct | null {
  return digitalProducts.find((product) => product.id === id) ?? null;
}

export function formatDigitalProductPrice(
  amountMinor: number,
  currency: DigitalProduct["currency"],
) {
  return new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export function digitalProductDiscount(product: DigitalProduct) {
  if (product.originalPriceMinor <= product.priceMinor) return 0;
  return Math.round(
    ((product.originalPriceMinor - product.priceMinor) / product.originalPriceMinor) *
      100,
  );
}

export function digitalProductDownloadLabel(type: DigitalProductFileType) {
  if (type === "pdf") return "Download Your PDF";
  if (type === "zip") return "Download ZIP";
  if (type === "folder") return "Open Your Worksheets";
  return "Download Files";
}
