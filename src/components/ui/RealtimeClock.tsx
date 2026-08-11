"use client";

import React, { useState, useEffect } from "react";

export function RealtimeClock() {
  const [timeStr, setTimeStr] = useState<string>("--:--:--");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("id-ID", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };

    updateTime(); // Initial update on client mount
    const timer = setInterval(updateTime, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-4xl font-extrabold text-[#006761] tracking-tight mb-1 font-mono">
      {timeStr}
    </div>
  );
}
