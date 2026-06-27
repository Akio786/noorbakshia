import React from 'react';

export const DoubleBezelCard = ({ children, className = "", onClick, delay = "", colSpan = "col-span-1", rowSpan = "row-span-1" }) => {
    return (
        <div 
            onClick={onClick}
            className={`group w-full relative z-10 rounded-[2rem] overflow-hidden border border-cream/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] bg-white/5 flex flex-col p-6 ${onClick ? 'cursor-pointer active:scale-[0.98] hover:bg-white/10' : ''} transition-all duration-700 ease-fluid animate-fade-up ${delay} ${colSpan} ${rowSpan} ${className}`}
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        >
            {children}
        </div>
    );
};
