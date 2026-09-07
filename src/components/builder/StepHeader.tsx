import React from 'react';
import { Check } from 'lucide-react';
import { useQuotation } from '../../context/QuotationContext';

export const StepHeader: React.FC = () => {
  const { activeStep, setActiveStep } = useQuotation();

  const steps = [
    { number: 1, title: 'Home Type' },
    { number: 2, title: 'Scope of Work' },
    { number: 3, title: 'Packages & Export' },
  ];

  return (
    <div className="flex flex-col items-center justify-center pt-2 pb-6">
      
      {/* Wizard Step Indicator matching Screenshot */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs font-semibold">
        {steps.map((step, idx) => {
          const isCompleted = step.number < activeStep;
          const isActive = step.number === activeStep;

          return (
            <React.Fragment key={step.number}>
              {idx > 0 && (
                <div
                  className={`w-8 sm:w-16 h-0.5 rounded-full transition-colors ${
                    step.number <= activeStep ? 'bg-rose-500' : 'bg-slate-200'
                  }`}
                />
              )}

              <button
                onClick={() => setActiveStep(step.number as 1 | 2 | 3)}
                className="flex items-center gap-1.5 focus:outline-none group"
              >
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                    isCompleted
                      ? 'bg-rose-500 text-white shadow-xs'
                      : isActive
                      ? 'bg-rose-600 text-white ring-4 ring-rose-100 shadow-xs'
                      : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.number}
                </div>
                <span
                  className={`transition-colors whitespace-nowrap ${
                    isActive
                      ? 'text-rose-600 font-bold'
                      : isCompleted
                      ? 'text-slate-800 font-semibold'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  {step.title}
                </span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
};
