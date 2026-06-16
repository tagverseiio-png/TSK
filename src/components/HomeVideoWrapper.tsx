"use client";

import dynamic from "next/dynamic";

const HomeVideo = dynamic(() => import("./HomeVideo"), { ssr: false });

export default function HomeVideoWrapper() {
    return <HomeVideo />;
}
