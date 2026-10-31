import React from 'react';

export const QuantumAuroraBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
      {/* Deep Space Base */}
      <div className="absolute inset-0 bg-[#0A0A1B]" />

      {/* Aurora Radial Glow 1 (Electric Violet) */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[65vw] h-[65vw] rounded-full opacity-25 blur-[120px] animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, #8B5CF6 0%, rgba(139, 92, 246, 0) 70%)',
          animationDuration: '9s'
        }}
      />

      {/* Aurora Radial Glow 2 (Cyan Beam) */}
      <div 
        className="absolute top-[30%] -right-[15%] w-[55vw] h-[55vw] rounded-full opacity-20 blur-[140px] animate-pulse-glow"
        style={{
          background: 'radial-gradient(circle, #22D3EE 0%, rgba(34, 211, 238, 0) 70%)',
          animationDuration: '12s',
          animationDelay: '3s'
        }}
      />

      {/* Aurora Radial Glow 3 (Neon Coral subtle warmth) */}
      <div 
        className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] rounded-full opacity-15 blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #FF6B8A 0%, rgba(255, 107, 138, 0) 70%)',
        }}
      />

      {/* Subtle Grid Lines Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, #8B5CF6 1px, transparent 1px), linear-gradient(to bottom, #8B5CF6 1px, transparent 1px)`,
          backgroundSize: '48px 48px'
        }}
      />
    </div>
  );
};
