import React from "react";
import clsx from "clsx";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: "default" | "flat" | "elevated" | "accent";
}

export function Card({
  children,
  variant = "default",
  className,
  ...props
}: CardProps) {
  const base = "rounded-[24px] p-5 transition-all duration-200";

  const variants = {
    default: "bg-white border border-[#e8e8e8] shadow-sm",
    flat: "bg-[#f3f3f3] border border-transparent",
    elevated: "bg-white shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-transparent",
    accent: "bg-gradient-to-br from-[#006761] to-[#004d48] text-white shadow-lg shadow-[#006761]/20",
  };

  return (
    <div className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}
