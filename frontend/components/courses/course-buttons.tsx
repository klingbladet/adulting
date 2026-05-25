import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'third' | 'forth' | 'outline';
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
  const baseStyles = "rounded-4xl flex items-center justify-center gap-2 transition duration-300";
  
  // Specifika stilar för dina varianter från designen
  const variants = {
    primary: "bg-primary text-white py-4 px-6 font-semibold",
    secondary: "bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB] py-4 px-6 font-semibold",
    third: "bg-[#4981F2] text-white hover:bg-[#6696F4] py-4 px-6 font-semibold",
    forth: "bg-[#F3F4F6] text-[#1F2937] hover:bg-[#E5E7EB]",
    outline: "border-2 border-[#5D7CFA] text-[#5D7CFA] hover:bg-[#F0F4FF] py-4 px-6 font-semibold"
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