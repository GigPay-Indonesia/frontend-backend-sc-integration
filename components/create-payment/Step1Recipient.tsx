import { Mail, User, Hash, Globe, Clock } from 'lucide-react';
import { PaymentData } from '../../pages/CreatePayment';
import { ENTITY_OPTIONS, EntityType } from './entityConfig';

interface Step1Props {
    data: PaymentData;
    updateFields: (field: keyof PaymentData, value: any) => void;
    onEntityTypeChange: (type: EntityType) => void;
}

export const Step1Recipient: React.FC<Step1Props> = ({ data, updateFields, onEntityTypeChange }) => {
    const { identity } = data.recipient;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Display Name
                </label>
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={identity.displayName}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, identity: { ...identity, displayName: e.target.value } })}
                        placeholder="e.g. Nusa Creative Studio"
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Entity Type
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {ENTITY_OPTIONS.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => onEntityTypeChange(type.id)}
                                className={`cursor-pointer rounded-xl border p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${identity.entityType === type.id
                                    ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_0_15px_-3px_rgba(0,82,255,0.3)]'
                                    : 'bg-[#0f172a]/30 border-slate-800 text-slate-400 hover:bg-[#0f172a]/50 hover:border-slate-700'
                                    }`}
                            >
                                <type.icon size={18} />
                                <span className="text-xs font-semibold">{type.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Legal Name
                    </label>
                    <input
                        type="text"
                        value={identity.legalName}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, identity: { ...identity, legalName: e.target.value } })}
                        placeholder="Legal entity name"
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recipient Email
                </label>
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="email"
                        value={identity.email}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, identity: { ...identity, email: e.target.value } })}
                        placeholder="finance@company.com"
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Country / Jurisdiction
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            value={identity.country}
                            onChange={(e) => updateFields('recipient', { ...data.recipient, identity: { ...identity, country: e.target.value } })}
                            placeholder="Indonesia"
                            className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Timezone
                    </label>
                    <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                        <input
                            type="text"
                            value={identity.timezone}
                            onChange={(e) => updateFields('recipient', { ...data.recipient, identity: { ...identity, timezone: e.target.value } })}
                            placeholder="Asia/Jakarta"
                            className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Internal Reference ID
                </label>
                <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <input
                        type="text"
                        value={identity.referenceId}
                        onChange={(e) => updateFields('recipient', { ...data.recipient, identity: { ...identity, referenceId: e.target.value } })}
                        placeholder="Optional reference"
                        className="w-full bg-[#0f172a]/50 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:border-primary/50 transition-all font-medium"
                    />
                </div>
            </div>
        </div>
    );
};
