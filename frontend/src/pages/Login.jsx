import React, { useState } from 'react';
import API from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldAlert, Activity } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await API.post('/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('username', response.data.username);

      if (response.data.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/staff');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'ACCESS_DENIED: INVALID_CREDENTIALS');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] font-sans selection:bg-white selection:text-black p-4 relative overflow-hidden">
      
      {/* Background Tech Detail */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
        <div className="text-[12rem] font-black text-center uppercase leading-none break-all">
NO PAIN NO GAIN  EAT SLEEP TRAIN <br/> IRON PARADISE <br/> MAXIMUM EFFORT  PURE GRIT  HEAVY DUTY  BREAK LIMITS  REPS TO FAILURE  BLOOD AND GUTS  UNSTOPPABLE DRIVE        </div>
      </div>

      <div className="w-full max-w-md relative group">
        
        {/* Subtle Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#333] to-[#111] rounded-sm blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

        <div className="relative bg-[#151515] border border-[#222] p-8 md:p-12 shadow-2xl">
          
          {/* Top Status Bar */}
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-[10px] font-mono text-gray-500 tracking-widest uppercase">Server: Online</span>
            </div>
            <Activity size={14} className="text-gray-700" />
          </div>

          <header className="mb-10 text-center md:text-left">
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none mb-2">
              GYM <span className="text-gray-500 underline decoration-1 underline-offset-4">CRM</span>
            </h1>
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.2em]">Restricted Personnel Only</p>
          </header>

          {error && (
            <div className="mb-6 p-4 bg-red-950/20 border-l-2 border-red-500 flex items-center gap-3 animate-shake">
              <ShieldAlert className="text-red-500" size={18} />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-8">
            <div className="relative group">
              <label className="absolute -top-6 left-0 text-[10px] font-black text-gray-600 uppercase tracking-widest group-focus-within:text-white transition-all">
                Identification
              </label>
              <div className="flex items-center border-b border-[#333] group-focus-within:border-white transition-all py-2">
                <User size={18} className="text-gray-600 group-focus-within:text-white mr-3" />
                <input
                  type="text"
                  className="w-full bg-transparent text-white outline-none font-mono text-sm uppercase placeholder:text-gray-700"
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="off"
                />
              </div>
            </div>

            <div className="relative group">
              <label className="absolute -top-6 left-0 text-[10px] font-black text-gray-600 uppercase tracking-widest group-focus-within:text-white transition-all">
                Security Key
              </label>
              <div className="flex items-center border-b border-[#333] group-focus-within:border-white transition-all py-2">
                <Lock size={18} className="text-gray-600 group-focus-within:text-white mr-3" />
                <input
                  type="password"
                  className="w-full bg-transparent text-white outline-none font-mono text-sm placeholder:text-gray-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-white text-black font-black py-4 uppercase text-xs tracking-[0.3em] hover:bg-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'VERIFYING...' : 'INITIALIZE_LOGIN'}
            </button>
          </form>

          <footer className="mt-12 pt-6 border-t border-[#222]">
            <p className="text-[9px] font-mono text-gray-700 leading-relaxed text-center uppercase tracking-tighter">
              Authorized use only. Connection is encrypted and logged. Unauthorized access attempts will be flagged.
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Login;