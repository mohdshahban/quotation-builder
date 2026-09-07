import React from 'react';
import {
  Tv,
  Armchair,
  Sofa,
  Coffee,
  Paintbrush,
  Sparkles,
  Grid,
  Layers,
  Lightbulb,
  Zap,
  BedDouble,
  DoorClosed,
  Utensils,
  Bath,
  Home,
  ChefHat,
  Box,
  Image,
  Flame,
  Flower2,
  FolderKanban,
  Table,
  Lamp,
  ShowerHead,
  Sliders,
  Maximize2,
  Brush,
  LucideIcon
} from 'lucide-react';

export const ICON_MAP: Record<string, LucideIcon> = {
  Tv: Tv,
  Armchair: Armchair,
  Sofa: Sofa,
  Coffee: Coffee,
  Paintbrush: Paintbrush,
  Sparkles: Sparkles,
  Grid: Grid,
  Layers: Layers,
  Lightbulb: Lightbulb,
  Zap: Zap,
  BedDouble: BedDouble,
  DoorClosed: DoorClosed,
  Utensils: Utensils,
  Bath: Bath,
  Home: Home,
  ChefHat: ChefHat,
  Box: Box,
  Image: Image,
  Flame: Flame,
  Flower2: Flower2,
  FolderKanban: FolderKanban,
  Table: Table,
  Lamp: Lamp,
  ShowerHead: ShowerHead,
  Sliders: Sliders,
  Maximize2: Maximize2,
  Brush: Brush,
};

export const AVAILABLE_ICONS = [
  { name: 'Tv', label: 'TV / Media Unit', icon: Tv },
  { name: 'Sofa', label: 'Sofa / Couch', icon: Sofa },
  { name: 'Armchair', label: 'Wing Chair / Armchair', icon: Armchair },
  { name: 'Coffee', label: 'Coffee / Center Table', icon: Coffee },
  { name: 'Paintbrush', label: 'Wall Painting', icon: Paintbrush },
  { name: 'Image', label: 'Wallpaper / Artwork', icon: Image },
  { name: 'Grid', label: 'False Ceiling', icon: Grid },
  { name: 'Lightbulb', label: 'Electrical & Lighting', icon: Lightbulb },
  { name: 'BedDouble', label: 'Bed & Bedroom', icon: BedDouble },
  { name: 'DoorClosed', label: 'Wardrobe / Storage', icon: DoorClosed },
  { name: 'Utensils', label: 'Crockery / Dining', icon: Utensils },
  { name: 'ChefHat', label: 'Modular Kitchen', icon: ChefHat },
  { name: 'Bath', label: 'Bathroom / Vanity', icon: Bath },
  { name: 'Layers', label: 'Shoe Rack / Cabinets', icon: Layers },
  { name: 'Sparkles', label: 'Decor / Accent Items', icon: Sparkles },
  { name: 'Table', label: 'Study Table / Desk', icon: Table },
  { name: 'Flower2', label: 'Balcony / Planters', icon: Flower2 },
  { name: 'Flame', label: 'Pooja / Temple Unit', icon: Flame },
];

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const ItemIconRenderer: React.FC<IconRendererProps> = ({ name, className = "w-6 h-6", size }) => {
  const IconComponent = ICON_MAP[name] || Box;
  return <IconComponent className={className} size={size} />;
};
