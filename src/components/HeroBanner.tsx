import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { openModal } from '../store/slices/uiSlice';
import { Plus, Sparkles, BookOpen, Users, GitFork, ShieldCheck } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const isMidnight = theme === 'midnight';

  return (
    <section className="space-y-8">
      {/* 2-Column Split Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Column: Typographic Hierarchy */}
        <div className="lg:col-span-7 flex flex-col justify-between py-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              Collaborative Storytelling Platform
            </div>

            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-serif font-black tracking-tight leading-[1.15]"
              style={{ textWrap: 'balance' }}
            >
              Where writers unite to weave living, breathing worlds.
            </h1>

            <p
              className={`mt-4 text-sm sm:text-base leading-relaxed max-w-xl ${
                isMidnight ? 'text-stone-300' : 'text-stone-700'
              }`}
            >
              Draft sprawling sagas, invite trusted co-authors, and collaborate on manuscripts in real
              time. Protected by PostgreSQL and JWT token rotation with instantaneous version snapshots.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  dispatch(openModal('newStory'));
                } else {
                  dispatch(openModal('signup'));
                }
              }}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-xl flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Manuscript</span>
            </button>

            <button
              onClick={() => dispatch(openModal('deployGuide'))}
              className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 ${
                isMidnight
                  ? 'border-stone-800 bg-stone-900/60 text-stone-300 hover:bg-stone-800 hover:text-white'
                  : 'border-amber-300 bg-amber-100/60 text-stone-800 hover:bg-amber-200'
              }`}
            >
              Explore PERN Architecture
            </button>
          </div>
        </div>

        {/* Right Column: Hero Illustration */}
        <div className="lg:col-span-5 relative min-h-[280px] lg:min-h-full rounded-3xl overflow-hidden border shadow-2xl group">
          <img
            src="/src/assets/images/storytelling_hero_1792657292506.jpg"
            alt="Writers collaborating around an illuminated storytelling manuscript"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="text-xs font-bold text-amber-300 font-serif">
              The Living Manuscript
            </div>
            <div className="text-[11px] text-stone-300 mt-0.5">
              Simultaneous writing with multi-user presence indicators
            </div>
          </div>
        </div>
      </div>

      {/* Full-width KPI / Architectural Feature Strip below split */}
      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-2xl border ${
          isMidnight ? 'bg-stone-900/50 border-stone-800/80' : 'bg-amber-50 border-amber-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Role-Based Access</div>
            <div className="text-[11px] text-stone-400">Author &amp; contributor roles</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">JWT + HTTP Cookie</div>
            <div className="text-[11px] text-stone-400">In-memory Redux security</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">Version Milestones</div>
            <div className="text-[11px] text-stone-400">Immutable story revisions</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold">PostgreSQL Engine</div>
            <div className="text-[11px] text-stone-400">Render cloud ready DDL</div>
          </div>
        </div>
      </div>
    </section>
  );
};
