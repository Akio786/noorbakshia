import React from 'react';

export const DoubleBezelCard = ({ children, className = "", onClick, delay = "", colSpan = "col-span-1", rowSpan = "row-span-1" }) => {
    return (
        <div 
            onClick={onClick}
            className={`group relative p-1.5 rounded-[2rem] bg-emerald-dark ring-1 ring-cream/5 shadow-[inset_0_1px_1px_rgba(245,230,200,0.05)] ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} transition-all duration-700 ease-fluid animate-fade-up ${delay} ${colSpan} ${rowSpan} ${className}`}
        >
            <div className={`w-full h-full rounded-[calc(2rem-0.375rem)] bg-emerald-mid relative overflow-hidden transition-all duration-700 ease-fluid ${onClick ? 'group-hover:bg-[#1f5540]' : ''} flex flex-col p-6`}>
                {children}
            </div>
        </div>
    );
};
