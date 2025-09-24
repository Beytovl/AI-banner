import { GoogleGenAI, Modality } from "@google/genai";
import { BannerSettings, GeneratedImage } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const urlToGenerativePart = async (url: string) => {
     const response = await fetch(url);
     const blob = await response.blob();
     const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(blob);
    });
     return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: blob.type },
    };
}

const getClosestAspectRatio = (width: number, height: number): '1:1' | '16:9' | '9:16' | '4:3' | '3:4' => {
    if (height === 0) return '16:9';
    const ratio = width / height;
    const ratios = {
        '16:9': 16 / 9,
        '9:16': 9 / 16,
        '1:1': 1,
        '4:3': 4 / 3,
        '3:4': 3 / 4,
    };

    let closest: '1:1' | '16:9' | '9:16' | '4:3' | '3:4' = '16:9';
    let minDiff = Infinity;

    for (const key in ratios) {
        const diff = Math.abs(ratio - ratios[key as keyof typeof ratios]);
        if (diff < minDiff) {
            minDiff = diff;
            closest = key as '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
        }
    }
    return closest;
}


export async function generateBannerFromPrompt(settings: BannerSettings): Promise<GeneratedImage[]> {
    try {
        const brandColorPrompt = settings.brandColors.length > 0
            ? `Brand colors to incorporate: ${settings.brandColors.join(', ')}.`
            : '';
        const fullPrompt = `Generate a photorealistic, ultra-high-resolution, professional banner with the theme: "${settings.prompt}". The image quality must be exceptional, with sharp details and vibrant colors. The style should be modern and clean. ${brandColorPrompt}`;

        const aspectRatio = getClosestAspectRatio(settings.width, settings.height);

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: fullPrompt,
            config: {
                numberOfImages: settings.numberOfImages,
                outputMimeType: 'image/jpeg',
                aspectRatio: aspectRatio,
            },
        });

        return response.generatedImages.map(img => ({
            url: `data:image/jpeg;base64,${img.image.imageBytes}`,
            alt: settings.prompt
        }));
    } catch (error) {
        console.error("Error generating banner:", error);
        throw new Error("Failed to generate banner. Please check your prompt and settings.");
    }
}

export async function editBannerWithPrompt(baseImage: string, prompt: string, brandColors: string[], numberOfImages: number): Promise<GeneratedImage[]> {
    try {
        const imagePart = await urlToGenerativePart(baseImage);
        
        const brandColorPrompt = brandColors.length > 0 
            ? `Also, subtly incorporate the brand color(s) ${brandColors.join(', ')} into the image if it makes sense aesthetically, for example as a background tint or accent color. If the prompt is to add a background, consider using one of the brand colors.`
            : '';

        const fullPrompt = `Based on the user's request: "${prompt}", edit the provided image. ${brandColorPrompt} Ensure the final image is of the highest possible quality, with sharp details and professional lighting. Maintain a photorealistic look.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: fullPrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
                candidateCount: numberOfImages,
            },
        });
        
        const imageResults: GeneratedImage[] = [];
        for (const candidate of response.candidates) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    imageResults.push({ url: imageUrl, alt: prompt });
                }
            }
        }

        if (imageResults.length === 0) {
            throw new Error("The AI did not return an edited image. Try a different prompt.");
        }

        return imageResults;

    } catch (error) {
        console.error("Error editing banner:", error);
        throw new Error("Failed to edit banner. The AI may not be able to fulfill this request.");
    }
}

export async function resizeImageSmart(baseImage: string, width: number, height: number): Promise<GeneratedImage[]> {
    try {
        const imagePart = await urlToGenerativePart(baseImage);

        const resizePrompt = `Resize and adapt this image to perfectly fit a ${width}x${height} pixel canvas. The new aspect ratio is approximately ${getClosestAspectRatio(width, height)}. Intelligently extend the background or adjust the composition to fill any new space. Do not stretch, distort, or letterbox the image. The main subject should be preserved and well-composed within the new dimensions. The output must be a high-quality, seamless, and natural-looking image with photorealistic details.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: {
                parts: [
                    imagePart,
                    { text: resizePrompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        const imageResults: GeneratedImage[] = [];
        for (const candidate of response.candidates) {
            for (const part of candidate.content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                    imageResults.push({ url: imageUrl, alt: `Resized to ${width}x${height}` });
                }
            }
        }

        if (imageResults.length === 0) {
            throw new Error("The AI did not return a resized image. Try different dimensions.");
        }

        return imageResults;

    } catch (error) {
        console.error("Error resizing image:", error);
        throw new Error("Failed to resize image. The AI may not be able to fulfill this request.");
    }
}