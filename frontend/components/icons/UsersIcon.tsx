import React from 'react';

export const UsersIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
            d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962c.51.056 1.02.086 1.5.086m-1.5 0c-.51 0-1.02-.03-1.5-.086m0 0a7.5 7.5 0 100-11.254.75.75 0 01.04 1.124l-1.5 1.5a.75.75 0 01-1.06 0l-1.5-1.5a.75.75 0 01.04-1.124 7.5 7.5 0 0011.254 0A7.5 7.5 0 0018 18.72z"
        />
    </svg>
);