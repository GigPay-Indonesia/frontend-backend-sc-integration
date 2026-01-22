import React, { useState } from 'react';
import { Search, SlidersHorizontal, MapPin } from 'lucide-react';
import { JobCard } from '../components/jobs/JobCard';

// Dummy Data
const JOBS_DATA = [
    {
        id: 1,
        title: 'Senior Smart Contract Engineer',
        description: 'We are looking for an experienced Solidity engineer to help build our next-gen DEX aggregator on Base. You will be responsible for optimizing gas usage and implementing complex routing algorithms.',
        budget: '45,000,000',
        tags: ['Solidity', 'DeFi', 'Base'],
        client: 'ApexProtocol',
        clientAvatar: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?q=80&w=200&auto=format&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=800&auto=format&fit=crop',
        postedTime: '2h ago',
        type: 'Fixed Price'
    },
    {
        id: 2,
        title: 'Full Stack Web3 Developer',
        description: 'Seeking a developer to build a niche NFT marketplace art. Needs experience with Next.js, Tailwind, and wagmi integration.',
        budget: '25,000,000',
        tags: ['Next.js', 'NFT', 'Wagmi'],
        client: 'ArtBlock DAO',
        clientAvatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop',
        postedTime: '5h ago',
        type: 'Fixed Price'
    },
    {
        id: 3,
        title: 'Community Manager',
        description: 'Manage our telegram community of 50k+ members. Must be fluent in Indonesian and English with a strong understanding of crypto culture.',
        budget: '8,000,000',
        tags: ['Community', 'Marketing', 'Telegram'],
        client: 'BasePunks',
        clientAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=200&auto=format&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1551817958-c966c429a3e1?q=80&w=800&auto=format&fit=crop',
        postedTime: '1d ago',
        type: 'Hourly'
    },
    {
        id: 4,
        title: 'UI/UX Designer for Fintech',
        description: 'Redesign our lending protocol interface. we need a clean, mobile-first design that simplifies complex DeFi interactions.',
        budget: '15,000,000',
        tags: ['Figma', 'UI/UX', 'Mobile'],
        client: 'LendV2',
        clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop',
        postedTime: '1d ago',
        type: 'Fixed Price'
    },
    {
        id: 5,
        title: 'Security Auditor',
        description: 'Audit our ERC-20 token with custom taxes and anti-bot mechanisms. Deliverable is a comprehensive PDF report.',
        budget: '12,000,000',
        tags: ['Security', 'Audit', 'Smart Contract'],
        client: 'SafeMoon3',
        clientAvatar: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=200&auto=format&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
        postedTime: '2d ago',
        type: 'Fixed Price'
    },
    {
        id: 6,
        title: 'Content Writer for Web3',
        description: 'Write 4 SEO-optimized articles per month about Layer 2 scaling solutions and the Base ecosystem.',
        budget: '5,000,000',
        tags: ['Writing', 'Content', 'SEO'],
        client: 'BaseNews',
        clientAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
        bannerImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=800&auto=format&fit=crop',
        postedTime: '3d ago',
        type: 'Hourly'
    },
];

const FILTERS = ['All Jobs', 'Development', 'Design', 'Marketing', 'Writing'];

import JobDetailsModal from '../components/jobs/JobDetailsModal';

