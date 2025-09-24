
// FIX: Add useCallback to react imports
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from 'react';
import { PlaceholderIcon } from './icons/PlaceholderIcon';

interface WorkspaceProps {
    baseImage: string | null;
    logoImage: string | null;
    width: number;
    height: number;
}

interface DraggableLogoProps {
    logoImage: string;
    containerRef: React.RefObject<HTMLDivElement>;
}

const DraggableLogo: React.FC<DraggableLogoProps> = ({ logoImage, containerRef }) => {
    const [position, setPosition] = useState({ x: 10, y: 10 });
    const [size, setSize] = useState({ width: 100, height: 100 });
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        dragRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        e.preventDefault();
    };

    const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        setIsResizing(true);
        dragRef.current = { x: e.clientX, y: e.clientY };
        e.stopPropagation();
        e.preventDefault();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();

        if (isDragging) {
            let newX = e.clientX - dragRef.current.x;
            let newY = e.clientY - dragRef.current.y;
            newX = Math.max(0, Math.min(newX, containerRect.width - size.width));
            newY = Math.max(0, Math.min(newY, containerRect.height - size.height));
            setPosition({ x: newX, y: newY });
        }
        if (isResizing) {
            const dx = e.clientX - dragRef.current.x;
            const dy = e.clientY - dragRef.current.y;
            let newWidth = size.width + dx;
            let newHeight = size.height + dy;

            // Maintain aspect ratio
            const img = new Image();
            img.src = logoImage;
            if(img.width > 0 && img.height > 0) {
                 newHeight = newWidth * (img.height / img.width);
            }
            
            newWidth = Math.max(20, Math.min(newWidth, containerRect.width - position.x));
            newHeight = Math.max(20, Math.min(newHeight, containerRect.height - position.y));

            setSize({ width: newWidth, height: newHeight });
            dragRef.current = { x: e.clientX, y: e.clientY };
        }
    }, [isDragging, isResizing, position.x, position.y, size.width, size.height, containerRef, logoImage]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        setIsResizing(false);
    }, []);
    
    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    return (
        <div
            className="absolute cursor-move border-2 border-dashed border-blue-400/70"
            style={{ left: position.x, top: position.y, width: size.width, height: size.height }}
            onMouseDown={handleMouseDown}
        >
            <img src={logoImage} alt="Logo" className="w-full h-full object-contain" draggable="false" />
            <div
                className="absolute -right-1 -bottom-1 w-4 h-4 bg-blue-500 rounded-full cursor-se-resize border-2 border-gray-900"
                onMouseDown={handleResizeMouseDown}
            />
        </div>
    );
};

export const Workspace = forwardRef<{ download: () => void }, WorkspaceProps>(({ baseImage, logoImage, width, height }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [logoElement, setLogoElement] = useState<HTMLElement | null>(null);

    useImperativeHandle(ref, () => ({
        download: () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container || !baseImage) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const bannerImg = new Image();
            bannerImg.crossOrigin = "anonymous";
            bannerImg.onload = () => {
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(bannerImg, 0, 0, width, height);

                if (logoImage && logoElement) {
                    const logoImg = new Image();
                    logoImg.crossOrigin = "anonymous";
                    logoImg.onload = () => {
                        const containerRect = container.getBoundingClientRect();
                        const scaleX = canvas.width / containerRect.width;
                        const scaleY = canvas.height / containerRect.height;
                        
                        const logoRect = logoElement.getBoundingClientRect();
                        const logoX = (logoRect.left - containerRect.left) * scaleX;
                        const logoY = (logoRect.top - containerRect.top) * scaleY;
                        const logoWidth = logoRect.width * scaleX;
                        const logoHeight = logoRect.height * scaleY;

                        ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

                        const link = document.createElement('a');
                        link.download = 'banner.png';
                        link.href = canvas.toDataURL('image/png');
                        link.click();
                    };
                    logoImg.src = logoImage;
                } else {
                     const link = document.createElement('a');
                     link.download = 'banner.png';
                     link.href = canvas.toDataURL('image/png');
                     link.click();
                }
            };
            bannerImg.src = baseImage;
        }
    }));
    
    useEffect(() => {
        if(containerRef.current) {
            const logoEl = containerRef.current.querySelector('.absolute.cursor-move') as HTMLElement;
            setLogoElement(logoEl);
        }
    }, [logoImage, baseImage]);

    return (
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-2xl p-4 flex-grow flex items-center justify-center border border-gray-700">
            <div ref={containerRef} className="relative w-full h-full max-w-full max-h-[60vh]" style={{ aspectRatio: `${width || 16} / ${height || 9}` }}>
                {baseImage ? (
                    <img src={baseImage} alt="Workspace" className="object-contain w-full h-full" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-600 rounded-lg">
                        <PlaceholderIcon className="w-16 h-16 mb-4"/>
                        <p className="text-lg font-semibold">Your Banner Will Appear Here</p>
                        <p className="text-sm">Generate a new banner or upload an image to start.</p>
                    </div>
                )}
                {logoImage && baseImage && <DraggableLogo logoImage={logoImage} containerRef={containerRef} />}
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
    );
});
