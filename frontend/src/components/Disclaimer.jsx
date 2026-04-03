import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Disclaimer({ onAccept }) {
  const [checked, setChecked] = useState(false)

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 40% 0%, #160f2e 0%, #080613 55%)' }}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400 shimmer"
              style={{ boxShadow: '0 0 8px rgba(155,144,234,0.8)' }} />
            <span className="text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ background: 'linear-gradient(135deg, #d5cffb, #9b90ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              HearMe
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-lavender-400 shimmer"
              style={{ boxShadow: '0 0 8px rgba(155,144,234,0.8)', animationDelay: '1s' }} />
          </div>
          <h1 className="text-[28px] font-serif text-white font-normal leading-[1.35]">
            A space to speak<br />and feel heard
          </h1>
        </div>

        {/* Cards */}
        <div className="space-y-2.5 mb-8">
          {[
            {
              label: 'Not therapy',
              labelColor: '#b9b0f6',
              text: 'HearMe is a supportive companion tool, not a licensed mental health provider or crisis service. It does not replace professional care.',
              border: 'rgba(155,144,234,0.15)',
              bg: 'rgba(22,18,42,0.6)',
            },
            {
              label: 'Your privacy',
              labelColor: '#b9b0f6',
              text: 'Your voice is processed in real time and never stored. No recordings are saved. Your memories stay with you.',
              border: 'rgba(155,144,234,0.15)',
              bg: 'rgba(22,18,42,0.6)',
            },
            {
              label: 'If you are in crisis',
              labelColor: '#f0a8c0',
              text: null,
              border: 'rgba(240,168,192,0.25)',
              bg: 'rgba(240,168,192,0.06)',
              crisis: true,
            },
          ].map(card => (
            <div key={card.label}
              className="rounded-2xl p-4 backdrop-blur-sm"
              style={{ border: `1px solid ${card.border}`, background: card.bg }}>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] mb-1.5"
                style={{ color: card.labelColor }}>
                {card.label}
              </p>
              {card.crisis ? (
                <p className="text-sm text-gray-100 leading-relaxed">
                  Call or text <span className="text-white font-bold">988</span> (Suicide & Crisis Lifeline)
                  {' '}· Text <span className="text-white font-bold">HOME</span> to <span className="text-white font-bold">741741</span>
                </p>
              ) : (
                <p className="text-sm text-gray-300 leading-relaxed">{card.text}</p>
              )}
            </div>
          ))}
        </div>

        {/* Checkbox */}
        <label className="flex items-start gap-3 cursor-pointer mb-6 group select-none">
          <div
            onClick={() => setChecked(!checked)}
            className="mt-0.5 w-5 h-5 rounded-md flex-shrink-0 flex items-center justify-center transition-all duration-200"
            style={{
              border: checked
                ? '2px solid rgba(155,144,234,0.9)'
                : '2px solid rgba(155,144,234,0.3)',
              background: checked
                ? 'linear-gradient(135deg, #7d70db, #9b90ea)'
                : 'transparent',
              boxShadow: checked ? '0 0 12px rgba(125,112,219,0.4)' : 'none',
            }}
          >
            {checked && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span className="text-sm text-gray-300 leading-relaxed">
            I understand HearMe is a companion tool, not a mental health provider. I am not currently in crisis.
          </span>
        </label>

        <button
          onClick={() => checked && onAccept()}
          disabled={!checked}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-300"
          style={checked ? {
            background: 'linear-gradient(135deg, #7d70db, #9b90ea)',
            color: 'white',
            boxShadow: '0 4px 24px rgba(125,112,219,0.45), 0 1px 0 rgba(255,255,255,0.1) inset',
            cursor: 'pointer',
          } : {
            background: 'rgba(30,28,52,0.6)',
            color: 'rgba(255,255,255,0.25)',
            border: '1px solid rgba(255,255,255,0.06)',
            cursor: 'not-allowed',
          }}
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
