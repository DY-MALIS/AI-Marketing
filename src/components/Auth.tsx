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
  Plus,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

import { auth, signInWithGoogle } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { useLanguage } from '../contexts/LanguageContext';

interface AuthProps {
  onDemoMode?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onDemoMode }) => {
  const { t } = useLanguage();
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error(err);
      setErrorCode(err.code);
      if (err.code === 'auth/admin-restricted-operation' || err.code === 'auth/operation-not-allowed') {
        setError(t('firebaseAdminRestricted'));
      } else {
        setError(err.message || t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setErrorCode(err.code);
      setError(err.message || 'Google login failed');
    } finally {
      setLoading(false);
    }
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
            {isLogin ? t('signInToContinue') : t('joinAndGrow')}
          </p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[3rem] border border-white/50 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="space-y-4">
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs text-center leading-relaxed font-medium">
                  {error}
                </div>
                
                {(errorCode === 'auth/admin-restricted-operation' || errorCode === 'auth/operation-not-allowed') && onDemoMode && (
                  <motion.button 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    type="button"
                    onClick={onDemoMode}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xs shadow-xl flex items-center justify-center gap-2 hover:bg-black transition-all"
                  >
                    <Sparkles size={16} className="text-brand-400" />
                    {t('exploreDemo')}
                  </motion.button>
                )}
              </div>
            )}

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-brand-700 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-brand-700/30 hover:bg-brand-800 transition-all flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {t('continueAsGuest')}
                  <ChevronRight size={20} />
                </>
              )}
            </motion.button>

            {onDemoMode && (
              <p className="text-center text-slate-400 text-[11px] font-bold uppercase tracking-wider mt-4">
                {t('orTryDemo')} {' '}
                <button 
                  type="button"
                  onClick={onDemoMode}
                  className="text-brand-600 hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles size={12} /> {t('exploreDemo')}
                </button>
              </p>
            )}

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">{t('orContinueWith')}</span>
              </div>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white border border-slate-100 text-slate-700 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg hover:bg-slate-50 disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {t('continueWithGoogle')}
            </motion.button>
          </form>

          {/* Account toggle hidden as only supporting Guest and Google for now */}
        </div>

        <p className="text-center text-slate-400 text-[10px] mt-10 leading-relaxed font-medium uppercase tracking-widest">
          {t('termsAndPrivacyPrefix')} <br />
          <span className="text-brand-600 font-bold cursor-pointer">{t('termsOfService')}</span> {t('and')} <span className="text-brand-600 font-bold cursor-pointer">{t('privacyPolicy')}</span>.
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;
