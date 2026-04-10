'use client';

import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Shield, Eye, Database, Lock } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyContent() {
  return (
    <div className="min-h-screen bg-mesh p-8 md:p-20 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="self-start mb-12"
      >
        <Link
          href="/"
          className="flex items-center gap-2 text-brand-600 font-bold hover:text-brand-800 transition-all bg-white/50 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-white"
        >
          <ArrowLeft size={20} />
          Back to Login
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full glass p-10 md:p-16 rounded-[3rem] border border-white/50 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-emerald-500">
          <Shield size={200} />
        </div>

        <header className="mb-12 border-b border-brand-100 pb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner border border-emerald-100">
              <Shield size={24} />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-brand-700 tracking-tight">Privacy Policy</h1>
          </div>
          <p className="text-slate-500 text-lg">Last Updated: April 10, 2026</p>
        </header>

        <div className="space-y-12 text-slate-600 leading-relaxed">
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-700 flex items-center gap-3">
              <Eye className="text-brand-400" size={24} />
              Information We Collect
            </h2>
            <div className="space-y-4">
              <p>
                To provide you with a high-quality Marketing Engine experience, we collect specific information when you interact with our platform:
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: "Account Info", desc: "Name, email, and preferences provided during sign-up." },
                  { title: "API Credentials", desc: "TikTok and Google AI API keys securely stored for your use." },
                  { title: "Usage Data", desc: "Information on how you use our AI generators and analytics." },
                  { title: "Third-party Data", desc: "Public profile info from connected accounts like TikTok." }
                ].map((item, i) => (
                  <li key={i} className="bg-white/40 p-5 rounded-2xl border border-white/60">
                    <h4 className="font-bold text-brand-700 text-sm mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-700 flex items-center gap-3">
              <Database className="text-brand-400" size={24} />
              How We Use Your Data
            </h2>
            <p>
              Your data is primarily used to facilitate the AI generation process. For example, your campaign goals are sent to Google Gemini to craft your marketing copy. We do not sell your personal data to third parties. We use your data to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 text-sm">
              <li>Generate relevant marketing content tailored to your brand.</li>
              <li>Provide real-time TikTok analytics.</li>
              <li>Improve platform performance and AI accuracy.</li>
              <li>Communicate important updates regarding your account.</li>
            </ul>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-700 flex items-center gap-3">
              <Lock className="text-brand-400" size={24} />
              Security First
            </h2>
            <div className="p-8 bg-brand-700 text-white rounded-[2rem] shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-brand-100 font-medium mb-4">
                  We implement industry-standard security measures to protect your information. All sensitive credentials, including API keys, are encrypted at rest and in transit.
                </p>
                <div className="flex gap-4">
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/20">SSL/TLS Encryption</div>
                  <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-white/20">Secure OAuth 2.0</div>
                </div>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-10">
                 <Lock size={150} />
               </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-brand-700 flex items-center gap-3">
              <span className="text-brand-400">04.</span> Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal information at any time. You can disconnect your TikTok account from the settings panel or contact us to permanently remove your account data.
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-10 border-t border-brand-100 text-center">
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold">© 2026 Marketing Engine • Secure & Private</p>
        </footer>
      </motion.div>
    </div>
  );
}
