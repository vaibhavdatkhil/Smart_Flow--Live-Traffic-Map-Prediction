import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: number | string
  unit?: string
  icon: LucideIcon
  color?: string
  change?: number
  delay?: number
  animated?: boolean
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef = useRef<number>()

  useEffect(() => {
    startRef.current = null
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts
      const progress = Math.min((ts - startRef.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return count
}

export default function StatCard({
  title, value, unit, icon: Icon, color = '#00d4ff', change, delay = 0, animated = true
}: StatCardProps) {
  const numValue = typeof value === 'number' ? value : 0
  const displayNum = animated ? useCountUp(numValue) : numValue
  const displayValue = typeof value === 'string' ? value : displayNum.toLocaleString()

  const isPositive = change !== undefined ? change >= 0 : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="stat-card city-panel p-5 relative overflow-hidden"
      style={{ borderColor: `${color}25` }}
    >
      {/* Background glow */}
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-10"
        style={{ background: color, filter: 'blur(20px)' }} />

      {/* Corner accent */}
      <div className="absolute top-0 right-0 w-12 h-12"
        style={{
          background: `linear-gradient(225deg, ${color}20, transparent)`,
          borderBottom: `1px solid ${color}30`,
          borderLeft: `1px solid ${color}30`,
          borderRadius: '0 12px 0 0'
        }} />

      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs mb-2 tracking-widest uppercase"
            style={{ color: '#64748b', fontFamily: 'Rajdhani, sans-serif' }}>
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold"
              style={{ fontFamily: 'Rajdhani, sans-serif', color }}>
              {displayValue}
            </span>
            {unit && (
              <span className="text-xs" style={{ color: '#64748b' }}>{unit}</span>
            )}
          </div>
          {change !== undefined && (
            <div className="mt-1 flex items-center gap-1">
              <span className="text-xs" style={{ color: isPositive ? '#00ff88' : '#ff3b3b' }}>
                {isPositive ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="text-xs" style={{ color: '#475569' }}>vs yesterday</span>
            </div>
          )}
        </div>

        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>

      {/* Bottom bar */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.8, delay: delay + 0.3 }}
        className="absolute bottom-0 left-0 h-0.5 origin-left"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)`, width: '60%' }}
      />
    </motion.div>
  )
}
