import React from 'react';

export default function ContactPage() {
    return (
        <div className="relative min-h-screen bg-[#15110f] overflow-hidden">
            {/* Background Video */}
            <div className="fixed inset-0 w-full h-full z-[1]">
                <video
                    autoPlay
                    playsInline
                    muted
                    loop
                    className="w-full h-full object-cover opacity-60"
                >
                    <source src="https://elektra-nuxt.cdn.prismic.io/elektra-nuxt/Z9_VXXdAxsiBvxU6_Video-contact-comp.mp4" type="video/mp4" />
                </video>
                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#15110f]/80 to-transparent h-[30rem]" />
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#15110f] via-[#15110f]/80 to-transparent h-[30rem]" />
            </div>

            <div className="relative z-[2] min-h-screen pt-32 md:pt-48 pb-12 px-6 md:px-[5rem] flex flex-col justify-between">

                {/* Top/Middle Section */}
                <div className="flex flex-col md:flex-row relative">

                    {/* Main Content Columns (Left aligned) */}
                    <div className="flex flex-col md:flex-row gap-16 md:gap-[5rem] w-full md:w-[60%]">
                        {/* Leadership Column */}
                        <article className="flex flex-col gap-6 w-full md:w-1/2">
                            <h2 className="text-white/60 font-bold text-[12px] md:text-[14px] tracking-widest uppercase mb-4">Leadership</h2>
                            <ul className="flex flex-col gap-8 md:gap-12 text-[#15110f] mix-blend-difference font-bold">
                                <li className="flex flex-col gap-1 mix-blend-difference text-white">
                                    <p className="text-[16px]">Founder & Director</p>
                                    <p className="text-white/60 text-[14px] font-medium">The Simple Krew</p>
                                    <div className="flex gap-4 mt-2 text-[14px] text-brand-orange font-medium">
                                        <a href="mailto:admin@thesimplekrew.com" className="hover:text-white transition-colors border-b border-brand-orange/20 pb-1">admin@thesimplekrew.com</a>
                                    </div>
                                </li>
                                <li className="flex flex-col gap-1 mix-blend-difference text-white">
                                    <p className="text-[16px]">Growth & Strategy</p>
                                    <p className="text-white/60 text-[14px] font-medium">Global Team</p>
                                    <div className="flex gap-4 mt-2 text-[14px] text-brand-orange font-medium">
                                        <a href="mailto:admin@thesimplekrew.com" className="hover:text-white transition-colors border-b border-brand-orange/20 pb-1">admin@thesimplekrew.com</a>
                                    </div>
                                </li>
                            </ul>
                        </article>

                        {/* Markets Column */}
                        <article className="flex flex-col gap-6 w-full md:w-1/2">
                            <h2 className="text-white/60 font-bold text-[12px] md:text-[14px] tracking-widest uppercase mb-4">Markets</h2>
                            <ul className="flex flex-col gap-8 md:gap-[2.5rem] font-bold">
                                <li className="flex flex-col gap-1 mix-blend-difference text-white">
                                    <p className="text-[16px]">Singapore</p>
                                    <p className="text-white/60 text-[14px] font-medium uppercase tracking-wider">APAC HQ</p>
                                    <div className="flex gap-4 mt-2 text-[14px] text-brand-orange font-medium">
                                        <a href="mailto:admin@thesimplekrew.com" className="hover:text-white transition-colors">7 Cuff Road</a>
                                    </div>
                                </li>
                                <li className="flex flex-col gap-1 mix-blend-difference text-white">
                                    <p className="text-[16px]">Malaysia / India</p>
                                    <p className="text-white/60 text-[14px] font-medium uppercase tracking-wider">Regional Hubs</p>
                                    <div className="flex gap-4 mt-2 text-[14px] text-brand-orange font-medium">
                                        <a href="mailto:admin@thesimplekrew.com" className="hover:text-white transition-colors border-b border-brand-orange/20 pb-1">admin@thesimplekrew.com</a>
                                    </div>
                                </li>
                            </ul>
                        </article>
                    </div>

                    {/* Social Links on Right */}
                    <div className="absolute bottom-[-10%] right-0 flex flex-col gap-6 items-end">
                        <div className="flex gap-4">
                            <a href="http://instagram.com/thesimplekrew/" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:text-white transition-colors flex items-center gap-2">
                                <span className="font-monument text-[10px] tracking-widest uppercase hidden md:inline">DM us: @thesimplekrew</span>
                                <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24.095 0H7.905C3.54 0 0 3.54 0 7.905V24.095C0 28.46 3.54 31.995 7.905 32H24.095C28.46 31.995 31.995 28.46 32 24.095V7.905C31.995 3.54 28.46 0.005 24.095 0ZM23.93 10.1C22.805 10.1 21.9 9.19 21.9 8.065C21.9 6.94 22.81 6.035 23.935 6.035C25.06 6.035 25.965 6.945 25.965 8.07C25.965 9.195 25.055 10.1 23.93 10.1ZM16 8.38C20.21 8.38 23.62 11.79 23.62 16C23.62 20.21 20.21 23.62 16 23.62C11.79 23.62 8.38 20.21 8.38 16C8.385 11.795 11.795 8.385 16 8.38Z" />
                                    <path d="M16 20.585C18.53 20.585 20.585 18.53 20.585 16C20.585 13.47 18.53 11.415 16 11.415C13.47 11.415 11.415 13.47 11.415 16C11.415 18.53 13.47 20.58 16 20.585Z" />
                                </svg>
                            </a>
                            <a href="mailto:admin@thesimplekrew.com" className="text-brand-orange hover:text-white transition-colors">
                                <svg width="33" height="30" viewBox="0 0 33 30" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M0.751234 4.36997C0.321311 5.27554 0.769336 6.31115 1.60655 6.83127L13.8118 14.4195C15.4637 15.4505 17.5363 15.4505 19.1882 14.4195L31.398 6.83127C32.2352 6.31115 32.6832 5.27554 32.2533 4.36997C31.0314 1.78328 28.4519 0 25.4605 0H7.53949C4.54813 0 1.9686 1.78328 0.751234 4.36997ZM33 22.2632C33 26.5356 29.624 30 25.456 30H7.53949C3.37603 30 0 26.5356 0 22.2632V13.5557C0 12.6502 0.959408 12.0929 1.71969 12.5619L11.3681 18.5619C14.5224 20.5217 18.4731 20.5217 21.6274 18.5619L31.2848 12.5573C32.0361 12.0882 33.0045 12.6455 33.0045 13.5511V22.2632H33Z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                </div>

                {/* Footer Logo - Text Version */}
                <footer className="w-full mt-32 mb-12 flex-grow flex flex-col items-center justify-center md:justify-start md:items-start gap-4">
                    <h1 className="font-monument leading-[0.9] text-[9vw] md:text-[5vw] outline-none border-none tracking-tighter mix-blend-difference opacity-[0.85] m-0 text-white uppercase">THE SIMPLE KREW<span className="text-brand-orange">.</span></h1>
                    <p className="text-white/50 text-[12px] font-sans">&copy; 2026 The Simple Krew. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
