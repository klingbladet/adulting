'use client';

import React from "react"
import { ChevronRight } from 'lucide-react';


interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isClickable?: boolean;
  onClick?: () => void;
}

const StepCard = ({
  icon,
  title,
  description,
  isClickable = true,
  onClick
}: StepCardProps) => {
  const interactiveStyles = isClickable
  ? "cursor-pointer hover:border-primary hover:shadow-md transition-all active:scale-[0.98]"
  : "";

  return(
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between p-4 bg-secondary border-border rounded-2xl shadow-sm w-full ${interactiveStyles}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-background rounded-full text-secondary-foreground shrink-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-foreground text-base">{title}</h3>
          <p className="text-sm text-foreground mt-0.5">{description}</p>
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



export default StepCard;