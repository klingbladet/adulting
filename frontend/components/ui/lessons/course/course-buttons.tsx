import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  fullWidth?: boolean;
}

const CourseButton = ({ 
  children, 
  variant = 'primary', 
  fullWidth = true, 
  className = '', 
  ...props 
  
}: ButtonProps) => {
  
  // Bas-stilar som alla knappar delar
  const baseStyles = "py-4 px-6 rounded-2xl font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2";
  
  // Specifika stilar för dina varianter från designen
  const variants = {
    primary: "bg-[#5D7CFA] text-white hover:bg-[#4A6AEB] shadow-sm",
    secondary: "bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB]",
    outline: "border-2 border-[#5D7CFA] text-[#5D7CFA] hover:bg-[#F0F4FF]"
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default CourseButton;