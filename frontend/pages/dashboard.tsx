// pages/dashboard.tsx

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import CountUp from 'react-countup'
import {
  FiCloud,
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi'

const CITIES = [
  'Mumbai',
  'Delhi',
  'Pune',
  'Bangalore',
  'Chennai',
  'Hyderabad',
  'Kolkata',
  'Ahmedabad'
]

const COLORS = [
  '#00d4ff',
  '#00ff88',
  '#ffb800',
  '#ff3b3b',
  '#7c3aed',
  '#06b6d4',
  '#f97316',
  '#ec4899'
]

const alerts = [
  'Heavy traffic detected in Mumbai',
  'AI predicts congestion in Delhi',
  'Rain may affect Bangalore traffic',
  'Traffic optimized successfully in Pune'
]

function rnd(a: number, b: number) {
  return Math.floor(Math.random() * (b - a + 1)) + a
}

function genLive() {

  const h = new Date().getHours()

  const peak =
    (h >= 7 && h <= 9) ||
    (h >= 17 && h <= 19)

  return CITIES.map((city, i) => {

    const base = [85, 92, 67, 78, 71, 74, 80, 55][i]

    const v = Math.floor(
      base *
      (peak ? 1.4 : 0.8) *
      (0.85 + Math.random() * 0.3)
    )

    return {
      city,
      vehicles: v,
      level:
        v < 30
          ? 'Low'
          : v < 65
          ? 'Medium'
          : 'High',
      speed: Math.max(5, Math.floor(80 - v * 0.65))
    }

  })

}

export default function Dashboard() {

  const [junctions, setJunctions] = useState(genLive())
  const [total, setTotal] = useState(0)
  const [cong, setCong] = useState(0)
  const [speed, setSpeed] = useState(0)
  const [time, setTime] = useState(new Date())
  const [alertIndex, setAlertIndex] = useState(0)

  const hourlyRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {

    const update = () => {

      const j = genLive()

      setJunctions(j)

      setTotal(
        j.reduce((s, x) => s + x.vehicles, 0)
      )

      setCong(
        Math.floor(
          (j.filter(x => x.level === 'High').length / j.length) * 100
        )
      )

      setSpeed(
        Math.floor(
          j.reduce((s, x) => s + x.speed, 0) / j.length
        )
      )

      setTime(new Date())

    }

    update()

    const interval = setInterval(update, 5000)

    return () => clearInterval(interval)

  }, [])

  useEffect(() => {

    const alertTimer = setInterval(() => {

      setAlertIndex(prev => (prev + 1) % alerts.length)

    }, 4000)

    return () => clearInterval(alertTimer)

  }, [])

  useEffect(() => {

    const timer = setTimeout(() => {

      if (typeof window === 'undefined') return

      const Chart = (window as any).Chart

      if (!Chart) return

      const hourly = Array.from({ length: 24 }, (_, h) => {

        const m =
          h >= 7 && h <= 9
            ? 2.8
            : h >= 17 && h <= 19
            ? 3.0
            : h <= 4
            ? 0.3
            : 1.2

        return Math.floor(45 * m + rnd(-8, 8))

      })

      new Chart(hourlyRef.current, {
        type: 'line',
        data: {
          labels: Array.from({ length: 24 }, (_, h) => h + 'h'),
          datasets: [
            {
              label: 'Vehicles',
              data: hourly,
              borderColor: '#00d4ff',
              backgroundColor: 'rgba(0,212,255,0.08)',
              borderWidth: 3,
              fill: true,
              tension: 0.4,
              pointRadius: 0
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false }
          }
        }
      })

    }, 300)

    return () => clearTimeout(timer)

  }, [])

  const StatCard = ({ label, value, color, sub }: any) => (

    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: `0 0 30px ${color}40`
      }}
      transition={{
        type: 'spring',
        stiffness: 300
      }}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}25`,
        borderRadius: 20,
        padding: '18px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >

      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 90,
        height: 90,
        borderRadius: '50%',
        background: color,
        filter: 'blur(40px)',
        opacity: 0.18
      }} />

      <div style={{
        color: '#64748b',
        fontSize: 12,
        marginBottom: 6,
        letterSpacing: '0.08em'
      }}>
        {label}
      </div>

      <div style={{
        color,
        fontSize: 32,
        fontWeight: 700
      }}>
        <CountUp
          end={Number(value)}
          duration={2}
        />
      </div>

      <div style={{
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 4
      }}>
        {sub}
      </div>

    </motion.div>

  )

  return (

    <>

      <Head>

        <title>SmartFlow AI Dashboard</title>

        <script
          src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js"
          async
        />

      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#030712',
        color: '#fff',
        paddingTop: 60,
        overflow: 'hidden',
        position: 'relative'
      }}>

        {/* Animated background */}

        <div style={{
          position: 'fixed',
          inset: 0,
          background:
            `
            radial-gradient(circle at 20% 20%, rgba(0,212,255,0.12), transparent 25%),
            radial-gradient(circle at 80% 30%, rgba(124,58,237,0.12), transparent 25%),
            radial-gradient(circle at 50% 80%, rgba(0,255,136,0.08), transparent 30%)
            `,
          animation: 'moveBg 12s infinite alternate',
          zIndex: 0
        }} />

        <Navbar />

        <div style={{
          maxWidth: 1350,
          margin: '0 auto',
          padding: '24px',
          position: 'relative',
          zIndex: 2
        }}>

          {/* Header */}

          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 20,
              marginBottom: 20
            }}
          >

            <div>

              <h1 style={{
                fontSize: 36,
                margin: 0,
                fontWeight: 800,
                letterSpacing: '0.08em'
              }}>
                SMARTFLOW AI CONTROL CENTER
              </h1>

              <p style={{
                color: '#94a3b8'
              }}>
                Real-time Smart Traffic Monitoring
              </p>

            </div>

            <div style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap'
            }}>

              {/* Clock */}

              <div style={{
                padding: '14px 18px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)'
              }}>

                <div style={{
                  color: '#64748b',
                  fontSize: 11
                }}>
                  LIVE TIME
                </div>

                <div style={{
                  color: '#00d4ff',
                  fontSize: 24,
                  fontFamily: 'monospace'
                }}>
                  {time.toLocaleTimeString()}
                </div>

              </div>

              {/* Weather */}

              <div style={{
                padding: '14px 18px',
                borderRadius: 16,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>

                <FiCloud size={26} color="#00d4ff" />

                <div>
                  <div style={{ fontWeight: 700 }}>
                    29°C
                  </div>

                  <div style={{
                    fontSize: 12,
                    color: '#94a3b8'
                  }}>
                    Clear Sky
                  </div>
                </div>

              </div>

            </div>

          </motion.div>

          {/* Alert */}

          <motion.div
            key={alertIndex}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            style={{
              marginBottom: 22,
              padding: '14px 18px',
              borderRadius: 16,
              background:
                'linear-gradient(90deg, rgba(255,59,59,0.15), rgba(255,184,0,0.08))',
              border: '1px solid rgba(255,59,59,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}
          >

            <FiAlertTriangle color="#ffb800" size={22} />

            <span>
              {alerts[alertIndex]}
            </span>

          </motion.div>

          {/* Stats */}

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))',
            gap: 16,
            marginBottom: 24
          }}>

            <StatCard
              label="LIVE VEHICLES"
              value={total}
              color="#00d4ff"
              sub="↑ 8% vs yesterday"
            />

            <StatCard
              label="CONGESTION"
              value={cong}
              color="#ff3b3b"
              sub="AI monitored"
            />

            <StatCard
              label="AVG SPEED"
              value={speed}
              color="#00ff88"
              sub="Traffic optimized"
            />

            <StatCard
              label="AI ACCURACY"
              value={89}
              color="#7c3aed"
              sub="RandomForest Model"
            />

          </div>

          {/* Charts */}

          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 20,
            marginBottom: 24
          }}>

            {/* Traffic Chart */}

            <motion.div
              whileHover={{ scale: 1.01 }}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 22,
                padding: 24,
                backdropFilter: 'blur(20px)'
              }}
            >

              <div style={{
                marginBottom: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>

                <FiActivity color="#00d4ff" />

                <h3 style={{
                  margin: 0
                }}>
                  24-Hour Traffic Volume
                </h3>

              </div>

              <div style={{
                height: 320
              }}>
                <canvas ref={hourlyRef} />
              </div>

            </motion.div>

            {/* AI Prediction */}

            <motion.div
              whileHover={{
                scale: 1.03
              }}
              style={{
                background:
                  'linear-gradient(135deg,#111827,#0f172a)',
                border:
                  '1px solid rgba(124,58,237,0.3)',
                borderRadius: 22,
                padding: 24
              }}
            >

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20
              }}>

                <FiActivity
                  color="#7c3aed"
                  size={24}
                />

                <h3 style={{
                  margin: 0
                }}>
                  AI Prediction Engine
                </h3>

              </div>

              <p style={{
                color: '#94a3b8',
                lineHeight: 1.7
              }}>
                AI predicts 34% traffic increase
                in Mumbai within next 2 hours.
              </p>

              <div style={{
                marginTop: 18,
                height: 10,
                borderRadius: 20,
                background: '#1e293b'
              }}>

                <div style={{
                  width: '78%',
                  height: '100%',
                  borderRadius: 20,
                  background:
                    'linear-gradient(90deg,#7c3aed,#00d4ff)'
                }} />

              </div>

            </motion.div>

          </div>

          {/* Live Junction Table */}

          <div style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 22,
            padding: 24,
            backdropFilter: 'blur(20px)'
          }}>

            <h3 style={{
              marginTop: 0,
              marginBottom: 18
            }}>
              LIVE JUNCTION STATUS
            </h3>

            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>

              <thead>

                <tr>

                  {[
                    'City',
                    'Vehicles/hr',
                    'Speed',
                    'Status'
                  ].map(h => (

                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        padding: 12,
                        color: '#64748b'
                      }}
                    >
                      {h}
                    </th>

                  ))}

                </tr>

              </thead>

              <tbody>

                {junctions.map((j, i) => (

                  <motion.tr
                    key={j.city}
                    whileHover={{
                      background:
                        'rgba(255,255,255,0.03)'
                    }}
                  >

                    <td style={{
                      padding: 14
                    }}>
                      {j.city}
                    </td>

                    <td style={{
                      padding: 14
                    }}>
                      {j.vehicles}
                    </td>

                    <td style={{
                      padding: 14
                    }}>
                      {j.speed} km/h
                    </td>

                    <td style={{
                      padding: 14
                    }}>

                      <span style={{
                        padding: '4px 10px',
                        borderRadius: 8,
                        background:
                          j.level === 'High'
                            ? 'rgba(255,59,59,0.18)'
                            : j.level === 'Medium'
                            ? 'rgba(255,184,0,0.18)'
                            : 'rgba(0,255,136,0.18)',
                        color:
                          j.level === 'High'
                            ? '#ff3b3b'
                            : j.level === 'Medium'
                            ? '#ffb800'
                            : '#00ff88'
                      }}>
                        {j.level}
                      </span>

                    </td>

                  </motion.tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        <style>{`

          @keyframes moveBg {

            0% {
              transform: translateY(0px)
            }

            100% {
              transform: translateY(-40px)
            }

          }

        `}</style>

      </div>

    </>

  )

}
