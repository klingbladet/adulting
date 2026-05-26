'use client';

import React from "react"
import { ChevronRight } from 'lucide-react';


interface BlockCardProps {
  variant?: 'primary' | 'secondary';
  icon: React.ReactNode;
  title: string;
  time?: string | number | null;
  steps?: number | null;
  description?: string;
  isClickable?: boolean;
  onClick?: () => void;
  className?: string;
  badge?: React.ReactNode;
}

const BlockCard = ({
  variant = 'primary',
  icon,
  title,
  time,
  steps,
  description,
  isClickable = true,
  onClick,
  className,
  badge
}: BlockCardProps) => {
  const interactiveStyles = isClickable
    ? "text-primary cursor-pointer hover:border-secondary-800 hover:border-2 transition-all active:scale-[0.98]"
    : "";

  const details = [];
  if (time) details.push(typeof time === 'number' ? `${time} min` : time);
  if (steps !== undefined && steps !== null) details.push(`${steps} steg`);

  const variants = {
    primary: "bg-secondary text-white rounded-2xl",
    secondary: "bg-overview-box text-[#1F2937] hover:bg-overview-hover transition duration-300",
  };

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between p-4 border-border w-full ${interactiveStyles} ${variants[variant]} ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-5 h-5 bg-background rounded-full text-secondary-foreground shrink-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground text-sm">{title}</h3>
          {badge && badge}
        </div>
      </div>
      {isClickable && (
        <div className="text-secondary-foreground">
          <ChevronRight size={20} />
        </div>
      )}
    </div>
  );
};



export default BlockCard;
