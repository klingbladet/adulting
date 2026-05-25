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
    <div className="w-full mb-12 relative">
      {/* Bakgrundslinje */}
      <div className="bg-secondary absolute top-4 left-0 w-full h-1 bg-border-translate-y-1/2 z-0 rounded-full"></div>
      
      {/* Aktiv linje */}
      <div 
        className="absolute top-4 left-0 h-1 bg-primary -translate-y-1/2 z-0 rounded-full"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      ></div>

      <div className="relative z-10 flex justify-between w-full">
        {steps.map((step) => {
          const isActive = currentStep >= step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${isActive ? 'bg-secondary  text-secondary-foreground' : 'bg-background border-border text-muted-foreground'}`}>
                {step.id}
              </div>
              <span className={`text-xs sm:text-sm font-semibold px-2 py-0.5 rounded-full bg-background transition-colors ${isCurrent ? 'text-primary bg-primary/10' : isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}