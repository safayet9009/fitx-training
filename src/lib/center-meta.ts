// Extended branch metadata keyed by center name.
// Keeps the existing DB schema untouched while enriching the UI.

export type CenterMeta = {
  lat: number;
  lng: number;
  trainers: number;
  rating: number; // /5
  hours: string;
  description: string;
  bkash: string;
  nagad: string;
  gallery: string[]; // gradient placeholders
};

const g = (a: string, b: string) => `linear-gradient(135deg, ${a}, ${b})`;

const CENTER_META: Record<string, CenterMeta> = {
  // Dhaka
  "FitX Gulshan":     { lat: 23.7925, lng: 90.4078, trainers: 12, rating: 4.8, hours: "5:00 AM – 11:00 PM",
    description: "Our flagship Gulshan club with elite trainers, premium recovery zone and a Pro-grade strength floor.",
    bkash: "01711-200001", nagad: "01511-200001", gallery: [g("#22c55e","#0ea5e9"), g("#a855f7","#22d3ee"), g("#f59e0b","#ef4444")] },
  "FitX Dhanmondi":   { lat: 23.7461, lng: 90.3742, trainers: 9, rating: 4.6, hours: "6:00 AM – 10:30 PM",
    description: "Dhanmondi's most-loved community gym with yoga studio, cardio theatre and group HIIT classes.",
    bkash: "01711-200002", nagad: "01511-200002", gallery: [g("#06b6d4","#3b82f6"), g("#22c55e","#84cc16")] },
  "FitX Banani":      { lat: 23.7937, lng: 90.4066, trainers: 10, rating: 4.7, hours: "5:30 AM – 11:00 PM",
    description: "CrossFit-style training rigs, performance coaches, and a fresh-juice bar in the heart of Banani.",
    bkash: "01711-200003", nagad: "01511-200003", gallery: [g("#f43f5e","#f59e0b"), g("#a855f7","#ec4899")] },
  "FitX Uttara":      { lat: 23.8759, lng: 90.3795, trainers: 7, rating: 4.4, hours: "6:00 AM – 10:00 PM",
    description: "Spacious Uttara facility with separate ladies' floor and a dedicated functional training zone.",
    bkash: "01711-200004", nagad: "01511-200004", gallery: [g("#22c55e","#14b8a6"), g("#3b82f6","#6366f1")] },
  "FitX Mirpur":      { lat: 23.8069, lng: 90.3686, trainers: 6, rating: 4.3, hours: "6:00 AM – 10:30 PM",
    description: "Weights-first gym with an in-house boxing ring and the most affordable Pro plans in Mirpur.",
    bkash: "01711-200005", nagad: "01511-200005", gallery: [g("#ef4444","#f59e0b"), g("#0ea5e9","#a855f7")] },
  "FitX Mohakhali":   { lat: 23.7779, lng: 90.4045, trainers: 8, rating: 4.5, hours: "5:30 AM – 10:30 PM",
    description: "Boutique cardio club in Mohakhali DOHS with Finnish sauna and on-call physiotherapist.",
    bkash: "01711-200006", nagad: "01511-200006", gallery: [g("#06b6d4","#22c55e"), g("#f59e0b","#ec4899")] },
  "FitX Bashundhara": { lat: 23.8186, lng: 90.4275, trainers: 14, rating: 4.9, hours: "5:00 AM – 11:30 PM",
    description: "Largest FitX branch with indoor pool, hot yoga studio and 24/7 access for Pro members.",
    bkash: "01711-200007", nagad: "01511-200007", gallery: [g("#a855f7","#06b6d4"), g("#22c55e","#f59e0b"), g("#ef4444","#a855f7")] },
  // Chittagong
  "FitX Agrabad":     { lat: 22.3293, lng: 91.8137, trainers: 6, rating: 4.4, hours: "6:00 AM – 10:00 PM",
    description: "Agrabad's go-to gym for corporate professionals — quick-circuit programs and shower lockers.",
    bkash: "01711-300001", nagad: "01511-300001", gallery: [g("#0ea5e9","#22c55e"), g("#a855f7","#3b82f6")] },
  "FitX Nasirabad":   { lat: 22.3672, lng: 91.8204, trainers: 7, rating: 4.6, hours: "6:00 AM – 10:30 PM",
    description: "Performance-oriented club with CrossFit rigs and elite-level personal training packages.",
    bkash: "01711-300002", nagad: "01511-300002", gallery: [g("#f43f5e","#a855f7"), g("#22c55e","#0ea5e9")] },
  "FitX GEC":         { lat: 22.3590, lng: 91.8214, trainers: 5, rating: 4.2, hours: "6:30 AM – 10:00 PM",
    description: "Central GEC Circle gym with morning yoga, evening Zumba and a friendly local community vibe.",
    bkash: "01711-300003", nagad: "01511-300003", gallery: [g("#22c55e","#f59e0b"), g("#06b6d4","#a855f7")] },
  "FitX Khulshi":     { lat: 22.3582, lng: 91.8089, trainers: 6, rating: 4.5, hours: "6:00 AM – 10:30 PM",
    description: "Khulshi hilltop branch with sauna, free-weights heaven and panoramic city views.",
    bkash: "01711-300004", nagad: "01511-300004", gallery: [g("#a855f7","#ec4899"), g("#3b82f6","#22c55e")] },
  // Barishal
  "FitX Band Road":   { lat: 22.6953, lng: 90.3702, trainers: 4, rating: 4.1, hours: "6:00 AM – 9:30 PM",
    description: "River-view Band Road gym with classic strength gear and beginner-friendly coaching.",
    bkash: "01711-400001", nagad: "01511-400001", gallery: [g("#22c55e","#06b6d4"), g("#f59e0b","#ef4444")] },
  "FitX Sadar":       { lat: 22.7010, lng: 90.3535, trainers: 5, rating: 4.3, hours: "6:00 AM – 10:00 PM",
    description: "Sadar Road's premium branch — yoga studio, dedicated PT zone and clean locker facilities.",
    bkash: "01711-400002", nagad: "01511-400002", gallery: [g("#3b82f6","#a855f7"), g("#22c55e","#84cc16")] },
  "FitX Nathullabad": { lat: 22.7264, lng: 90.3528, trainers: 3, rating: 4.0, hours: "6:30 AM – 9:30 PM",
    description: "No-frills weights-focused gym in Nathullabad with the lowest monthly fee in the city.",
    bkash: "01711-400003", nagad: "01511-400003", gallery: [g("#ef4444","#a855f7"), g("#0ea5e9","#22c55e")] },
};

const FALLBACK: CenterMeta = {
  lat: 23.8103, lng: 90.4125, trainers: 5, rating: 4.2, hours: "6:00 AM – 10:00 PM",
  description: "A modern FitX branch with full strength, cardio and group-class facilities.",
  bkash: "01711-000000", nagad: "01511-000000", gallery: [g("#22c55e","#0ea5e9")],
};

export function getCenterMeta(name: string): CenterMeta {
  return CENTER_META[name] ?? FALLBACK;
}

export const CITY_CENTROIDS: Record<string, [number, number]> = {
  Dhaka: [23.8103, 90.4125],
  Chittagong: [22.3569, 91.7832],
  Barishal: [22.7010, 90.3535],
};
