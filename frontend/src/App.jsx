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
            active ? 'bg-lavender-400 wave-bar' : 'bg-night-600 h-1'
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
      <header className="flex items-center justify-between px-5 py-4 border-b border-night-700">
        <div className="flex items-center gap-2.5">
          <div className={`w-1.5 h-1.5 rounded-full transition-colors ${connected ? 'bg-lavender-400' : 'bg-night-600'}`} />
          <span className="text-sm font-medium text-lavender-300 tracking-wide">GriefPilot</span>
        </div>
        <div className="flex items-center gap-3">
          <WaveformIcon active={listening} />
          {sessionEnded && (
            <button onClick={resetSession}
              className="text-xs border border-lavender-400/40 text-lavender-300 px-3 py-1.5 rounded-lg hover:bg-lavender-400/10 transition-colors">
              Start new session
            </button>
          )}
          {transcript.length > 0 && !sessionEnded && (
            <button
              onClick={() => { endSession(); setShowLetter(true) }}
              className="text-xs text-gray-500 hover:text-gray-400 border border-night-600 hover:border-night-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              End session
            </button>
          )}
          {sessionEnded && (
            <button
              onClick={() => { resetSession(); setShowLetter(false) }}
              className="text-xs text-lavender-300 hover:text-lavender-200 border border-lavender-400/40 hover:border-lavender-400/70 px-3 py-1.5 rounded-lg transition-colors"
            >
              New session
            </button>
          )}
        </div>
      </header>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* Left panel — Constellation + Compass */}
        <div className="lg:w-80 xl:w-96 border-b lg:border-b-0 lg:border-r border-night-700 flex flex-col">
          <div className="flex-1 p-4 flex flex-col gap-4">

            {/* Compass */}
            <div className="flex justify-center pt-2">
              <GriefCompass griefState={griefState} />
            </div>

            {/* Divider */}
            <div className="border-t border-night-700" />

            {/* Constellation */}
            <div className="flex-1 relative min-h-48">
              <p className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium">Memory constellation</p>
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
                  <span key={emotion} className="text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: node.color + '50', color: node.color, backgroundColor: node.color + '15' }}>
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
              <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-16">
                <div className="w-12 h-12 rounded-full border border-lavender-400/20 flex items-center justify-center shimmer">
                  <div className="w-2 h-2 rounded-full bg-lavender-400/40" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                    Press the button below and speak.<br />
                    There is no right way to begin.
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
                  <div className="max-w-xs lg:max-w-sm xl:max-w-md bg-night-700 rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-gray-200 leading-relaxed">{turn.user}</p>
                  </div>
                </div>
                {/* Assistant */}
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-sm xl:max-w-md">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div className="w-1 h-1 rounded-full bg-lavender-400/60" />
                      <span className="text-xs text-lavender-300/60 font-medium">GriefPilot</span>
                    </div>
                    <p className="font-serif text-base text-gray-300 leading-relaxed">{turn.assistant}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mic controls */}
          <div className="border-t border-night-700 px-4 py-5 flex flex-col items-center gap-3">
            <button
              onClick={listening ? stopListening : startListening}
              className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                listening
                  ? 'bg-lavender-500/20 border-2 border-lavender-400'
                  : 'bg-night-700 border-2 border-night-600 hover:border-lavender-400/50'
              }`}
            >
              {listening && (
                <span className="absolute inset-0 rounded-full border-2 border-lavender-400/30 animate-ping" />
              )}
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <rect x="7" y="1" width="8" height="13" rx="4"
                  fill={listening ? '#9b93ea' : '#3a3a5c'} />
                <path d="M3 10c0 4.418 3.582 8 8 8s8-3.582 8-8"
                  stroke={listening ? '#9b93ea' : '#3a3a5c'}
                  strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="11" y1="18" x2="11" y2="21"
                  stroke={listening ? '#9b93ea' : '#3a3a5c'}
                  strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
            {partial && (
              <p className="text-xs text-lavender-300/70 italic mb-1 text-center px-4">{partial}</p>
            )}
            <p className="text-xs text-gray-600">
              {listening ? 'Listening — tap to pause' : 'Tap to speak'}
            </p>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <div className="border-t border-night-800 px-4 py-2 text-center">
        <p className="text-xs text-gray-700">
          GriefPilot is a companion tool, not therapy. In crisis? Call or text <span className="text-gray-600">988</span>
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
