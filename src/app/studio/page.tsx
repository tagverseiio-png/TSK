import BookingForm from "@/components/studio/BookingForm";
import NoiseOverlay from "@/components/NoiseOverlay";
import clientPromise from "@/lib/mongodb";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Studio Rental | The Simple Krew",
  description: "Book our premium podcast studio. Packages customized based on client requirements.",
};

async function getStudioConfig() {
  try {
    const client = await clientPromise.connect();
    const db = client.db(process.env.MONGODB_DB || "TSK");
    const config = await db.collection("studioConfig").findOne({});
    if (!config) throw new Error("No studio config found");
    return {
      baseRate: config.baseRate as number,
      minHours: config.minHours as number,
      videoCoverage: config.videoCoverage as number,
      reelNoSubs: config.reelNoSubs as number,
      reelWithSubs: config.reelWithSubs as number,
      fullPodcast: config.fullPodcast as number,
      whatsappNumber: config.whatsappNumber as string,
      contactEmail: config.contactEmail as string || "admin@thesimplekrew.com",
      timeSlots: config.timeSlots as string[],
    };
  } catch (err) {
    console.error("[studio] Failed to fetch config, using defaults:", err);
    // Fallback to defaults so the page never hard-crashes
    return {
      baseRate: 80,
      minHours: 2,
      videoCoverage: 200,
      reelNoSubs: 100,
      reelWithSubs: 150,
      fullPodcast: 300,
      whatsappNumber: "1234567890",
      contactEmail: "admin@thesimplekrew.com",
      timeSlots: ["10:00 AM", "01:00 PM", "04:00 PM", "07:00 PM"],
    };
  }
}

export default async function StudioBookingPage() {
  const config = await getStudioConfig();

  return (
    <main className="min-h-screen bg-background relative selection:bg-brand-orange selection:text-black">
      <NoiseOverlay />
      
      {/* Decorative dark element */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

      <div className="pt-32 pb-24 px-4 md:px-8">
        <BookingForm config={config} />
      </div>
    </main>
  );
}
