import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logoutUser } from '../store/slices/authSlice';
import { openModal, toggleTheme, navigateTo } from '../store/slices/uiSlice';
import { setFilter } from '../store/slices/storySlice';
import {
  BookOpen,
  Feather,
  Sun,
  Moon,
  Plus,
  LogOut,
  User as UserIcon,
  Server,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme, activeView } = useAppSelector((state) => state.ui);

  const isMidnight = theme === 'midnight';

  const handleNavClick = (filterType: 'all' | 'mine' | 'collaborations') => {
    dispatch(setFilter(filterType));
    dispatch(navigateTo({ view: 'home' }));
  };

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur-md transition-colors ${
        isMidnight
          ? 'bg-stone-950/85 border-stone-800 text-stone-100'
          : 'bg-amber-50/85 border-amber-200 text-stone-900'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 md:px-8 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => dispatch(navigateTo({ view: 'home' }))}
          className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0"
        >
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-md ${
              isMidnight
                ? 'bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950'
                : 'bg-gradient-to-tr from-stone-800 to-amber-700 text-amber-100'
            }`}
          >
            <Feather className="w-5 h-5" />
          </div>
          <span className="font-serif font-black text-xl tracking-tight">
            ScribeSpace
          </span>
        </button>

        {/* Zone 2: 4-5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide">
          <button
            onClick={() => handleNavClick('all')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline ${
              isMidnight ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-black'
            }`}
          >
            All Stories
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                dispatch(openModal('login'));
              } else {
                handleNavClick('mine');
              }
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline ${
              isMidnight ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-black'
            }`}
          >
            My Manuscripts
          </button>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                dispatch(openModal('login'));
              } else {
                handleNavClick('collaborations');
              }
            }}
            className={`transition-colors whitespace-nowrap shrink-0 hover:underline ${
              isMidnight ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-black'
            }`}
          >
            Co-Authored Works
          </button>
          <button
            onClick={() => dispatch(openModal('deployGuide'))}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 hover:underline ${
              isMidnight ? 'text-amber-400 hover:text-amber-300' : 'text-amber-800 hover:text-amber-900'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Render Deploy Guide</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action cluster */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className={`p-2 rounded-xl border transition-colors ${
              isMidnight
                ? 'bg-stone-900 border-stone-800 text-amber-400 hover:bg-stone-800'
                : 'bg-amber-100 border-amber-300 text-stone-800 hover:bg-amber-200'
            }`}
            title={`Switch to ${isMidnight ? 'Parchment Light' : 'Midnight Dark'} theme`}
          >
            {isMidnight ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <button
                onClick={() => dispatch(openModal('newStory'))}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Story</span>
              </button>

              <div
                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border ${
                  isMidnight ? 'bg-stone-900/90 border-stone-800' : 'bg-amber-100 border-amber-300'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-semibold max-w-[90px] truncate">
                  {user.username}
                </span>
                <button
                  onClick={() => dispatch(logoutUser())}
                  className="text-stone-400 hover:text-rose-400 transition-colors ml-1"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => dispatch(openModal('login'))}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
                  isMidnight
                    ? 'text-stone-300 hover:text-white hover:bg-stone-900'
                    : 'text-stone-700 hover:text-black hover:bg-amber-200/60'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => dispatch(openModal('signup'))}
                className="px-4 py-2 text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
              >
                Join ScribeSpace
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
