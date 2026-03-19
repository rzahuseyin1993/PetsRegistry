export interface FlyerTemplate {
  id: string;
  name: string;
  description: string;
  previewColor: string;
  // Layout & color config
  bgColor: string;
  bgAccent: string;
  headerColor: string;
  headerText: string;
  bodyText: string;
  accentColor: string;
  accentText: string;
  ctaColor: string;
  ctaText: string;
  fontFamily: string;
  layout: "bold-split" | "centered-photo" | "framed-elegant" | "banner-action" | "editorial";
}

export const flyerTemplates: FlyerTemplate[] = [
  {
    id: "bold-red",
    name: "Bold Red Alert",
    description: "High-impact red banner with large photo — maximum visibility",
    previewColor: "bg-red-600",
    bgColor: "#FFFFFF",
    bgAccent: "#FEE2E2",
    headerColor: "#DC2626",
    headerText: "#FFFFFF",
    bodyText: "#1A1A1A",
    accentColor: "#DC2626",
    accentText: "#FFFFFF",
    ctaColor: "#1A1A1A",
    ctaText: "#FFFFFF",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    layout: "bold-split",
  },
  {
    id: "warm-orange",
    name: "Warm & Friendly",
    description: "Soft orange tones with rounded shapes — approachable and warm",
    previewColor: "bg-orange-400",
    bgColor: "#FFF7ED",
    bgAccent: "#FDBA74",
    headerColor: "#EA580C",
    headerText: "#FFFFFF",
    bodyText: "#431407",
    accentColor: "#F97316",
    accentText: "#FFFFFF",
    ctaColor: "#EA580C",
    ctaText: "#FFFFFF",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    layout: "centered-photo",
  },
  {
    id: "elegant-grey",
    name: "Elegant Grey",
    description: "Sophisticated dark frame with scalloped photo border — premium look",
    previewColor: "bg-gray-700",
    bgColor: "#F5F5F0",
    bgAccent: "#D4D4D4",
    headerColor: "#374151",
    headerText: "#F9FAFB",
    bodyText: "#1F2937",
    accentColor: "#374151",
    accentText: "#FFFFFF",
    ctaColor: "#059669",
    ctaText: "#FFFFFF",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    layout: "framed-elegant",
  },
  {
    id: "nature-green",
    name: "Nature Green",
    description: "Fresh green with bold banner — perfect for outdoor pets",
    previewColor: "bg-green-700",
    bgColor: "#FFFFFF",
    bgAccent: "#D1FAE5",
    headerColor: "#15803D",
    headerText: "#FFFFFF",
    bodyText: "#14532D",
    accentColor: "#22C55E",
    accentText: "#FFFFFF",
    ctaColor: "#15803D",
    ctaText: "#FFFFFF",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    layout: "banner-action",
  },
  {
    id: "purple-charm",
    name: "Purple Charm",
    description: "Playful purple gradient with centered layout — eye-catching",
    previewColor: "bg-purple-500",
    bgColor: "#C084FC",
    bgAccent: "#A855F7",
    headerColor: "#6B21A8",
    headerText: "#FFFFFF",
    bodyText: "#FFFFFF",
    accentColor: "#E9D5FF",
    accentText: "#6B21A8",
    ctaColor: "#6B21A8",
    ctaText: "#FFFFFF",
    fontFamily: "'Helvetica Neue', 'Arial', sans-serif",
    layout: "editorial",
  },
];
