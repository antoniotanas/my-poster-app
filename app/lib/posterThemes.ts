// app/lib/posterThemes.ts

export interface PosterTheme {
  id: string;
  name: string;
  titleColor: string;
  titleFont: string;
  titleSize: number;
  descriptionColor: string;
  layoutMode: 'center' | 'left' | 'bottom' | 'minimal';
  overlayColor: string;
  showBorder: boolean;
  accentColor: string;
  styleDescription: string; // Added for AI image generation
}

export const POSTER_THEMES: PosterTheme[] = [
  {
    id: 'classic-dark',
    name: 'Classic Dark',
    titleColor: '#FFFFFF',
    titleFont: 'Helvetica-Bold',
    titleSize: 42,
    descriptionColor: '#E0E0E0',
    layoutMode: 'center',
    overlayColor: 'rgba(0,0,0,0.5)',
    showBorder: true,
    accentColor: '#FFD700',
    styleDescription: 'Classic event poster, dark elegance, minimal lighting, subtle textures, professional and high contrast'
  },
  {
    id: 'modern-clean',
    name: 'Modern Clean',
    titleColor: '#1a1a1a',
    titleFont: 'Helvetica',
    titleSize: 56,
    descriptionColor: '#333333',
    layoutMode: 'left',
    overlayColor: 'rgba(255,255,255,0.85)',
    showBorder: false,
    accentColor: '#FF4500',
    styleDescription: 'Modern clean minimalist design, bright environment, soft shadows, abstract geometric shapes, corporate memphis style'
  },
  {
    id: 'cyber-neon',
    name: 'Cyber Neon',
    titleColor: '#00FF00',
    titleFont: 'Helvetica',
    titleSize: 48,
    descriptionColor: '#FFFFFF',
    layoutMode: 'bottom',
    overlayColor: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
    showBorder: true,
    accentColor: '#FF00FF',
    styleDescription: 'Cyberpunk aesthetic, neon lights, futuristic city vibes, dark background with glowing pink and blue accents, synthwave style'
  }
];
