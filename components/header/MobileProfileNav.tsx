import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockUserApi } from '../../lib/mock-api';

export const MobileProfileNav: React.FC = () => {
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string>('');

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const data = await mockUserApi.getProfile();
                if (data.avatarUrl) {
                    setAvatarUrl(data.avatarUrl);
                }
            } catch (error) {
                console.error("Failed to load profile for nav", error);
            }
        };
        loadProfile();
    }, []);

    // If no avatar (or default), show a default placeholder or the fetched one
    const displayAvatar = avatarUrl || '/avatars/alex.png';

    return (
        <button
            onClick={() => navigate('/settings')}
            className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 hover:border-white/50 transition-colors"
        >
            <img
                src={displayAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }}
            />
        </button>
    );
};
