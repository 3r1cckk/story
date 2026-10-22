import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addContributor, removeContributor } from '../store/slices/storySlice';
import { closeModal } from '../store/slices/uiSlice';
import { apiFetch } from '../../src/services/api';
import { User, Contributor } from '../types';
import { X, UserPlus, Trash2, Users, Check, AlertCircle } from 'lucide-react';

export const ContributorModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentStory } = useAppSelector((state) => state.stories);
  const { user } = useAppSelector((state) => state.auth);

  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('');
  const [selectedRole, setSelectedRole] = useState<'contributor' | 'editor'>('contributor');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const users = await apiFetch<User[]>('/users');
        setAvailableUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err);
      } finally {
        setLoadingUsers(false);
      }
    }
    loadUsers();
  }, []);

  if (!currentStory) return null;

  const isAuthor = user && user.id === currentStory.author_id;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;

    setErrorMessage(null);
    setStatusMessage(null);

    try {
      await dispatch(
        addContributor({
          story_id: currentStory.id,
          user_id: Number(selectedUserId),
          role: selectedRole,
        })
      ).unwrap();

      setStatusMessage('Collaborator added successfully!');
      setSelectedUserId('');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setErrorMessage(err || 'Failed to add collaborator.');
    }
  };

  const handleRemove = async (contribId: number) => {
    try {
      await dispatch(removeContributor(contribId)).unwrap();
      setStatusMessage('Collaborator removed.');
      setTimeout(() => setStatusMessage(null), 2500);
    } catch (err: any) {
      setErrorMessage(err || 'Failed to remove collaborator.');
    }
  };

  // Filter out author and existing contributors from candidate list
  const existingUserIds = new Set([
    currentStory.author_id,
    ...(currentStory.contributors?.map((c) => c.user_id) || []),
  ]);
  const candidates = availableUsers.filter((u) => !existingUserIds.has(u.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative text-stone-100">
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-serif font-black flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-500" />
          Manuscript Co-Authors &amp; Contributors
        </h3>
        <p className="text-xs text-stone-400 mt-1">
          Co-authors can collaborate simultaneously, edit chapters, and create milestone revisions.
        </p>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Existing Contributors List */}
        <div className="mt-6 space-y-2">
          <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">
            Current Collaborators ({currentStory.contributors?.length || 0})
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {/* Lead Author */}
            <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                  {currentStory.author_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">{currentStory.author_name}</div>
                  <div className="text-[10px] text-stone-400">Lead Author (Owner)</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase">Author</span>
            </div>

            {/* Invited Contributors */}
            {currentStory.contributors && currentStory.contributors.length > 0 ? (
              currentStory.contributors.map((contrib) => (
                <div
                  key={contrib.id}
                  className="p-3 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-stone-800 text-stone-300 flex items-center justify-center font-bold text-xs">
                      {contrib.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{contrib.username}</div>
                      <div className="text-[10px] text-stone-400">{contrib.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-stone-400 capitalize">
                      {contrib.role}
                    </span>
                    {isAuthor && (
                      <button
                        onClick={() => handleRemove(contrib.id)}
                        className="text-stone-500 hover:text-rose-400 p-1 transition-colors"
                        title="Remove Contributor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-stone-800 text-center text-xs text-stone-500">
                No external contributors invited yet. Invite registered writers below.
              </div>
            )}
          </div>
        </div>

        {/* Invite Form (Author Only) */}
        {isAuthor && (
          <form onSubmit={handleAdd} className="mt-6 pt-5 border-t border-stone-800 space-y-3">
            <div className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-amber-500" />
              Invite New Co-Author
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="">Select registered writer...</option>
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.username} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="contributor">Contributor</option>
                  <option value="editor">Editor</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedUserId}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50"
            >
              Add Co-Author
            </button>
          </form>
        )}

        <div className="mt-6 flex justify-end">
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
