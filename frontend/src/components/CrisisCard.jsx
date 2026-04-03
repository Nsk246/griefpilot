import { motion } from 'framer-motion'

export default function CrisisCard() {
  return (
    <div className="fixed inset-0 bg-night-950 flex items-center justify-center p-6 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-night-800 border border-rose-grief/40 rounded-3xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-grief/10 border border-rose-grief/30 flex items-center justify-center mx-auto mb-6">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M11 7v5M11 15h.01M21 11c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1s10 4.477 10 10z"
                stroke="#e8a0b8" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 className="text-xl font-serif text-white mb-2">We hear you</h2>
          <p className="text-sm text-gray-400 mb-8 leading-relaxed">
            It sounds like you may be going through something more than grief right now.
            Please reach out to someone who can really help.
          </p>

          <div className="space-y-3">
            <a href="tel:988"
              className="flex items-center justify-between bg-night-700 hover:bg-night-600 border border-night-600 rounded-2xl px-5 py-4 transition-colors group">
              <div className="text-left">
                <p className="text-white font-medium text-sm">988 Suicide & Crisis Lifeline</p>
                <p className="text-gray-500 text-xs mt-0.5">Call or text, 24/7, free, confidential</p>
              </div>
              <span className="text-lavender-400 text-lg font-semibold group-hover:text-lavender-300">988</span>
            </a>

            <a href="sms:741741?body=HOME"
              className="flex items-center justify-between bg-night-700 hover:bg-night-600 border border-night-600 rounded-2xl px-5 py-4 transition-colors group">
              <div className="text-left">
                <p className="text-white font-medium text-sm">Crisis Text Line</p>
                <p className="text-gray-500 text-xs mt-0.5">Text HOME to 741741</p>
              </div>
              <span className="text-lavender-400 text-sm font-semibold group-hover:text-lavender-300">Text →</span>
            </a>

            <a href="tel:18006624357"
              className="flex items-center justify-between bg-night-700 hover:bg-night-600 border border-night-600 rounded-2xl px-5 py-4 transition-colors group">
              <div className="text-left">
                <p className="text-white font-medium text-sm">SAMHSA Helpline</p>
                <p className="text-gray-500 text-xs mt-0.5">1-800-662-4357 · Free, confidential</p>
              </div>
              <span className="text-lavender-400 text-sm font-semibold group-hover:text-lavender-300">Call →</span>
            </a>
          </div>

          <p className="text-xs text-gray-600 mt-6">
            This session has ended. You are not alone.
          </p>
        </div>
      </motion.div>
    </div>
  )
}