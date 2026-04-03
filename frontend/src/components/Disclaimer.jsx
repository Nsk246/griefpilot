import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Disclaimer({ onAccept }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 bg-night-950 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-2 h-2 rounded-full bg-lavender-400 shimmer" />
            <span className="text-lavender-300 text-sm font-medium tracking-widest uppercase">GriefPilot</span>
            <div className="w-2 h-2 rounded-full bg-lavender-400 shimmer" />
          </div>
          <h1 className="text-3xl font-serif text-white font-normal leading-snug">
            A companion for<br />what words can hold
          </h1>
        </div>

        {/* Cards */}
        <div className="space-y-3 mb-8">
          <div className="bg-night-800 border border-night-600 rounded-2xl p-4">
            <p className="text-xs text-lavender-300 font-medium uppercase tracking-widest mb-1">Not therapy</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              GriefPilot is a supportive companion tool, not a licensed mental health provider or crisis service. It does not replace professional care.
            </p>
          </div>

          <div className="bg-night-800 border border-night-600 rounded-2xl p-4">
            <p className="text-xs text-lavender-300 font-medium uppercase tracking-widest mb-1">Your privacy</p>
            <p className="text-sm text-gray-300 leading-relaxed">
              Your voice is processed in real time and never stored. No recordings are saved. Your memories stay with you.
            </p>
          </div>

          <div className="bg-night-700 border border-lavender-400/30 rounded-2xl p-4">
            <p className="text-xs text-rose-grief font-medium uppercase tracking-widest mb-1">If you are in crisis</p>
            <p className="text-sm text-gray-200 leading-relaxed">
              Call or text <span className="text-white font-semibold">988</span> (Suicide & Crisis Lifeline) · Text <span className="text-white font-semibold">HOME</span> to <span className="text-white font-semibold">741741</span>
            </p>
          </div>
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 group">
          <div
            onClick={() => setChecked(!checked)}
            className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              checked
                ? 'bg-lavender-500 border-lavender-400'
                : 'bg-transparent border-night-600 group-hover:border-lavender-400/50'
            }`}
          >
            {checked && (
              <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-400 leading-relaxed">
            I understand GriefPilot is a companion tool, not a mental health provider. I am not currently in crisis.
          </span>
        </label>

        <button
          onClick={() => checked && onAccept()}
          disabled={!checked}
          className={`w-full py-3.5 rounded-2xl text-sm font-medium tracking-wide transition-all duration-300 ${
            checked
              ? 'bg-lavender-500 hover:bg-lavender-400 text-white cursor-pointer'
              : 'bg-night-700 text-gray-600 cursor-not-allowed'
          }`}
        >
          Begin session
        </button>

        <p className="text-center text-xs text-gray-600 mt-4">
          Take your time. There is no rush here.
        </p>
      </motion.div>
    </div>
  )
}