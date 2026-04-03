import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TheLetter({ letter, onClose }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!letter) return
    setDisplayed('')
    setDone(false)

    const words = letter.split(' ')
    let i = 0
    timerRef.current = setInterval(() => {
      if (i >= words.length) {
        clearInterval(timerRef.current)
        setDone(true)
        return
      }
      setDisplayed(prev => (prev ? prev + ' ' : '') + words[i])
      i++
    }, 180)

    return () => clearInterval(timerRef.current)
  }, [letter])

  const speak = () => {
    if (!window.speechSynthesis || !letter) return
    setSpeaking(true)
    const utterance = new SpeechSynthesisUtterance(letter)
    utterance.rate = 0.82
    utterance.pitch = 1.0
    utterance.volume = 1
    const voices = speechSynthesis.getVoices()
    const preferred = voices.find(v => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Moira'))
    if (preferred) utterance.voice = preferred
    utterance.onend = () => setSpeaking(false)
    speechSynthesis.speak(utterance)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.2 }}
      className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: 'rgba(8,6,19,0.97)', backdropFilter: 'blur(20px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-px h-16 mx-auto mb-6 rounded-full"
            style={{ background: 'linear-gradient(180deg, transparent, rgba(155,144,234,0.5), transparent)' }} />
          <p className="text-[10px] text-lavender-300/50 uppercase tracking-[0.25em] font-medium">A letter</p>
        </div>

        {/* Letter text */}
        <div className="min-h-40 mb-12 px-4">
          <p className="font-serif text-[17px] text-gray-100 leading-[2] text-center italic">
            {displayed}
            {!done && (
              <span className="inline-block w-px h-[18px] bg-lavender-400/50 ml-1 animate-pulse align-middle" />
            )}
          </p>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col items-center gap-5"
            >
              {!speaking ? (
                <button
                  onClick={speak}
                  className="flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200"
                  style={{
                    color: '#c4bbf8',
                    border: '1px solid rgba(155,144,234,0.3)',
                    background: 'rgba(125,112,219,0.1)',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM6.5 5.5l4 2.5-4 2.5V5.5z" fill="currentColor"/>
                  </svg>
                  Read aloud
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="wave-bar w-[3px] h-5 rounded-full"
                      style={{ background: 'rgba(155,144,234,0.6)' }} />
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="text-xs text-gray-600 hover:text-gray-400 transition-colors"
              >
                Close
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
