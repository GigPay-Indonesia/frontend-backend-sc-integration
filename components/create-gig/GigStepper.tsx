import React from 'react';
import { Check } from 'lucide-react';

interface GigStepperProps {
    currentStep: number;
}

const steps = [
    { id: 1, label: 'JOB' },
    { id: 2, label: 'SCOPE' },
    { id: 3, label: 'PAYMENT' },
    { id: 4, label: 'REVIEW' },
];

export const GigStepper: React.FC<GigStepperProps> = ({ currentStep }) => {
    return (
        <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-10 relative">
            {/* Progress Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 transform -translate-y-1/2" />

            {/* Active Progress Line */}
            <div
                className="absolute top-1/2 left-0 h-0.5 bg-cyan-400 -z-10 transform -translate-y-1/2 transition-all duration-500 ease-in-out"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;

                return (
                    <div key={step.id} className="flex flex-col items-center bg-[#0a0a0a] px-2">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isActive
                                    ? 'border-cyan-400 bg-cyan-400 text-black font-bold shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                                    : isCompleted
                                        ? 'border-cyan-400 bg-[#0a0a0a] text-cyan-400'
                                        : 'border-slate-700 bg-[#0a0a0a] text-slate-500'
                                }`}
                        >
                            {isCompleted ? <Check size={18} /> : <span>{step.id}</span>}
                        </div>
                        <span
                            className={`mt-2 text-xs font-bold tracking-wider uppercase ${isActive ? 'text-cyan-400' : isCompleted ? 'text-cyan-400' : 'text-slate-600'
                                }`}
                        >
                            {step.id}. {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
};
