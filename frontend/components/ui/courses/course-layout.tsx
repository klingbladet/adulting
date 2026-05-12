'use client';

import React from "react"
import { ChevronRight } from 'lucide-react';


interface BlockCardProps {
  icon: React.ReactNode;
  title: string;
  time?: string | number | null;
  description?: string;
  isClickable?: boolean;
  onClick?: () => void;
}

const BlockCard = ({
  icon,
  title,
  time,
  description,
  isClickable = true,
  onClick
}: BlockCardProps) => {
  const interactiveStyles = isClickable
  ? "cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-[0.98]"
  : "";

  const displaySubtitle = description || (typeof time === 'number' ? `${time} min` : time);

  return(
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between p-4 bg-secondary border-border rounded-2xl shadow-sm w-full ${interactiveStyles}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-6 h-6 bg-background rounded-full text-secondary-foreground shrink-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground text-base">{title}</h3>
          {displaySubtitle && (
            <p className="text-sm text-foreground mt-0.5">{displaySubtitle}</p>
          )}
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
