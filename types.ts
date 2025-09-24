
export interface BannerSettings {
    prompt: string;
    width: number;
    height: number;
    brandColors: string[];
    numberOfImages: number;
}

export interface GeneratedImage {
    url: string;
    alt: string;
}

export interface Template {
    id: string;
    name: string;
    settings: BannerSettings;
}
