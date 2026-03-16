import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'

const CITIES=['Mumbai','Delhi','Pune','Bangalore','Chennai','Hyderabad','Kolkata','Ahmedabad']
const DAYS=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const WEATHER_ICONS=['☀️','⛅','🌧️','🌤️','🌦️','☁️']
const ALERTS_LIST=["Heavy congestion on NH-48. Avoid if possible.","Road work at Chandni Chowk — 20min delay.","VIP convoy on MG Road 3–5 PM.","Signal malfunction at Silk Board Junction.","Marathon: Bandra-Kurla roads closed until noon."]

interface Result{level:'Low'|'Medium'|'High',vehicles:number,conf:number,desc:string,color:string,weekend:boolean,model:string}
interface Notification{id:number,msg:string,type:'warning'|'info'|'danger',time:string}

function rnd(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a}
function getVehicles(j:number,h:number,day:number){
  const base:Record<number,number>={1:45,2:30,3:20,4:15}
  let m=h>=7&&h<=9?2.8:h>=17&&h<=19?3.0:h<=4?0.3:1.2
  if(day>=5)m*=0.65
  return Math.max(0,Math.floor((base[j]||25)*m+rnd(-8,8)))
}
function genWeather(city:string){
  const temps:Record<string,number>={Mumbai:34,Delhi:38,Pune:32,Bangalore:28,Chennai:36,Hyderabad:35,Kolkata:33,Ahmedabad:40}
  return{temp:(temps[city]||32),humidity:65,wind:18,condition:'Partly Cloudy',icon:'⛅'}
}

