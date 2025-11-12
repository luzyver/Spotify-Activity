export type Palette = {
  gradient: string;
  primary: string;
  secondary: string;
  name: string;
};

export const COLOR_PALETTES: Palette[] = [
  {
    gradient: 'from-[#1ed760]/20 via-[#1db954]/15 to-[#169c46]/20',
    primary: '#1ed760',
    secondary: '#1db954',
    name: 'spotify',
  },
  {
    gradient: 'from-[#ff6b6b]/20 via-[#ee5a6f]/15 to-[#c44569]/20',
    primary: '#ff6b6b',
    secondary: '#ee5a6f',
    name: 'sunset',
  },
  {
    gradient: 'from-[#4facfe]/20 via-[#00f2fe]/15 to-[#43e97b]/20',
    primary: '#4facfe',
    secondary: '#00f2fe',
    name: 'ocean',
  },
  {
    gradient: 'from-[#b06ab3]/20 via-[#4568dc]/15 to-[#6a3093]/20',
    primary: '#b06ab3',
    secondary: '#4568dc',
    name: 'purple',
  },
  {
    gradient: 'from-[#ffa751]/20 via-[#ffe259]/15 to-[#ffa751]/20',
    primary: '#ffa751',
    secondary: '#ffe259',
    name: 'peach',
  },
  {
    gradient: 'from-[#667eea]/20 via-[#764ba2]/15 to-[#f093fb]/20',
    primary: '#667eea',
    secondary: '#764ba2',
    name: 'midnight',
  },
];
