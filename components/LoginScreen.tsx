import React, { useState } from 'react';
import { LogoIcon, LogoText } from './Logo';
import { User } from '../types';

interface LoginScreenProps {
  onLogin: (user: User) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
        onLogin({
            name,
            email,
            preferences: []
        });
    }, 800);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl p-3 mb-4">
                <LogoIcon className="w-full h-full" />
            </div>
            <LogoText />
            <p className="text-slate-500 mt-2 text-center text-sm">Your Personal AI Shopping Assistant</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Your Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. John Doe"
                    required
                />
            </div>
            <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wide">Email</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="e.g. john@example.com"
                    required
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all transform hover:scale-[1.02] shadow-blue-200 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed mt-4"
            >
                {loading ? 'Setting up...' : 'Start Shopping'}
            </button>
        </form>

        <div className="mt-6 text-center">
            <p className="text-xs text-slate-400">By continuing, you agree to experience the future of shopping.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;