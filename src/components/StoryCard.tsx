import React from 'react';
import { Story } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { navigateTo } from '../store/slices/uiSlice';
import { Users, MessageSquare, Feather, ArrowUpRight } from 'lucide-react';

interface StoryCardProps {
  story: Story;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story }) => {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.ui);
  const { user } = useAppSelector((state) => state.auth);
  const isMidnight = theme === 'midnight';

  const isAuthor = user && user.id === story.author_id;
  const wordCount = story.content ? story.content.split(/\s+/).filter(Boolean).length : 0;

  return (
    <article
      onClick={() => dispatch(navigateTo({ view: 'storyViewer', storyId: story.id }))}
      className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl cursor-pointer group ${
        isMidnight
          ? 'bg-stone-900/70 border-stone-800 hover:border-amber-500/50 hover:bg-stone-900'
          : 'bg-amber-50/70 border-amber-200/90 hover:border-amber-500/50 hover:bg-amber-50'
      }`}
    >
      <div>
        {/* Clean Unboxed Metadata Line (Zero-Pill Rule) */}
        <div className="flex items-center gap-2 text-xs text-stone-400 mb-2 font-medium">
          <span className="text-amber-500 font-semibold">{story.genre || 'Literature'}</span>
          <span aria-hidden="true">·</span>
          <span>By {story.author_name}</span>
          {isAuthor && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-bold">Author</span>
            </>
          )}
        </div>

        {/* Story Title */}
        <h3
          className="text-lg md:text-xl font-serif font-black tracking-tight group-hover:text-amber-500 transition-colors"
          style={{ textWrap: 'balance' }}
        >
          {story.title}
        </h3>

        {/* Synopsis / Excerpt */}
        <p
          className={`mt-2 text-xs md:text-sm line-clamp-3 leading-relaxed ${
            isMidnight ? 'text-stone-300' : 'text-stone-600'
          }`}
        >
          {story.synopsis || story.content.slice(0, 160) + '...'}
        </p>
      </div>

      {/* Bottom Footer Metadata */}
      <div className="mt-6 pt-4 border-t border-stone-800/60 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-4">
          <span className="font-mono tabular-nums">{wordCount.toLocaleString()} words</span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-stone-400" />
            <span className="tabular-nums font-mono">{story.contributors_count || 0}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-stone-400" />
            <span className="tabular-nums font-mono">{story.comments_count || 0}</span>
          </span>
        </div>

        <div className="flex items-center gap-1 text-amber-500 font-bold text-xs group-hover:translate-x-0.5 transition-transform">
          <span>Read Manuscript</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
};
