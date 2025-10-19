import React from 'react';

export const LogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z" 
        />
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12.75l-1.14-2.28a.75.75 0 00-1.36 0L11.25 12.75l-2.28-1.14a.75.75 0 000 1.36l2.28 1.14 1.14 2.28a.75.75 0 001.36 0l1.14-2.28 2.28 1.14a.75.75 0 000-1.36l-2.28-1.14z"
        />
    </svg>
);