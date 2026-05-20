import React from 'react';

interface StepperProps {
  currentStep: number;
}

export default function CreatorStepper({ currentStep }: StepperProps) {
  const steps = [
    { id: 1, name: 'Struktur' },
    { id: 2, name: 'Innehåll' },
    { id: 3, name: 'Quiz' },
    { id: 4, name: 'Förhandsgranska' },
    { id: 5, name: 'Publicera'}
  ];

  return (
    <div className="w-full mb-8 relative">
      {/* Bakgrundslinje (grå) */}
      <div className="absolute top-4 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
      
      {/* Aktiv linje (blå) */}
      <div 
        className="absolute top-4 left-0 h-1 bg-blue-500 -translate-y-1/2 z-0 rounded-full transition-all duration-500"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      ></div>

      <div className="relative z-10 flex justify-between w-full">
        {steps.map((step) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-300 ${isActive ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>
                {step.id}
              </div>
              <span className={`text-xs sm:text-sm font-medium transition-colors duration-300 bg-white/80 px-1 rounded ${isCurrent ? 'text-blue-600' : isActive ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}