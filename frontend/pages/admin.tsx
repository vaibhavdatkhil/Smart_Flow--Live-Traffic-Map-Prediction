import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'

const LEVEL_COLOR: Record<string,string>={Low:'#00ff88',Medium:'#ffb800',High:'#ff3b3b'}
const CITIES=['Mumbai','Delhi','Pune','Bangalore','Chennai','Hyderabad']
const ALERTS_LIST=["Heavy congestion on NH-48 near Khopoli.","Road work at Chandni Chowk — 20min delay.","Flash flood warning: coastal roads affected.","VIP movement expected 3–5 PM on MG Road.","Marathon: Bandra-Kurla roads closed until noon.","Signal malfunction at Silk Board Junction."]
function rnd(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a}

function genLogs(){
  const levels=['Low','Low','Medium','Medium','High']
  return Array.from({length:18},(_,i)=>{
    const l=levels[rnd(0,4)]
    const dt=new Date(Date.now()-i*3*60000)
    return{id:i+1,ts:dt.toLocaleString(),city:CITIES[rnd(0,5)],j:rnd(1,4),h:dt.getHours(),level:l,v:rnd(5,115),conf:0.78+Math.random()*0.18}
  })
}

export default function Admin(){
  const [tab,setTab]=useState<'logs'|'stats'|'alerts'>('logs')
  const [logs,setLogs]=useState(genLogs())
  const pieRef=useRef<HTMLCanvasElement>(null)
  const chartInit=useRef(false)
  const chartInst=useRef<any>(null)

  useEffect(()=>{
    if(chartInit.current)return
    const timer=setTimeout(()=>{
      const Chart=(window as any).Chart
      if(!Chart||!pieRef.current)return
      chartInit.current=true
      if(chartInst.current)chartInst.current.destroy()
      chartInst.current=new Chart(pieRef.current,{
        type:'doughnut',
        data:{labels:['Low','Medium','High'],datasets:[{data:[1200,2300,1500],backgroundColor:['#00ff88','#ffb800','#ff3b3b'],borderWidth:0,spacing:3}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'60%'}
      })
    },400)
    return()=>clearTimeout(timer)
  },[])

  const pieData=[{l:'Low',v:1200,c:'#00ff88'},{l:'Medium',v:2300,c:'#ffb800'},{l:'High',v:1500,c:'#ff3b3b'}]
  const feats=[{n:'Hour',v:38},{n:'Junction',v:26},{n:'Month',v:18},{n:'Day',v:12},{n:'IsWeekend',v:6}]
  const statsData=[['Total Records','5,000'],['ML Model','Random Forest (100 trees)'],['Features','Hour, Day, Month, Junction, IsWeekend'],['Target','Traffic Level (Low/Medium/High)'],['Train/Test Split','80% / 20%'],['Model Accuracy','89.1%'],['Max Vehicles','119/hr'],['Min Vehicles','0/hr'],['Avg Vehicles','32.4/hr']]

  const Panel=({children,style={}}: any)=>(
    <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18,...style}}>{children}</div>
  )
  const STitle=({color='#00d4ff',children}: any)=>(
    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
      <span style={{width:3,height:13,borderRadius:2,background:color,display:'inline-block'}}/>{children}
    </div>
  )

  return(
    <>
      <Head>
        <title>SmartFlow — Admin</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" async/>
      </Head>
      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.03)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03)1px,transparent 1px)',backgroundSize:'40px 40px'}}>
        <Navbar/>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{maxWidth:1280,margin:'0 auto',padding:'24px 20px'}}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
            <div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:28,color:'#e2e8f0',letterSpacing:'0.06em',margin:0}}>ADMIN PANEL</h1>
              <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Analytics, prediction logs, and system health</p>
            </div>
            <button onClick={()=>setLogs(genLogs())} style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:8,border:'1px solid rgba(0,212,255,0.25)',background:'rgba(0,212,255,0.07)',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontSize:13,cursor:'pointer',letterSpacing:'0.05em'}}>
              🔄 REFRESH
            </button>
          </div>

          {/* Top cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[['DATASET RECORDS','5,000','#00d4ff'],['MODEL ACCURACY','89.1%','#7c3aed'],['AVG VEHICLES','32.4','#00ff88'],['JUNCTIONS','4','#ffb800']].map(([l,v,c])=>(
              <div key={l} style={{background:'#0a0f1e',border:`1px solid ${c}20`,borderRadius:12,padding:'14px 16px',position:'relative',overflow:'hidden'}}>
                <div style={{position:'absolute',top:-20,right:-20,width:60,height:60,borderRadius:'50%',background:c,filter:'blur(20px)',opacity:0.1}}/>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.1em',color:'#64748b',textTransform:'uppercase',marginBottom:4}}>{l}</div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:26,color:c as string}}>{v}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:16}}>
            <Panel>
              <STitle color="#7c3aed">LEVEL DISTRIBUTION</STitle>
              <div style={{height:160,position:'relative'}}><canvas ref={pieRef}/></div>
              <div style={{display:'flex',justifyContent:'center',gap:14,marginTop:10}}>
                {pieData.map(d=>(
                  <span key={d.l} style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#64748b'}}>
                    <span style={{width:9,height:9,borderRadius:2,background:d.c}}/>
                    {d.l} {d.v.toLocaleString()}
                  </span>
                ))}
              </div>
            </Panel>

            <Panel>
              <STitle color="#ffb800">CLASS BREAKDOWN</STitle>
              {pieData.map(d=>{
                const pct=Math.round(d.v/5000*100)
                return(
                  <div key={d.l} style={{marginBottom:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
                      <span style={{color:'#94a3b8'}}>{d.l} Traffic</span>
                      <span style={{color:d.c,fontFamily:'monospace'}}>{d.v.toLocaleString()} ({pct}%)</span>
                    </div>
                    <div style={{height:6,borderRadius:3,background:'#1a2744'}}>
                      <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:0.8}} style={{height:'100%',borderRadius:3,background:d.c}}/>
                    </div>
                  </div>
                )
              })}
            </Panel>

            <Panel>
              <STitle color="#7c3aed">FEATURE IMPORTANCE</STitle>
              {feats.map((f,i)=>(
                <div key={f.n} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span style={{color:'#94a3b8'}}>{f.n}</span>
                    <span style={{color:'#7c3aed',fontFamily:'monospace'}}>{f.v}%</span>
                  </div>
                  <div style={{height:5,borderRadius:3,background:'#1a2744'}}>
                    <motion.div initial={{width:0}} animate={{width:`${f.v*2.5}%`}} transition={{duration:0.8,delay:i*0.1}} style={{height:'100%',borderRadius:3,background:'#7c3aed'}}/>
                  </div>
                </div>
              ))}
            </Panel>
          </div>

          {/* Tabs */}
          <Panel>
            <div style={{display:'flex',borderBottom:'1px solid #1a2744',marginBottom:16,gap:0}}>
              {(['logs','stats','alerts'] as const).map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 20px',border:'none',borderBottom:`2px solid ${tab===t?'#00d4ff':'transparent'}`,background:tab===t?'rgba(0,212,255,0.04)':'transparent',color:tab===t?'#00d4ff':'#475569',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:12,letterSpacing:'0.08em',cursor:'pointer',textTransform:'uppercase',marginBottom:-1,transition:'all 0.2s'}}>
                  {t==='logs'?'📋 PREDICTION LOGS':t==='stats'?'📊 DATASET STATS':'🚨 ALERTS'}
                </button>
              ))}
            </div>

            {/* Logs */}
            {tab==='logs'&&(
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #1a2744'}}>
                      {['#','Timestamp','City','Junction','Hour','Level','Vehicles','Confidence'].map(h=>(
                        <th key={h} style={{textAlign:'left',padding:'6px 10px',fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.06em',color:'#475569',fontWeight:600,textTransform:'uppercase'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log=>{
                      const c=LEVEL_COLOR[log.level]
                      return(
                        <tr key={log.id} style={{borderBottom:'1px solid rgba(26,39,68,0.4)'}}>
                          <td style={{padding:'7px 10px',color:'#334155',fontFamily:'monospace'}}>{log.id}</td>
                          <td style={{padding:'7px 10px',color:'#64748b',whiteSpace:'nowrap'}}>{log.ts}</td>
                          <td style={{padding:'7px 10px',color:'#e2e8f0'}}>{log.city}</td>
                          <td style={{padding:'7px 10px',color:'#64748b',fontFamily:'monospace'}}>J-{log.j}</td>
                          <td style={{padding:'7px 10px',color:'#64748b',fontFamily:'monospace'}}>{String(log.h).padStart(2,'0')}:00</td>
                          <td style={{padding:'7px 10px'}}><span style={{padding:'2px 7px',borderRadius:4,background:`${c}15`,color:c,border:`1px solid ${c}30`,fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700}}>{log.level}</span></td>
                          <td style={{padding:'7px 10px',color:'#94a3b8',fontFamily:'monospace'}}>{log.v}</td>
                          <td style={{padding:'7px 10px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:6}}>
                              <div style={{width:50,height:4,borderRadius:2,background:'#1a2744'}}><div style={{width:`${log.conf*100}%`,height:'100%',borderRadius:2,background:'#7c3aed'}}/></div>
                              <span style={{color:'#7c3aed',fontSize:10,fontFamily:'monospace'}}>{(log.conf*100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Stats */}
            {tab==='stats'&&(
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                <div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#64748b',letterSpacing:'0.08em',marginBottom:12}}>DATASET OVERVIEW</div>
                  {statsData.map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1a2744',fontSize:12,gap:12}}>
                      <span style={{color:'#64748b',flexShrink:0}}>{k}</span>
                      <span style={{color:'#94a3b8',fontFamily:'monospace',textAlign:'right'}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:12,color:'#64748b',letterSpacing:'0.08em',marginBottom:12}}>HOURLY PATTERN</div>
                  {[['00–05 (Night)','Low traffic','#00ff88'],['06–09 (Morning rush)','Very High','#ff3b3b'],['10–16 (Midday)','Moderate','#ffb800'],['17–19 (Evening rush)','Very High','#ff3b3b'],['20–23 (Night)','Low traffic','#00ff88']].map(([t,v,c])=>(
                    <div key={t} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:'1px solid #1a2744',fontSize:12}}>
                      <span style={{color:'#64748b'}}>{t}</span>
                      <span style={{color:c as string}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alerts */}
            {tab==='alerts'&&(
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {ALERTS_LIST.map((msg,i)=>{
                  const sev=['High','Medium','Low','Medium','High','Low'][i%6]
                  const c=LEVEL_COLOR[sev]
                  return(
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'12px 14px',borderRadius:8,background:`${c}07`,border:`1px solid ${c}25`}}>
                      <span style={{color:c,fontSize:16,flexShrink:0}}>⚠</span>
                      <div style={{flex:1}}>
                        <p style={{color:'#e2e8f0',fontSize:13,margin:0}}>{msg}</p>
                        <div style={{display:'flex',gap:12,marginTop:4}}>
                          <span style={{color:'#64748b',fontSize:11}}>{CITIES[i%6]}</span>
                          <span style={{color:'#475569',fontSize:11,fontFamily:'monospace'}}>{new Date(Date.now()-i*900000).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      <span style={{padding:'2px 8px',borderRadius:4,background:`${c}15`,color:c,border:`1px solid ${c}30`,fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700,flexShrink:0}}>{sev.toUpperCase()}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </Panel>
        </motion.div>
      </div>
    </>
  )
}
