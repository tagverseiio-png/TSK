import ProjectGrid from "@/components/ProjectGrid";

const brandingProjects = [
    { id: "1", image: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?q=80&w=1000", brand: "Ocula", director: "Brand Identity", slug: "ocula", size: "medium" as const },
    { id: "2", image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1000", brand: "Verge", director: "Content Strategy", slug: "verge", size: "large" as const },
    { id: "3", image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000", brand: "Horizon", director: "Omnichannel", slug: "horizon", size: "small" as const },
];

export default function BrandingPage() {
    return <ProjectGrid title="Branding" projects={brandingProjects} basePath="branding" />;
}
