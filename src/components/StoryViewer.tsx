import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchStoryById, deleteStory } from '../store/slices/storySlice';
import { openModal, navigateTo } from '../store/slices/uiSlice';
import { CommentsSection } from './CommentsSection';
import {
  ArrowLeft,
  Edit3,
  Users,
  GitFork,
  Trash2,
  Share2,
  Calendar,
  BookOpen,
  UserPlus,
} from 'lucide-react';

export const StoryViewer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStory, loading } = useAppSelector((state) => state.stories);
  const { selectedStoryId, theme } = useAppSelector((state) => state.ui);
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const isMidnight = theme === 'midnight';

  useEffect(() => {
    if (selectedStoryId) {
      dispatch(fetchStoryById(selectedStoryId));
    }
  }, [selectedStoryId, dispatch]);

  if (loading || !currentStory) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs text-stone-400">Loading manuscript...</p>
      </div>
    );
  }

  const isAuthor = user && user.id === currentStory.author_id;
  const isContributor =
    user && currentStory.contributors?.some((c) => c.user_id === user.id);
  const canEdit = isAuthor || isContributor;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this story? This cannot be undone.')) {
      await dispatch(deleteStory(currentStory.id));
      dispatch(navigateTo({ view: 'home' }));
    }
  };

  const wordCount = currentStory.content ? currentStory.content.split(/\s+/).filter(Boolean).length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-4">
        <button
          onClick={() => dispatch(navigateTo({ view: 'home' }))}
          className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatch(openModal('versions'))}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isMidnight
                ? 'border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                : 'border-amber-300 bg-amber-100 text-stone-800 hover:bg-amber-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Revisions ({currentStory.versions?.length || 0})</span>
          </button>

          {isAuthor && (
            <button
              onClick={() => dispatch(openModal('contributors'))}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
                isMidnight
                  ? 'border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                  : 'border-amber-300 bg-amber-100 text-stone-800 hover:bg-amber-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-amber-500" />
              <span>Co-Authors ({currentStory.contributors?.length || 0})</span>
            </button>
          )}

          {canEdit && (
            <button
              onClick={() => dispatch(navigateTo({ view: 'storyEditor', storyId: currentStory.id }))}
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-md transition-transform hover:scale-105"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Open Collaborative Editor</span>
            </button>
          )}

          {isAuthor && (
            <button
              onClick={handleDelete}
              className="p-1.5 text-stone-400 hover:text-rose-400 transition-colors"
              title="Delete Story (Author Only)"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Story Header */}
      <div className="space-y-4">
        {/* Unboxed Metadata (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-400">
          <span className="font-bold text-amber-500">{currentStory.genre}</span>
          <span aria-hidden="true">·</span>
          <span>Lead Author: <strong className="text-stone-200">{currentStory.author_name}</strong></span>
          <span aria-hidden="true">·</span>
          <span>{wordCount.toLocaleString()} words</span>
          <span aria-hidden="true">·</span>
          <span>{readingTime} min read</span>
          <span aria-hidden="true">·</span>
          <span>Updated {new Date(currentStory.updated_at).toLocaleDateString()}</span>
        </div>

        <h1
          className="text-3xl md:text-5xl font-serif font-black tracking-tight leading-tight"
          style={{ textWrap: 'balance' }}
        >
          {currentStory.title}
        </h1>

        {currentStory.synopsis && (
          <p className="text-base md:text-lg italic text-amber-200/90 font-serif border-l-2 border-amber-500/50 pl-4 py-1">
            "{currentStory.synopsis}"
          </p>
        )}
      </div>

      {/* Contributors Strip */}
      {currentStory.contributors && currentStory.contributors.length > 0 && (
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
            isMidnight ? 'bg-stone-900/60 border-stone-800' : 'bg-amber-100/60 border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-stone-400">
            <Users className="w-4 h-4 text-amber-500" />
            <span>Collaborating Scribes:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentStory.contributors.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1.5 text-xs text-stone-300 font-medium"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>{c.username}</span>
                <span className="text-[10px] text-stone-500">({c.role})</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Story Content Prose */}
      <article
        className={`p-8 md:p-12 rounded-3xl border shadow-xl ${
          isMidnight ? 'bg-stone-900/40 border-stone-800' : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="prose prose-stone max-w-none dark:prose-invert font-serif text-base md:text-lg leading-relaxed whitespace-pre-line selection:bg-amber-500 selection:text-stone-950">
          {currentStory.content}
        </div>
      </article>

      {/* Comments & Discussion */}
      <CommentsSection storyId={currentStory.id} comments={currentStory.comments || []} />
    </div>
  );
};
