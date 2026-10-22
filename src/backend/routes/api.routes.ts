import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as storyController from '../controllers/story.controller';
import * as contributorController from '../controllers/contributor.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import {
  requireStoryAuthor,
  requireStoryAuthorOrContributor,
} from '../middleware/authorize.middleware';

const router = Router();

// ==========================================
// 1. Authentication Routes
// ==========================================
router.post('/auth/register', authController.register);
router.post('/register', authController.register); // Direct alias per prompt specification

router.post('/auth/login', authController.login);
router.post('/login', authController.login); // Direct alias per prompt specification

router.post('/auth/refresh', authController.refreshAccessToken);
router.post('/auth/logout', authController.logout);
router.get('/auth/me', authenticateToken, authController.getMe);
router.get('/users', authenticateToken, authController.searchUsers);

// ==========================================
// 2. Stories Routes (CRUD)
// ==========================================
router.get('/stories', storyController.getStories);
router.get('/stories/:id', storyController.getStoryById);
router.post('/stories', authenticateToken, storyController.createStory);
router.patch('/stories/:id', authenticateToken, requireStoryAuthorOrContributor, storyController.updateStory);
router.delete('/stories/:id', authenticateToken, requireStoryAuthor, storyController.deleteStory);

// Versions & Revisions
router.get('/stories/:id/versions', storyController.getVersions);
router.post('/stories/:id/versions', authenticateToken, requireStoryAuthorOrContributor, storyController.createVersionSnapshot);

// Comments
router.get('/stories/:id/comments', storyController.getComments);
router.post('/stories/:id/comments', authenticateToken, storyController.addComment);

// Real-Time Collaborator Presence & Live Cursors
router.get('/stories/:id/presence', storyController.getStoryPresence);
router.post('/stories/:id/presence', authenticateToken, storyController.updateStoryPresence);

// ==========================================
// 3. Contributors Routes
// ==========================================
router.post('/contributors', authenticateToken, contributorController.addContributor);
router.get('/contributors/:story_id', authenticateToken, contributorController.getContributors);
router.delete('/contributors/:id', authenticateToken, contributorController.removeContributor);

export default router;
