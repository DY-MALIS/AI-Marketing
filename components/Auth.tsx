'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  Lock, 
  User, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthProps {
  onLogin: () => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contact: '',
    birthday: '',
    gender: '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate auth
    onLogin();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-mesh p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-10">
          <p className="text-slate-400 mt-2 text-lg font-medium">
            {isLogin ? 'Sign in to continue to Marketing Engine' : 'Join Marketing Engine and grow your business'}
          </p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[3rem] border border-white/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-5 bg-brand-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-700/30 hover:bg-brand-800 transition-all flex items-center justify-center gap-3 mt-4"
            >
              {isLogin ? 'Sign In' : 'Sign Up'}
              <ChevronRight size={20} />
            </motion.button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">Or continue with</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => alert('Redirecting to TikTok OAuth...')}
              className="w-full py-4 bg-black text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:bg-slate-900"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.06 3.42-.01 6.83-.02 10.25-.17 4.14-4.23 7.25-8.26 6.5-3.94-.73-6.47-5.11-4.67-8.73 1.14-2.2 3.86-3.54 6.32-3.14.05 1.58 0 3.16 0 4.74-1.57-.14-3.29.35-4.23 1.71-.96 1.39-.64 3.55.75 4.53 1.38.97 3.56.64 4.53-.75.28-.38.39-.84.41-1.3.02-3.58 0-7.17.01-10.75 0-2.87 0-5.74 0-8.61z"/>
              </svg>
              Continue with TikTok
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-700 font-bold hover:text-brand-800 transition-colors flex items-center justify-center gap-2 mx-auto text-sm"
            >
              {isLogin ? (
                <>
                  <Plus size={18} />
                  Create new account
                </>
              ) : (
                <>
                  <ArrowLeft size={18} />
                  I already have an account
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-10 leading-relaxed font-medium uppercase tracking-widest">
          By continuing, you agree to Marketing Engine&apos;s <br />
          <Link 
            href="/terms-of-service"
            className="text-brand-600 font-bold cursor-pointer hover:text-brand-800 transition-colors underline decoration-brand-200"
          >
            Terms of Service
          </Link> and <Link 
            href="/privacy-policy"
            className="text-brand-600 font-bold cursor-pointer hover:text-brand-800 transition-colors underline decoration-brand-200"
          >
            Privacy Policy
          </Link>.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
