import React, { useState } from 'react';
import { Comment } from '../types';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addComment } from '../store/slices/storySlice';
import { openModal } from '../store/slices/uiSlice';
import { MessageSquare, Send, User } from 'lucide-react';

interface CommentsSectionProps {
  storyId: number;
  comments: Comment[];
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({ storyId, comments }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { theme } = useAppSelector((state) => state.ui);
  const isMidnight = theme === 'midnight';

  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await dispatch(addComment({ story_id: storyId, content: content.trim() })).unwrap();
      setContent('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6 pt-8 border-t border-stone-800">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-serif font-black flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-amber-500" />
          Manuscript Discussion &amp; Feedback ({comments.length})
        </h3>
      </div>

      {/* New Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold text-xs flex items-center justify-center shrink-0">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts, pacing critique, or chapter suggestions..."
                rows={3}
                className={`w-full p-3.5 rounded-2xl border text-xs focus:outline-none focus:border-amber-500 ${
                  isMidnight
                    ? 'bg-stone-900 border-stone-800 text-white placeholder:text-stone-500'
                    : 'bg-amber-50 border-amber-300 text-stone-900 placeholder:text-stone-400'
                }`}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!content.trim() || isSubmitting}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-transform active:scale-95 disabled:opacity-50 shadow-md"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Posting...' : 'Post Critique'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div
          className={`p-4 rounded-2xl border text-center space-y-2 ${
            isMidnight ? 'bg-stone-900/60 border-stone-800' : 'bg-amber-50 border-amber-200'
          }`}
        >
          <p className="text-xs text-stone-400">Join the discussion to leave comments for the authors.</p>
          <button
            onClick={() => dispatch(openModal('login'))}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md"
          >
            Log In to Comment
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-3 pt-2">
        {comments.length > 0 ? (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-4 rounded-2xl border space-y-1.5 ${
                isMidnight ? 'bg-stone-900/40 border-stone-800/80' : 'bg-amber-50/60 border-amber-200/80'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-stone-800 text-amber-400 text-[10px] font-bold flex items-center justify-center">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-bold text-stone-200">{comment.username}</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-stone-300 pl-8 leading-relaxed font-serif">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-stone-500 italic text-center py-4">
            No critiques yet. Be the first to share your thoughts on this manuscript.
          </p>
        )}
      </div>
    </section>
  );
};
