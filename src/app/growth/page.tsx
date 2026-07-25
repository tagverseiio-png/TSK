import ProjectGrid from "@/components/ProjectGrid";

const growthProjects = [
    { id: "1", image: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000", brand: "TechFest", director: "Event Scale", slug: "techfest", size: "large" as const },
    { id: "2", image: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000", brand: "Acquire", director: "B2B SaaS", slug: "acquire", size: "small" as const },
    { id: "3", image: "https://images.unsplash.com/photo-1579248512140-5e3ecbcbf3bb?q=80&w=1000", brand: "Forge", director: "Market Entry", slug: "forge", size: "medium" as const },
];

export default function GrowthPage() {
    return <ProjectGrid title="Growth" projects={growthProjects} basePath="growth" />;
}
