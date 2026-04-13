import BookingForm from "@/components/studio/BookingForm";
import NoiseOverlay from "@/components/NoiseOverlay";

export const metadata = {
  title: "Studio Rental | The Simple Krew",
  description: "Book our premium podcast studio. Packages customized based on client requirements.",
};

export default function StudioBookingPage() {
  return (
    <main className="min-h-screen bg-background relative selection:bg-brand-orange selection:text-black">
      <NoiseOverlay />
      
      {/* Decorative dark element */}
      <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-b from-brand-orange/5 to-transparent pointer-events-none" />
      <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-brand-orange/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="pt-32 pb-24 px-4 md:px-8">
        <BookingForm />
      </div>
    </main>
  );
}
