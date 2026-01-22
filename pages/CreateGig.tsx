import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';
import ReactBitsStepper from '../components/ReactBitsStepper';
import { Step1Job } from '../components/create-gig/Step1Job';
import { Step2Scope } from '../components/create-gig/Step2Scope';
import { Step3Payment } from '../components/create-gig/Step3Payment';
import { SidebarTreasury } from '../components/create-gig/SidebarTreasury';
import { Step4Review } from '../components/create-gig/Step4Review';

export interface GigData {
    jobTitle: string;
    description: string;
    requirements: string[];
    externalLink: string;
    milestones: Array<{ id: number; title: string; deliverables: string }>;
    payment: {
        amount: string;
        walletAddress: string;
        acceptanceWindow: string;
    };
}

const INITIAL_DATA: GigData = {
    jobTitle: '',
    description: '',
    requirements: ['Solidity (3+ Years)', 'Indonesian Resident'],
    externalLink: '',
    milestones: [{ id: 1, title: '', deliverables: '' }],
    payment: {
        amount: '45.000.000',
        walletAddress: '0x71c7656EC7ab88b098deFB751B7401B5f6d8976F',
        acceptanceWindow: '7 Days'
    }
};

export const CreateGig: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [gigData, setGigData] = useState<GigData>(INITIAL_DATA);

    const updateData = (field: keyof GigData, value: any) => {
        setGigData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (currentStep < 4) {
            setCurrentStep(prev => prev + 1);
        } else {
            // Deploy Logic here
            console.log('Deploying Gig:', gigData);
            navigate('/gig-created-success', { state: { data: gigData } });
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else navigate('/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft size={20} className="text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            {currentStep === 1 ? 'Job Details' :
                                currentStep === 2 ? 'Project Scope & Milestones' :
                                    currentStep === 3 ? 'Create Gig Payment' : 'Review & Sign'}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            {currentStep === 1 ? 'Define the core job details and expectations.' :
                                currentStep === 2 ? 'Define clear deliverables and timelines.' :
                                    currentStep === 3 ? 'Secure on-chain escrow for freelancers.' :
                                        'Review all details before deploying.'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                        <span className="text-xs font-mono text-cyan-400">IDR.eth</span>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-900 transition-colors">
                        <Settings size={20} className="text-slate-400" />
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">

                    {/* Stepper Container */}
                    <div className="bg-[#0a0a0a] border border-slate-800 rounded-2xl min-h-[600px] overflow-hidden mb-6 flex flex-col">
                        <div className="p-6 border-b border-slate-800/50">
                            <ReactBitsStepper
                                steps={[
                                    { id: 1, label: 'Job' },
                                    { id: 2, label: 'Scope' },
                                    { id: 3, label: 'Payment' },
                                    { id: 4, label: 'Review' }
                                ]}
                                currentStep={currentStep - 1} // Convert 1-based to 0-based
                                onStepClick={(index) => setCurrentStep(index + 1)} // Convert 0-based to 1-based
                            />
                        </div>

                        <div className="p-6 flex-1">
                            {currentStep === 1 && <Step1Job data={gigData} updateFields={updateData} />}
                            {currentStep === 2 && <Step2Scope milestones={gigData.milestones} updateMilestones={(m) => updateData('milestones', m)} />}
                            {currentStep === 3 && <Step3Payment payment={gigData.payment} updatePayment={(p) => updateData('payment', p)} />}
                            {currentStep === 4 && <Step4Review data={gigData} />}
                        </div>
                    </div>

                    <div className="flex justify-between pt-4">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium"
                        >
                            <ArrowLeft size={18} /> Back
                        </button>

                        <button
                            onClick={handleNext}
                            className={`px-8 py-3 rounded-xl font-bold transition-all ${currentStep === 4
                                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]'
                                : 'bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]'
                                }`}
                        >
                            {currentStep === 4 ? 'Confirm & Deploy' : 'Save & Continue'}
                        </button>
                    </div>
                </div>



                {/* Sidebar Context */}
                <div className="space-y-6">
                    {currentStep === 3 ? (
                        <SidebarTreasury payment={gigData.payment} />
                    ) : (
                        <div className="bg-[#0f172a]/40 border border-slate-800 rounded-2xl p-6">
                            <h4 className="text-sm font-bold text-slate-300 tracking-wider uppercase mb-4">
                                {currentStep === 1 ? 'Creation Progress' :
                                    currentStep === 2 ? 'Scope Guidance' :
                                        'Review Tips'}
                            </h4>
                            <div className="space-y-4">
                                <p className="text-sm text-slate-400 leading-relaxed">
                                    {currentStep === 1 ? 'Define who you are looking for and what the gig entails.' :
                                        currentStep === 2 ? 'Detailed milestones serve as the primary source of truth during dispute resolutions.' :
                                            'Double check all details. Once deployed, the escrow terms are immutable.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};
