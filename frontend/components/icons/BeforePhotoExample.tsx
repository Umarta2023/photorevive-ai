// FIX: Replaced placeholder content with a valid React component.
import React from 'react';
import { beforePhotoData } from '../../assets/photo-data';

export const BeforePhotoExample: React.FC = () => (
    <img 
        src={beforePhotoData}
        alt="Example of an old, damaged photo before restoration"
        className="w-full h-full object-cover"
    />
);
