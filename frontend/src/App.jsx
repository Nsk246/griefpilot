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
    <div className="flex items-center gap-0.5 h-5">
      {[1,2,3,4,5].map(i => (
        <div
          key={i}
          className={`w-0.5 rounded-full transition-all duration-300 ${
            active ? 'bg-lavender-300 wave-bar' : 'bg-night-500 h-1'
          }`}
          style={{ height: active ? undefined : '4px' }}
        />
      ))}
    </div>
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
    <div className="min-h-screen bg-night-950 text-white flex flex-col">

      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-night-600">
        <div className="flex items-center gap-2.5">
          <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
            connected
              ? 'bg-lavender-400 shadow-[0_0_6px_2px_rgba(155,144,234,0.5)]'
              : 'bg-night-500'
          }`} />
          <span className="text-sm font-semibold text-lavender-200 tracking-wide">HearMe</span>
        </div>
        <div className="flex items-center gap-3">
          <WaveformIcon active={listening} />
          {transcript.length > 0 && !sessionEnded && (
            <button
              onClick={() => { endSession(); setShowLetter(true) }}
              className="text-xs font-medium text-gray-200 hover:text-white border border-night-500 hover:border-night-400 bg-night-700 hover:bg-night-600 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              End session
            </button>
          )}
          {sessionEnded && (
            <button
              onClick={() => { resetSession(); setShowLetter(false) }}
              className="text-xs font-semibold text-lavender-100 hover:text-white border border-lavender-500/60 hover:border-lavender-400 bg-lavender-500/15 hover:bg-lavender-500/30 px-3 py-1.5 rounded-lg transition-all duration-200"
            >
              New session
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left panel — Constellation + Compass */}
        <div className="lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-night-600 flex flex-col bg-night-900/50">
          <div className="flex-1 p-4 flex flex-col gap-4">

            {/* Compass */}
            <div className="flex justify-center pt-2">
              <GriefCompass griefState={griefState} />
            </div>

            {/* Divider */}
            <div className="border-t border-night-600" />

            {/* Constellation */}
            <div className="flex-1 relative min-h-48">
              <p className="text-xs text-lavender-300 uppercase tracking-widest mb-2 font-semibold">Memory constellation</p>
              <div className="absolute inset-0 top-6">
                <Constellation nodes={nodes} />
              </div>
            </div>
          </div>

          {/* Node legend */}
          {nodes.length > 0 && (
            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
              {[...new Set(nodes.map(n => n.emotion))].slice(0, 5).map(emotion => {
                const node = nodes.find(n => n.emotion === emotion)
                return (
                  <span key={emotion} className="text-xs px-2.5 py-1 rounded-full border font-medium"
                    style={{ borderColor: node.color + '80', color: node.color, backgroundColor: node.color + '20' }}>
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
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
            {transcript.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center gap-5 py-16">
                <div className="w-14 h-14 rounded-full border border-lavender-400/30 flex items-center justify-center shimmer bg-lavender-500/5">
                  <div className="w-3 h-3 rounded-full bg-lavender-400/60" />
                </div>
                <div>
                  <p className="text-gray-200 text-sm leading-relaxed max-w-xs">
                    Press the button below and speak.<br />
                    <span className="text-gray-400">There is no right way to begin.</span>
                  </p>
                </div>
              </div>
            )}

            {transcript.map((turn, i) => (
              <motion.div
                key={turn.ts}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                {/* User */}
                <div className="flex justify-end">
                  <div className="max-w-xs lg:max-w-sm xl:max-w-md bg-lavender-500/15 border border-lavender-400/25 rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-white leading-relaxed">{turn.user}</p>
                  </div>
                </div>
                {/* Assistant */}
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-sm xl:max-w-md">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-lavender-400" />
                      <span className="text-xs text-lavender-300 font-semibold tracking-wide">HearMe</span>
                    </div>
                    <p className="font-serif text-base text-gray-100 leading-relaxed">{turn.assistant}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mic controls */}
          <div className="border-t border-night-600 px-4 py-5 flex flex-col items-center gap-3 bg-night-900/40">
            {partial && (
              <p className="text-xs text-lavender-200 italic text-center px-4">{partial}</p>
            )}
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                listening
                  ? 'bg-lavender-500/25 border-2 border-lavender-300 mic-active'
                  : 'bg-night-700 border-2 border-night-500 hover:border-lavender-400 hover:bg-night-600'
              }`}
            >
              {listening && (
                <span className="absolute inset-0 rounded-full border-2 border-lavender-400/40 animate-ping" />
              )}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="7" y="1" width="8" height="13" rx="4"
                  fill={listening ? '#b8b0f4' : '#4a4a72'} />
                <path d="M3 10c0 4.418 3.582 8 8 8s8-3.582 8-8"
                  stroke={listening ? '#b8b0f4' : '#4a4a72'}
                  strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="11" y1="18" x2="11" y2="21"
                  stroke={listening ? '#b8b0f4' : '#4a4a72'}
                  strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            <p className="text-xs font-medium text-gray-300">
              {listening ? 'Listening — tap to pause' : 'Tap to speak'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="border-t border-night-600 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">
          HearMe is a companion tool, not therapy. In crisis? Call or text <span className="text-gray-300 font-medium">988</span>
        </p>
      </div>

      {/* Letter overlay */}
      <AnimatePresence>
        {showLetter && letter && (
          <TheLetter letter={letter} onClose={() => setShowLetter(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
