// FIX: Replaced placeholder content with a valid React component.
import React from 'react';
import { afterPhotoData } from '../../assets/photo-data';

export const AfterPhotoExample: React.FC = () => (
    <img 
        src={afterPhotoData}
        alt="Example of a photo after being restored and colorized"
        className="w-full h-full object-cover"
    />
);
