"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Clock, Send, Users, Video, Film, Scissors, ArrowRight, ArrowLeft, CheckCircle2, Lock } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface StudioConfig {
  baseRate: number;
  minHours: number;
  videoCoverage: number;
  reelNoSubs: number;
  reelWithSubs: number;
  fullPodcast: number;
  whatsappNumber: string;
  contactEmail?: string;
  timeSlots: string[];
}

const STEPS = [
  { id: 1, title: "Your Details" },
  { id: 2, title: "Schedule" },
  { id: 3, title: "Services" },
  { id: 4, title: "Review" },
];

export default function BookingForm({ config }: { config: StudioConfig }) {
  const { baseRate, minHours, videoCoverage, reelNoSubs, reelWithSubs, fullPodcast, whatsappNumber, contactEmail, timeSlots } = config;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [lockedSlots, setLockedSlots] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    date: "",
    startTime: "", // Initially empty to force selection or handle explicitly
    duration: minHours,
    videoCoverage: false,
    reelsNoSubs: 0,
    reelsWithSubs: 0,
    fullPodcast: 0,
  });

  // Fetch locked slots from Express when date changes
  useEffect(() => {
    if (!formData.date) { setLockedSlots([]); return; }
    fetch(`${API_BASE}/api/availability?date=${formData.date}`)
      .then((r) => r.json())
      .then((d) => {
        const locked = d.lockedSlots || [];
        setLockedSlots(locked);
        
        // If current startTime is locked, or if startTime is not selected, try to find first available
        if (!formData.startTime || locked.includes(formData.startTime)) {
          const firstAvailable = timeSlots.find(s => !locked.includes(s));
          if (firstAvailable) setFormData(prev => ({ ...prev, startTime: firstAvailable }));
        }
      })
      .catch(() => setLockedSlots([]));
  }, [formData.date, timeSlots]);

  const isAllSlotsFull = formData.date && lockedSlots.length >= timeSlots.length;

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
    const baseCost = formData.duration * baseRate;
    const videoCost = formData.videoCoverage ? formData.duration * videoCoverage : 0;
    const reelsNoSubsCost = formData.reelsNoSubs * reelNoSubs;
    const reelsWithSubsCost = formData.reelsWithSubs * reelWithSubs;
    const fullPodcastCost = formData.fullPodcast * fullPodcast;
    return baseCost + videoCost + reelsNoSubsCost + reelsWithSubsCost + fullPodcastCost;
  }, [formData, baseRate, videoCoverage, reelNoSubs, reelWithSubs, fullPodcast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 4) {
      if (!isNextDisabled()) nextStep();
      return;
    }

    setSubmitting(true);

    // Save to MongoDB
    try {
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, totalPrice }),
      });
    } catch (err) {
      console.warn("Could not save booking to DB:", err);
      // Don't block the WhatsApp redirect if DB fails
    }

    // Construct WhatsApp Message
    const text = `*New Studio Booking Request*%0A%0A*Name:* ${formData.name}%0A*Phone:* ${formData.phone}%0A*Date:* ${formData.date}%0A*Time:* ${formData.startTime}%0A*Duration:* ${formData.duration} Hours%0A%0A*Packages Selected:*%0A- Studio Rental (${formData.duration}hrs)%0A- Video Coverage: ${formData.videoCoverage ? "Yes" : "No"}%0A- Reels (No Subs): ${formData.reelsNoSubs}%0A- Reels (With Subs): ${formData.reelsWithSubs}%0A- Full Podcast Edit: ${formData.fullPodcast}%0A%0A*Total Estimate:* $${totalPrice}`;

    // Clean number: remove any non-digit chars (spaces, +, -, etc)
    const cleanNumber = whatsappNumber.replace(/\D/g, "");
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${text}`;
    setSubmitting(false);
    window.open(whatsappUrl, "_blank");
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const isNextDisabled = () => {
    if (step === 1 && (!formData.name || !formData.phone)) return true;
    if (step === 2) {
      if (!formData.date || !formData.startTime || lockedSlots.includes(formData.startTime)) return true;
    }
    return false;
  };

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
        
        {/* Added Contact Details Block */}
        <div className="mt-6 flex flex-wrap justify-center gap-6 md:gap-12">
           <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-brand-orange hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-black transition-all">
                <Send size={14} />
              </div>
              <span className="font-monument text-[10px] tracking-widest uppercase truncate max-w-[150px] sm:max-w-none">WhatsApp: {whatsappNumber}</span>
           </a>
           <a href={`mailto:${contactEmail}`} className="flex items-center gap-2 text-brand-orange hover:text-white transition-colors group">
              <div className="w-8 h-8 rounded-full bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange group-hover:text-black transition-all">
                <Users size={14} />
              </div>
              <span className="font-monument text-[10px] tracking-widest uppercase">Email: {contactEmail}</span>
           </a>
        </div>
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-[radial-gradient(circle_at_center,rgba(255,107,0,0.1)_0%,transparent_70%)] rounded-full pointer-events-none" />

        <form onSubmit={handleSubmit} className="p-6 md:p-12 h-full flex flex-col">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" variants={slideVariants} initial="hidden" animate="visible" exit="exit" className="flex-1 space-y-8">
                <div className="text-center mb-8">
                  <h3 className="font-monument text-2xl text-white">Let&apos;s get introduced</h3>
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
                  <p className="text-white/50 text-sm mt-2">Select a date, a slot, and total duration.</p>
                  
                  {isAllSlotsFull && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-monument uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Lock size={14} /> This date is currently full
                    </motion.div>
                  )}
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
                        <span className="text-white/40 normal-case tracking-normal">Min. {minHours} hours (${baseRate}/hr)</span>
                      </label>
                      <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-2 hover:bg-white/10 transition-all focus-within:border-brand-orange">
                        <input
                          required
                          type="number"
                          name="duration"
                          min={minHours}
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
                      {timeSlots.map((slot) => {
                        const isBooked = lockedSlots.includes(slot);
                        const isSelected = formData.startTime === slot;
                        
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => !isBooked && setFormData({ ...formData, startTime: slot })}
                            className={`py-5 px-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                              isBooked 
                                ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed opacity-50" 
                                : isSelected
                                  ? "bg-brand-orange border-brand-orange text-black scale-[1.03] shadow-lg shadow-brand-orange/20 z-10"
                                  : "bg-white/5 border-white/10 text-white hover:border-brand-orange/50 hover:bg-white/10"
                            }`}
                          >
                            <span className="font-monument text-sm">{slot}</span>
                            {isBooked ? (
                              <span className="flex items-center gap-1 text-[9px] uppercase font-bold tracking-widest text-red-400">
                                <Lock size={8} /> Booked
                              </span>
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
                  <label className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-2xl border transition-all cursor-pointer group bg-gradient-to-r from-white/5 to-transparent hover:from-white/10 hover:border-brand-orange/50 gap-4">
                    <div className="flex items-center gap-4 sm:gap-6">
                      <div className={`p-3 sm:p-4 rounded-xl flex items-center justify-center transition-all ${formData.videoCoverage ? 'bg-brand-orange text-black shadow-lg shadow-brand-orange/20 scale-110' : 'bg-white/5 text-white'}`}>
                        <Video size={24} className="sm:w-[28px] sm:h-[28px]" />
                      </div>
                      <div>
                        <h4 className="font-monument text-lg sm:text-xl text-white group-hover:text-brand-orange transition-colors">Video Coverage</h4>
                        <p className="text-xs sm:text-sm text-white/50 mt-1">Multi-camera setup, Lighting, &amp; Technical Operator</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 sm:gap-8 pt-4 sm:pt-0 border-t border-white/5 sm:border-t-0">
                      <span className="font-monument text-lg sm:text-xl text-brand-orange/90">
                        +${videoCoverage}<span className="text-[10px] sm:text-sm text-white/40">/hr</span>
                      </span>
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          name="videoCoverage"
                          checked={formData.videoCoverage}
                          onChange={handleInputChange}
                          className="w-0 h-0 opacity-0 absolute" 
                        />
                        <div className={`w-12 sm:w-14 h-7 sm:h-8 rounded-full transition-colors flex items-center px-1 ${formData.videoCoverage ? 'bg-brand-orange' : 'bg-white/10'}`}>
                          <motion.div layout className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full bg-white shadow-md ${formData.videoCoverage ? 'ml-auto' : ''}`} />
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
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <span className="text-brand-orange font-monument text-sm whitespace-nowrap">+${reelNoSubs}<span className="text-[10px] text-white/40">/ea</span></span>
                        <input
                          type="number"
                          name="reelsNoSubs"
                          min="0"
                          value={formData.reelsNoSubs}
                          onChange={handleInputChange}
                          className="w-16 sm:w-20 bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-white text-center focus:outline-none focus:border-brand-orange transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all flex flex-col shadow-inner">
                      <div className="flex items-center gap-3 mb-3">
                        <Film className="text-brand-orange" size={24} />
                        <h4 className="font-monument text-sm text-white">Reel (w/ Subs)</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-6 flex-1">Optimized for IG/TikTok (up to 90 seconds). Burned-in dynamic subtitles.</p>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <span className="text-brand-orange font-monument text-sm whitespace-nowrap">+${reelWithSubs}<span className="text-[10px] text-white/40">/ea</span></span>
                        <input
                          type="number"
                          name="reelsWithSubs"
                          min="0"
                          value={formData.reelsWithSubs}
                          onChange={handleInputChange}
                          className="w-16 sm:w-20 bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-white text-center focus:outline-none focus:border-brand-orange transition-all text-sm"
                        />
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/[0.07] transition-all flex flex-col shadow-inner border-t-brand-orange/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Users className="text-brand-orange" size={24} />
                        <h4 className="font-monument text-sm text-white">Full Podcast Edit</h4>
                      </div>
                      <p className="text-xs text-white/50 mb-6 flex-1">Multi-cam switching, color correction, audio mastering. Final output ready for YouTube.</p>
                      <div className="flex items-center justify-between mt-auto gap-2">
                        <span className="text-brand-orange font-monument text-sm whitespace-nowrap">+${fullPodcast}<span className="text-[10px] text-white/40">/ep</span></span>
                        <input
                          type="number"
                          name="fullPodcast"
                          min="0"
                          value={formData.fullPodcast}
                          onChange={handleInputChange}
                          className="w-16 sm:w-20 bg-black/50 border border-white/10 rounded-lg px-2 sm:px-3 py-2 text-white text-center focus:outline-none focus:border-brand-orange transition-all text-sm"
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
                  <div className="py-4 flex justify-between items-center gap-4">
                    <span className="text-white/50 uppercase tracking-widest text-[10px] sm:text-xs shrink-0">For</span>
                    <span className="text-white font-monument text-sm sm:text-lg text-right break-words">{formData.name}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center gap-4">
                    <span className="text-white/50 uppercase tracking-widest text-[10px] sm:text-xs shrink-0">Contact</span>
                    <span className="text-white text-sm sm:text-lg text-right break-words">{formData.phone}</span>
                  </div>
                  <div className="py-4 flex justify-between items-center gap-4">
                    <span className="text-white/50 uppercase tracking-widest text-[10px] sm:text-xs shrink-0">When</span>
                    <div className="text-right">
                      <div className="text-brand-orange font-monument text-sm sm:text-lg">{formData.date} at {formData.startTime}</div>
                      <div className="text-white/50 text-xs sm:text-sm">{formData.duration} Hours</div>
                    </div>
                  </div>
                  <div className="py-4">
                    <span className="text-white/50 uppercase tracking-widest text-xs block mb-3">Add-ons</span>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-white/80">Video Coverage</span>
                        {formData.videoCoverage ? <span className="text-brand-orange">Yes (+${videoCoverage * formData.duration})</span> : <span className="text-white/30">None</span>}
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

                <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_30px_rgba(255,107,0,0.1)]">
                  <span className="text-brand-orange uppercase tracking-widest text-sm font-bold">Estimated Total</span>
                  <span className="font-monument text-3xl sm:text-4xl text-brand-white">${totalPrice}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons footer */}
          <div className="mt-auto pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5">
            <button
              type="button"
              onClick={prevStep}
              className={`flex items-center gap-2 text-white/50 hover:text-brand-orange transition-colors font-monument uppercase text-[10px] tracking-widest px-4 py-2 sm:py-3 ${step === 1 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span><span className="sm:hidden">Back</span>
            </button>
            <button
              type="submit"
              disabled={isNextDisabled() || submitting}
              className="w-full sm:w-auto bg-brand-orange hover:bg-orange-500 text-black px-4 sm:px-8 py-4 rounded-full font-monument uppercase tracking-wider flex items-center justify-center gap-2 sm:gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:pointer-events-none text-[9px] sm:text-xs min-h-[50px] sm:min-h-[56px]"
            >
              <span className="whitespace-nowrap">{submitting ? "Saving..." : step === 4 ? "Confirm via WhatsApp" : "Next Step"}</span>
              {step === 4 ? <Send size={14} className="sm:w-[18px] sm:h-[18px]" /> : <ArrowRight size={14} className="sm:w-[18px] sm:h-[18px]" />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
