-- =========================================================
-- PostgreSQL Database Schema for Collaborative Storytelling
-- Compatible with Render.com PostgreSQL, Neon, AWS RDS, Supabase
-- =========================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Stories Table
CREATE TABLE IF NOT EXISTS stories (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  synopsis TEXT,
  genre VARCHAR(50) DEFAULT 'General',
  author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contributors Table
CREATE TABLE IF NOT EXISTS contributors (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(30) DEFAULT 'contributor',
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(story_id, user_id)
);

-- 4. Story Versions (Version Control / Snapshots)
CREATE TABLE IF NOT EXISTS story_versions (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(255),
  edited_by INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Comments Section
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  story_id INT NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_contributors_story ON contributors(story_id);
CREATE INDEX IF NOT EXISTS idx_contributors_user ON contributors(user_id);
CREATE INDEX IF NOT EXISTS idx_versions_story ON story_versions(story_id);
CREATE INDEX IF NOT EXISTS idx_comments_story ON comments(story_id);
