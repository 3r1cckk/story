import React, { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateStory, createSnapshot, fetchStoryById } from '../store/slices/storySlice';
import { fetchStoryPresence, sendHeartbeat } from '../store/slices/presenceSlice';
import { openModal, navigateTo } from '../store/slices/uiSlice';
import {
  ArrowLeft,
  Save,
  Users,
  GitFork,
  Sparkles,
  CheckCircle2,
  Clock,
  UserPlus,
} from 'lucide-react';

export const StoryEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStory, saving } = useAppSelector((state) => state.stories);
  const { selectedStoryId, theme } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const { activeWriters } = useAppSelector((state) => state.presence);

  const isMidnight = theme === 'midnight';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [checkpointSummary, setCheckpointSummary] = useState('');
  const [isCheckpointOpen, setIsCheckpointOpen] = useState(false);

  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Initialize editor from current story
  useEffect(() => {
    if (currentStory) {
      setTitle(currentStory.title || '');
      setContent(currentStory.content || '');
      setSynopsis(currentStory.synopsis || '');
      setGenre(currentStory.genre || 'Fantasy');
    }
  }, [currentStory]);

  // Periodic heartbeat & presence polling
  useEffect(() => {
    if (!selectedStoryId) return;

    // Send immediate heartbeat
    dispatch(sendHeartbeat({ storyId: selectedStoryId }));

    const interval = setInterval(() => {
      dispatch(sendHeartbeat({ storyId: selectedStoryId }));
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedStoryId, dispatch]);

  const handleSave = async (customSummary?: string) => {
    if (!currentStory) return;

    setSaveStatus('Saving manuscript...');
    try {
      await dispatch(
        updateStory({
          id: currentStory.id,
          title,
          content,
          synopsis,
          genre,
          summary: customSummary || `Collaborative edit by ${user?.username || 'Writer'}`,
        })
      ).unwrap();

      setSaveStatus('Saved successfully');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err}`);
      setTimeout(() => setSaveStatus(null), 4000);
    }
  };

  const handleCreateCheckpoint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStory || !checkpointSummary) return;

    await dispatch(
      createSnapshot({
        story_id: currentStory.id,
        title,
        content,
        summary: checkpointSummary,
      })
    );

    setIsCheckpointOpen(false);
    setCheckpointSummary('');
    setSaveStatus('Milestone snapshot created!');
    setTimeout(() => setSaveStatus(null), 3000);
  };

  if (!currentStory) {
    return (
      <div className="py-24 text-center">
        <p className="text-stone-400">Loading editor...</p>
      </div>
    );
  }

  const isAuthor = user && user.id === currentStory.author_id;
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const otherWriters = activeWriters.filter((w) => w.userId !== user?.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 animate-fade-in">
      {/* Top Studio Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => dispatch(navigateTo({ view: 'storyViewer', storyId: currentStory.id }))}
            className="flex items-center gap-1.5 text-xs font-bold text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Reader View</span>
          </button>

          <span className="text-stone-700">|</span>

          {/* Active Co-Authors Presence Banner */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Room:
            </span>

            {/* Writer Avatars */}
            <div className="flex items-center -space-x-1.5">
              <div
                className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] flex items-center justify-center ring-2 ring-stone-900"
                title={`You (${user?.username})`}
              >
                You
              </div>

              {otherWriters.map((writer) => (
                <div
                  key={writer.userId}
                  className="w-6 h-6 rounded-full text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-stone-900 shadow-sm"
                  style={{ backgroundColor: writer.color }}
                  title={`${writer.username} is active in this story`}
                >
                  {writer.username.charAt(0).toUpperCase()}
                </div>
              ))}
            </div>

            {otherWriters.length > 0 && (
              <span className="text-[11px] text-amber-400 font-medium">
                {otherWriters.map((w) => w.username).join(', ')} writing now
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {saveStatus && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {saveStatus}
            </span>
          )}

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
              <span>Invite Co-Author</span>
            </button>
          )}

          <button
            onClick={() => setIsCheckpointOpen(true)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-colors ${
              isMidnight
                ? 'border-stone-800 bg-stone-900 text-stone-300 hover:bg-stone-800'
                : 'border-amber-300 bg-amber-100 text-stone-800 hover:bg-amber-200'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Create Milestone Checkpoint</span>
          </button>

          <button
            disabled={saving}
            onClick={() => handleSave()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center gap-1.5 shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Manuscript'}</span>
          </button>
        </div>
      </div>

      {/* Editor Canvas */}
      <div
        className={`rounded-3xl border p-6 md:p-10 shadow-2xl space-y-6 ${
          isMidnight ? 'bg-stone-900/40 border-stone-800' : 'bg-amber-50/80 border-amber-200'
        }`}
      >
        {/* Story Title Input */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of the Manuscript..."
            className="w-full bg-transparent text-2xl md:text-4xl font-serif font-black tracking-tight focus:outline-none placeholder:text-stone-500 selection:bg-amber-500 selection:text-stone-950"
          />
        </div>

        {/* Synopsis & Genre Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-stone-800/60">
          <div className="md:col-span-3">
            <input
              type="text"
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Short synopsis / logline (e.g., A steampunk expedition across moving clockwork islands...)"
              className="w-full bg-transparent text-xs text-stone-400 italic font-serif focus:outline-none placeholder:text-stone-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 text-xs">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none ${
                isMidnight
                  ? 'bg-stone-800 border border-stone-700 text-stone-200'
                  : 'bg-amber-100 border border-amber-300 text-stone-800'
              }`}
            >
              <option value="Fantasy">Fantasy</option>
              <option value="Sci-Fi">Sci-Fi</option>
              <option value="Mystery">Mystery</option>
              <option value="Historical">Historical</option>
              <option value="Horror">Horror</option>
              <option value="General">General</option>
            </select>
            <span className="font-mono tabular-nums text-stone-500">{wordCount.toLocaleString()} words</span>
          </div>
        </div>

        {/* Content Textarea */}
        <div className="pt-4 border-t border-stone-800/60">
          <textarea
            ref={contentRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Begin drafting chapter here... Co-authors can edit simultaneously."
            rows={22}
            className="w-full bg-transparent font-serif text-base md:text-lg leading-relaxed focus:outline-none resize-y placeholder:text-stone-600 selection:bg-amber-500 selection:text-stone-950"
          />
        </div>
      </div>

      {/* Milestone Checkpoint Modal */}
      {isCheckpointOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 text-stone-100 space-y-4 shadow-2xl">
            <h3 className="text-lg font-serif font-black flex items-center gap-2">
              <GitFork className="w-5 h-5 text-amber-500" />
              Create Version Milestone
            </h3>
            <p className="text-xs text-stone-400">
              Save an immutable checkpoint of this story draft. Any author or collaborator can review
              or revert to this version at any time.
            </p>

            <form onSubmit={handleCreateCheckpoint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                  Milestone Summary / Revision Note
                </label>
                <input
                  type="text"
                  required
                  value={checkpointSummary}
                  onChange={(e) => setCheckpointSummary(e.target.value)}
                  placeholder="e.g. Completed Chapter 1 Climax & gear dialogue"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCheckpointOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md"
                >
                  Save Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
