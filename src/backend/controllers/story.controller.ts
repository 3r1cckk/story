import { Request, Response } from 'express';
import { db } from '../db/database';
import { AuthRequest } from '../middleware/auth.middleware';

// Active writers presence registry (storyId -> Map of userId -> PresenceData)
interface PresenceData {
  userId: number;
  username: string;
  color: string;
  lastActive: number;
  cursorPosition?: number;
}
const activeStoryWriters = new Map<number, Map<number, PresenceData>>();

const WRITER_COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#14B8A6'];

export const getStories = async (req: Request, res: Response) => {
  try {
    const { author_id, genre, search } = req.query;

    let queryText = 'SELECT * FROM stories';
    let params: any[] = [];

    if (author_id) {
      queryText += ' WHERE author_id = $1';
      params.push(Number(author_id));
    }

    const result = await db.query(queryText, params);
    let stories = result.rows;

    if (genre && genre !== 'All') {
      stories = stories.filter((s) => s.genre?.toLowerCase() === String(genre).toLowerCase());
    }

    if (search) {
      const term = String(search).toLowerCase();
      stories = stories.filter(
        (s) =>
          s.title?.toLowerCase().includes(term) ||
          s.synopsis?.toLowerCase().includes(term) ||
          s.author_name?.toLowerCase().includes(term)
      );
    }

    res.json(stories);
  } catch (err) {
    console.error('getStories error:', err);
    res.status(500).json({ message: 'Failed to retrieve stories.' });
  }
};

export const getStoryById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      return res.status(400).json({ message: 'Valid story ID is required.' });
    }

    const storyResult = await db.query('SELECT * FROM stories WHERE id = $1', [id]);
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyResult.rows[0];

    // Fetch contributors
    const contribResult = await db.query(
      'SELECT * FROM contributors WHERE story_id = $1',
      [id]
    );

    // Fetch comments
    const commentResult = await db.query(
      'SELECT * FROM comments WHERE story_id = $1',
      [id]
    );

    // Fetch versions
    const versionResult = await db.query(
      'SELECT * FROM story_versions WHERE story_id = $1',
      [id]
    );

    res.json({
      ...story,
      contributors: contribResult.rows,
      comments: commentResult.rows,
      versions: versionResult.rows,
    });
  } catch (err) {
    console.error('getStoryById error:', err);
    res.status(500).json({ message: 'Failed to fetch story details.' });
  }
};

export const createStory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required to create a story.' });
    }

    const { title, content, synopsis, genre } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required fields.' });
    }

    const trimmedTitle = String(title).trim();
    if (trimmedTitle.length === 0) {
      return res.status(400).json({ message: 'Title cannot be empty.' });
    }

    const result = await db.query(
      'INSERT INTO stories (title, content, synopsis, genre, author_id, is_published) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        trimmedTitle,
        content,
        synopsis || 'A newly drafted collaborative story.',
        genre || 'General',
        user.id,
        true,
      ]
    );

    const createdStory = result.rows[0];

    // Create initial version snapshot
    await db.query(
      'INSERT INTO story_versions (story_id, title, content, summary, edited_by) VALUES ($1, $2, $3, $4, $5)',
      [createdStory.id, createdStory.title, createdStory.content, 'Initial Story Creation', user.id]
    );

    res.status(201).json({
      message: 'Story created successfully.',
      story: {
        ...createdStory,
        author_name: user.username,
        author_email: user.email,
        contributors: [],
        contributors_count: 0,
      },
    });
  } catch (err) {
    console.error('createStory error:', err);
    res.status(500).json({ message: 'Failed to create story.' });
  }
};

export const updateStory = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const { title, content, synopsis, genre, summary } = req.body;

    if (!title || content === undefined) {
      return res.status(400).json({ message: 'Title and content are required.' });
    }

    const updateResult = await db.query(
      'UPDATE stories SET title = $1, content = $2, synopsis = $3, genre = $4 WHERE id = $5',
      [title, content, synopsis, genre, id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const updated = updateResult.rows[0];

    // Create automatic or custom version snapshot
    await db.query(
      'INSERT INTO story_versions (story_id, title, content, summary, edited_by) VALUES ($1, $2, $3, $4, $5)',
      [
        id,
        title,
        content,
        summary || `Revision by ${user.username} at ${new Date().toLocaleTimeString()}`,
        user.id,
      ]
    );

    res.json({
      message: 'Story saved and revision snapshot created.',
      story: updated,
    });
  } catch (err) {
    console.error('updateStory error:', err);
    res.status(500).json({ message: 'Failed to update story.' });
  }
};

export const deleteStory = async (req: AuthRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await db.query('DELETE FROM stories WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    // Clean up presence
    activeStoryWriters.delete(id);

    res.json({ message: 'Story deleted successfully.' });
  } catch (err) {
    console.error('deleteStory error:', err);
    res.status(500).json({ message: 'Failed to delete story.' });
  }
};

export const getVersions = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await db.query('SELECT * FROM story_versions WHERE story_id = $1', [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch version history.' });
  }
};

export const createVersionSnapshot = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const id = Number(req.params.id);
    const { title, content, summary } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required for a snapshot.' });
    }

    const result = await db.query(
      'INSERT INTO story_versions (story_id, title, content, summary, edited_by) VALUES ($1, $2, $3, $4, $5)',
      [id, title, content, summary || 'Manual milestone checkpoint', user.id]
    );

    res.status(201).json({
      message: 'Version checkpoint created.',
      version: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create snapshot.' });
  }
};

export const getComments = async (req: Request, res: Response) => {
  try {
    const storyId = Number(req.params.id);
    const result = await db.query('SELECT * FROM comments WHERE story_id = $1', [storyId]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch comments.' });
  }
};

export const addComment = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const storyId = Number(req.params.id);
    const { content } = req.body;

    if (!content || String(content).trim().length === 0) {
      return res.status(400).json({ message: 'Comment content cannot be empty.' });
    }

    const result = await db.query(
      'INSERT INTO comments (story_id, user_id, content) VALUES ($1, $2, $3)',
      [storyId, user.id, String(content).trim()]
    );

    res.status(201).json({
      message: 'Comment posted.',
      comment: {
        ...result.rows[0],
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to post comment.' });
  }
};

// Real-Time Collaborator Presence Endpoints
export const getStoryPresence = (req: Request, res: Response) => {
  const storyId = Number(req.params.id);
  const room = activeStoryWriters.get(storyId);
  const now = Date.now();

  if (!room) {
    return res.json([]);
  }

  // Prune inactive writers (> 20 seconds)
  const activeList: PresenceData[] = [];
  for (const [uId, data] of room.entries()) {
    if (now - data.lastActive < 20000) {
      activeList.push(data);
    } else {
      room.delete(uId);
    }
  }

  res.json(activeList);
};

export const updateStoryPresence = (req: AuthRequest, res: Response) => {
  const user = req.user!;
  const storyId = Number(req.params.id);
  const { cursorPosition } = req.body;

  if (!activeStoryWriters.has(storyId)) {
    activeStoryWriters.set(storyId, new Map());
  }

  const room = activeStoryWriters.get(storyId)!;
  const colorIndex = (user.id * 3) % WRITER_COLORS.length;

  room.set(user.id, {
    userId: user.id,
    username: user.username,
    color: WRITER_COLORS[colorIndex],
    lastActive: Date.now(),
    cursorPosition: typeof cursorPosition === 'number' ? cursorPosition : undefined,
  });

  const activeList = Array.from(room.values());
  res.json(activeList);
};
