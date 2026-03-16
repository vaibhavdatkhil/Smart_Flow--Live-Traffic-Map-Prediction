import { motion, AnimatePresence } from 'framer-motion'

interface TrafficLightProps {
  level: 'Low' | 'Medium' | 'High' | null
  vehicles?: number
  confidence?: number
  description?: string
}

export default function TrafficLight({ level, vehicles, confidence, description }: TrafficLightProps) {
  const levelConfig = {
    Low: { color: '#00ff88', glow: 'rgba(0,255,136,0.5)', label: 'FREE FLOW', position: 2 },
    Medium: { color: '#ffb800', glow: 'rgba(255,184,0,0.5)', label: 'MODERATE', position: 1 },
    High: { color: '#ff3b3b', glow: 'rgba(255,59,59,0.5)', label: 'CONGESTED', position: 0 },
  }

  const config = level ? levelConfig[level] : null

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Traffic Light Housing */}
      <div className="relative">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative rounded-2xl p-4 flex flex-col items-center gap-4"
          style={{
            background: '#0a0f1e',
            border: '3px solid #1a2744',
            width: 100,
            boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>
          {/* Housing bolts */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full"
            style={{ background: '#1a2744' }} />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full"
            style={{ background: '#1a2744' }} />

          {/* Lights */}
          {['High', 'Medium', 'Low'].map((l, i) => {
            const cfg = levelConfig[l as keyof typeof levelConfig]
            const isActive = level === l

            return (
              <div key={l} className="relative">
                <motion.div
                  animate={isActive ? {
                    boxShadow: [
                      `0 0 10px ${cfg.glow}`,
                      `0 0 30px ${cfg.glow}, 0 0 60px ${cfg.glow}`,
                      `0 0 10px ${cfg.glow}`
                    ]
                  } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: isActive ? cfg.color : '#0d1424',
                    border: `2px solid ${isActive ? cfg.color : '#1a2744'}`,
                    opacity: isActive ? 1 : 0.2,
                  }}>
                  {isActive && (
                    <motion.div
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ background: cfg.color }}
                    />
                  )}
                </motion.div>
              </div>
            )
          })}

          {/* Post */}
          <div className="w-4 h-8 rounded-b-sm"
            style={{ background: 'linear-gradient(180deg, #1a2744, #0a0f1e)' }} />
        </motion.div>
      </div>

      {/* Result Info */}
      <AnimatePresence mode="wait">
        {level && config && (
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-3"
          >
            <div className="inline-block px-6 py-2 rounded-full font-bold tracking-widest text-sm"
              style={{
                background: `${config.color}18`,
                border: `1px solid ${config.color}60`,
                color: config.color,
                fontFamily: 'Rajdhani, sans-serif',
                fontSize: 16,
                letterSpacing: '0.15em'
              }}>
              {config.label}
            </div>

            {vehicles !== undefined && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-bold"
                style={{ fontFamily: 'Rajdhani, sans-serif', color: config.color }}>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}>
                  {vehicles}
                </motion.span>
                <span className="text-base ml-2 font-normal opacity-70"
                  style={{ color: '#94a3b8' }}>
                  vehicles/hr
                </span>
              </motion.div>
            )}

            {confidence !== undefined && (
              <div className="text-sm" style={{ color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>
                Confidence: <span style={{ color: config.color }}>{(confidence * 100).toFixed(1)}%</span>
              </div>
            )}

            {description && (
              <p className="text-sm max-w-xs text-center" style={{ color: '#94a3b8' }}>
                {description}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!level && (
        <div className="text-center" style={{ color: '#334155' }}>
          <p style={{ fontFamily: 'Rajdhani, sans-serif', letterSpacing: '0.1em', fontSize: 14 }}>
            AWAITING PREDICTION
          </p>
        </div>
      )}
    </div>
  )
}
