
export interface TikTokUser {
  display_name: string;
  avatar_url: string;
  follower_count: number;
  following_count: number;
  likes_count: number;
  video_count: number;
}

export interface TikTokVideo {
  id: string;
  title: string;
  cover_image_url: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  create_time: number;
}

export interface TikTokAnalyticsData {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  followers_count: number;
  videos: TikTokVideo[];
}

class TikTokService {
  private clientId = import.meta.env.VITE_TIKTOK_CLIENT_ID;
  private clientSecret = import.meta.env.VITE_TIKTOK_CLIENT_SECRET;
  private redirectUri = `${window.location.origin}/tiktok-callback`;

  async login() {
    const scope = 'user.info.basic,video.list,video.stats';
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${this.clientId}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}`;
    window.location.href = authUrl;
  }

  async handleCallback(code: string) {
    // In a real app, this would be handled by a backend to exchange code for token
    // For this demo, we'll simulate the token storage
    localStorage.setItem('tiktok_access_token', 'mock_token_' + Date.now());
    return true;
  }

  isAuthenticated() {
    return !!localStorage.getItem('tiktok_access_token');
  }

  async getUserInfo(): Promise<TikTokUser | null> {
    if (!this.isAuthenticated()) return null;
    
    // Mocking API response with EXACT data from the screenshot
    return {
      display_name: 'AI Cafe',
      avatar_url: 'https://p16-sign-va.tiktokcdn.com/tos-maliva-avt-0068/7355000000000000000~c5_100x100.jpeg?x-expires=1712563200&x-signature=mock', // Placeholder for the Apsara profile pic
      follower_count: 3,
      following_count: 0,
      likes_count: 58,
      video_count: 10
    };
  }

  async getAnalytics(): Promise<TikTokAnalyticsData | null> {
    if (!this.isAuthenticated()) return null;

    // Mocking API response for analytics matching the screenshot
    return {
      views: 2199, // Sum of views in the screenshot
      likes: 58,
      comments: 12,
      shares: 5,
      followers_count: 3,
      videos: [
        {
          id: '1',
          title: 'Coffee Shop Animation',
          cover_image_url: 'https://picsum.photos/seed/cafe1/400/600',
          view_count: 600,
          like_count: 15,
          comment_count: 2,
          share_count: 1,
          create_time: Date.now() - 86400000 * 1
        },
        {
          id: '2',
          title: 'Couple on Stairs',
          cover_image_url: 'https://picsum.photos/seed/cafe2/400/600',
          view_count: 360,
          like_count: 10,
          comment_count: 1,
          share_count: 0,
          create_time: Date.now() - 86400000 * 2
        },
        {
          id: '3',
          title: 'Couple watching Sunset',
          cover_image_url: 'https://picsum.photos/seed/cafe3/400/600',
          view_count: 337,
          like_count: 8,
          comment_count: 0,
          share_count: 1,
          create_time: Date.now() - 86400000 * 3
        },
        {
          id: '4',
          title: 'Couple walking in Park',
          cover_image_url: 'https://picsum.photos/seed/cafe4/400/600',
          view_count: 324,
          like_count: 12,
          comment_count: 3,
          share_count: 2,
          create_time: Date.now() - 86400000 * 4
        },
        {
          id: '5',
          title: 'AI Cafe Interior',
          cover_image_url: 'https://picsum.photos/seed/cafe5/400/600',
          view_count: 281,
          like_count: 5,
          comment_count: 1,
          share_count: 0,
          create_time: Date.now() - 86400000 * 5
        },
        {
          id: '6',
          title: 'Apsara AI Art',
          cover_image_url: 'https://picsum.photos/seed/cafe6/400/600',
          view_count: 158,
          like_count: 4,
          comment_count: 2,
          share_count: 1,
          create_time: Date.now() - 86400000 * 6
        },
        {
          id: '7',
          title: 'Traditional Dance',
          cover_image_url: 'https://picsum.photos/seed/cafe7/400/600',
          view_count: 133,
          like_count: 3,
          comment_count: 1,
          share_count: 0,
          create_time: Date.now() - 86400000 * 7
        },
        {
          id: '8',
          title: 'Cafe Exterior',
          cover_image_url: 'https://picsum.photos/seed/cafe8/400/600',
          view_count: 6,
          like_count: 1,
          comment_count: 0,
          share_count: 0,
          create_time: Date.now() - 86400000 * 8
        },
        {
          id: '9',
          title: 'New Video 1',
          cover_image_url: 'https://picsum.photos/seed/cafe9/400/600',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          share_count: 0,
          create_time: Date.now() - 86400000 * 9
        },
        {
          id: '10',
          title: 'New Video 2',
          cover_image_url: 'https://picsum.photos/seed/cafe10/400/600',
          view_count: 0,
          like_count: 0,
          comment_count: 0,
          share_count: 0,
          create_time: Date.now() - 86400000 * 10
        }
      ]
    };
  }

  logout() {
    localStorage.removeItem('tiktok_access_token');
  }
}

export const tiktokService = new TikTokService();
