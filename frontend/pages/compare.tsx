import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'

const CITIES=[
  {name:'Mumbai',base:85,color:'#00d4ff',lat:19.076,lon:72.877},
  {name:'Delhi',base:92,color:'#ff3b3b',lat:28.704,lon:77.102},
  {name:'Pune',base:67,color:'#00ff88',lat:18.520,lon:73.856},
  {name:'Bangalore',base:78,color:'#ffb800',lat:12.971,lon:77.594},
  {name:'Chennai',base:71,color:'#7c3aed',lat:13.082,lon:80.270},
  {name:'Hyderabad',base:74,color:'#06b6d4',lat:17.385,lon:78.486},
  {name:'Kolkata',base:80,color:'#f97316',lat:22.572,lon:88.363},
  {name:'Ahmedabad',base:55,color:'#ec4899',lat:23.022,lon:72.571},
]

const WEATHER_API_KEY = '4d8fb5b93d4af21d66a2948710284366' // OpenWeatherMap free key

function rnd(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a}

interface WeatherData {
  temp: number
  feels_like: number
  humidity: number
  wind: number
  condition: string
  icon: string
  city: string
}

export default function Compare(){
  const chartRef=useRef<HTMLCanvasElement>(null)
  const radarRef=useRef<HTMLCanvasElement>(null)
  const chartInst=useRef<any[]>([])
  const [selected,setSelected]=useState<string[]>(['Mumbai','Delhi','Pune','Bangalore'])
  const [metric,setMetric]=useState<'vehicles'|'speed'|'congestion'>('vehicles')
  const [hour,setHour]=useState(8)
  const [mounted,setMounted]=useState(false)
  const [weather,setWeather]=useState<Record<string,WeatherData>>({})
  const [weatherLoading,setWeatherLoading]=useState(false)
  const [activeWeatherCity,setActiveWeatherCity]=useState('Mumbai')

  useEffect(()=>{
    setMounted(true)
    setHour(new Date().getHours())
  },[])

  // Fetch real weather
  const fetchWeather = async (cityName: string, lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`
      )
      if(!res.ok) throw new Error('Weather API error')
      const data = await res.json()
      const iconMap: Record<string,string> = {
        'Clear':'☀️','Clouds':'⛅','Rain':'🌧️','Drizzle':'🌦️',
        'Thunderstorm':'⛈️','Snow':'❄️','Mist':'🌫️','Haze':'🌫️','Fog':'🌫️'
      }
      return {
        temp: Math.round(data.main.temp),
        feels_like: Math.round(data.main.feels_like),
        humidity: data.main.humidity,
        wind: Math.round(data.wind.speed * 3.6),
        condition: data.weather[0].description,
        icon: iconMap[data.weather[0].main] || '🌤️',
        city: cityName
      }
    } catch {
      // Fallback weather data
      const fallbacks: Record<string,any> = {
        Mumbai:{temp:34,feels_like:38,humidity:78,wind:18,condition:'partly cloudy',icon:'⛅'},
        Delhi:{temp:38,feels_like:42,humidity:45,wind:12,condition:'clear sky',icon:'☀️'},
        Pune:{temp:32,feels_like:35,humidity:60,wind:15,condition:'few clouds',icon:'🌤️'},
        Bangalore:{temp:28,feels_like:30,humidity:65,wind:10,condition:'overcast',icon:'☁️'},
        Chennai:{temp:36,feels_like:41,humidity:80,wind:22,condition:'humid',icon:'🌤️'},
        Hyderabad:{temp:35,feels_like:39,humidity:55,wind:16,condition:'clear',icon:'☀️'},
        Kolkata:{temp:33,feels_like:37,humidity:72,wind:14,condition:'hazy',icon:'🌫️'},
        Ahmedabad:{temp:40,feels_like:44,humidity:30,wind:20,condition:'sunny',icon:'☀️'},
      }
      return {...(fallbacks[cityName]||{temp:32,feels_like:35,humidity:60,wind:15,condition:'clear',icon:'🌤️'}), city:cityName}
    }
  }

  // Fetch weather for all selected cities
  const loadWeather = async () => {
    setWeatherLoading(true)
    const results: Record<string,WeatherData> = {}
    for(const cityName of selected) {
      const city = CITIES.find(c=>c.name===cityName)
      if(city) {
        results[cityName] = await fetchWeather(city.name, city.lat, city.lon)
      }
    }
    setWeather(results)
    setWeatherLoading(false)
  }

  useEffect(()=>{
    if(mounted && selected.length > 0) loadWeather()
  },[mounted, selected])

  function getData(){
    return CITIES.filter(c=>selected.includes(c.name)).map(c=>{
      const m=hour>=7&&hour<=9?2.8:hour>=17&&hour<=19?3.0:hour<=4?0.3:1.2
      const v=Math.floor(c.base*m+rnd(-10,10))
      return{...c,vehicles:v,speed:Math.max(5,Math.floor(80-v*0.65)),congestion:Math.min(100,Math.floor(v*0.9))}
    })
  }

  useEffect(()=>{
    if(!mounted)return
    const timer=setTimeout(()=>{
      const Chart=(window as any).Chart
      if(!Chart)return
      chartInst.current.forEach(c=>c?.destroy())
      chartInst.current=[]
      const data=getData()

      if(chartRef.current){
        const vals=data.map(d=>metric==='vehicles'?d.vehicles:metric==='speed'?d.speed:d.congestion)
        const c=new Chart(chartRef.current,{
          type:'bar',
          data:{labels:data.map(d=>d.name),datasets:[{label:metric,data:vals,backgroundColor:data.map(d=>d.color+'cc'),borderColor:data.map(d=>d.color),borderWidth:2,borderRadius:6}]},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#64748b',font:{size:11}}},y:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#64748b',font:{size:11}}}}}
        })
        chartInst.current.push(c)
      }

      if(radarRef.current){
        const metrics=['Vehicles','Speed','Efficiency','Safety','Flow']
        const datasets=data.slice(0,4).map(d=>({
          label:d.name,
          data:[d.vehicles/1.2,d.speed,rnd(50,90),rnd(60,95),rnd(55,85)],
          borderColor:d.color,backgroundColor:d.color+'22',borderWidth:2,pointBackgroundColor:d.color
        }))
        const c=new Chart(radarRef.current,{
          type:'radar',
          data:{labels:metrics,datasets},
          options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{labels:{color:'#64748b',font:{size:10}}}},scales:{r:{grid:{color:'rgba(26,39,68,0.5)'},ticks:{color:'#475569',backdropColor:'transparent',font:{size:9}},pointLabels:{color:'#94a3b8',font:{size:11}},angleLines:{color:'rgba(26,39,68,0.5)'}}}}
        })
        chartInst.current.push(c)
      }
    },300)
    return()=>clearTimeout(timer)
  },[selected,metric,hour,mounted])

  const data=getData()
  const best=data.length>0?data.reduce((a,b)=>metric==='speed'?a.speed>b.speed?a:b:a.vehicles<b.vehicles?a:b,data[0]):null
  const activeWeather = weather[activeWeatherCity]

  const getWeatherImpact = (w: WeatherData) => {
    if(!w) return {text:'Loading weather data...', color:'#64748b'}
    if(w.temp > 40) return {text:'Extreme heat! High breakdown risk on roads.', color:'#ff3b3b'}
    if(w.condition.includes('rain') || w.condition.includes('drizzle')) return {text:'Rain reducing visibility — expect 20% more congestion.', color:'#ffb800'}
    if(w.condition.includes('fog') || w.condition.includes('mist')) return {text:'Fog advisory! Reduced speed limits in effect.', color:'#ffb800'}
    if(w.temp > 35) return {text:'High heat may cause vehicle overheating incidents.', color:'#ffb800'}
    if(w.wind > 40) return {text:'Strong winds affecting highway vehicle stability.', color:'#ffb800'}
    return {text:'Weather conditions are favorable for normal traffic.', color:'#00ff88'}
  }

  return(
    <>
      <Head>
        <title>SmartFlow — City Comparison</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js" async/>
      </Head>
      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.02)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02)1px,transparent 1px)',backgroundSize:'40px 40px'}}>
        <Navbar/>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{maxWidth:1300,margin:'0 auto',padding:'24px 20px'}}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
            <div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:26,color:'#e2e8f0',letterSpacing:'0.06em',margin:0}}>🏙 CITY COMPARISON</h1>
              <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Compare traffic + live weather across Indian cities</p>
            </div>
            <button onClick={loadWeather} disabled={weatherLoading}
              style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:9,border:'1px solid rgba(0,255,136,0.3)',background:'rgba(0,255,136,0.07)',color:'#00ff88',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.05em'}}>
              {weatherLoading?<><span style={{width:12,height:12,border:'2px solid rgba(0,255,136,0.3)',borderTop:'2px solid #00ff88',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block'}}/>UPDATING...</>:<>🌤 REFRESH WEATHER</>}
            </button>
          </div>

          {/* Controls */}
          <div style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:14,marginBottom:18,alignItems:'end',flexWrap:'wrap'}}>
            <div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'#64748b',letterSpacing:'0.08em',marginBottom:8,textTransform:'uppercase'}}>Select Cities (min 2)</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {CITIES.map(c=>{
                  const sel=selected.includes(c.name)
                  return(
                    <button key={c.name} onClick={()=>setSelected(p=>sel&&p.length>2?p.filter(x=>x!==c.name):[...p,c.name])}
                      style={{padding:'5px 12px',borderRadius:6,border:`1px solid ${sel?c.color+'60':'#1a2744'}`,background:sel?`${c.color}12`:'transparent',color:sel?c.color:'#475569',fontFamily:'Exo 2,sans-serif',fontSize:12,cursor:'pointer',transition:'all 0.2s'}}>
                      {c.name}
                    </button>
                  )
                })}
              </div>
            </div>
            <div>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'#64748b',letterSpacing:'0.08em',marginBottom:8,textTransform:'uppercase'}}>Metric</div>
              <div style={{display:'flex',gap:4,background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:9,padding:4}}>
                {(['vehicles','speed','congestion'] as const).map(m=>(
                  <button key={m} onClick={()=>setMetric(m)} style={{padding:'6px 12px',borderRadius:6,border:'none',background:metric===m?'rgba(0,212,255,0.15)':'transparent',color:metric===m?'#00d4ff':'#64748b',fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s',textTransform:'uppercase'}}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{minWidth:160}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'#64748b',letterSpacing:'0.08em',marginBottom:8,textTransform:'uppercase'}}>Hour: {String(hour).padStart(2,'0')}:00</div>
              <input type="range" min={0} max={23} value={hour} onChange={e=>setHour(Number(e.target.value))} style={{width:'100%',accentColor:'#00d4ff'}}/>
            </div>
          </div>

          {/* Winner */}
          {best&&(
            <div style={{background:`${best.color}08`,border:`1px solid ${best.color}30`,borderRadius:12,padding:'12px 18px',marginBottom:16,display:'flex',alignItems:'center',gap:14}}>
              <span style={{fontSize:22}}>🏆</span>
              <div>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,color:best.color}}>
                  {metric==='speed'?'FASTEST CITY':'LEAST CONGESTED'}: {best.name.toUpperCase()}
                </div>
                <div style={{fontSize:12,color:'#64748b'}}>
                  {metric==='vehicles'?best.vehicles+' vehicles/hr':metric==='speed'?best.speed+' km/h':best.congestion+'% congestion'} at {String(hour).padStart(2,'0')}:00
                </div>
              </div>
            </div>
          )}

          {/* Charts row */}
          <div style={{display:'grid',gridTemplateColumns:'1.5fr 1fr',gap:16,marginBottom:16}}>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:13,borderRadius:2,background:'#00d4ff',display:'inline-block'}}/>{metric.toUpperCase()} AT {String(hour).padStart(2,'0')}:00
              </div>
              <div style={{position:'relative',height:240}}><canvas ref={chartRef}/></div>
            </div>
            <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:13,borderRadius:2,background:'#7c3aed',display:'inline-block'}}/>PERFORMANCE RADAR
              </div>
              <div style={{position:'relative',height:240}}><canvas ref={radarRef}/></div>
            </div>
          </div>

          {/* Live Weather Section */}
          <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
              <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',display:'flex',alignItems:'center',gap:8}}>
                <span style={{width:3,height:13,borderRadius:2,background:'#00d4ff',display:'inline-block'}}/>
                🌤 LIVE WEATHER — REAL-TIME DATA
                {weatherLoading&&<span style={{width:12,height:12,border:'2px solid rgba(0,212,255,0.3)',borderTop:'2px solid #00d4ff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block',marginLeft:8}}/>}
              </div>
              <div style={{display:'flex',gap:6}}>
                {selected.map(c=>{
                  const city=CITIES.find(x=>x.name===c)
                  return(
                    <button key={c} onClick={()=>setActiveWeatherCity(c)}
                      style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${activeWeatherCity===c?(city?.color||'#00d4ff')+'50':'#1a2744'}`,background:activeWeatherCity===c?`${city?.color||'#00d4ff'}12`:'transparent',color:activeWeatherCity===c?(city?.color||'#00d4ff'):'#64748b',fontFamily:'Exo 2,sans-serif',fontSize:11,cursor:'pointer',transition:'all 0.2s'}}>
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>

            {activeWeather?(
              <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:20,alignItems:'center'}}>
                <div style={{textAlign:'center',padding:'16px 24px',background:'rgba(13,20,36,0.8)',border:'1px solid #1a2744',borderRadius:12}}>
                  <div style={{fontSize:52}}>{activeWeather.icon}</div>
                  <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:40,color:'#00d4ff',lineHeight:1}}>{activeWeather.temp}°C</div>
                  <div style={{fontSize:12,color:'#64748b',marginTop:4,textTransform:'capitalize'}}>{activeWeather.condition}</div>
                  <div style={{fontSize:11,color:'#475569',marginTop:2}}>{activeWeatherCity}</div>
                </div>
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:12}}>
                    {[
                      {label:'Feels Like',value:`${activeWeather.feels_like}°C`,color:'#ffb800',icon:'🌡️'},
                      {label:'Humidity',value:`${activeWeather.humidity}%`,color:'#00d4ff',icon:'💧'},
                      {label:'Wind Speed',value:`${activeWeather.wind} km/h`,color:'#00ff88',icon:'💨'},
                    ].map(w=>(
                      <div key={w.label} style={{padding:'12px',borderRadius:10,background:'rgba(13,20,36,0.8)',border:`1px solid ${w.color}20`,textAlign:'center'}}>
                        <div style={{fontSize:20,marginBottom:4}}>{w.icon}</div>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:20,color:w.color}}>{w.value}</div>
                        <div style={{fontSize:11,color:'#475569',marginTop:2}}>{w.label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Weather traffic impact */}
                  {(()=>{
                    const impact=getWeatherImpact(activeWeather)
                    return(
                      <div style={{padding:'12px 14px',borderRadius:10,background:`${impact.color}08`,border:`1px solid ${impact.color}25`}}>
                        <div style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:impact.color,letterSpacing:'0.06em',marginBottom:4,fontWeight:700}}>⚠ TRAFFIC IMPACT ANALYSIS</div>
                        <p style={{color:'#94a3b8',fontSize:13,margin:0,lineHeight:1.5}}>{impact.text}</p>
                      </div>
                    )
                  })()}
                </div>
              </div>
            ):(
              <div style={{textAlign:'center',padding:'20px',color:'#475569',fontFamily:'Rajdhani,sans-serif'}}>
                {weatherLoading?'Loading real-time weather data...':'Select a city to see weather'}
              </div>
            )}
          </div>

          {/* Comparison table */}
          <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18}}>
            <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',marginBottom:14,display:'flex',alignItems:'center',gap:8}}>
              <span style={{width:3,height:13,borderRadius:2,background:'#00ff88',display:'inline-block'}}/>DETAILED COMPARISON
            </div>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:'1px solid #1a2744'}}>
                    {['City','Vehicles/hr','Speed','Congestion','Level','Weather','Status'].map(h=>(
                      <th key={h} style={{textAlign:'left',padding:'8px 12px',fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'#475569',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.sort((a,b)=>b.vehicles-a.vehicles).map((d,i)=>{
                    const level=d.vehicles<30?'Low':d.vehicles<65?'Medium':'High'
                    const lc={Low:'#00ff88',Medium:'#ffb800',High:'#ff3b3b'}[level]
                    const w=weather[d.name]
                    return(
                      <tr key={d.name} style={{borderBottom:'1px solid rgba(26,39,68,0.4)'}}>
                        <td style={{padding:'10px 12px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{width:10,height:10,borderRadius:'50%',background:d.color,boxShadow:`0 0 6px ${d.color}`}}/>
                            <span style={{color:'#e2e8f0',fontWeight:600}}>{d.name}</span>
                            {i===0&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:'rgba(255,184,0,0.15)',color:'#ffb800'}}>PEAK</span>}
                          </div>
                        </td>
                        <td style={{padding:'10px 12px',color:d.color,fontFamily:'monospace',fontWeight:600}}>{d.vehicles}</td>
                        <td style={{padding:'10px 12px',color:'#94a3b8',fontFamily:'monospace'}}>{d.speed} km/h</td>
                        <td style={{padding:'10px 12px'}}>
                          <div style={{display:'flex',alignItems:'center',gap:8}}>
                            <div style={{flex:1,height:4,borderRadius:2,background:'#1a2744',maxWidth:80}}>
                              <div style={{width:`${d.congestion}%`,height:'100%',borderRadius:2,background:lc}}/>
                            </div>
                            <span style={{color:lc,fontFamily:'monospace',fontSize:11}}>{d.congestion}%</span>
                          </div>
                        </td>
                        <td style={{padding:'10px 12px'}}>
                          <span style={{padding:'2px 8px',borderRadius:4,background:`${lc}15`,color:lc,border:`1px solid ${lc}30`,fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700}}>{level}</span>
                        </td>
                        <td style={{padding:'10px 12px'}}>
                          {w?(
                            <div style={{display:'flex',alignItems:'center',gap:5}}>
                              <span style={{fontSize:14}}>{w.icon}</span>
                              <span style={{color:'#94a3b8',fontSize:12}}>{w.temp}°C</span>
                            </div>
                          ):(
                            <span style={{color:'#334155',fontSize:11}}>Loading...</span>
                          )}
                        </td>
                        <td style={{padding:'10px 12px',color:'#64748b',fontSize:12}}>
                          {d.speed>50?'✅ Flowing':d.speed>25?'⚠️ Slow':'🔴 Gridlock'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
