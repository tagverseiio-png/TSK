"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Send, Users, Video, Film, Scissors, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";

// Pricing Constants based on the provided package
const PRICING = {
  BASE_RATE: 80, // per hour
  MIN_HOURS: 2,
  VIDEO_COVERAGE: 200, // per hour
  REEL_NO_SUBS: 100, // per reel
  REEL_WITH_SUBS: 150, // per reel
  FULL_PODCAST: 300, // per episode
};

const WHATSAPP_NUMBER = "1234567890"; // TODO: Replace with actual number
const TIME_SLOTS = ["10:00 AM", "01:00 PM", "04:00 PM", "07:00 PM"];

const STEPS = [
  { id: 1, title: "Your Details" },
  { id: 2, title: "Schedule" },
  { id: 3, title: "Services" },
  { id: 4, title: "Review" },
];

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    startTime: TIME_SLOTS[0],
    duration: PRICING.MIN_HOURS,
    videoCoverage: false,
    reelsNoSubs: 0,
    reelsWithSubs: 0,
    fullPodcast: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const totalPrice = useMemo(() => {
    const baseCost = formData.duration * PRICING.BASE_RATE;
    const videoCost = formData.videoCoverage ? formData.duration * PRICING.VIDEO_COVERAGE : 0;
    const reelsNoSubsCost = formData.reelsNoSubs * PRICING.REEL_NO_SUBS;
    const reelsWithSubsCost = formData.reelsWithSubs * PRICING.REEL_WITH_SUBS;
    const fullPodcastCost = formData.fullPodcast * PRICING.FULL_PODCAST;

    return baseCost + videoCost + reelsNoSubsCost + reelsWithSubsCost + fullPodcastCost;
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
      return;
    }

    // Construct WhatsApp Message
    const text = `*New Studio Booking Request*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Time:* ${formData.startTime}%0A*Duration:* ${formData.duration} Hours%0A%0A*Packages Selected:*%0A- Studio Rental (${formData.duration}hrs)%0A- Video Coverage: ${formData.videoCoverage ? "Yes" : "No"}%0A- Reels (No Subs): ${formData.reelsNoSubs}%0A- Reels (With Subs): ${formData.reelsWithSubs}%0A- Full Podcast Edit: ${formData.fullPodcast}%0A%0A*Total Estimate:* $${totalPrice}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(whatsappUrl, "_blank");
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Determine if 'Next' should be disabled based on current step
  const isNextDisabled = () => {
    if (step === 1 && (!formData.name || !formData.phone)) return true;
    if (step === 2 && !formData.date) return true;
    return false;
  };

  // Animation variants
  const slideVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-8 relative z-10">
      <div className="mb-12 text-center">
        <h2 className="font-monument text-3xl md:text-5xl text-brand-white mb-4">Book The Studio</h2>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Reserve your slot for our premium podcast studio. Review the packages and hit book to finalize over WhatsApp.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-12 relative max-w-2xl mx-auto">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/10 -z-10 -translate-y-1/2"></div>
        <div 
          className="absolute top-1/2 left-0 h-[2px] bg-brand-orange -z-10 -translate-y-1/2 transition-all duration-500 ease-in-out"
          style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
        ></div>
        
        {STEPS.map((s) => (
          <div key={s.id} className="flex flex-col items-center gap-2">
            <div 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-monument text-sm transition-all duration-300 ${
                step >= s.id ? "bg-brand-orange text-black shadow-[0_0_20px_rgba(255,107,0,0.4)]" : "bg-[#15110f] border border-white/20 text-white/40"
              }`}
            >
              {step > s.id ? <CheckCircle2 size={18} /> : s.id}
            </div>
            <span className={`text-[10px] uppercase tracking-widest absolute -bottom-6 ${step >= s.id ? "text-brand-orange" : "text-white/40"}`}>{s.title}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden relative min-h-[500px]">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-brand-orange/10 blur-[120px] rounded-full pointer-events-none" />

        <form onSubmit={handleSubmit} className="p-6 md:p-12 h-full flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-8">
                <div className="text-center mb-8">
                  <h3 className="font-monument text-2xl text-white">Let's get introduced</h3>
                  <p className="text-white/50 text-sm mt-2">Who are we reserving the studio for?</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                  <div className="space-y-3 group">
                    <label className="text-[10px] text-brand-orange uppercase tracking-widest group-focus-within:text-brand-orange transition-colors">Full Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-3 text-2xl text-white focus:outline-none focus:border-brand-orange focus:bg-white/[0.05] transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-3 group">
                    <label className="text-[10px] text-brand-orange uppercase tracking-widest group-focus-within:text-brand-orange transition-colors">Phone Number</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-white/[0.03] border-b-2 border-white/10 px-0 py-3 text-2xl text-white focus:outline-none focus:border-brand-orange focus:bg-white/[0.05] transition-all"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-8 max-w-3xl mx-auto w-full">
                <div className="text-center mb-8">
                  <h3 className="font-monument text-2xl text-white">Choose your time</h3>
                  <p className="text-white/50 text-sm mt-2">Select a date, a 3-hour slot, and total duration.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] text-brand-orange uppercase tracking-widest flex items-center gap-2">
                        <CalendarDays size={14} /> Select Date
                      </label>
                      <input
                        required
                        type="date"
                        name="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={formData.date}
                        onChange={handleInputChange}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-brand-orange transition-all hover:bg-white/10"
                        style={{ colorScheme: "dark" }}
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <label className="text-[10px] text-brand-orange uppercase tracking-widest flex items-center justify-between">
                        <span>Duration (Hours)</span>
                        <span className="text-white/40 normal-case tracking-normal">Min. 2 hours ($80/hr)</span>
                      </label>
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10 transition-all focus-within:border-brand-orange">
                        <input
                          required
                          type="number"
                          name="duration"
                          min={PRICING.MIN_HOURS}
                          value={formData.duration}
                          onChange={handleInputChange}
                          className="w-full bg-transparent text-2xl text-white focus:outline-none py-2"
                        />
                        <span className="text-white/30 font-monument">HRS</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] text-brand-orange uppercase tracking-widest flex items-center gap-2">
                      <Clock size={14} /> Available Slots
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {TIME_SLOTS.map((slot) => {
                        const isSoldOut = formData.date && slot === "01:00 PM";
                        const isSelected = formData.startTime === slot;
                        
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isSoldOut as boolean}
                            onClick={() => setFormData({ ...formData, startTime: slot })}
                            className={`py-5 px-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                              isSoldOut 
                                ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-50" 
                                : isSelected
                                  ? "bg-brand-orange border-brand-orange text-black scale-[1.03] shadow-lg shadow-brand-orange/20 z-10"
                                  : "bg-white/5 border-white/10 text-white hover:border-brand-orange/50 hover:bg-white/10"
                            }`}
                          >
                            <span className="font-monument text-sm">{slot}</span>
                            {isSoldOut ? (
                              <span className="text-[9px] uppercase font-bold tracking-widest text-red-500">Sold Out</span>
                            ) : (
                              <span className={`text-[9px] uppercase tracking-widest ${isSelected ? 'text-black/60' : 'text-brand-orange/60'}`}>Available</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-8 max-w-4xl mx-auto w-full">
                <div className="text-center mb-8">
                  <h3 className="font-monument text-2xl text-white">Elevate your production</h3>
                  <p className="text-white/50 text-sm mt-2">Add professional video coverage and post-production edit packages.</p>
                </div>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer group bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 hover:border-brand-orange/50">
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-xl flex items-center justify-center transition-all ${formData.videoCoverage ? 'bg-brand-orange text-black shadow-lg shadow-brand-orange/20 scale-110' : 'bg-white/5 text-white'}`}>
                        <Video size={28} />
                      </div>
                      <div>
                        <h4 className="font-monument text-xl text-white group-hover:text-brand-orange transition-colors">Video Coverage</h4>
                        <p className="text-sm text-white/50 mt-1">Multi-camera setup, Lighting, & Technical Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-monument text-xl text-brand-orange/90">+$200<span className="text-sm text-white/40">/hr</span></span>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          name="videoCoverage"
                          checked={formData.videoCoverage}
                          onChange={handleInputChange}
                          className="w-0 h-0 opacity-0 absolute" 
                        />
                        <div className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${formData.videoCoverage ? 'bg-brand-orange' : 'bg-white/10'}`}>
                          <motion.div layout className={`w-6 h-6 rounded-full bg-white shadow-md ${formData.videoCoverage ? 'ml-auto' : ''}`} />
                        </div>
                      </div>
                    </div>
                  </label>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4">
                    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all flex flex-col shadow-inner">
                      <div className="flex items-center gap-3 mb-3">
                        <Scissors className="text-brand-orange" size={24} />
                        <h4 className="font-monument text-sm text-white">Reel (No Subs)</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-6 flex-1">Optimized for IG/TikTok (up to 90 seconds). Raw cut.</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-brand-orange font-monument">+$100<span className="text-[10px] text-white/40">/ea</span></span>
                        <input
                          type="number"
                          name="reelsNoSubs"
                          min="0"
                          value={formData.reelsNoSubs}
                          onChange={handleInputChange}
                          className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-brand-orange transition-all"
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all flex flex-col shadow-inner">
                      <div className="flex items-center gap-3 mb-3">
                        <Film className="text-brand-orange" size={24} />
                        <h4 className="font-monument text-sm text-white">Reel (w/ Subs)</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-6 flex-1">Optimized for IG/TikTok (up to 90 seconds). Burned-in dynamic subtitles.</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-brand-orange font-monument">+$150<span className="text-[10px] text-white/40">/ea</span></span>
                        <input
                          type="number"
                          name="reelsWithSubs"
                          min="0"
                          value={formData.reelsWithSubs}
                          onChange={handleInputChange}
                          className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-brand-orange transition-all"
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all flex flex-col shadow-inner border-t-brand-orange/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="text-brand-orange" size={24} />
                        <h4 className="font-monument text-sm text-white">Full Podcast Edit</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-6 flex-1">Multi-cam switching, color correction, audio mastering. Final output ready for YouTube.</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-brand-orange font-monument">+$300<span className="text-[10px] text-white/40">/ep</span></span>
                        <input
                          type="number"
                          name="fullPodcast"
                          min="0"
                          value={formData.fullPodcast}
                          onChange={handleInputChange}
                          className="w-20 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-white text-center focus:outline-none focus:border-brand-orange transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-8 max-w-2xl mx-auto w-full">
                <div className="text-center mb-10">
                  <h3 className="font-monument text-3xl text-brand-orange mb-2">Almost there!</h3>
                  <p className="text-white/60">Review your final booking details before confirming.</p>
                </div>
                
                <div className="bg-white/5 rounded-2xl p-6 border border-white/10 divide-y divide-white/10">
                  <div className="py-4 flex justify-between items-center">
                    <span className="text-white/50 uppercase tracking-widest text-xs">For</span>
                    <span className="text-white font-monument text-lg">{formData.name}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <span className="text-white/50 uppercase tracking-widest text-xs">Contact</span>
                    <span className="text-white text-lg">{formData.phone}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center">
                    <span className="text-white/50 uppercase tracking-widest text-xs">When</span>
                    <div className="text-right">
                      <div className="text-brand-orange font-monument text-lg">{formData.date} at {formData.startTime}</div>
                      <div className="text-white/50 text-sm">{formData.duration} Hours</div>
                    </div>
                  </div>
                  <div className="py-4">
                    <span className="text-white/50 uppercase tracking-widest text-xs block mb-3">Add-ons</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/80">Video Coverage</span>
                        {formData.videoCoverage ? <span className="text-brand-orange">Yes (+${PRICING.VIDEO_COVERAGE * formData.duration})</span> : <span className="text-white/30">None</span>}
                      </div>
                      {(formData.reelsNoSubs > 0 || formData.reelsWithSubs > 0 || formData.fullPodcast > 0) && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-white/80">Editing Package</span>
                          <span className="text-brand-orange text-right">
                            {formData.reelsNoSubs > 0 ? `${formData.reelsNoSubs}x Reels ` : ""}
                            {formData.reelsWithSubs > 0 ? `${formData.reelsWithSubs}x Pro Reels ` : ""}
                            {formData.fullPodcast > 0 ? `${formData.fullPodcast}x Full Edits` : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-6 flex items-center justify-between shadow-[0_0_30px_rgba(255,107,0,0.1)]">
                  <span className="text-brand-orange uppercase tracking-widest text-sm font-bold">Estimated Total</span>
                  <span className="font-monument text-4xl text-brand-white">${totalPrice}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons footer */}
          <div className="mt-auto pt-8 flex items-center justify-between border-t border-white/5">
            <button
              type="button"
              onClick={prevStep}
              className={`flex items-center gap-2 text-white/50 hover:text-brand-orange transition-colors font-monument uppercase text-xs tracking-widest px-4 py-3 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="submit"
              disabled={isNextDisabled()}
              className="bg-brand-orange hover:bg-orange-500 text-black px-8 py-4 rounded-full font-monument uppercase tracking-wider flex items-center gap-3 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:pointer-events-none"
            >
              {step === 4 ? "Confirm via WhatsApp" : "Next Step"}
              {step === 4 ? <Send size={18} /> : <ArrowRight size={18} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
