import RosterList from "@/components/RosterList";
import WorkBonus from "@/components/WorkBonus";

const caseStudies = [
    {
        id: "1",
        firstName: "Chuan",
        lastName: "Watch",
        slug: "chuan-watch",
        count: "50+",
        category: "Product Photography",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=1000",
        featured: true,
    },
    {
        id: "2",
        firstName: "Concert",
        lastName: "Campaign",
        slug: "concert-campaign",
        count: "01",
        category: "Video Production",
        image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1000",
    },
    {
        id: "3",
        firstName: "Diamond",
        lastName: "Pearl",
        slug: "diamond-pearl",
        count: "01",
        category: "Brand Campaign",
        image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1000",
    },
    {
        id: "4",
        firstName: "DNet",
        lastName: "",
        slug: "dnet",
        count: "01",
        category: "Commercial Ads",
        image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=1000",
    },
    {
        id: "5",
        firstName: "Kree",
        lastName: "",
        slug: "kree",
        count: "01",
        category: "Content Creation",
        image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000",
    },
    {
        id: "6",
        firstName: "Ruchi",
        lastName: "",
        slug: "ruchi",
        count: "01",
        category: "Social Media",
        image: "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?q=80&w=1000",
    },
    {
        id: "7",
        firstName: "Super",
        lastName: "Deluxe",
        slug: "super-deluxe",
        count: "01",
        category: "Brand Identity",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1000",
    },
];

export default function WorkPage() {
    return (
        <div className="min-h-screen bg-[#15110f] w-full overflow-hidden">
            <RosterList
                items={caseStudies}
                basePath="work"
                pageLabel="OUR PORTFOLIO"
                subline="Bold campaigns. Cinematic visuals. Real results."
            />
            <WorkBonus />
        </div>
    );
}
