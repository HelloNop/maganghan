"use client";

import React from "react";
import clsx from "clsx";

interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeKey: string;
  onChange: (key: string) => void;
}

export function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex items-center gap-1 bg-[#f3f3f3] p-1 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={clsx(
            "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 whitespace-nowrap",
            activeKey === tab.key
              ? "bg-white text-[#006761] shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={clsx(
                "ml-1.5 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold rounded-full",
                activeKey === tab.key
                  ? "bg-[#006761]/10 text-[#006761]"
                  : "bg-gray-200/70 text-gray-500"
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