export const Jobs: React.FC = () => {
    const [activeFilter, setActiveFilter] = useState('All Jobs');
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRemoteOnly, setIsRemoteOnly] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [minBudget, setMinBudget] = useState(0);

    // Filter Logic
    const filteredJobs = JOBS_DATA.filter(job => {
        // 1. Search Query
        const matchesSearch =
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            job.client.toLowerCase().includes(searchQuery.toLowerCase());

        // 2. Category Filter
        const matchesCategory = activeFilter === 'All Jobs' ||
            (activeFilter === 'Development' && (job.tags.includes('Solidity') || job.tags.includes('Next.js') || job.tags.includes('Audit'))) ||
            (activeFilter === 'Design' && (job.tags.includes('UI/UX') || job.tags.includes('Figma'))) ||
            (activeFilter === 'Marketing' && (job.tags.includes('Marketing') || job.tags.includes('Community'))) ||
            (activeFilter === 'Writing' && (job.tags.includes('Writing') || job.tags.includes('Content')));

        // 3. Remote Filter
        const matchesRemote = !isRemoteOnly || true;

        // 4. Budget Filter (Simple Implementation)
        const jobBudget = parseInt(job.budget.replace(/,/g, ''));
        const matchesBudget = jobBudget >= minBudget;

        return matchesSearch && matchesCategory && matchesRemote && matchesBudget;
    });

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 animate-fadeIn">
                    <div>
                        <h1 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Explore Gigs
                        </h1>
                        <p className="text-slate-500 mt-2 max-w-lg">
                            Find your next crypto payment opportunity. Secure on-chain work with guaranteed escrow payments.
                        </p>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="sticky top-20 z-30 bg-[#050505]/80 backdrop-blur-md py-4 mb-8 -mx-4 px-4 border-b border-slate-800/50">
                    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search by title, skill, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0a0a0a] border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all shadow-lg"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-6 py-3 border rounded-xl transition-all flex items-center gap-2 font-medium whitespace-nowrap ${showFilters
                                    ? 'bg-slate-800 border-slate-700 text-white'
                                    : 'bg-[#0a0a0a] border-slate-800 text-slate-400 hover:bg-slate-900'
                                }`}
                        >
                            <SlidersHorizontal size={18} /> Filters
                        </button>
                        <button
                            onClick={() => setIsRemoteOnly(!isRemoteOnly)}
                            className={`px-6 py-3 border rounded-xl transition-all flex items-center gap-2 font-medium whitespace-nowrap ${isRemoteOnly
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                    : 'bg-[#0a0a0a] border-slate-800 text-slate-400 hover:bg-slate-900'
                                }`}
                        >
                            <MapPin size={18} /> Remote Only
                        </button>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showFilters && (
                        <div className="max-w-7xl mx-auto mt-4 p-6 bg-[#0a0a0a] border border-slate-800 rounded-2xl animate-fadeInUp shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Min. Budget (IDRX)</h3>
                                    <input
                                        type="range"
                                        min="0"
                                        max="50000000"
                                        step="1000000"
                                        value={minBudget}
                                        onChange={(e) => setMinBudget(parseInt(e.target.value))}
                                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                                        <span>0</span>
                                        <span className="text-cyan-400 font-bold">{minBudget.toLocaleString()}</span>
                                        <span>50M+</span>
                                    </div>
                                </div>
                                {/* Additional filters could go here */}
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Job Type</h3>
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700">Fixed Price</button>
                                        <button className="px-4 py-2 bg-slate-800 rounded-lg text-sm text-slate-300 hover:bg-slate-700">Hourly</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Filter Chips */}
                    <div className="max-w-7xl mx-auto mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {FILTERS.map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                                    : 'bg-transparent border-slate-800 text-slate-500 hover:border-slate-600'
                                    }`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeInUp">
                    {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                            <JobCard
                                key={job.id}
                                title={job.title}
                                description={job.description}
                                budget={job.budget}
                                tags={job.tags}
                                client={job.client}
                                clientAvatar={job.clientAvatar}
                                bannerImage={job.bannerImage}
                                postedTime={job.postedTime}
                                type={job.type as any}
                                onView={() => setSelectedJob(job)}
                            />
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="text-slate-500" size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">No jobs found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setActiveFilter('All Jobs'); setIsRemoteOnly(false); }}
                                className="mt-6 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Job Details Modal */}
            <JobDetailsModal
                isOpen={!!selectedJob}
                onClose={() => setSelectedJob(null)}
                job={selectedJob}
            />
        </div>
    );
};
