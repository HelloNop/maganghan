import React, { forwardRef } from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-[#3d4947]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            "w-full px-4 py-3 bg-[#f5f5f5] text-[#1a1c1c] text-sm rounded-xl border border-transparent transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:bg-white focus:border-[#006761] focus:ring-2 focus:ring-[#006761]/15",
            error && "bg-red-50/50 border-red-500 focus:border-red-500 focus:ring-red-500/15 text-red-900",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs font-medium text-[#ba1a1a] mt-0.5">{error}</p>}
        {!error && helperText && (
          <p className="text-xs text-gray-500 mt-0.5">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
