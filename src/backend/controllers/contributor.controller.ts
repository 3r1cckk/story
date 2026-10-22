import { Request, Response } from 'express';
import { db } from '../db/database';
import { AuthRequest } from '../middleware/auth.middleware';

export const addContributor = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const { story_id, user_id, role } = req.body;

    if (!story_id || !user_id) {
      return res.status(400).json({ message: 'Both story_id and user_id are required.' });
    }

    const sId = Number(story_id);
    const uId = Number(user_id);

    // Verify story exists and authenticated user is author
    const storyResult = await db.query('SELECT * FROM stories WHERE id = $1', [sId]);
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    const story = storyResult.rows[0];
    if (story.author_id !== user.id) {
      return res.status(403).json({
        message: 'Only the story author can invite contributors.',
      });
    }

    if (story.author_id === uId) {
      return res.status(400).json({
        message: 'You are already the author of this story.',
      });
    }

    // Verify user to add exists
    const targetUserResult = await db.query('SELECT * FROM users WHERE id = $1', [uId]);
    if (targetUserResult.rows.length === 0) {
      return res.status(404).json({ message: 'User to invite not found.' });
    }

    const targetUser = targetUserResult.rows[0];

    // Insert contributor
    const result = await db.query(
      'INSERT INTO contributors (story_id, user_id, role) VALUES ($1, $2, $3)',
      [sId, uId, role || 'contributor']
    );

    const inserted = result.rows[0];

    res.status(201).json({
      message: `${targetUser.username} added as a contributor.`,
      contributor: {
        ...inserted,
        username: targetUser.username,
        email: targetUser.email,
        avatar_url: targetUser.avatar_url,
      },
    });
  } catch (err) {
    console.error('addContributor error:', err);
    res.status(500).json({ message: 'Failed to add contributor.' });
  }
};

export const getContributors = async (req: Request, res: Response) => {
  try {
    const storyId = Number(req.params.story_id);
    if (!storyId) {
      return res.status(400).json({ message: 'Valid story_id parameter is required.' });
    }

    const result = await db.query(
      'SELECT * FROM contributors WHERE story_id = $1',
      [storyId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('getContributors error:', err);
    res.status(500).json({ message: 'Failed to retrieve contributors.' });
  }
};

export const removeContributor = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user!;
    const contributorId = Number(req.params.id);

    if (!contributorId) {
      return res.status(400).json({ message: 'Valid contributor ID is required.' });
    }

    // Find the contributor record
    const contribResult = await db.query('SELECT * FROM contributors WHERE id = $1', [contributorId]);
    if (contribResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contributor record not found.' });
    }

    const contrib = contribResult.rows[0];

    // Find the story to ensure user is author
    const storyResult = await db.query('SELECT * FROM stories WHERE id = $1', [contrib.story_id]);
    if (storyResult.rows.length === 0) {
      return res.status(404).json({ message: 'Associated story not found.' });
    }

    const story = storyResult.rows[0];
    if (story.author_id !== user.id) {
      return res.status(403).json({
        message: 'Only the story author can remove contributors.',
      });
    }

    await db.query('DELETE FROM contributors WHERE id = $1', [contributorId]);

    res.json({ message: 'Contributor removed successfully.' });
  } catch (err) {
    console.error('removeContributor error:', err);
    res.status(500).json({ message: 'Failed to remove contributor.' });
  }
};
