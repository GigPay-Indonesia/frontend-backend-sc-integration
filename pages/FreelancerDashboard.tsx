import React, { useState } from 'react';
import { Button } from '../components/Button';
import { Contract, ContractState } from '../types';
import { DollarSign, Clock, CheckCircle, UploadCloud, Zap } from 'lucide-react';

const initialMyJobs: Contract[] = [
  { id: 'GP-101', title: 'Frontend React Development', freelancerName: 'Me', amount: 15000000, state: ContractState.SUBMITTED, createdAt: '2023-10-25', isYielding: true },
  { id: 'GP-102', title: 'Logo Design & Brand Kit', freelancerName: 'Me', amount: 5000000, state: ContractState.FUNDED, createdAt: '2023-10-27', isYielding: false },
  { id: 'GP-105', title: 'API Integration', freelancerName: 'Me', amount: 2000000, state: ContractState.RELEASED, createdAt: '2023-10-20', isYielding: false },
];

export const FreelancerDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Contract[]>(initialMyJobs);

  const handleSubmitWork = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, state: ContractState.SUBMITTED } : j));
  };

  const totalEarnings = jobs
    .filter(j => j.state === ContractState.RELEASED)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const activeValue = jobs
    .filter(j => j.state !== ContractState.RELEASED && j.state !== ContractState.CREATED)
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 border border-white/5 hover:border-emerald-500/30 transition-all group">
          <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
            <DollarSign size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">Total Earnings</p>
            <h3 className="text-3xl font-bold font-display text-white mt-1">IDR {totalEarnings.toLocaleString()}</h3>
          </div>
        </div>

        <div className="glass-card p-6 rounded-3xl flex items-center gap-5 border border-white/5 hover:border-blue-500/30 transition-all group">
          <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-400 font-medium uppercase tracking-wide">In Escrow (Active)</p>
            <h3 className="text-3xl font-bold font-display text-white mt-1">IDR {activeValue.toLocaleString()}</h3>
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      <section>
        <h2 className="text-2xl font-bold font-display text-white mb-6">My Projects</h2>
        <div className="grid gap-5">
          {jobs.map(job => (
            <div key={job.id} className="glass-card rounded-2xl p-6 border border-white/5 hover:border-white/20 transition-all">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    <StatusBadgeFreelancer state={job.state} />
                  </div>
                  <p className="text-slate-500 text-sm font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                    {job.id}
                  </p>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Value</p>
                    <p className="text-xl font-bold font-mono text-white">IDR {job.amount.toLocaleString()}</p>
                  </div>
                  
                  <div className="min-w-[150px] flex justify-end">
                    {job.state === ContractState.FUNDED && (
                      <Button onClick={() => handleSubmitWork(job.id)} variant="glow" size="sm">
                        <UploadCloud size={16} className="mr-2"/> Submit Work
                      </Button>
                    )}
                    {job.state === ContractState.SUBMITTED && (
                      <div className="text-center bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20">
                        <p className="text-sm font-bold text-blue-400">Under Review</p>
                        {job.isYielding && (
                          <p className="text-[10px] text-emerald-400 font-bold uppercase mt-1 flex items-center justify-center">
                            <Zap size={10} className="mr-1 fill-emerald-400"/> Yield Active
                          </p>
                        )}
                      </div>
                    )}
                    {job.state === ContractState.RELEASED && (
                      <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold flex items-center">
                        <CheckCircle size={16} className="mr-2" /> Paid
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const StatusBadgeFreelancer = ({ state }: { state: ContractState }) => {
  if (state === ContractState.FUNDED) return <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 font-bold">In Progress</span>;
  if (state === ContractState.SUBMITTED) return <span className="text-xs bg-yellow-500/10 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/20 font-bold">Submitted</span>;
  if (state === ContractState.RELEASED) return <span className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-bold">Completed</span>;
  return <span className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded-full border border-slate-700 font-bold">{state}</span>;
}