import { motion, AnimatePresence } from 'framer-motion'

const STAGES = {
  accepting_loss:       { label: 'Accepting',   color: '#9b93ea', angle: 0 },
  working_through_pain: { label: 'Feeling',      color: '#e8a0b8', angle: 72 },
  adjusting:            { label: 'Adjusting',    color: '#7fc9b5', angle: 144 },
  reinvesting:          { label: 'Reconnecting', color: '#85b7eb', angle: 216 },
  shock:                { label: 'Processing',   color: '#fac775', angle: 288 },
}

export default function GriefCompass({ griefState }) {
  const stage = griefState?.stage || null
  const intensity = griefState?.intensity || 0
  const current = stage ? STAGES[stage] : null

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        {/* Outer ring */}
        <svg className="w-full h-full" viewBox="0 0 112 112">
          <circle cx="56" cy="56" r="50" fill="none" stroke="#222238" strokeWidth="8" />
          {current && (
            <motion.circle
              cx="56" cy="56" r="50"
              fill="none"
              stroke={current.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(intensity / 5) * 314} 314`}
              strokeDashoffset="78.5"
              transform="rotate(-90 56 56)"
              initial={{ strokeDasharray: '0 314' }}
              animate={{ strokeDasharray: `${(intensity / 5) * 314} 314` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          )}
        </svg>

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={stage}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center"
              >
                <div
                  className="w-3 h-3 rounded-full mb-1"
                  style={{ backgroundColor: current.color }}
                />
                <span className="text-xs text-gray-200 font-semibold">{current.label}</span>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-2 h-2 rounded-full bg-night-600"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {griefState && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-xs text-gray-300 font-medium">
            {griefState.dominant_emotion} · {griefState.intensity}/5
          </p>
        </motion.div>
      )}
    </div>
  )
}