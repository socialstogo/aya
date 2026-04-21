export interface Venue {
  id: string;
  name: string;
  type: string;
  neighborhood: string;
  address: string;
  crowd: number;
  wait: number;
  rating: number;
  lat: number;
  lng: number;
  image: string;
  hours: string;
  priceLevel: number;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_color: string;
  instagram_handle: string;
  tiktok_handle: string;
  venue_types: string[];
  neighborhoods: string[];
  followed_venues: string[];
  onboarding_complete: boolean;
}

export interface ScenePost {
  id: string;
  user_id: string;
  venue_id: string;
  venue_name: string;
  content: string;
  image_url?: string;
  created_at: string;
  likes: number;
  author_name: string;
  author_avatar_color: string;
}

export type FilterType = 'All' | 'Bar' | 'Nightclub' | 'Restaurant' | 'Rooftop' | 'Live Music';
