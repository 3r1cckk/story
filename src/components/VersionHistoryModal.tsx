import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateStory } from '../store/slices/storySlice';
import { closeModal, navigateTo } from '../store/slices/uiSlice';
import { StoryVersion } from '../types';
import { X, GitFork, RotateCcw, Clock, User, Check } from 'lucide-react';

export const VersionHistoryModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStory } = useAppSelector((state) => state.stories);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedVersion, setSelectedVersion] = useState<StoryVersion | null>(null);
  const [restoredMsg, setRestoredMsg] = useState<string | null>(null);

  if (!currentStory) return null;

  const versions = currentStory.versions || [];
  const activeVer = selectedVersion || versions[0];

  const handleRestore = async (version: StoryVersion) => {
    if (
      window.confirm(
        `Are you sure you want to restore the manuscript to revision "${version.summary}"? This will update the current draft.`
      )
    ) {
      await dispatch(
        updateStory({
          id: currentStory.id,
          title: version.title,
          content: version.content,
          synopsis: currentStory.synopsis,
          genre: currentStory.genre,
          summary: `Reverted to version: ${version.summary}`,
        })
      );

      setRestoredMsg('Manuscript reverted to selected version.');
      setTimeout(() => {
        setRestoredMsg(null);
        dispatch(closeModal());
        dispatch(navigateTo({ view: 'storyEditor', storyId: currentStory.id }));
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative text-stone-100 flex flex-col max-h-[85vh]">
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-serif font-black flex items-center gap-2">
          <GitFork className="w-5 h-5 text-amber-500" />
          Manuscript Version Control &amp; Snapshots
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Review immutable chapter revisions, compare changes, or revert to an earlier checkpoint.
        </p>

        {restoredMsg && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{restoredMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 flex-1 min-h-0 overflow-hidden">
          {/* Version List Sidebar */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto pr-2 border-r border-stone-800/80">
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Timeline Revisions ({versions.length})
            </div>

            {versions.map((ver, idx) => {
              const isSelected = activeVer?.id === ver.id;
              return (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersion(ver)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-500/15 border-amber-500/80 text-white'
                      : 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700 text-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400">
                      Rev #{versions.length - idx}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {new Date(ver.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="text-xs font-medium mt-1 text-stone-200 line-clamp-1">
                    {ver.summary}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-stone-400 mt-2">
                    <User className="w-3 h-3" />
                    <span>{ver.author_name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ver.content.split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Version Preview Canvas */}
          <div className="md:col-span-7 flex flex-col justify-between overflow-hidden">
            {activeVer ? (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800 shrink-0">
                  <div>
                    <h4 className="text-sm font-bold text-white">{activeVer.summary}</h4>
                    <div className="text-[11px] text-stone-400">
                      Edited by {activeVer.author_name} on {new Date(activeVer.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestore(activeVer)}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-md"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore Draft</span>
                  </button>
                </div>

                <div className="mt-4 flex-1 overflow-y-auto p-4 rounded-2xl bg-stone-950 border border-stone-800/80 font-serif text-sm leading-relaxed text-stone-300 whitespace-pre-line">
                  {activeVer.content}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-stone-500">
                Select a version on the left to preview.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
          <button
            onClick={() => dispatch(closeModal())}
            className="px-4 py-2 text-xs font-bold text-stone-400 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
