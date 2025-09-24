import React, { useState, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { ControlPanel } from './components/ControlPanel';
import { Workspace } from './components/Workspace';
import { ResultsGallery } from './components/ResultsGallery';
import { generateBannerFromPrompt, editBannerWithPrompt, resizeImageSmart } from './services/geminiService';
import { BannerSettings, GeneratedImage, Template } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

const App: React.FC = () => {
    const [settings, setSettings] = useState<BannerSettings>({
        prompt: '',
        width: 792,
        height: 352,
        brandColors: [],
        numberOfImages: 1,
    });
    const [baseImage, setBaseImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [templates, setTemplates] = useLocalStorage<Template[]>('banner-templates', []);

    const workspaceRef = useRef<{ download: () => void }>(null);

    const handleGenerate = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImage(null);

        try {
            let results: GeneratedImage[];
            if (baseImage) {
                results = await editBannerWithPrompt(baseImage, settings.prompt, settings.brandColors, settings.numberOfImages);
            } else {
                results = await generateBannerFromPrompt(settings);
            }
            setGeneratedImages(results);
            if (results.length > 0) {
                setSelectedImage(results[0].url);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [baseImage, settings]);

    const handleSmartResize = useCallback(async () => {
        if (!baseImage) {
            setError("Please upload an image to resize first.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedImages([]);
        setSelectedImage(null);

        try {
            const results = await resizeImageSmart(baseImage, settings.width, settings.height);
            setGeneratedImages(results);
            if (results.length > 0) {
                setSelectedImage(results[0].url);
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [baseImage, settings.width, settings.height]);

    const handleDownload = () => {
        workspaceRef.current?.download();
    };

    const handleSelectImage = (url: string) => {
        setSelectedImage(url);
    };

    const handleSaveTemplate = () => {
        const name = prompt("Enter a name for this template:");
        if (name) {
            const newTemplate: Template = { id: Date.now().toString(), name, settings };
            setTemplates([...templates, newTemplate]);
        }
    };
    
    const handleLoadTemplate = (template: Template) => {
        setSettings(template.settings);
    };

    const handleDeleteTemplate = (id: string) => {
        setTemplates(templates.filter(t => t.id !== id));
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col">
            <Header />
            <main className="flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
                <div className="lg:col-span-3">
                    <ControlPanel
                        settings={settings}
                        setSettings={setSettings}
                        baseImage={baseImage}
                        setBaseImage={(img) => {
                            setBaseImage(img);
                            setSelectedImage(img);
                        }}
                        setLogoImage={setLogoImage}
                        onGenerate={handleGenerate}
                        onSmartResize={handleSmartResize}
                        isLoading={isLoading}
                        templates={templates}
                        onSaveTemplate={handleSaveTemplate}
                        onLoadTemplate={handleLoadTemplate}
                        onDeleteTemplate={handleDeleteTemplate}
                    />
                </div>
                <div className="lg:col-span-6 flex flex-col gap-4">
                     <Workspace
                        ref={workspaceRef}
                        baseImage={selectedImage}
                        logoImage={logoImage}
                        width={settings.width}
                        height={settings.height}
                     />
                     <div className="flex justify-end">
                        <button
                            onClick={handleDownload}
                            disabled={!selectedImage}
                            className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                            Download Banner
                        </button>
                    </div>
                </div>
                <div className="lg:col-span-3">
                    <ResultsGallery
                        images={generatedImages}
                        isLoading={isLoading}
                        error={error}
                        onSelectImage={handleSelectImage}
                        selectedImageUrl={selectedImage}
                    />
                </div>
            </main>
        </div>
    );
};

export default App;