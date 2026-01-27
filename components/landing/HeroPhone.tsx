import React from 'react';

const HeroPhone: React.FC = () => {
    return (
        <div className="border-[6px] transform transition-transform duration-700 hover:rotate-1 bg-black w-full max-w-[360px] border-[#1a1a1a] ring-white/10 ring-1 rounded-[3.5rem] pt-3 pr-3 pb-3 pl-3 relative shadow-2xl">
            <div className="bg-[#0A0A0A] rounded-[3rem] overflow-hidden aspect-[9/19] relative flex flex-col items-center justify-center">
                <img
                    src="/hero-mobile-frame.png"
                    alt="Mobile App Interface"
                    className="w-full h-full object-cover"
                />
            </div>
        </div>
    );
};

export default HeroPhone;
