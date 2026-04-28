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
  ? "cursor-pointer hover:border-[##5D7CFA] hover:shadow-md transition-all active:scale-[0.98]"
  : "";

  return(
    <div
      onClick={isClickable ? onClick : undefined}
      className={`flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl shadow-sm w-full ${interactiveStyles}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full text-gray-500 flex-shrink-0">
          {icon}
        </div>
        <div className="flex flex-col">
          <h3 className="font-semibold text-[#1F2937] text-base">{title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      {isClickable && (
        <div className="text-gray-400">
          <ChevronRight size={20} /> 
        </div>
      )}
    </div>
  );
};

export default StepCard;