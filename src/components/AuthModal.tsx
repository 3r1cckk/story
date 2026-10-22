import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loginUser, registerUser, clearAuthError } from '../store/slices/authSlice';
import { closeModal, openModal } from '../store/slices/uiSlice';
import { X, Lock, Mail, User, AlertCircle, KeyRound, Sparkles } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeModal } = useAppSelector((state) => state.ui);
  const { loading, error } = useAppSelector((state) => state.auth);

  const isLogin = activeModal === 'login';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    dispatch(clearAuthError());

    try {
      if (isLogin) {
        await dispatch(loginUser({ email, password })).unwrap();
        dispatch(closeModal());
      } else {
        if (!username.trim()) {
          setLocalError('Username is required.');
          return;
        }
        await dispatch(registerUser({ username: username.trim(), email, password })).unwrap();
        dispatch(closeModal());
      }
    } catch (err: any) {
      // Error is stored in redux state
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    dispatch(clearAuthError());
    setLocalError(null);
    try {
      await dispatch(loginUser({ email: demoEmail, password: 'password123' })).unwrap();
      dispatch(closeModal());
    } catch (err) {
      console.error('Demo login failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative text-stone-100">
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Switcher */}
        <div className="flex border-b border-stone-800 pb-3 gap-6 mb-6">
          <button
            onClick={() => dispatch(openModal('login'))}
            className={`text-base font-serif font-bold transition-colors ${
              isLogin ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-stone-400 hover:text-white'
            }`}
          >
            Log In
          </button>
          <button
            onClick={() => dispatch(openModal('signup'))}
            className={`text-base font-serif font-bold transition-colors ${
              !isLogin ? 'text-amber-400 border-b-2 border-amber-400 pb-1' : 'text-stone-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {(error || localError) && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. will_shakespeare"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="author@scribespace.com"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-stone-950 border border-stone-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In to Library' : 'Create Account & Sign In'}
          </button>
        </form>

        {/* 1-Click Demo Accounts for testing */}
        <div className="mt-6 pt-5 border-t border-stone-800">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            Quick 1-Click Demo Accounts
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('elena@scribespace.com')}
              className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-white text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-amber-300">Elena (Author)</div>
              <div className="text-[10px] text-stone-500">Clockwork Archipelago</div>
            </button>
            <button
              onClick={() => handleDemoLogin('marcus@scribespace.com')}
              className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 text-stone-300 hover:text-white text-left transition-colors"
            >
              <div className="font-bold text-[11px] text-amber-300">Marcus (Contributor)</div>
              <div className="text-[10px] text-stone-500">Co-Author of Ch. 1</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
