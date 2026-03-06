export interface PackageInfo {
    id: string;
    tag: string;
    title: string;
    hourlyRate: number;
    originalHourlyRate: number;
    minimumHours: number;
    priceUnit: string;
    promo: string;
    features: string[];
    extraHourNote: string;
}

export const packages: PackageInfo[] = [
    {
        id: "executive",
        tag: "Executive",
        title: "Hourly Rental",
        hourlyRate: 225,
        originalHourlyRate: 250,
        minimumHours: 3,
        priceUnit: "/hour",
        promo: "Limited Launch Offer · First 5 Bookings Only",
        features: [
            "On-site setup & management",
            "All necessary equipment included",
            "Choose between Home Tee Hero or GSPro Software",
            "Additional Hours: $200 per extra hour if available",
        ],
        extraHourNote: "Additional Hours: $200 per extra hour if available",
    },
];

/** Derived: starting price for display */
export const startingAt = (pkg: PackageInfo) =>
    pkg.hourlyRate * pkg.minimumHours;

/** Short features for the compact booking card (no extra-hour note) */
export const bookingFeatures = (pkg: PackageInfo) =>
    pkg.features.filter((f) => !f.startsWith("Additional Hours"));