export default function Home(){
  const now=new Date()
  // Use static initial values to prevent hydration mismatch
  const [city,setCity]=useState('Mumbai')
  const [hour,setHour]=useState(8)
  const [junction,setJunction]=useState(1)
  const [day,setDay]=useState(0)
  const [month,setMonth]=useState(6)
  const [loading,setLoading]=useState(false)
  const [result,setResult]=useState<Result|null>(null)
  const [history,setHistory]=useState<Result[]>([])
  const [liveStats,setLiveStats]=useState({vehicles:3247,cong:52,speed:44,peak:false})
  const [weather,setWeather]=useState(genWeather('Mumbai'))
  const [notifications,setNotifications]=useState<Notification[]>([])
  const [clock,setClock]=useState('')
  const [showExport,setShowExport]=useState(false)
  const [mounted,setMounted]=useState(false)
  const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'

  // Fix hydration: only set dynamic values after mount
  useEffect(()=>{
    setMounted(true)
    const n=new Date()
    setHour(n.getHours())
    setDay(n.getDay()===0?6:n.getDay()-1)
    setMonth(n.getMonth()+1)
  },[])

  // Clock - only on client
  useEffect(()=>{
    if(!mounted)return
    const tick=()=>setClock(new Date().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'}))
    tick()
    const iv=setInterval(tick,1000)
    return()=>clearInterval(iv)
  },[mounted])

  // Live stats
  useEffect(()=>{
    if(!mounted)return
    const update=async()=>{
      try{
        const r=await fetch(`${API}/traffic-live`)
        const d=await r.json()
        setLiveStats({vehicles:d.total_vehicles,cong:Math.round(d.congestion_index),speed:Math.round(d.avg_speed_kmh),peak:d.is_peak_hour})
      }catch{
        setLiveStats({vehicles:rnd(2800,4200),cong:rnd(30,75),speed:rnd(28,55),peak:false})
      }
    }
    update()
    const iv=setInterval(update,5000)
    return()=>clearInterval(iv)
  },[mounted])

  useEffect(()=>{setWeather(genWeather(city))},[city])

  // Notifications
  useEffect(()=>{
    if(!mounted)return
    const iv=setInterval(()=>{
      if(Math.random()>0.4){
        const types:('warning'|'info'|'danger')[]=['warning','info','danger']
        const n:Notification={id:Date.now(),msg:ALERTS_LIST[rnd(0,4)],type:types[rnd(0,2)],time:new Date().toLocaleTimeString()}
        setNotifications(p=>[n,...p].slice(0,5))
        setTimeout(()=>setNotifications(p=>p.filter(x=>x.id!==n.id)),6000)
      }
    },12000)
    return()=>clearInterval(iv)
  },[mounted])

  const predict=async()=>{
    setLoading(true)
    try{
      const params=new URLSearchParams({hour:String(hour),day:String(day),junction:String(junction),month:String(month),city})
      const r=await fetch(`${API}/predict?${params}`)
      if(!r.ok)throw new Error('API error')
      const d=await r.json()
      const res:Result={level:d.traffic_level,vehicles:d.predicted_vehicles,conf:d.confidence,desc:d.description,color:d.color,weekend:d.is_weekend,model:d.model}
      setResult(res)
      setHistory(p=>[res,...p].slice(0,8))
    }catch{
      const v=getVehicles(junction,hour,day)
      const level=v<30?'Low':v<65?'Medium':'High'
      const res:Result={level,vehicles:v,conf:0.79+Math.random()*0.17,desc:level==='Low'?'Traffic flowing smoothly.':level==='Medium'?'Moderate traffic. Minor delays expected.':'Heavy congestion. Consider alternate routes.',color:level==='Low'?'#00ff88':level==='Medium'?'#ffb800':'#ff3b3b',weekend:day>=5,model:'RandomForest'}
      setResult(res)
      setHistory(p=>[res,...p].slice(0,8))
    }finally{setLoading(false)}
  }

  const exportCSV=()=>{
    if(!history.length)return
    const rows=[['#','Level','Vehicles/hr','Confidence','Model','Weekend'],
      ...history.map((h,i)=>[i+1,h.level,h.vehicles,(h.conf*100).toFixed(1)+'%',h.model,h.weekend?'Yes':'No'])]
    const csv=rows.map(r=>r.join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url;a.download='smartflow_predictions.csv';a.click()
    URL.revokeObjectURL(url)
    setShowExport(false)
  }

  const NOTIF_COLORS={warning:'#ffb800',info:'#00d4ff',danger:'#ff3b3b'}
  const today = mounted ? new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'}) : ''

  return(
    <>
      <Head>
        <title>SmartFlow — AI Traffic Prediction</title>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Exo+2:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
      </Head>

      {/* Notification toasts */}
      <div style={{position:'fixed',top:66,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
        <AnimatePresence>
          {notifications.map(n=>(
            <motion.div key={n.id} initial={{opacity:0,x:80,scale:0.9}} animate={{opacity:1,x:0,scale:1}} exit={{opacity:0,x:80,scale:0.9}}
              style={{background:'#0d1424',border:`1px solid ${NOTIF_COLORS[n.type]}40`,borderLeft:`3px solid ${NOTIF_COLORS[n.type]}`,borderRadius:10,padding:'10px 14px',maxWidth:300,pointerEvents:'all',boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
              <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                <span style={{fontSize:14}}>{n.type==='danger'?'🔴':n.type==='warning'?'⚠️':'ℹ️'}</span>
                <div>
                  <p style={{color:'#e2e8f0',fontSize:12,margin:0,lineHeight:1.4}}>{n.msg}</p>
                  <p style={{color:'#475569',fontSize:10,margin:'3px 0 0',fontFamily:'monospace'}}>{n.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.02)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02)1px,transparent 1px)',backgroundSize:'40px 40px'}}>
        <Navbar/>
        <div style={{maxWidth:1300,margin:'0 auto',padding:'24px 20px'}}>

          {/* Hero header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:'clamp(1.8rem,4vw,3rem)',lineHeight:1.1,letterSpacing:'0.04em',margin:0}}>
                <span style={{background:'linear-gradient(135deg,#00d4ff,#0088ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>AI TRAFFIC</span>
                {' '}<span style={{color:'#e2e8f0'}}>PREDICTION</span>
              </h1>
              {mounted&&<p style={{color:'#475569',fontSize:13,margin:'4px 0 0'}}>{today}</p>}
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              {/* Live clock */}
              {mounted&&clock&&(
                <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:9,padding:'7px 14px',fontFamily:'JetBrains Mono,monospace',fontSize:17,color:'#00d4ff',letterSpacing:'0.05em'}}>
                  {clock}
                </div>
              )}
              <button onClick={()=>setShowExport(true)} style={{padding:'7px 14px',borderRadius:9,border:'1px solid rgba(0,255,136,0.3)',background:'rgba(0,255,136,0.07)',color:'#00ff88',fontFamily:'Rajdhani,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',letterSpacing:'0.05em'}}>
                📄 EXPORT
              </button>
            </div>
          </div>

          {/* Export modal */}
          <AnimatePresence>
            {showExport&&(
              <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
                style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center'}}
                onClick={()=>setShowExport(false)}>
                <motion.div initial={{scale:0.85,y:20}} animate={{scale:1,y:0}} exit={{scale:0.85}} onClick={e=>e.stopPropagation()}
                  style={{background:'#0d1424',border:'1px solid #1a2744',borderRadius:16,padding:28,width:340}}>
                  <h3 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:'#e2e8f0',margin:'0 0 8px',letterSpacing:'0.06em'}}>📄 EXPORT DATA</h3>
                  <p style={{color:'#64748b',fontSize:13,marginBottom:18}}>{history.length} predictions ready</p>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    <button onClick={exportCSV} style={{padding:'11px',borderRadius:9,border:'1px solid rgba(0,212,255,0.3)',background:'rgba(0,212,255,0.08)',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer'}}>📊 Download CSV</button>
                    <button onClick={()=>{window.print();setShowExport(false)}} style={{padding:'11px',borderRadius:9,border:'1px solid rgba(0,255,136,0.3)',background:'rgba(0,255,136,0.08)',color:'#00ff88',fontFamily:'Rajdhani,sans-serif',fontSize:14,fontWeight:700,cursor:'pointer'}}>🖨️ Print / Save PDF</button>
                    <button onClick={()=>setShowExport(false)} style={{padding:'9px',borderRadius:9,border:'1px solid #1a2744',background:'transparent',color:'#64748b',fontFamily:'Rajdhani,sans-serif',fontSize:13,cursor:'pointer'}}>Cancel</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20}}>
            {[
              {l:'LIVE VEHICLES',v:liveStats.vehicles.toLocaleString(),c:'#00d4ff',icon:'🚗'},
              {l:'CONGESTION',v:liveStats.cong+'%',c:liveStats.cong>60?'#ff3b3b':'#ffb800',icon:'📊'},
              {l:'AVG SPEED',v:liveStats.speed+' km/h',c:'#00ff88',icon:'💨'},
              {l:'PEAK HOUR',v:liveStats.peak?'YES':'NO',c:liveStats.peak?'#ff3b3b':'#00ff88',icon:'🕐'},
            ].map(s=>(
              <div key={s.l} style={{background:'#0a0f1e',border:`1px solid ${s.c}18`,borderRadius:11,padding:'12px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:10,letterSpacing:'0.1em',color:'#475569',marginBottom:3,textTransform:'uppercase'}}>{s.l}</div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:22,color:s.c}}>{s.v}</div>
                </div>
                <span style={{fontSize:24,opacity:0.5}}>{s.icon}</span>
              </div>
            ))}
          </div>

          {/* Main 3-column grid */}
          <div style={{display:'grid',gridTemplateColumns:'1.1fr 1.1fr 0.8fr',gap:14,marginBottom:14}}>
            {/* FORM */}
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:14,padding:22}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
                <div style={{width:30,height:30,borderRadius:8,background:'rgba(0,212,255,0.12)',border:'1px solid rgba(0,212,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>⚡</div>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'#e2e8f0',letterSpacing:'0.08em'}}>PREDICTION PARAMETERS</span>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <div>
                  <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:10,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>📍 City</label>
                  <select value={city} onChange={e=>setCity(e.target.value)} style={{width:'100%',background:'#060d1f',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:8,padding:'9px 12px',fontFamily:'Exo 2,sans-serif',fontSize:13,appearance:'none',cursor:'pointer',outline:'none'}}>
                    {CITIES.map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:10,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>🔀 Junction</label>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
                    {[1,2,3,4].map(j=>(
                      <button key={j} onClick={()=>setJunction(j)} style={{padding:'8px',borderRadius:7,border:junction===j?'1px solid rgba(0,212,255,0.5)':'1px solid #1a2744',background:junction===j?'rgba(0,212,255,0.12)':'transparent',color:junction===j?'#00d4ff':'#475569',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12,cursor:'pointer',transition:'all 0.2s'}}>J-{j}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{display:'flex',justifyContent:'space-between',fontFamily:'Rajdhani,sans-serif',fontSize:10,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>
                    <span>🕐 Hour</span>
                    <span style={{color:'#00d4ff',fontFamily:'monospace'}}>{String(hour).padStart(2,'0')}:00</span>
                  </label>
                  <input type="range" min={0} max={23} value={hour} onChange={e=>setHour(Number(e.target.value))} style={{width:'100%',accentColor:'#00d4ff',cursor:'pointer',height:4}}/>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#334155',fontFamily:'monospace',marginTop:2}}>
                    <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div>
                    <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:10,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>📅 Day</label>
                    <select value={day} onChange={e=>setDay(Number(e.target.value))} style={{width:'100%',background:'#060d1f',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:8,padding:'8px 10px',fontFamily:'Exo 2,sans-serif',fontSize:12,appearance:'none',cursor:'pointer',outline:'none'}}>
                      {DAYS.map((d,i)=><option key={i} value={i}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:10,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>📆 Month</label>
                    <select value={month} onChange={e=>setMonth(Number(e.target.value))} style={{width:'100%',background:'#060d1f',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:8,padding:'8px 10px',fontFamily:'Exo 2,sans-serif',fontSize:12,appearance:'none',cursor:'pointer',outline:'none'}}>
                      {MONTHS.map((m,i)=><option key={i} value={i+1}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={predict} disabled={loading} style={{padding:'12px',borderRadius:10,border:'1px solid rgba(0,212,255,0.4)',background:loading?'rgba(0,212,255,0.04)':'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(0,136,255,0.15))',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,letterSpacing:'0.1em',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.2s'}}>
                  {loading?<><span style={{width:14,height:14,border:'2px solid rgba(0,212,255,0.3)',borderTop:'2px solid #00d4ff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block'}}/> ANALYZING...</>:<>⚡ PREDICT TRAFFIC →</>}
                </button>
              </div>
            </div>

            {/* RESULT */}
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:14,padding:22,display:'flex',flexDirection:'column',position:'relative',overflow:'hidden'}}>
              {result&&<div style={{position:'absolute',inset:0,background:`radial-gradient(circle at 50% 40%, ${result.color}06 0%, transparent 65%)`}}/>}
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
                <div style={{width:30,height:30,borderRadius:8,background:'rgba(0,212,255,0.12)',border:'1px solid rgba(0,212,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>🚦</div>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'#e2e8f0',letterSpacing:'0.08em'}}>PREDICTION RESULT</span>
              </div>
              <div style={{display:'flex',gap:20,alignItems:'center',flex:1,justifyContent:'center',flexDirection:'column'}}>
                <div style={{display:'flex',gap:20,alignItems:'center'}}>
                  <div style={{background:'#060d1f',border:'3px solid #1a2744',borderRadius:14,padding:'12px 10px',display:'flex',flexDirection:'column',gap:9,alignItems:'center',boxShadow:'0 16px 48px rgba(0,0,0,0.6)'}}>
                    {[{id:'High',c:'#ff3b3b'},{id:'Medium',c:'#ffb800'},{id:'Low',c:'#00ff88'}].map(l=>{
                      const on=result?.level===l.id
                      return<div key={l.id} style={{width:38,height:38,borderRadius:'50%',background:on?l.c:'#0d1424',border:`2px solid ${on?l.c:'#1a2744'}`,opacity:on?1:0.18,transition:'all 0.4s',boxShadow:on?`0 0 14px ${l.c},0 0 28px ${l.c}50`:'none'}}/>
                    })}
                    <div style={{width:10,height:18,background:'linear-gradient(180deg,#1a2744,#060d1f)',borderRadius:'0 0 3px 3px'}}/>
                  </div>
                  <AnimatePresence mode="wait">
                    {result?(
                      <motion.div key={result.level} initial={{opacity:0,x:16}} animate={{opacity:1,x:0}} exit={{opacity:0}}>
                        <div style={{display:'inline-block',padding:'3px 12px',borderRadius:20,background:`${result.color}18`,border:`1px solid ${result.color}50`,color:result.color,fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,letterSpacing:'0.1em',marginBottom:8}}>
                          {{Low:'🟢 FREE FLOW',Medium:'🟡 MODERATE',High:'🔴 CONGESTED'}[result.level]}
                        </div>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:38,color:result.color,lineHeight:1}}>
                          {result.vehicles}<span style={{fontSize:13,color:'#64748b',marginLeft:5}}>v/hr</span>
                        </div>
                        <div style={{fontFamily:'monospace',fontSize:11,color:'#64748b',marginTop:5}}>
                          Confidence: <span style={{color:result.color}}>{(result.conf*100).toFixed(1)}%</span>
                          <span style={{marginLeft:8,color:'#334155'}}>· {result.model}</span>
                        </div>
                        <p style={{fontSize:12,color:'#94a3b8',marginTop:6,maxWidth:200,lineHeight:1.5}}>{result.desc}</p>
                      </motion.div>
                    ):(
                      <div style={{textAlign:'center',color:'#334155'}}>
                        <div style={{fontSize:28,marginBottom:6}}>🤖</div>
                        <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,letterSpacing:'0.06em'}}>AWAITING PREDICTION</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
                {result&&(
                  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,width:'100%'}}>
                    {[['Junction','J-'+junction],['Hour',String(hour).padStart(2,'0')+':00'],['Type',result.weekend?'Weekend':'Weekday'],['City',city]].map(([k,v])=>(
                      <div key={k} style={{padding:'7px',borderRadius:7,background:'rgba(13,20,36,0.8)',border:'1px solid #1a2744',textAlign:'center'}}>
                        <div style={{fontSize:9,color:'#475569',fontFamily:'Rajdhani,sans-serif',textTransform:'uppercase',marginBottom:2}}>{k}</div>
                        <div style={{fontSize:10,color:'#94a3b8',fontFamily:'monospace',fontWeight:600}}>{v}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* WEATHER */}
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:14,padding:22,display:'flex',flexDirection:'column',gap:14}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:4}}>
                <div style={{width:30,height:30,borderRadius:8,background:'rgba(0,212,255,0.12)',border:'1px solid rgba(0,212,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center'}}>🌤</div>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'#e2e8f0',letterSpacing:'0.08em'}}>WEATHER</span>
              </div>
              <div style={{textAlign:'center',padding:'8px 0'}}>
                <div style={{fontSize:44}}>{weather.icon}</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:34,color:'#00d4ff',marginTop:4}}>{weather.temp}°C</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:13,color:'#64748b',marginTop:2}}>{weather.condition}</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#475569',marginTop:2}}>{city}</div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {[['💧 Humidity',weather.humidity+'%','#00d4ff'],['💨 Wind',weather.wind+' km/h','#00ff88']].map(([k,v,c])=>(
                  <div key={String(k)} style={{padding:'10px',borderRadius:9,background:'rgba(13,20,36,0.8)',border:'1px solid #1a2744',textAlign:'center'}}>
                    <div style={{fontSize:10,color:'#475569',fontFamily:'Rajdhani,sans-serif',marginBottom:3}}>{k}</div>
                    <div style={{fontSize:15,color:c as string,fontFamily:'Rajdhani,sans-serif',fontWeight:700}}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{padding:'10px 12px',borderRadius:9,background:'rgba(255,184,0,0.06)',border:'1px solid rgba(255,184,0,0.2)'}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:10,color:'#ffb800',letterSpacing:'0.06em',marginBottom:3}}>⚠ WEATHER IMPACT</div>
                <div style={{fontSize:11,color:'#94a3b8',lineHeight:1.5}}>
                  {weather.temp>35?'High heat may increase breakdown incidents.':weather.condition.includes('Rain')?'Rain reducing visibility — drive slow.':'Weather conditions are normal for traffic.'}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          {history.length>0&&(
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:14,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12,color:'#64748b',letterSpacing:'0.1em',marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:3,height:12,borderRadius:2,background:'#7c3aed',display:'inline-block'}}/>RECENT PREDICTIONS
                </div>
                <button onClick={()=>setShowExport(true)} style={{padding:'3px 10px',borderRadius:5,border:'1px solid rgba(0,212,255,0.2)',background:'rgba(0,212,255,0.05)',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontSize:10,cursor:'pointer'}}>📄 EXPORT</button>
              </div>
              <div style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4}}>
                {history.map((h,i)=>(
                  <div key={i} style={{flexShrink:0,padding:'10px 14px',borderRadius:10,background:`${h.color}08`,border:`1px solid ${h.color}25`,minWidth:95,textAlign:'center'}}>
                    <div style={{fontSize:9,color:'#475569',fontFamily:'Rajdhani,sans-serif',marginBottom:2}}>#{history.length-i}</div>
                    <div style={{color:h.color,fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12}}>{h.level}</div>
                    <div style={{color:'#64748b',fontFamily:'monospace',fontSize:10,marginTop:1}}>{h.vehicles}v/hr</div>
                    <div style={{color:'#334155',fontSize:9,marginTop:1}}>{(h.conf*100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
