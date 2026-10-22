export interface User {
  id: number;
  username: string;
  email: string;
  avatar_url?: string;
  created_at?: string;
}

export interface Contributor {
  id: number;
  story_id: number;
  user_id: number;
  username: string;
  email: string;
  avatar_url?: string;
  role: 'contributor' | 'editor';
  added_at: string;
}

export interface StoryVersion {
  id: number;
  story_id: number;
  title: string;
  content: string;
  summary: string;
  edited_by: number;
  author_name: string;
  created_at: string;
}

export interface Comment {
  id: number;
  story_id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  content: string;
  created_at: string;
}

export interface Story {
  id: number;
  title: string;
  content: string;
  synopsis?: string;
  genre: string;
  author_id: number;
  author_name: string;
  author_email: string;
  is_published: boolean;
  contributors_count?: number;
  contributors?: Contributor[];
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ActiveWriter {
  userId: number;
  username: string;
  color: string;
  lastActive: number;
  cursorPosition?: number;
}
