import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import { useRouter } from 'next/router'

export default function Profile() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview'|'activity'|'settings'>('overview')
  const [mounted, setMounted] = useState(false)

  const MOCK_ACTIVITY = [
    { id:1, type:'prediction', city:'Mumbai', level:'High', vehicles:87, time:'2 min ago', icon:'⚡' },
    { id:2, type:'route', from:'Pune', to:'Mumbai', duration:'2h 15m', time:'1 hour ago', icon:'🗺' },
    { id:3, type:'prediction', city:'Delhi', level:'Medium', vehicles:54, time:'3 hours ago', icon:'⚡' },
    { id:4, type:'alert', msg:'Accident on NH-48 near Khopoli', time:'5 hours ago', icon:'🚨' },
    { id:5, type:'prediction', city:'Bangalore', level:'Low', vehicles:28, time:'Yesterday', icon:'⚡' },
    { id:6, type:'route', from:'Delhi', to:'Agra', duration:'3h 45m', time:'2 days ago', icon:'🗺' },
  ]

  const STATS = [
    { label:'Total Predictions', value:'47', icon:'⚡', color:'#00d4ff' },
    { label:'Routes Searched', value:'12', icon:'🗺', color:'#00ff88' },
    { label:'Alerts Received', value:'8', icon:'🚨', color:'#ff3b3b' },
    { label:'Cities Monitored', value:'6', icon:'🏙', color:'#ffb800' },
  ]

  useEffect(() => {
    setMounted(true)
    const u = localStorage.getItem('sf_user')
    if (!u) { router.push('/login'); return }
    const parsed = JSON.parse(u)
    setUser(parsed)
    setName(parsed.name || '')
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    const updated = { ...user, name }
    localStorage.setItem('sf_user', JSON.stringify(updated))
    setUser(updated)
    setSaving(false)
    setSaved(true)
    setEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const LEVEL_COLOR: Record<string,string> = { Low:'#00ff88', Medium:'#ffb800', High:'#ff3b3b' }

  if (!mounted || !user) return null

  return (
    <>
      <Head><title>SmartFlow — My Profile</title></Head>
      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.02)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02)1px,transparent 1px)',backgroundSize:'40px 40px'}}>
        <Navbar/>
        <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} style={{maxWidth:1100,margin:'0 auto',padding:'28px 20px'}}>

          {/* Header card */}
          <div style={{background:'linear-gradient(135deg,#0a0f1e,#0d1628)',border:'1px solid #1a2744',borderRadius:16,padding:28,marginBottom:20,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,212,255,0.08),transparent)' }}/>
            <div style={{display:'flex',alignItems:'center',gap:20,position:'relative'}}>
              {/* Avatar */}
              <div style={{width:80,height:80,borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff,#0055ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32,fontWeight:700,color:'white',flexShrink:0,boxShadow:'0 0 30px rgba(0,212,255,0.4)'}}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                {editing ? (
                  <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:8}}>
                    <input value={name} onChange={e=>setName(e.target.value)}
                      style={{background:'#060d1f',border:'1px solid rgba(0,212,255,0.4)',color:'#e2e8f0',borderRadius:8,padding:'8px 14px',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:22,outline:'none',width:240}}/>
                    <button onClick={saveProfile} disabled={saving}
                      style={{padding:'8px 16px',borderRadius:7,border:'1px solid rgba(0,255,136,0.4)',background:'rgba(0,255,136,0.1)',color:'#00ff88',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                      {saving?'SAVING...':'✅ SAVE'}
                    </button>
                    <button onClick={()=>setEditing(false)} style={{padding:'8px 12px',borderRadius:7,border:'1px solid #1a2744',background:'transparent',color:'#64748b',fontFamily:'Rajdhani,sans-serif',fontSize:12,cursor:'pointer'}}>CANCEL</button>
                  </div>
                ) : (
                  <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:4}}>
                    <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:28,color:'#e2e8f0',margin:0,letterSpacing:'0.04em'}}>{user.name}</h1>
                    <button onClick={()=>setEditing(true)} style={{padding:'4px 10px',borderRadius:6,border:'1px solid #1a2744',background:'transparent',color:'#475569',fontSize:11,cursor:'pointer',fontFamily:'Rajdhani,sans-serif'}}>✏️ EDIT</button>
                  </div>
                )}
                <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                  <span style={{color:'#64748b',fontSize:13}}>{user.email}</span>
                  <span style={{padding:'2px 10px',borderRadius:4,background:'rgba(0,212,255,0.1)',color:'#00d4ff',border:'1px solid rgba(0,212,255,0.2)',fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700}}>{(user.role||'user').toUpperCase()}</span>
                  <span style={{padding:'2px 8px',borderRadius:4,background:'rgba(0,255,136,0.08)',color:'#00ff88',border:'1px solid rgba(0,255,136,0.2)',fontSize:11}}>☁️ MongoDB Atlas</span>
                </div>
                {saved && <div style={{color:'#00ff88',fontSize:12,marginTop:6}}>✅ Profile updated successfully!</div>}
              </div>
              {/* Quick stats */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,flexShrink:0}}>
                {STATS.slice(0,4).map(s=>(
                  <div key={s.label} style={{padding:'10px 14px',borderRadius:10,background:'rgba(13,20,36,0.8)',border:`1px solid ${s.color}20`,textAlign:'center',minWidth:100}}>
                    <div style={{fontSize:18}}>{s.icon}</div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:20,color:s.color}}>{s.value}</div>
                    <div style={{fontSize:10,color:'#475569',fontFamily:'Rajdhani,sans-serif',marginTop:1}}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',gap:4,background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:10,padding:4,marginBottom:16,width:'fit-content'}}>
            {(['overview','activity','settings'] as const).map(t=>(
              <button key={t} onClick={()=>setActiveTab(t)} style={{padding:'8px 20px',borderRadius:7,border:'none',background:activeTab===t?'rgba(0,212,255,0.15)':'transparent',color:activeTab===t?'#00d4ff':'#64748b',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12,letterSpacing:'0.06em',cursor:'pointer',transition:'all 0.2s',textTransform:'uppercase'}}>
                {t==='overview'?'📊 Overview':t==='activity'?'⚡ Activity':'⚙ Settings'}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab==='overview' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                {/* Favorite cities */}
                <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:3,height:13,borderRadius:2,background:'#00d4ff',display:'inline-block'}}/>MONITORED CITIES
                  </div>
                  {['Mumbai','Delhi','Pune','Bangalore','Chennai','Hyderabad'].map((city,i)=>{
                    const colors=['#00d4ff','#ff3b3b','#00ff88','#ffb800','#7c3aed','#06b6d4']
                    const levels=['High','Medium','Low','High','Medium','Low']
                    const vehicles=[87,54,28,71,62,45]
                    const lc={High:'#ff3b3b',Medium:'#ffb800',Low:'#00ff88'}[levels[i]]
                    return(
                      <div key={city} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(26,39,68,0.5)'}}>
                        <div style={{width:9,height:9,borderRadius:'50%',background:colors[i],flexShrink:0}}/>
                        <span style={{color:'#94a3b8',flex:1,fontSize:13}}>{city}</span>
                        <span style={{padding:'1px 7px',borderRadius:4,background:`${lc}15`,color:lc,fontSize:10,fontFamily:'Rajdhani,sans-serif',fontWeight:700}}>{levels[i]}</span>
                        <span style={{color:'#64748b',fontSize:11,fontFamily:'monospace'}}>{vehicles[i]}v/hr</span>
                      </div>
                    )
                  })}
                </div>
                {/* Recent predictions */}
                <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:3,height:13,borderRadius:2,background:'#7c3aed',display:'inline-block'}}/>PREDICTION SUMMARY
                  </div>
                  {[{label:'Low Traffic',count:18,color:'#00ff88',pct:38},{label:'Medium Traffic',count:21,color:'#ffb800',pct:45},{label:'High Traffic',count:8,color:'#ff3b3b',pct:17}].map(s=>(
                    <div key={s.label} style={{marginBottom:14}}>
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                        <span style={{color:'#94a3b8'}}>{s.label}</span>
                        <span style={{color:s.color,fontFamily:'monospace'}}>{s.count} ({s.pct}%)</span>
                      </div>
                      <div style={{height:6,borderRadius:3,background:'#1a2744'}}>
                        <motion.div initial={{width:0}} animate={{width:`${s.pct}%`}} transition={{duration:0.8}} style={{height:'100%',borderRadius:3,background:s.color}}/>
                      </div>
                    </div>
                  ))}
                  <div style={{padding:'10px 12px',borderRadius:8,background:'rgba(0,212,255,0.05)',border:'1px solid rgba(0,212,255,0.15)',marginTop:8}}>
                    <div style={{fontSize:11,color:'#64748b',marginBottom:2}}>Most Active Time</div>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'#00d4ff'}}>08:00 — 09:00 AM 🌅</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Activity Tab */}
          {activeTab==='activity' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:3,height:13,borderRadius:2,background:'#00ff88',display:'inline-block'}}/>RECENT ACTIVITY
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:10}}>
                  {MOCK_ACTIVITY.map((a,i)=>(
                    <motion.div key={a.id} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                      style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:'rgba(13,20,36,0.8)',border:'1px solid rgba(26,39,68,0.5)'}}>
                      <div style={{width:36,height:36,borderRadius:9,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{a.icon}</div>
                      <div style={{flex:1}}>
                        {a.type==='prediction'&&<p style={{color:'#e2e8f0',fontSize:13,margin:0}}>Predicted <span style={{color:LEVEL_COLOR[a.level!]}}>{a.level}</span> traffic in <b>{a.city}</b> — {a.vehicles} v/hr</p>}
                        {a.type==='route'&&<p style={{color:'#e2e8f0',fontSize:13,margin:0}}>Searched route <b>{a.from}</b> → <b>{a.to}</b> ({a.duration})</p>}
                        {a.type==='alert'&&<p style={{color:'#e2e8f0',fontSize:13,margin:0}}>🚨 Alert: {a.msg}</p>}
                      </div>
                      <span style={{color:'#475569',fontSize:11,fontFamily:'monospace',flexShrink:0}}>{a.time}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings Tab */}
          {activeTab==='settings' && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:3,height:13,borderRadius:2,background:'#ffb800',display:'inline-block'}}/>PREFERENCES
                  </div>
                  {[
                    {label:'Push Notifications',desc:'Receive accident & congestion alerts',enabled:true},
                    {label:'Email Reports',desc:'Weekly traffic summary to your email',enabled:false},
                    {label:'Auto-Reroute',desc:'Automatically suggest alternate routes',enabled:true},
                    {label:'Peak Hour Alerts',desc:'Alert before rush hour starts',enabled:true},
                    {label:'Weather Warnings',desc:'Weather-related traffic warnings',enabled:true},
                  ].map((pref,i)=>{
                    const [on,setOn]=useState(pref.enabled)
                    return(
                      <div key={pref.label} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:'1px solid rgba(26,39,68,0.5)'}}>
                        <div>
                          <div style={{color:'#e2e8f0',fontSize:13}}>{pref.label}</div>
                          <div style={{color:'#475569',fontSize:11,marginTop:2}}>{pref.desc}</div>
                        </div>
                        <div onClick={()=>setOn(!on)}
                          style={{width:40,height:22,borderRadius:11,background:on?'rgba(0,255,136,0.3)':'rgba(26,39,68,0.8)',border:`1px solid ${on?'rgba(0,255,136,0.5)':'#1a2744'}`,cursor:'pointer',position:'relative',transition:'all 0.2s',flexShrink:0}}>
                          <div style={{position:'absolute',top:2,left:on?18:2,width:16,height:16,borderRadius:'50%',background:on?'#00ff88':'#475569',transition:'all 0.2s'}}/>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:16,display:'flex',alignItems:'center',gap:8}}>
                    <span style={{width:3,height:13,borderRadius:2,background:'#ff3b3b',display:'inline-block'}}/>ACCOUNT
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {[
                      {label:'Change Password',icon:'🔒',color:'#00d4ff'},
                      {label:'Export My Data',icon:'📄',color:'#00ff88'},
                      {label:'Privacy Settings',icon:'🛡️',color:'#ffb800'},
                      {label:'Connected Devices',icon:'📱',color:'#7c3aed'},
                    ].map(item=>(
                      <button key={item.label} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:9,border:`1px solid ${item.color}20`,background:`${item.color}06`,color:item.color,fontFamily:'Exo 2,sans-serif',fontSize:13,cursor:'pointer',textAlign:'left',transition:'all 0.2s'}}
                        onMouseEnter={e=>e.currentTarget.style.background=`${item.color}12`}
                        onMouseLeave={e=>e.currentTarget.style.background=`${item.color}06`}>
                        <span style={{fontSize:16}}>{item.icon}</span>{item.label}
                        <span style={{marginLeft:'auto',opacity:0.5}}>→</span>
                      </button>
                    ))}
                    <div style={{marginTop:8,padding:'12px 14px',borderRadius:9,background:'rgba(255,59,59,0.06)',border:'1px solid rgba(255,59,59,0.2)'}}>
                      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#ff3b3b',marginBottom:6,fontWeight:700}}>⚠ DANGER ZONE</div>
                      <button style={{width:'100%',padding:'9px',borderRadius:7,border:'1px solid rgba(255,59,59,0.4)',background:'transparent',color:'#ff3b3b',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.05em'}}>
                        🗑️ DELETE ACCOUNT
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </>
  )
}
