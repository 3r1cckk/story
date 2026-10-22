import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createStory } from '../store/slices/storySlice';
import { closeModal, navigateTo } from '../store/slices/uiSlice';
import { X, BookPlus, Sparkles } from 'lucide-react';

export const NewStoryModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { saving } = useAppSelector((state) => state.stories);

  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('Fantasy');
  const [synopsis, setSynopsis] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError('Please provide both a title and starting chapter text.');
      return;
    }

    setError(null);
    try {
      const created = await dispatch(
        createStory({
          title: title.trim(),
          genre,
          synopsis: synopsis.trim(),
          content: content.trim(),
        })
      ).unwrap();

      dispatch(closeModal());
      dispatch(navigateTo({ view: 'storyEditor', storyId: created.id }));
    } catch (err: any) {
      setError(err || 'Failed to create story');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative text-stone-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-serif font-black flex items-center gap-2">
          <BookPlus className="w-5 h-5 text-amber-500" />
          Create New Collaborative Manuscript
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Start a new world. Once created, you can invite co-authors to contribute chapters and edits.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Manuscript Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Glass Cartographers of Oakhaven"
              className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500 font-serif font-bold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Genre
              </label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Fantasy">Fantasy</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Mystery">Mystery</option>
                <option value="Historical">Historical</option>
                <option value="Horror">Horror</option>
                <option value="General">General Fiction</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Logline / Synopsis
              </label>
              <input
                type="text"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="A one-sentence hook for fellow scribes"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Opening Chapter / Prologue *
            </label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the initial scenes of your manuscript..."
              rows={8}
              className="w-full bg-stone-950 border border-stone-700 rounded-xl p-3.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-serif leading-relaxed"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dispatch(closeModal())}
              className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Launch Manuscript'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
