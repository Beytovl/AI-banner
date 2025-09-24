
import React from 'react';
import { GeneratedImage } from '../types';

interface ResultsGalleryProps {
    images: GeneratedImage[];
    isLoading: boolean;
    error: string | null;
    onSelectImage: (url: string) => void;
    selectedImageUrl: string | null;
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ images, isLoading, error, onSelectImage, selectedImageUrl }) => {
    return (
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-gray-700">
            <h3 className="text-lg font-semibold mb-4 text-white border-b border-gray-700 pb-2">Results</h3>
            <div className="flex-grow overflow-y-auto -mr-2 pr-2">
                {isLoading && (
                    <div className="grid grid-cols-2 gap-4 animate-pulse">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="aspect-video bg-gray-700 rounded-lg"></div>
                        ))}
                    </div>
                )}
                {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-lg">{error}</div>}
                {!isLoading && !error && images.length === 0 && (
                    <div className="text-center text-gray-500 h-full flex items-center justify-center">
                        <p>Generated images will be shown here.</p>
                    </div>
                )}
                {!isLoading && images.length > 0 && (
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                className={`relative rounded-lg overflow-hidden cursor-pointer group transition-transform transform hover:scale-105 ${selectedImageUrl === image.url ? 'ring-4 ring-blue-500' : ''}`}
                                onClick={() => onSelectImage(image.url)}
                            >
                                <img src={image.url} alt={image.alt} className="aspect-video object-cover w-full" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <p className="text-white font-bold">Select</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
