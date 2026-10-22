import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { db } from '../db/database';

export const requireStoryAuthor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const storyId = Number(req.params.id || req.body.story_id);
    if (!storyId) {
      return res.status(400).json({ message: 'Story ID is required for authorization.' });
    }

    const result = await db.query('SELECT * FROM stories WHERE id = $1', [storyId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = result.rows[0];
    if (story.author_id !== user.id) {
      return res.status(403).json({
        message: 'Forbidden: Only the author of this story can perform this action.',
      });
    }

    // Attach story to request for downstream handlers if needed
    (req as any).story = story;
    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ message: 'Internal authorization error.' });
  }
};

export const requireStoryAuthorOrContributor = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const storyId = Number(req.params.id || req.body.story_id);
    if (!storyId) {
      return res.status(400).json({ message: 'Story ID is required for authorization.' });
    }

    const storyResult = await db.query('SELECT * FROM stories WHERE id = $1', [storyId]);
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyResult.rows[0];

    // If user is the author, allow immediately
    if (story.author_id === user.id) {
      (req as any).story = story;
      return next();
    }

    // Check if user is a listed contributor
    const contribResult = await db.query(
      'SELECT * FROM contributors WHERE story_id = $1',
      [storyId]
    );

    const isContributor = contribResult.rows.some((c) => c.user_id === user.id);
    if (!isContributor) {
      return res.status(403).json({
        message: 'Forbidden: You must be the author or an invited contributor to edit this story.',
      });
    }

    (req as any).story = story;
    next();
  } catch (err) {
    console.error('Authorization error:', err);
    res.status(500).json({ message: 'Internal authorization error.' });
  }
};
