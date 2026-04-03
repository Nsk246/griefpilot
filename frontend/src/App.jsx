import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from './hooks/useSession'
import Disclaimer from './components/Disclaimer'
import GriefCompass from './components/GriefCompass'
import Constellation from './components/Constellation'
import TheLetter from './components/TheLetter'
import CrisisCard from './components/CrisisCard'

function WaveformIcon({ active }) {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`w-[3px] rounded-full transition-all duration-300 ${
            active ? 'bg-lavender-300 wave-bar' : 'bg-night-500 h-[5px]'
          }`}
        />
      ))}
    </div>
  )
}

function MicIcon({ active }) {
  const color = active ? '#c4bbf8' : '#6060a0'
  return (
    <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
      <rect x="7" y="1" width="8" height="13" rx="4" fill={color} />
      <path d="M3 10c0 4.418 3.582 8 8 8s8-3.582 8-8"
        stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="11" y1="18" x2="11" y2="21"
        stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
}

export default function App() {
  const [accepted, setAccepted] = useState(false)
  const [showLetter, setShowLetter] = useState(false)

  const {
    connected, listening, transcript, griefState,
    nodes, letter, crisis, sessionEnded, status, partial,
    startListening, stopListening, endSession, resetSession,
  } = useSession()

  if (!accepted) return <Disclaimer onAccept={() => setAccepted(true)} />
  if (crisis) return <CrisisCard />

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'transparent' }}>

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-night-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <div className={`relative w-2 h-2 rounded-full transition-all duration-700 ${
            connected
              ? 'bg-lavender-400'
              : 'bg-night-500'
          }`}>
            {connected && (
              <span className="absolute inset-0 rounded-full bg-lavender-400 animate-ping opacity-60" />
            )}
          </div>
          <span className="text-sm font-semibold tracking-wide"
            style={{ background: 'linear-gradient(135deg, #d5cffb, #9b90ea)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            HearMe
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <WaveformIcon active={listening} />
          {transcript.length > 0 && !sessionEnded && (
            <button
              onClick={() => { endSession(); setShowLetter(true) }}
              className="text-xs font-medium text-gray-300 hover:text-white px-3.5 py-1.5 rounded-lg transition-all duration-200 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10"
            >
              End session
            </button>
          )}
          {sessionEnded && (
            <button
              onClick={() => { resetSession(); setShowLetter(false) }}
              className="text-xs font-semibold text-lavender-200 hover:text-white px-3.5 py-1.5 rounded-lg transition-all duration-200 border border-lavender-500/50 hover:border-lavender-400/80 bg-lavender-500/15 hover:bg-lavender-500/25"
              style={{ boxShadow: '0 0 16px rgba(125,112,219,0.2)' }}
            >
              New session
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left panel */}
        <div className="lg:w-72 xl:w-80 border-b lg:border-b-0 lg:border-r border-white/[0.05] flex flex-col"
          style={{ background: 'linear-gradient(180deg, rgba(22,15,46,0.5) 0%, rgba(8,6,19,0.3) 100%)' }}>
          <div className="flex-1 p-5 flex flex-col gap-5">

            {/* Compass */}
            <div className="flex justify-center pt-1">
              <GriefCompass griefState={griefState} />
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Constellation */}
            <div className="flex-1 relative min-h-48">
              <p className="text-[10px] font-semibold text-lavender-300/70 uppercase tracking-[0.15em] mb-3">
                Memory constellation
              </p>
              <div className="absolute inset-0 top-7">
                <Constellation nodes={nodes} />
              </div>
            </div>
          </div>

          {/* Emotion legend */}
          {nodes.length > 0 && (
            <div className="px-5 pb-5 flex flex-wrap gap-1.5">
              {[...new Set(nodes.map(n => n.emotion))].slice(0, 5).map(emotion => {
                const node = nodes.find(n => n.emotion === emotion)
                return (
                  <span key={emotion}
                    className="text-[11px] px-2.5 py-1 rounded-full font-medium border"
                    style={{
                      borderColor: node.color + '60',
                      color: node.color,
                      backgroundColor: node.color + '18',
                    }}>
                    {emotion}
                  </span>
                )
              })}
            </div>
          )}
        </div>

        {/* Right panel — Conversation */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 lg:p-8 space-y-7">
            {transcript.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-16">
                {/* Glowing orb */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'radial-gradient(circle, rgba(155,144,234,0.15) 0%, transparent 70%)',
                      boxShadow: '0 0 40px 8px rgba(125,112,219,0.12)',
                      border: '1px solid rgba(155,144,234,0.2)',
                    }}>
                    <div className="w-3 h-3 rounded-full shimmer"
                      style={{ background: 'radial-gradient(circle, #b9b0f6, #7d70db)' }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-gray-100 text-base font-light leading-relaxed">
                    Press the button below and speak.
                  </p>
                  <p className="text-gray-500 text-sm">
                    There is no right way to begin.
                  </p>
                </div>
              </div>
            )}

            {transcript.map((turn, i) => (
              <motion.div
                key={turn.ts}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="space-y-3"
              >
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-sm lg:max-w-md xl:max-w-lg px-4 py-3 rounded-2xl rounded-tr-sm"
                    style={{
                      background: 'linear-gradient(135deg, rgba(125,112,219,0.22), rgba(155,144,234,0.14))',
                      border: '1px solid rgba(155,144,234,0.3)',
                      boxShadow: '0 2px 16px rgba(125,112,219,0.12)',
                    }}>
                    <p className="text-sm text-white leading-relaxed">{turn.user}</p>
                  </div>
                </div>

                {/* Assistant response */}
                <div className="flex justify-start">
                  <div className="max-w-sm lg:max-w-md xl:max-w-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'radial-gradient(circle, #c4bbf8, #7d70db)', boxShadow: '0 0 6px rgba(155,144,234,0.6)' }} />
                      <span className="text-[11px] text-lavender-300/80 font-semibold tracking-wider uppercase">HearMe</span>
                    </div>
                    <p className="font-serif text-[16px] text-gray-100 leading-[1.8]">{turn.assistant}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mic bar */}
          <div className="border-t border-white/[0.05] px-5 py-5 flex flex-col items-center gap-3"
            style={{ background: 'linear-gradient(0deg, rgba(8,6,19,0.9) 0%, rgba(13,10,30,0.5) 100%)' }}>
            <AnimatePresence>
              {partial && (
                <motion.p
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-lavender-200/80 italic text-center px-4 max-w-xs"
                >
                  {partial}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              onClick={listening ? stopListening : startListening}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                listening ? 'mic-active' : 'hover:scale-105'
              }`}
              style={listening ? {
                background: 'radial-gradient(circle at center, rgba(125,112,219,0.3), rgba(125,112,219,0.1))',
                border: '2px solid rgba(195,186,248,0.7)',
              } : {
                background: 'linear-gradient(135deg, rgba(42,38,80,0.8), rgba(26,24,48,0.9))',
                border: '2px solid rgba(96,85,160,0.5)',
              }}
            >
              {listening && (
                <span className="absolute inset-[-4px] rounded-full border border-lavender-400/25 animate-ping" />
              )}
              <MicIcon active={listening} />
            </button>

            <p className="text-xs font-medium"
              style={{ color: listening ? '#b9b0f6' : '#666090' }}>
              {listening ? 'Listening — tap to pause' : 'Tap to speak'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.04] px-4 py-2 text-center">
        <p className="text-[11px] text-gray-600">
          HearMe is a companion tool, not therapy. In crisis? Call or text{' '}
          <span className="text-gray-400 font-semibold">988</span>
        </p>
      </div>

      <AnimatePresence>
        {showLetter && letter && (
          <TheLetter letter={letter} onClose={() => setShowLetter(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
