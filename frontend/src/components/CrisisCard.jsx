import { motion } from 'framer-motion'

export default function CrisisCard() {
  return (
    <div className="fixed inset-0 flex items-center justify-center p-6 z-50"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 40% 0%, #160f2e 0%, #080613 55%)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl p-8 text-center backdrop-blur-sm"
          style={{
            background: 'rgba(18,14,34,0.85)',
            border: '1px solid rgba(240,168,192,0.2)',
            boxShadow: '0 0 60px rgba(240,168,192,0.06), 0 24px 48px rgba(0,0,0,0.5)',
          }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              background: 'radial-gradient(circle, rgba(240,168,192,0.15), rgba(240,168,192,0.04))',
              border: '1px solid rgba(240,168,192,0.3)',
              boxShadow: '0 0 24px rgba(240,168,192,0.1)',
            }}>
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <path d="M11 7v5M11 15h.01M21 11c0 5.523-4.477 10-10 10S1 16.523 1 11 5.477 1 11 1s10 4.477 10 10z"
                stroke="#f0a8c0" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          <h2 className="text-xl font-serif text-white mb-3">We hear you</h2>
          <p className="text-sm text-gray-300 mb-8 leading-relaxed max-w-xs mx-auto">
            It sounds like you may be going through something more than grief right now.
            Please reach out to someone who can really help.
          </p>

          <div className="space-y-2.5">
            {[
              { href: 'tel:988', title: '988 Suicide & Crisis Lifeline', sub: 'Call or text · 24/7 · free · confidential', action: '988' },
              { href: 'sms:741741?body=HOME', title: 'Crisis Text Line', sub: 'Text HOME to 741741', action: 'Text →' },
              { href: 'tel:18006624357', title: 'SAMHSA Helpline', sub: '1-800-662-4357 · Free, confidential', action: 'Call →' },
            ].map(item => (
              <a key={item.href} href={item.href}
                className="flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-200 group"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                <div className="text-left">
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{item.sub}</p>
                </div>
                <span className="text-lavender-300 font-semibold text-sm group-hover:text-lavender-200 transition-colors">
                  {item.action}
                </span>
              </a>
            ))}
          </div>

          <p className="text-xs text-gray-600 mt-7">
            This session has ended. You are not alone.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
