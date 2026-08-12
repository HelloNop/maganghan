import React from "react";
import { Loader2 } from "lucide-react";

export default function InternLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#006761]">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
      <div className="text-center space-y-1">
        <div className="h-4 w-32 bg-gray-200 rounded mx-auto"></div>
        <div className="h-3 w-48 bg-gray-100 rounded mx-auto"></div>
      </div>
    </div>
  );
}
