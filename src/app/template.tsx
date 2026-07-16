"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

import { ROUTE_COVER_EVENT } from "@/lib/route-cover";

export default function RouteTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [covering, setCovering] = useState(false);

  useEffect(() => {
    setCovering(false);
  }, [pathname]);

  useEffect(() => {
    const onCover = () => setCovering(true);
    window.addEventListener(ROUTE_COVER_EVENT, onCover);
    return () => window.removeEventListener(ROUTE_COVER_EVENT, onCover);
  }, []);

  return (
    <>
      {/* Independent Solid Black Transition Curtain */}
      <motion.div
        key={`fade-curtain-${pathname}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: covering ? 1 : 0 }}
        exit={{ opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: [0.25, 1, 0.5, 1], // Stable, linear-deceleration curve
        }}
        className="fixed inset-0 w-screen h-screen bg-black z-50 pointer-events-none transform-gpu"
      />

      {/* Core Page Render Output */}
      <div className="w-full relative z-10">
        {children}
      </div>
    </>
  );
}
