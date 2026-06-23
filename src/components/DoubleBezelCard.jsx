import React from 'react';

export const DoubleBezelCard = ({ children, className = "", onClick, delay = "", colSpan = "col-span-1", rowSpan = "row-span-1" }) => {
    return (
        <div 
            onClick={onClick}
            className={`group w-full relative z-10 rounded-[2rem] overflow-hidden ring-1 ring-cream/5 shadow-lg bg-emerald-mid flex flex-col p-6 ${onClick ? 'cursor-pointer active:scale-[0.98] hover:bg-[#1f5540]' : ''} transition-all duration-700 ease-fluid animate-fade-up ${delay} ${colSpan} ${rowSpan} ${className}`}
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        >
            {children}
        </div>
    );
};
