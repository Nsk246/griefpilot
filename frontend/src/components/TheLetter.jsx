import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function TheLetter({ letter, onClose }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!letter) return
    indexRef.current = 0
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
      transition={{ duration: 1 }}
      className="fixed inset-0 bg-night-950/95 flex items-center justify-center p-6 z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-1 h-12 bg-lavender-400/30 mx-auto mb-6 rounded-full" />
          <p className="text-xs text-lavender-300/60 uppercase tracking-widest font-medium">A letter</p>
        </div>

        {/* Letter text */}
        <div className="min-h-40 mb-10">
          <p className="font-serif text-lg text-gray-200 leading-relaxed text-center italic">
            {displayed}
            {!done && <span className="inline-block w-0.5 h-5 bg-lavender-400/60 ml-1 animate-pulse align-middle" />}
          </p>
        </div>

        {/* Actions */}
        <AnimatePresence>
          {done && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col items-center gap-4"
            >
              {!speaking && (
                <button
                  onClick={speak}
                  className="flex items-center gap-2 text-sm text-lavender-300 hover:text-lavender-200 transition-colors"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM6.5 5.5l4 2.5-4 2.5V5.5z"
                      fill="currentColor" opacity="0.8"/>
                  </svg>
                  Read aloud
                </button>
              )}
              {speaking && (
                <div className="flex items-center gap-1.5">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="wave-bar w-0.5 h-4 bg-lavender-400/60 rounded-full" />
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="text-xs text-gray-600 hover:text-gray-500 transition-colors mt-2"
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