import React from 'react';
import { useAppDispatch } from '../store/hooks';
import { closeModal } from '../store/slices/uiSlice';
import { X, Server, Database, ShieldCheck, Terminal, Copy, Check } from 'lucide-react';

export const RenderDeployGuide: React.FC = () => {
  const dispatch = useAppDispatch();
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative text-stone-100 max-h-[90vh] overflow-y-auto space-y-6">
        <button
          onClick={() => dispatch(closeModal())}
          className="absolute top-5 right-5 text-stone-400 hover:text-white p-1 rounded-full hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider">
            <Server className="w-4 h-4" />
            Deployment &amp; Architecture Documentation
          </div>
          <h3 className="text-2xl font-serif font-black text-white mt-1">
            Deploying ScribeSpace on Render.com
          </h3>
          <p className="text-xs text-stone-400 mt-1">
            Step-by-step deployment guide for the full-stack PERN (PostgreSQL, Express, React, Node) application.
          </p>
        </div>

        {/* 1. Database Provisioning */}
        <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Database className="w-4 h-4" />
            Step 1: Provision Render PostgreSQL Database
          </div>
          <ol className="list-decimal list-inside text-xs text-stone-300 space-y-1.5 leading-relaxed">
            <li>Log into your <strong>Render.com</strong> dashboard and click <strong>New +</strong> → <strong>PostgreSQL</strong>.</li>
            <li>Set Name to <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">scribespace-db</code> and select the Free tier.</li>
            <li>Once provisioned, copy the <strong>Internal Database URL</strong> (e.g. <code className="text-stone-400">postgres://...render.internal:5432/...</code>) to ensure low latency.</li>
            <li>Execute the schema script in the database shell using <code className="text-amber-300 bg-stone-900 px-1 py-0.5 rounded">src/backend/db/schema.sql</code>.</li>
          </ol>
        </div>

        {/* 2. Web Service Setup */}
        <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Terminal className="w-4 h-4" />
            Step 2: Deploy Web Service (Node.js &amp; Express + Vite)
          </div>
          <div className="text-xs text-stone-300 space-y-2">
            <p>Create a <strong>New Web Service</strong> linked to your GitHub repository:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-stone-500 block text-[10px] uppercase font-sans">Build Command:</span>
                <span className="text-amber-300">npm install &amp;&amp; npm run build</span>
              </div>
              <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                <span className="text-stone-500 block text-[10px] uppercase font-sans">Start Command:</span>
                <span className="text-amber-300">npm start</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Environment Variables */}
        <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <ShieldCheck className="w-4 h-4" />
            Step 3: Environment Variables Checklist
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800 font-mono text-[11px]">
              <span>DATABASE_URL = [Paste Internal DB URL from Step 1]</span>
              <button
                onClick={() => handleCopy('DATABASE_URL', 'db')}
                className="text-stone-400 hover:text-white ml-2"
              >
                {copiedKey === 'db' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800 font-mono text-[11px]">
              <span>JWT_SECRET = your_production_super_secret_jwt_key</span>
              <button
                onClick={() => handleCopy('JWT_SECRET', 'jwt')}
                className="text-stone-400 hover:text-white ml-2"
              >
                {copiedKey === 'jwt' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-900 border border-stone-800 font-mono text-[11px]">
              <span>REFRESH_SECRET = your_production_super_secret_refresh_key</span>
              <button
                onClick={() => handleCopy('REFRESH_SECRET', 'ref')}
                className="text-stone-400 hover:text-white ml-2"
              >
                {copiedKey === 'ref' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={() => dispatch(closeModal())}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
