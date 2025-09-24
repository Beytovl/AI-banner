import React, { useState } from 'react';
import { BannerSettings, Template } from '../types';
import { UploadIcon } from './icons/UploadIcon';
import { GenerateIcon } from './icons/GenerateIcon';
import { SaveIcon } from './icons/SaveIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ResizeIcon } from './icons/ResizeIcon';

interface ControlPanelProps {
    settings: BannerSettings;
    setSettings: React.Dispatch<React.SetStateAction<BannerSettings>>;
    baseImage: string | null;
    setBaseImage: (file: string | null) => void;
    setLogoImage: (file: string | null) => void;
    onGenerate: () => void;
    onSmartResize: () => void;
    isLoading: boolean;
    templates: Template[];
    onSaveTemplate: () => void;
    onLoadTemplate: (template: Template) => void;
    onDeleteTemplate: (id: string) => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
    settings,
    setSettings,
    baseImage,
    setBaseImage,
    setLogoImage,
    onGenerate,
    onSmartResize,
    isLoading,
    templates,
    onSaveTemplate,
    onLoadTemplate,
    onDeleteTemplate,
}) => {
    const [activeTab, setActiveTab] = useState<'settings' | 'templates'>('settings');
    const [newColor, setNewColor] = useState('#1E40AF');

    const dimensionPresets = [
        { name: 'FB Cover', width: 851, height: 315 },
        { name: 'LI Banner', width: 1584, height: 396 },
        { name: 'X Header', width: 1500, height: 500 },
        { name: 'Square', width: 1080, height: 1080 },
    ];

    const handleFileChange = (setter: (file: string | null) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setter(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSettingChange = (field: keyof BannerSettings, value: any) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const handleAddColor = () => {
        if (newColor && !settings.brandColors.includes(newColor)) {
            handleSettingChange('brandColors', [...settings.brandColors, newColor]);
        }
    };

    const handleRemoveColor = (colorToRemove: string) => {
        handleSettingChange('brandColors', settings.brandColors.filter(c => c !== colorToRemove));
    };

    const handlePresetClick = (width: number, height: number) => {
        setSettings(prev => ({ ...prev, width, height }));
    };

    return (
        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-2xl p-6 flex flex-col h-full border border-gray-700">
            <div className="flex border-b border-gray-700 mb-4">
                <button
                    onClick={() => setActiveTab('settings')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors duration-200 ${activeTab === 'settings' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Settings
                </button>
                <button
                    onClick={() => setActiveTab('templates')}
                    className={`flex-1 py-2 text-sm font-semibold transition-colors duration-200 ${activeTab === 'templates' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400 hover:text-white'}`}
                >
                    Templates
                </button>
            </div>
            
            <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">{baseImage ? "Editing Instructions" : "Banner Prompt"}</label>
                            <textarea
                                value={settings.prompt}
                                onChange={(e) => handleSettingChange('prompt', e.target.value)}
                                placeholder={baseImage ? "e.g., 'make the background blue' or 'add a cat wearing a hat'" : "e.g., 'a futuristic cityscape at sunset'"}
                                className="w-full h-24 p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FileInput label="Upload Image to Edit" onChange={handleFileChange(setBaseImage)} onClear={() => setBaseImage(null)} hasImage={!!baseImage} />
                            <FileInput label="Upload Logo" onChange={handleFileChange(setLogoImage)} onClear={() => setLogoImage(null)} />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Dimension Presets</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                {dimensionPresets.map(p => (
                                    <button
                                        key={p.name}
                                        onClick={() => handlePresetClick(p.width, p.height)}
                                        className="text-xs px-2 py-1.5 bg-gray-700/80 rounded-md hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {p.name}<br/>
                                        <span className="text-gray-400">{p.width}x{p.height}</span>
                                    </button>
                                ))}
                            </div>
                            <label className="block text-sm font-medium text-gray-300 my-2">Custom Dimensions (px)</label>
                            <div className="flex items-center gap-2">
                                <input type="number" value={settings.width} onChange={(e) => handleSettingChange('width', parseInt(e.target.value, 10) || 0)} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Width" />
                                <span className="text-gray-500">x</span>
                                <input type="number" value={settings.height} onChange={(e) => handleSettingChange('height', parseInt(e.target.value, 10) || 0)} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" placeholder="Height"/>
                            </div>
                            {baseImage && (
                                <button
                                    onClick={onSmartResize}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 mt-3 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                                >
                                    <ResizeIcon className="w-5 h-5" />
                                    Smart Resize
                                </button>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Number of Outputs: {settings.numberOfImages}</label>
                            <input type="range" min="1" max="4" value={settings.numberOfImages} onChange={(e) => handleSettingChange('numberOfImages', parseInt(e.target.value, 10))} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Brand Colors (Optional)</label>
                             <div className="flex items-center gap-2 mb-2">
                                <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-10 h-10 p-1 bg-gray-900 border border-gray-600 rounded-md cursor-pointer"/>
                                <input type="text" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="w-full p-2 bg-gray-900 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
                                <button onClick={handleAddColor} className="px-3 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-600 transition text-lg">+</button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {settings.brandColors.map(color => (
                                    <div key={color} className="flex items-center gap-2 bg-gray-700/80 rounded-full pl-2 pr-1 py-0.5 text-xs font-medium">
                                        <span className="w-3 h-3 rounded-full border border-gray-500" style={{ backgroundColor: color }}></span>
                                        <span className="font-mono">{color.toUpperCase()}</span>
                                        <button onClick={() => handleRemoveColor(color)} className="text-gray-400 hover:text-white bg-gray-600/50 rounded-full w-4 h-4 flex items-center justify-center transition">&times;</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'templates' && (
                    <div className="space-y-3">
                        <button onClick={onSaveTemplate} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition duration-200">
                           <SaveIcon className="w-5 h-5" /> Save Current Settings
                        </button>
                        <div className="space-y-2 pt-2">
                            {templates.length > 0 ? templates.map(template => (
                                <div key={template.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                                    <span className="text-sm font-medium truncate cursor-pointer hover:text-blue-400" onClick={() => onLoadTemplate(template)}>{template.name}</span>
                                    <button onClick={() => onDeleteTemplate(template.id)} className="text-gray-400 hover:text-red-500 p-1 rounded-full transition">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            )) : <p className="text-center text-sm text-gray-400">No saved templates.</p>}
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-700">
                <button
                    onClick={onGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-transform transform hover:scale-105 duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed disabled:scale-100"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        <>
                            <GenerateIcon className="w-6 h-6" />
                            {baseImage ? "Edit Image" : "Generate Banner"}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

const FileInput: React.FC<{label: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, onClear: () => void, hasImage?: boolean}> = ({ label, onChange, onClear, hasImage }) => (
    <div className="relative">
        <label className="w-full flex flex-col items-center justify-center h-24 px-4 py-6 bg-gray-900 text-blue-400 rounded-lg shadow-sm tracking-wide border-2 border-dashed border-gray-600 cursor-pointer hover:border-blue-500 hover:text-blue-300 transition">
            <UploadIcon className="w-6 h-6" />
            <span className="mt-2 text-xs font-semibold text-center text-gray-400">{label}</span>
            <input type='file' className="hidden" accept="image/*" onChange={onChange}/>
        </label>
        {hasImage && <button onClick={onClear} className="absolute top-1 right-1 text-gray-400 bg-gray-800 rounded-full p-0.5 hover:text-white hover:bg-red-600 transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg></button>}
    </div>
);