import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "h-10 w-auto", light = false }) => {
  const strokeColor = light ? "#FFFFFF" : "#3B82F6"; // Using the brighter Blue-500 for the main brand color

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <img
        src="/logo-gp.png"
        alt="GigPay Indonesia Logo"
        className="h-full w-auto object-contain"
        style={{ maxHeight: '100%' }}
      />
    </div>
  );
};
