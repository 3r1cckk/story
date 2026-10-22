/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { initializeAuth } from './store/slices/authSlice';
import { fetchStories, setFilter, setSelectedGenre, setSearchQuery } from './store/slices/storySlice';
import { openModal, navigateTo } from './store/slices/uiSlice';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { StoryCard } from './components/StoryCard';
import { StoryViewer } from './components/StoryViewer';
import { StoryEditor } from './components/StoryEditor';
import { AuthModal } from './components/AuthModal';
import { NewStoryModal } from './components/NewStoryModal';
import { ContributorModal } from './components/ContributorModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { RenderDeployGuide } from './components/RenderDeployGuide';
import { Search, Filter, BookOpen, Plus, Sparkles, Feather } from 'lucide-react';

const GENRES = ['All', 'Fantasy', 'Sci-Fi', 'Mystery', 'Historical', 'General'];

export default function App() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, initialized } = useAppSelector((state) => state.auth);
  const { items: stories, filter, selectedGenre, searchQuery, loading } = useAppSelector(
    (state) => state.stories
  );
  const { theme, activeView, activeModal } = useAppSelector((state) => state.ui);

  const isMidnight = theme === 'midnight';

  // Attempt silent token refresh and load initial story library on app mount
  useEffect(() => {
    dispatch(initializeAuth());
    dispatch(fetchStories());
  }, [dispatch]);

  // Filter stories based on active tabs, search, and genre
  const filteredStories = stories.filter((story) => {
    // Tab filter
    if (filter === 'mine') {
      if (!user || story.author_id !== user.id) return false;
    } else if (filter === 'collaborations') {
      if (!user) return false;
      const isContrib = story.contributors?.some((c: { user_id: number }) => c.user_id === user.id);
      if (!isContrib) return false;
    }

    // Genre filter
    if (selectedGenre !== 'All' && story.genre?.toLowerCase() !== selectedGenre.toLowerCase()) {
      return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = story.title?.toLowerCase().includes(q);
      const matchSynopsis = story.synopsis?.toLowerCase().includes(q);
      const matchAuthor = story.author_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchSynopsis && !matchAuthor) return false;
    }

    return true;
  });

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isMidnight
          ? 'bg-stone-950 text-stone-100 selection:bg-amber-500 selection:text-stone-950'
          : 'bg-[#FDFBF7] text-stone-900 selection:bg-amber-400 selection:text-stone-950'
      }`}
    >
      {/* 3-Zone Navigation Header */}
      <Navbar />

      {/* Main Workspace View Routing */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 space-y-10">
        {activeView === 'home' && (
          <div className="space-y-10 animate-fade-in">
            {/* Split Hero Section */}
            <HeroBanner />

            {/* Stories Exploration & Filtering Bar */}
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-800 pb-4">
                {/* Interactive Filter Segmented Control (Zero-Pill Rule applied: functional buttons) */}
                <div
                  className={`inline-flex items-center p-1 rounded-xl border ${
                    isMidnight ? 'bg-stone-900 border-stone-800' : 'bg-amber-100 border-amber-300'
                  }`}
                >
                  <button
                    onClick={() => dispatch(setFilter('all'))}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filter === 'all'
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    All Public Works ({stories.length})
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) dispatch(openModal('login'));
                      else dispatch(setFilter('mine'));
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filter === 'mine'
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    My Manuscripts
                  </button>
                  <button
                    onClick={() => {
                      if (!isAuthenticated) dispatch(openModal('login'));
                      else dispatch(setFilter('collaborations'));
                    }}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filter === 'collaborations'
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Co-Authored
                  </button>
                </div>

                {/* Search Bar & Genre Filter */}
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                      placeholder="Search title, author, or lore..."
                      className={`pl-8 pr-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:border-amber-500 ${
                        isMidnight
                          ? 'bg-stone-900 border-stone-800 text-white placeholder:text-stone-500'
                          : 'bg-amber-50 border-amber-300 text-stone-900 placeholder:text-stone-400'
                      }`}
                    />
                  </div>

                  <select
                    value={selectedGenre}
                    onChange={(e) => dispatch(setSelectedGenre(e.target.value))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border focus:outline-none ${
                      isMidnight
                        ? 'bg-stone-900 border-stone-800 text-stone-300'
                        : 'bg-amber-100 border-amber-300 text-stone-800'
                    }`}
                  >
                    {GENRES.map((g) => (
                      <option key={g} value={g}>
                        Genre: {g}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Story Grid */}
              {loading && stories.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs text-stone-400">Loading library manuscripts...</p>
                </div>
              ) : filteredStories.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStories.map((story) => (
                    <StoryCard key={story.id} story={story} />
                  ))}
                </div>
              ) : (
                <div
                  className={`p-12 rounded-3xl border text-center space-y-4 ${
                    isMidnight ? 'bg-stone-900/30 border-stone-800' : 'bg-amber-50/60 border-amber-200'
                  }`}
                >
                  <BookOpen className="w-10 h-10 text-stone-500 mx-auto" />
                  <div>
                    <h4 className="text-base font-serif font-bold text-stone-200">
                      No manuscripts match your filter
                    </h4>
                    <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                      Try clearing search parameters or start a new collaborative story as the first author.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (isAuthenticated) dispatch(openModal('newStory'));
                      else dispatch(openModal('signup'));
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-transform hover:scale-105"
                  >
                    Create First Manuscript
                  </button>
                </div>
              )}
            </section>
          </div>
        )}

        {activeView === 'storyViewer' && <StoryViewer />}

        {activeView === 'storyEditor' && <StoryEditor />}
      </main>

      {/* Footer */}
      <footer
        className={`border-t py-8 px-4 text-center text-xs transition-colors ${
          isMidnight ? 'bg-stone-950 border-stone-800 text-stone-500' : 'bg-[#F7F3EB] border-amber-200 text-stone-600'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Feather className="w-4 h-4 text-amber-500" />
            <span className="font-serif font-bold text-stone-300">ScribeSpace</span>
            <span>·</span>
            <span>Collaborative Storytelling Platform</span>
          </div>

          <div className="flex items-center gap-4 text-stone-400">
            <span>PERN Stack: PostgreSQL · Express · React · Node</span>
            <span>·</span>
            <button
              onClick={() => dispatch(openModal('deployGuide'))}
              className="text-amber-500 hover:underline font-semibold"
            >
              Render Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Global Modals */}
      {(activeModal === 'login' || activeModal === 'signup') && <AuthModal />}
      {activeModal === 'newStory' && <NewStoryModal />}
      {activeModal === 'contributors' && <ContributorModal />}
      {activeModal === 'versions' && <VersionHistoryModal />}
      {activeModal === 'deployGuide' && <RenderDeployGuide />}
    </div>
  );
}
