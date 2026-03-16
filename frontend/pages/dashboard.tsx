import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'

const CITIES = ['Mumbai','Delhi','Pune','Bangalore','Chennai','Hyderabad','Kolkata','Ahmedabad']
const COLORS = ['#00d4ff','#00ff88','#ffb800','#ff3b3b','#7c3aed','#06b6d4','#f97316','#ec4899']
const LEVEL_COLOR: Record<string,string> = {Low:'#00ff88',Medium:'#ffb800',High:'#ff3b3b'}

function rnd(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a}
function genLive(){
  const h=new Date().getHours()
  const peak=h>=7&&h<=9||h>=17&&h<=19
  return CITIES.map((city,i)=>{
    const base=[85,92,67,78,71,74,80,55][i]
    const v=Math.floor(base*(peak?1.4:0.8)*(0.85+Math.random()*0.3))
    return{city,vehicles:v,level:v<30?'Low':v<65?'Medium':'High',speed:Math.max(5,Math.floor(80-v*0.65))}
  })
}

export default function Dashboard(){
  const [junctions,setJunctions]=useState(genLive())
  const [total,setTotal]=useState(0)
  const [cong,setCong]=useState(0)
  const [speed,setSpeed]=useState(0)
  const hourlyRef=useRef<HTMLCanvasElement>(null)
  const histRef=useRef<HTMLCanvasElement>(null)
  const distRef=useRef<HTMLCanvasElement>(null)
  const cityRef=useRef<HTMLCanvasElement>(null)
  const chartsInit=useRef(false)
  const chartInstances=useRef<any[]>([])

  useEffect(()=>{
    const j=genLive()
    setJunctions(j)
    setTotal(j.reduce((s,x)=>s+x.vehicles,0))
    setCong(Math.floor(j.filter(x=>x.level==='High').length/j.length*100))
    setSpeed(Math.floor(j.reduce((s,x)=>s+x.speed,0)/j.length))
  },[])

  useEffect(()=>{
    const interval=setInterval(()=>{
      const j=genLive()
      setJunctions(j)
      setTotal(j.reduce((s,x)=>s+x.vehicles,0))
      setCong(Math.floor(j.filter(x=>x.level==='High').length/j.length*100))
      setSpeed(Math.floor(j.reduce((s,x)=>s+x.speed,0)/j.length))
    },5000)
    return()=>clearInterval(interval)
  },[])

  useEffect(()=>{
    if(chartsInit.current)return
    const timer=setTimeout(()=>{
      if(typeof window==='undefined')return
      const Chart=(window as any).Chart
      if(!Chart)return
      chartsInit.current=true

      // Destroy old
      chartInstances.current.forEach(c=>c?.destroy())
      chartInstances.current=[]

      const hourly=Array.from({length:24},(_,h)=>{
        const m=h>=7&&h<=9?2.8:h>=17&&h<=19?3.0:h<=4?0.3:1.2
        return Math.floor(45*m+rnd(-8,8))
      })

      if(hourlyRef.current){
        const c=new Chart(hourlyRef.current,{
          type:'line',
          data:{labels:Array.from({length:24},(_,h)=>h+'h'),datasets:[{label:'Vehicles',data:hourly,borderColor:'#00d4ff',backgroundColor:'rgba(0,212,255,0.08)',borderWidth:2,fill:true,tension:0.4,pointRadius:0}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',font:{size:10},maxTicksLimit:8}},y:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',font:{size:10}}}}}
        })
        chartInstances.current.push(c)
      }

      const hist=Array.from({length:24},(_,i)=>{
        const h=(new Date().getHours()-23+i+24)%24
        return Math.floor((h>=7&&h<=9?85:h>=17&&h<=19?95:h<=4?8:40)+rnd(-10,10))
      })
      if(histRef.current){
        const c=new Chart(histRef.current,{
          type:'line',
          data:{labels:Array.from({length:24},(_,i)=>((new Date().getHours()-23+i+24)%24)+'h'),datasets:[{label:'Vehicles',data:hist,borderColor:'#00ff88',backgroundColor:'rgba(0,255,136,0.05)',borderWidth:2,fill:true,tension:0.3,pointRadius:0}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',font:{size:10},maxTicksLimit:8}},y:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',font:{size:10}}}}}
        })
        chartInstances.current.push(c)
      }

      if(distRef.current){
        const c=new Chart(distRef.current,{
          type:'doughnut',
          data:{labels:['Cars','Bikes','Trucks','Buses'],datasets:[{data:[45,28,15,12],backgroundColor:['#00d4ff','#00ff88','#ffb800','#ff3b3b'],borderWidth:0,spacing:2}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},cutout:'65%'}
        })
        chartInstances.current.push(c)
      }

      const cityVehicles=CITIES.map((_,i)=>{
        const base=[85,92,67,78,71,74,80,55][i]
        const h=new Date().getHours()
        const peak=h>=7&&h<=9||h>=17&&h<=19
        return Math.floor(base*(peak?1.3:0.8))
      })
      if(cityRef.current){
        const c=new Chart(cityRef.current,{
          type:'bar',
          data:{labels:CITIES,datasets:[{label:'Vehicles',data:cityVehicles,backgroundColor:COLORS,borderWidth:0,borderRadius:4}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',font:{size:10}}},y:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',font:{size:10}}}}}
        })
        chartInstances.current.push(c)
      }
    },300)
    return()=>clearTimeout(timer)
  },[])

  const S=(props:any)=>(
    <div style={{background:'#0a0f1e',border:`1px solid ${props.color}25`,borderRadius:12,padding:'14px 16px',position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:-20,right:-20,width:60,height:60,borderRadius:'50%',background:props.color,filter:'blur(20px)',opacity:0.12}}/>
      <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.1em',color:'#64748b',textTransform:'uppercase',marginBottom:4}}>{props.label}</div>
      <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:26,color:props.color}}>{props.value}</div>
      {props.sub&&<div style={{fontSize:11,color:'#475569',marginTop:2}}>{props.sub}</div>}
    </div>
  )

  return(
    <>
      <Head>
        <title>SmartFlow — Dashboard</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" async/>
      </Head>
      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.03)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.03)1px,transparent 1px)',backgroundSize:'40px 40px'}}>
        <Navbar/>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{maxWidth:1280,margin:'0 auto',padding:'24px 20px'}}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
            <div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:28,color:'#e2e8f0',letterSpacing:'0.06em',margin:0}}>SMART CITY DASHBOARD</h1>
              <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Real-time traffic analytics and AI predictions</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'5px 12px',borderRadius:6,background:'rgba(0,255,136,0.07)',border:'1px solid rgba(0,255,136,0.2)'}}>
              <div style={{width:7,height:7,borderRadius:'50%',background:'#00ff88',animation:'blink 1.4s infinite'}}/>
              <span style={{fontFamily:'monospace',fontSize:11,color:'#00ff88'}}>AUTO-UPDATING</span>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            <S label="Live Vehicles" value={total.toLocaleString()} color="#00d4ff" sub="↑ 8% vs yesterday"/>
            <S label="Congestion" value={cong+'%'} color={cong>60?'#ff3b3b':'#ffb800'} sub="↓ 3% vs yesterday"/>
            <S label="Avg Speed" value={speed+' km/h'} color="#00ff88" sub="↑ 5% vs yesterday"/>
            <S label="AI Accuracy" value="89%" color="#7c3aed" sub="RandomForest model"/>
          </div>

          {/* Charts row 1 */}
          <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:14,borderRadius:2,background:'#00d4ff',display:'inline-block'}}/>24-HOUR TRAFFIC VOLUME
              </div>
              <div style={{position:'relative',height:200}}><canvas ref={hourlyRef}/></div>
            </div>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:14,borderRadius:2,background:'#ffb800',display:'inline-block'}}/>CITY CONGESTION
              </div>
              {junctions.map((j,i)=>(
                <div key={j.city} style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:11,marginBottom:3}}>
                    <span style={{color:'#94a3b8'}}>{j.city}</span>
                    <span style={{color:COLORS[i%COLORS.length],fontFamily:'monospace'}}>{j.vehicles}v/hr</span>
                  </div>
                  <div style={{height:5,borderRadius:3,background:'#1a2744'}}>
                    <motion.div initial={{width:0}} animate={{width:`${Math.min(100,j.vehicles)}%`}} transition={{duration:0.8,delay:i*0.05}} style={{height:'100%',borderRadius:3,background:COLORS[i%COLORS.length]}}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Charts row 2 */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:14,borderRadius:2,background:'#00ff88',display:'inline-block'}}/>TRAFFIC HISTORY (24h)
              </div>
              <div style={{position:'relative',height:180}}><canvas ref={histRef}/></div>
            </div>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:14,borderRadius:2,background:'#7c3aed',display:'inline-block'}}/>VEHICLES BY CITY
              </div>
              <div style={{position:'relative',height:180}}><canvas ref={cityRef}/></div>
            </div>
          </div>

          {/* Vehicle distribution + table */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:16,marginBottom:16}}>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:14,borderRadius:2,background:'#ff3b3b',display:'inline-block'}}/>VEHICLE TYPES
              </div>
              <div style={{position:'relative',height:160}}><canvas ref={distRef}/></div>
              <div style={{display:'flex',flexDirection:'column',gap:6,marginTop:12}}>
                {[['Cars','45%','#00d4ff'],['Bikes','28%','#00ff88'],['Trucks','15%','#ffb800'],['Buses','12%','#ff3b3b']].map(([l,v,c])=>(
                  <div key={l} style={{display:'flex',alignItems:'center',gap:8,fontSize:12}}>
                    <span style={{width:9,height:9,borderRadius:2,background:c,flexShrink:0}}/>
                    <span style={{color:'#64748b',flex:1}}>{l}</span>
                    <span style={{color:'#94a3b8',fontFamily:'monospace'}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Live table */}
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <span style={{width:3,height:14,borderRadius:2,background:'#00d4ff',display:'inline-block'}}/>LIVE JUNCTION STATUS
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5}}>
                  <div style={{width:7,height:7,borderRadius:'50%',background:'#00ff88',animation:'blink 1.4s infinite'}}/>
                  <span style={{fontSize:11,color:'#00ff88',fontFamily:'monospace'}}>UPDATING</span>
                </div>
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                  <thead>
                    <tr style={{borderBottom:'1px solid #1a2744'}}>
                      {['City','Vehicles/hr','Speed','Status','Trend'].map(h=>(
                        <th key={h} style={{textAlign:'left',padding:'6px 10px',fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.06em',color:'#475569',fontWeight:600,textTransform:'uppercase'}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {junctions.map((j,i)=>{
                      const c=LEVEL_COLOR[j.level]
                      return(
                        <tr key={j.city} style={{borderBottom:'1px solid rgba(26,39,68,0.4)'}}>
                          <td style={{padding:'8px 10px'}}>
                            <div style={{display:'flex',alignItems:'center',gap:8}}>
                              <div style={{width:8,height:8,borderRadius:'50%',background:c,boxShadow:`0 0 5px ${c}`}}/>
                              <span style={{color:'#e2e8f0'}}>{j.city}</span>
                            </div>
                          </td>
                          <td style={{padding:'8px 10px',color:'#94a3b8',fontFamily:'monospace'}}>{j.vehicles}</td>
                          <td style={{padding:'8px 10px',color:'#64748b'}}>{j.speed} km/h</td>
                          <td style={{padding:'8px 10px'}}>
                            <span style={{padding:'2px 8px',borderRadius:4,background:`${c}18`,color:c,border:`1px solid ${c}35`,fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700,letterSpacing:'0.04em'}}>{j.level.toUpperCase()}</span>
                          </td>
                          <td style={{padding:'8px 10px',fontSize:18,color:i%2===0?'#00ff88':'#ff3b3b'}}>{i%2===0?'↑':'↓'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </>
  )
}
