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
  ribbonText: string;
  previewImages: readonly {
    src: string;
    alt: string;
    label: string;
    width?: number;
    height?: number;
  }[];
  previewIntro: string;
  whatYouGet: readonly string[];
  benefitsHeading: string;
  benefits: readonly string[];
  stepsHeading: string;
  stepsIntro: string;
  steps: readonly { title: string; description: string }[];
  valueItems: readonly { name: string; valueMinor: number }[];
  audience: readonly string[];
  faqs: readonly { question: string; answer: string }[];
  finalHeading: string;
  finalDescription: string;
  download: {
    buttonLabel: string;
    intro: string;
    help: string;
  };
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
    id: "30-days-screen-free-activity-book",
    slug: "30-days-screen-free-activity-book",
    active: true,
    name: "30 Days Screen-Free Activity Book for Kids",
    headline: "30 Playful Ways to Unplug, Create and Connect as a Family",
    description:
      "Turn everyday time at home into a new adventure with 30 guided screen-free activities. Each activity includes the materials, estimated time, simple steps and a child-friendly reflection page.",
    shortDescription:
      "A printable 62-page book with 30 guided activities and reflection pages for family play.",
    priceMinor: 19_700,
    originalPriceMinor: 19_700,
    currency: "INR",
    badge: "30 Days of Play",
    thumbnail: "/products/30-days-screen-free-activity-book/bundle.png",
    ribbonText: "30 activities · 62 printable pages",
    previewImages: [
      {
        src: "/products/30-days-screen-free-activity-book/previews/cover.jpg",
        alt: "Cover of the 30 Days Screen-Free Activities printable book",
        label: "Printable activity book cover",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/activity-index.jpg",
        alt: "Index listing all 30 screen-free family activities",
        label: "All 30 activities at a glance",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/pillow-fort-guide.jpg",
        alt: "Pillow Fort activity guide with materials, steps and a play tip",
        label: "Step-by-step activity guides",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/pillow-fort-reflection.jpg",
        alt: "Pillow Fort reflection worksheet for children",
        label: "A reflection page for every activity",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/memory-museum-guide.jpg",
        alt: "Memory Museum activity guide with household materials and instructions",
        label: "Memory-building family play",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/memory-museum-reflection.jpg",
        alt: "Memory Museum reflection worksheet with feelings and learning prompts",
        label: "Feelings and learning prompts",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/colour-hunt-guide.jpg",
        alt: "Color Hunt activity guide with a timer, basket and simple steps",
        label: "Quick indoor activity ideas",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/colour-hunt-reflection.jpg",
        alt: "Color Hunt reflection worksheet for children and parents",
        label: "Space to draw, rate and reflect",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/shadow-theater-guide.jpg",
        alt: "Shadow Theater guide for putting on a family shadow show",
        label: "Creative family challenges",
        width: 910,
        height: 1287,
      },
      {
        src: "/products/30-days-screen-free-activity-book/previews/indoor-camping-reflection.jpg",
        alt: "Indoor Camping Night reflection page with drawing and rating prompts",
        label: "A keepsake of each adventure",
        width: 910,
        height: 1287,
      },
    ],
    previewIntro:
      "See the real printable pages included in the book, from the 30-day activity index to guided play ideas and child-friendly reflection sheets.",
    whatYouGet: [
      "A 62-page printable PDF activity book",
      "30 illustrated screen-free activity guides",
      "30 matching reflection and keepsake pages",
      "Materials, duration and location for every activity",
      "Simple step-by-step instructions and helpful tips",
      "Activities for creativity, movement, curiosity and family connection",
    ],
    benefitsHeading: "Make Screen-Free Time Easier to Start",
    benefits: [
      "Choose from quick indoor games, creative builds and family challenges",
      "See what you need before starting each activity",
      "Follow clear instructions without planning an activity from scratch",
      "Help children capture what they did, felt and learned",
    ],
    stepsHeading: "Pick. Play. Reflect.",
    stepsIntro:
      "Use one activity a day or choose any page whenever your family needs a fresh idea.",
    steps: [
      {
        title: "Pick",
        description:
          "Choose an activity from the index and gather the listed everyday materials.",
      },
      {
        title: "Play",
        description:
          "Follow the illustrated steps and enjoy the activity together, away from screens.",
      },
      {
        title: "Reflect",
        description:
          "Use the matching page to draw, share feelings, rate the activity and add a note.",
      },
    ],
    valueItems: [],
    audience: [
      "Families looking for ready-to-use screen-free ideas",
      "Children aged 3+ with adult guidance",
      "Rainy days, weekends, holidays and after-school time",
      "Parents, grandparents, carers and early-years educators",
    ],
    faqs: [
      sharedFaqs[0],
      {
        question: "What is included in the activity book?",
        answer:
          "The 62-page PDF includes a cover, a 30-activity index, 30 illustrated activity guides and 30 matching reflection pages.",
      },
      {
        question: "Which ages is it suitable for?",
        answer:
          "Activities show age guidance from 3+ to 5+ depending on the challenge. An adult should choose and supervise activities based on the child's age and abilities.",
      },
      {
        question: "Do the activities need special supplies?",
        answer:
          "Most activities use simple household or craft materials. Every guide clearly lists what to gather before you begin.",
      },
      sharedFaqs[1],
      sharedFaqs[2],
      sharedFaqs[3],
      sharedFaqs[4],
    ],
    finalHeading: "Ready for 30 Days of Screen-Free Fun?",
    finalDescription:
      "Download the printable book after verified payment and choose your family's first activity.",
    download: {
      buttonLabel: "Open Your Activity Book",
      intro:
        "Your payment has been verified. Open your protected 30 Days Screen-Free Activity Book folder below and save the PDF for your household's personal use.",
      help: "Try the access button again. It opens the activity book folder in Google Drive.",
    },
    file: {
      kind: "external_url",
      type: "folder",
      url: "https://drive.google.com/drive/folders/1HL4O7LDMDOiV3_tlBgoYrznhmzN56x-1?usp=drive_link",
    },
    seo: {
      title: "30 Days Screen-Free Activity Book for Kids",
      description:
        "Download a printable 62-page kids activity book with 30 guided screen-free family activities and matching reflection pages.",
      openGraphTitle: "30 Days Screen-Free Activity Book | CherishKit",
      openGraphDescription:
        "Thirty ready-to-use family activities with simple steps, everyday materials and printable reflection pages.",
      openGraphImage: "/products/30-days-screen-free-activity-book/bundle.png",
    },
  },
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
    ribbonText: "14,000+ printable worksheets",
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
    previewIntro:
      "Explore a small sample of the activities included. Swipe on mobile to see every page.",
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
    stepsHeading: "Choose. Print. Practice.",
    stepsIntro: "Use the bundle in a simple routine that fits your child's day.",
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
    finalHeading: "Ready to Download Your Kit?",
    finalDescription:
      "Start using your printable pages immediately after verified payment.",
    download: {
      buttonLabel: "Open Your Worksheets",
      intro:
        "Your payment has been verified. Open your protected worksheet collection below and save the link for your personal use.",
      help: "Try the access button again. It opens the worksheet collection in Google Drive.",
    },
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
  {
    id: "ssc-complete-notes-bundle",
    slug: "ssc-complete-notes-bundle",
    active: true,
    name: "SSC Complete Notes Bundle",
    headline: "English and Hindi Revision Notes for Focused SSC Preparation",
    description:
      "Study important SSC topics with visual, easy-to-revise digital notes covering history, geography, polity, science, environment and current affairs.",
    shortDescription:
      "Visual SSC revision notes in English and Hindi across key exam subjects.",
    priceMinor: 19_800,
    originalPriceMinor: 19_800,
    currency: "INR",
    badge: "English + Hindi",
    thumbnail: "/products/ssc-complete-notes-bundle/cover.webp",
    ribbonText: "SSC notes in English and Hindi",
    previewImages: [
      {
        src: "/products/ssc-complete-notes-bundle/previews/history-foundations.png",
        alt: "SSC history notes explaining ancient, medieval and modern periods",
        label: "History foundations",
        width: 628,
        height: 850,
      },
      {
        src: "/products/ssc-complete-notes-bundle/previews/stone-age-map.png",
        alt: "SSC history notes with human evolution, rock art and an India map",
        label: "Stone Age and archaeology",
        width: 622,
        height: 793,
      },
      {
        src: "/products/ssc-complete-notes-bundle/previews/animal-tissue.png",
        alt: "Bilingual science notes explaining types of animal tissue",
        label: "General science",
        width: 681,
        height: 784,
      },
      {
        src: "/products/ssc-complete-notes-bundle/previews/environment-conservation.png",
        alt: "Environment notes comparing conservation sites and biosphere reserves",
        label: "Environment and ecology",
        width: 456,
        height: 640,
      },
      {
        src: "/products/ssc-complete-notes-bundle/previews/current-affairs.png",
        alt: "Current affairs notes with important days, questions and explanations",
        label: "Current affairs",
        width: 981,
        height: 826,
      },
      {
        src: "/products/ssc-complete-notes-bundle/previews/vijayanagar-empire.png",
        alt: "History revision notes about the Vijayanagar Empire dynasties",
        label: "Visual revision notes",
        width: 636,
        height: 864,
      },
    ],
    previewIntro:
      "Preview the visual format, diagrams and explanations included in the notes. Swipe on mobile to see every sample.",
    whatYouGet: [
      "English and Hindi SSC notes",
      "History and geography revision material",
      "Polity and general science notes",
      "Environment and ecology concepts",
      "Current affairs questions with explanations",
      "Visual charts, maps and quick-revision pages",
    ],
    benefitsHeading: "Revise Important Topics Without Scattered Resources",
    benefits: [
      "Study key SSC subjects from organised digital folders",
      "Use visual charts and maps for faster recall",
      "Read on your phone, tablet or computer",
      "Download once and revise at your own pace",
    ],
    stepsHeading: "Open. Study. Revise.",
    stepsIntro: "Keep your preparation simple with organised notes for daily revision.",
    steps: [
      {
        title: "Open",
        description: "Access the organised SSC notes immediately after payment.",
      },
      {
        title: "Study",
        description: "Choose a subject and work through the visual explanations.",
      },
      {
        title: "Revise",
        description: "Return to important charts, facts and questions before the exam.",
      },
    ],
    valueItems: [],
    audience: [
      "SSC CGL, CHSL, MTS and GD aspirants",
      "Students who prefer visual revision notes",
      "Hindi and English medium learners",
      "Working aspirants preparing in limited study time",
    ],
    faqs: [
      sharedFaqs[0],
      {
        question: "Which languages are included?",
        answer: "The bundle includes study material in English and Hindi.",
      },
      {
        question: "Can I study on my phone?",
        answer:
          "Yes. You can open the digital notes on a phone, tablet or computer and print pages when useful.",
      },
      sharedFaqs[1],
      sharedFaqs[3],
      sharedFaqs[4],
    ],
    finalHeading: "Ready to Start Your SSC Revision?",
    finalDescription:
      "Get immediate access to the complete digital notes bundle after verified payment.",
    download: {
      buttonLabel: "Open Your SSC Notes",
      intro:
        "Your payment has been verified. Open your protected SSC notes collection below and save the link for your personal use.",
      help: "Try the access button again. It opens the SSC notes collection in Google Drive.",
    },
    file: {
      kind: "external_url",
      type: "folder",
      url: "https://drive.google.com/drive/folders/1UTuN2Kci07Ua8WVTzWF7HqIft7FCjYHn?usp=drive_link",
    },
    seo: {
      title: "SSC Complete Notes Bundle in English and Hindi",
      description:
        "Get digital SSC revision notes in English and Hindi covering history, geography, polity, science, environment and current affairs.",
      openGraphTitle: "SSC Complete Notes Bundle | CherishKit",
      openGraphDescription:
        "Visual digital revision notes across key SSC subjects in English and Hindi.",
      openGraphImage: "/products/ssc-complete-notes-bundle/cover.webp",
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
