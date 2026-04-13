import RosterList from "@/components/RosterList";

const services = [
    { id: "1", firstName: "Creative", lastName: "Direction", slug: "creative-direction", count: "01", image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000" },
    { id: "2", firstName: "Professional", lastName: "Photography", slug: "professional-photography", count: "02", image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?q=80&w=1000" },
    { id: "3", firstName: "Social Media", lastName: "Content", slug: "social-media-content", count: "03", image: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=1000" },
    { id: "4", firstName: "High-End", lastName: "Commercials", slug: "commercial-ads", count: "04", image: "https://images.unsplash.com/photo-1551288049-bbbda5366391?q=80&w=1000" },
    { id: "5", firstName: "Brand", lastName: "Campaigns", slug: "brand-campaigns", count: "05", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000" },
    { id: "6", firstName: "Account", lastName: "Growth", slug: "account-growth", count: "06", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000" },
    { id: "7", firstName: "Event", lastName: "Coverage", slug: "event-coverage", count: "07", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000" },
    { id: "8", firstName: "Influencer", lastName: "Marketing", slug: "influencer-marketing", count: "08", image: "https://images.unsplash.com/photo-1557835292-11996ee63b53?q=80&w=1000" },
    { id: "9", firstName: "Podcast", lastName: "Services", slug: "podcast-services", count: "09", image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?q=80&w=1000" },
    { id: "10", firstName: "Concert", lastName: "Production", slug: "concert-production", count: "10", image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1000" }
];

export default function ServicesPage() {
    return (
        <div className="min-h-screen bg-[#15110f] w-full overflow-hidden">
            <RosterList items={services} basePath="services" />
        </div>
    );
}
