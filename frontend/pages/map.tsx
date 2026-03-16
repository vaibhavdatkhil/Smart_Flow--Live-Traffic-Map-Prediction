import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'
import toast, { Toaster } from 'react-hot-toast'

const CITIES = [
  {name:'Mumbai',lat:19.0760,lng:72.8777,base:85},
  {name:'Delhi',lat:28.7041,lng:77.1025,base:92},
  {name:'Pune',lat:18.5204,lng:73.8567,base:67},
  {name:'Bangalore',lat:12.9716,lng:77.5946,base:78},
  {name:'Chennai',lat:13.0827,lng:80.2707,base:71},
  {name:'Hyderabad',lat:17.3850,lng:78.4867,base:74},
  {name:'Kolkata',lat:22.5726,lng:88.3639,base:80},
  {name:'Ahmedabad',lat:23.0225,lng:72.5714,base:55},
]

const ROUTE_ALERTS = [
  "🚨 Accident reported near Khopoli on NH-48!",
  "⚠️ Road work causing 2km jam near Talegaon!",
  "🚦 Signal failure at Wakad junction!",
  "🌧️ Waterlogging near Hinjewadi IT Park!",
  "🚛 Heavy vehicle restriction on Expressway!",
]

function rnd(a:number,b:number){return Math.floor(Math.random()*(b-a+1))+a}

const LEVEL_COLOR:Record<string,string>={
  Low:'#00ff88',    // bright green
  Medium:'#ffb800', // amber
  High:'#ff3b3b'    // red
}
const LEVEL_BG:Record<string,string>={
  Low:'rgba(0,255,136,0.15)',
  Medium:'rgba(255,184,0,0.15)',
  High:'rgba(255,59,59,0.15)'
}

//const vehicleMarkerRef = useRef<any>(null)
//const animationRef = useRef<any>(null)

//const [steps,setSteps] = useState<any[]>([])
//const [activeStep,setActiveStep] = useState(0)

export default function MapPage(){
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const circlesRef = useRef<any[]>([])
  const accidentMarkersRef = useRef<any[]>([])
  const routeLayersRef = useRef<any[]>([])
  const heatmapLayerRef = useRef<any>(null)
  const tileLayerRef = useRef<any>(null)
  
  // vehicle animation + navigation
const vehicleMarkerRef = useRef<any>(null)
const animationRef = useRef<any>(null)

const [steps,setSteps] = useState<any[]>([])
const [activeStep,setActiveStep] = useState(0)

  const [data, setData] = useState<any[]>([])
  const [accidents, setAccidents] = useState<any[]>([])
  const [selected, setSelected] = useState<any>(null)
  const [ts, setTs] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [mapStyle, setMapStyle] = useState<'dark'|'street'|'satellite'>('dark')
  
  // Route search
  const [fromCity, setFromCity] = useState('')
  const [toCity, setToCity] = useState('')
  const [routeResult, setRouteResult] = useState<any>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeAlert, setRouteAlert] = useState('')
  const [showRoutePanel, setShowRoutePanel] = useState(false)
  
  // Notifications
  const [notifications, setNotifications] = useState<any[]>([])

  // Fetch live traffic from backend API
useEffect(() => {
  const fetchTraffic = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/traffic-live")
      const json = await res.json()

      const formatted = json.cities.map((c: any, i: number) => ({
        id: i + 1,
        city: c.city,
        vehicles: c.vehicles,
        speed_kmh: c.speed,
        incidents: 0,
        lat: CITIES.find(x => x.name === c.city)?.lat || 20,
        lng: CITIES.find(x => x.name === c.city)?.lng || 78,
        level:
          c.congestion > 60
            ? "High"
            : c.congestion > 30
            ? "Medium"
            : "Low",
      }))

      setData(formatted)
      setTs(new Date().toLocaleTimeString())

    } catch (err) {
      console.log("Traffic fetch error:", err)
    }
  }

  fetchTraffic()

  const interval = setInterval(fetchTraffic, 5000)

  return () => clearInterval(interval)

}, []) 

  const TILES = {
    dark:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    street:'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    satellite:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  }

  useEffect(()=>{
    if(!document.getElementById('leaflet-css')){
      const link=document.createElement('link')
      link.id='leaflet-css'; link.rel='stylesheet'
      link.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)
    }

    const loadHeatmap = () => {
      if(!document.getElementById('leaflet-heat-js')){
        const script2=document.createElement('script')
        script2.id='leaflet-heat-js'
        script2.src='https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js'
        script2.onload=()=>initMap()
        document.head.appendChild(script2)
      } else {
        initMap()
      }
    }

    if((window as any).L){ 
      loadHeatmap()
    } else {
      if(!document.getElementById('leaflet-js')){
        const script=document.createElement('script')
        script.id='leaflet-js'
        script.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
        script.onload=()=>loadHeatmap()
        document.head.appendChild(script)
      }
    }
  },[])

  function initMap(){
    if(mapInstance.current||!mapRef.current)return
    const L=(window as any).L
    if(!L)return
    const map=L.map(mapRef.current,{center:[20.5937,78.9629],zoom:5,zoomControl:false,attributionControl:false})
    L.control.zoom({position:'bottomright'}).addTo(map)
    tileLayerRef.current=L.tileLayer(TILES.dark,{maxZoom:19}).addTo(map)
    mapInstance.current=map
    setMapReady(true)
  }

  // Live traffic websocket
  useEffect(()=>{
    setTs(new Date().toLocaleTimeString())
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/traffic")
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data)
        if(payload.junctions) setData(payload.junctions)
        if(payload.accidents) setAccidents(payload.accidents)
        setTs(new Date().toLocaleTimeString())
        if(payload.alert) {
          const n={id:Date.now(),msg:payload.alert,type:'warning',time:new Date().toLocaleTimeString()}
          setNotifications(p=>[n,...p].slice(0,3))
        }
      } catch(e) {}
    }
    return () => ws.close()
  },[])

  useEffect(()=>{
    if(!mapReady||!mapInstance.current)return
    const L=(window as any).L
    if(!L)return
    
    markersRef.current.forEach(m=>m.remove())
    circlesRef.current.forEach(c=>c.remove())
    accidentMarkersRef.current.forEach(c=>c.remove())
    if(heatmapLayerRef.current){
        mapInstance.current.removeLayer(heatmapLayerRef.current)
    }

    markersRef.current=[]
    circlesRef.current=[]
    accidentMarkersRef.current=[]

    const heatPoints: any[] = []

    data.forEach(j=>{
      const c=LEVEL_COLOR[j.level]
      const sz=j.level==='High'?22:j.level==='Medium'?18:14
      const intensity = j.level === 'High' ? 1.0 : j.level === 'Medium' ? 0.6 : 0.2
      heatPoints.push([j.lat, j.lng, intensity])

      const circle=L.circle([j.lat,j.lng],{
        radius:j.vehicles*180,color:c,fillColor:c,
        fillOpacity:0.1,weight:1.5,opacity:0.4
      }).addTo(mapInstance.current)
      circlesRef.current.push(circle)

      const icon=L.divIcon({
        className:'',
        html:`<div style="
          width:${sz}px;height:${sz}px;border-radius:50%;
          background:${c};
          box-shadow:0 0 20px ${c},0 0 40px ${c}66,0 0 6px white;
          border:2.5px solid white;
          cursor:pointer;position:relative">
          <div style="position:absolute;inset:-6px;border-radius:50%;border:2px solid ${c};opacity:0.5;animation:rexp 2s ease-out infinite"></div>
          <div style="position:absolute;inset:-12px;border-radius:50%;border:1px solid ${c};opacity:0.25;animation:rexp 2s ease-out infinite 0.7s"></div>
        </div>`,
        iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]
      })

      const marker=L.marker([j.lat,j.lng],{icon}).addTo(mapInstance.current)
      marker.bindPopup(`
        <div style="background:#0d1424;border:1px solid ${c}55;border-radius:12px;padding:16px;min-width:200px;font-family:sans-serif">
          <div style="font-size:17px;font-weight:700;color:#e2e8f0;margin-bottom:6px">${j.city}</div>
          <span style="display:inline-block;padding:3px 10px;border-radius:4px;background:${LEVEL_BG[j.level]};color:${c};border:1px solid ${c}44;font-size:11px;font-weight:700;margin-bottom:10px">${j.level.toUpperCase()} TRAFFIC</span>
          <div style="font-size:12px;color:#94a3b8;line-height:2">
            🚗 <b style="color:${c}">${j.vehicles}</b> vehicles/hr<br>
            💨 Speed: <b style="color:#e2e8f0">${j.speed_kmh} km/h</b><br>
            ⚠ Incidents: <b style="color:${j.incidents>0?'#ffb800':'#64748b'}">${j.incidents}</b>
          </div>
        </div>
      `,{className:'lf-popup',closeButton:false,maxWidth:240})
      marker.on('click',()=>setSelected(j))
      markersRef.current.push(marker)
    })

    accidents.forEach(acc => {
      const icon=L.divIcon({
        className:'',
        html:`<div style="font-size: 24px;">⛔</div>`,
        iconSize:[24,24],iconAnchor:[12,12]
      })
      const am = L.marker([acc.lat, acc.lng],{icon}).addTo(mapInstance.current)
      am.bindPopup(`<strong style="color:white">${acc.severity} Accident</strong><br/><span style="color:gray">${acc.description}</span>`, {className:'lf-popup'})
      accidentMarkersRef.current.push(am)
      heatPoints.push([acc.lat, acc.lng, 1.0])
    })

    if (L.heatLayer && heatPoints.length > 0) {
        heatmapLayerRef.current = L.heatLayer(heatPoints, {radius: 40, blur: 30, maxZoom: 14}).addTo(mapInstance.current)
    }
  },[data, accidents, mapReady])

  function changeStyle(style:'dark'|'street'|'satellite'){
    if(!mapInstance.current)return
    const L=(window as any).L
    if(tileLayerRef.current) mapInstance.current.removeLayer(tileLayerRef.current)
    tileLayerRef.current=L.tileLayer(TILES[style],{maxZoom:19}).addTo(mapInstance.current)
    setMapStyle(style)
  }

  function flyTo(j:any){
    if(!mapInstance.current)return
    mapInstance.current.flyTo([j.lat,j.lng],12,{animate:true,duration:1.2})
    setSelected(j)
  }

  // 1km ahead traffic alerts hook
  useEffect(() => {
    if(!routeResult || !routeResult.routeCoords) return
    const checkAlerts = async () => {
      try {
        const from = CITIES.find(c => c.name === fromCity)
        if (!from) return
        const res = await fetch('http://127.0.0.1:8000/api/check-1km-alerts', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({lat: from.lat, lng: from.lng, route_coords: routeResult.routeCoords})
        })
        const data = await res.json()
        if (data.alert) {
          toast.error(data.message, {duration: 6000, position:'bottom-center'})
        }
      } catch(e) {}
    }
    const iv = setInterval(checkAlerts, 10000)
    return () => clearInterval(iv)
  }, [routeResult, fromCity])
  /*
  // Route search
  async function searchRoute(){
    if(!fromCity||!toCity){ alert('Please select both cities!'); return }
    if(fromCity===toCity){ alert('Start and destination cannot be same!'); return }
    setRouteLoading(true)
    setRouteAlert('')

    const from=CITIES.find(c=>c.name===fromCity)
    const to=CITIES.find(c=>c.name===toCity)
    if(!from||!to){ setRouteLoading(false); return }

    try {
        const res = await fetch(`http://127.0.0.1:8000/api/route?start_lat=${from.lat}&start_lng=${from.lng}&end_lat=${to.lat}&end_lng=${to.lng}&alternatives=true`)
        const routeData = await res.json()
        
        if (routeData.error) {
            alert('Failed to calculate route.')
            setRouteLoading(false)
            return
        }

        if(mapInstance.current){
            const L=(window as any).L
            routeLayersRef.current.forEach(layer => mapInstance.current.removeLayer(layer))
            routeLayersRef.current = []

            let routeCoords: number[][] = []
            
            routeData.routes.forEach((r: any) => {
                if (r.is_primary) {
                  const segments = r.segments
                  segments.forEach((seg: any) => {
                      const pline = L.polyline(seg.path, {
                          color: seg.color, weight: 6, opacity: 0.9, lineCap: 'round'
                      }).addTo(mapInstance.current)
                      routeLayersRef.current.push(pline)
                      if(r.is_primary) routeCoords.push(seg.path[0])
                  })
                } else {
                  // Alternative Routes
                   const altPath = r.segments.map((s:any)=>s.path[0])
                   const altPline = L.polyline(altPath, {
                       color: 'gray', weight: 4, opacity: 0.5, dashArray: '10, 10', lineCap: 'round'
                   }).addTo(mapInstance.current)
                   routeLayersRef.current.push(altPline)
                }
            })

            // Add start/end markers
            const startIcon=L.divIcon({className:'',html:`<div style="background:#00ff88;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #00ff88"></div>`,iconSize:[14,14],iconAnchor:[7,7]})
            const endIcon=L.divIcon({className:'',html:`<div style="background:#ff3b3b;width:14px;height:14px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px #ff3b3b"></div>`,iconSize:[14,14],iconAnchor:[7,7]})
            
            const m1 = L.marker([from.lat,from.lng],{icon:startIcon}).addTo(mapInstance.current).bindPopup(`<b style="color:#00ff88">START: ${from.name}</b>`)
            const m2 = L.marker([to.lat,to.lng],{icon:endIcon}).addTo(mapInstance.current).bindPopup(`<b style="color:#ff3b3b">END: ${to.name}</b>`)
            
            routeLayersRef.current.push(m1, m2)

            if (routeLayersRef.current.length > 0 && routeLayersRef.current[0].getBounds) {
                mapInstance.current.fitBounds(routeLayersRef.current[0].getBounds(),{padding:[60,60]})
            }

            const primaryRoute = routeData.routes[0]
            const hasAccident = true // Forced accident for demonstration as requested

            const result={
                from:fromCity, to:toCity,
                distance:Math.round(primaryRoute.distance / 1000),
                duration:Math.round(primaryRoute.duration / 60),
                avgSpeed:rnd(35,65),
                congestion:'Medium',
                hasAccident,
                accidentLocation:fromCity,
                alternateRoute:routeData.routes.length > 1 ? "Found 1 Alternative Route" : "No alternatives available.",
                traffic:[
                  {zone:fromCity,level:'High'},
                  {zone:'Mid Route',level:'Low'},
                  {zone:toCity,level:'Medium'},
                ],
                routeCoords
            }
            setRouteResult(result)

            if(hasAccident){
                const alert=`🚨 ACCIDENT DETECTED! Rerouting and displaying alternate routes.`
                setRouteAlert(alert)
                const n={id:Date.now(),msg:alert,type:'danger',time:new Date().toLocaleTimeString()}
                setNotifications(p=>[n,...p].slice(0,3))
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        setRouteLoading(false)
    }
  }
*/
async function searchRoute(){

  if(!fromCity || !toCity){
    alert("Please select both cities")
    return
  }

  setRouteLoading(true)

  const from = CITIES.find(c=>c.name===fromCity)
  const to   = CITIES.find(c=>c.name===toCity)

  try{

    const res = await fetch(
      `http://127.0.0.1:8000/api/routes?src_lat=${from?.lat}&src_lng=${from?.lng}&dst_lat=${to?.lat}&dst_lng=${to?.lng}`
    )

    const data = await res.json()

    if(!data.routes || data.routes.length === 0){
      alert("No route found")
      setRouteLoading(false)
      return
    }

    const route = data.routes[0]

    const L = (window as any).L

    routeLayersRef.current.forEach(l=>mapInstance.current.removeLayer(l))
    routeLayersRef.current = []

    const routeLine = L.polyline(route.geometry,{
      color:"#2b8cff",
      weight:7,
      opacity:0.95,
      lineCap:"round"
    }).addTo(mapInstance.current)

    routeLayersRef.current.push(routeLine)

    mapInstance.current.fitBounds(routeLine.getBounds(),{padding:[60,60]})

    // create simple navigation steps
    const navSteps = [
      `Start from ${fromCity}`,
      `Drive towards ${toCity}`,
      `Follow the fastest route`,
      `You will reach ${toCity}`
    ]

    setSteps(navSteps)

    const result = {
      from:fromCity,
      to:toCity,
      distance:route.distance.toFixed(1),
      duration:Math.round(route.duration),
      avgSpeed:rnd(35,65)
    }

    setRouteResult(result)

  }catch(err){
    console.error(err)
    alert("Route API error")
  }

  setRouteLoading(false)
}


  function clearRoute(){
    if(mapInstance.current){
      routeLayersRef.current.forEach(layer => mapInstance.current.removeLayer(layer))
      routeLayersRef.current=[]
    }
    setRouteResult(null)
    setFromCity('')
    setToCity('')
    setRouteAlert('')
    mapInstance.current?.setView([20.5937,78.9629],5,{animate:true})
  }

  const total=data.reduce((s,j)=>s+j.vehicles,0)
  const cong=Math.floor(data.filter(j=>j.level==='High').length/(data.length||1)*100)
  const avgSpeed=Math.floor(data.reduce((s,j)=>s+j.speed_kmh,0)/(data.length||1))

  const NOTIF_COLOR:Record<string,string>={warning:'#ffb800',danger:'#ff3b3b',info:'#00d4ff'}

  return(
    <>
      <Head><title>SmartFlow — Live Traffic Map</title></Head>
      <Toaster />
      <style>{`
        .lf-popup .leaflet-popup-content-wrapper{background:transparent!important;box-shadow:none!important;padding:0!important;border:none!important}
        .lf-popup .leaflet-popup-content{margin:0!important}
        .lf-popup .leaflet-popup-tip-container{display:none}
        .leaflet-container{background:#060d1f!important}
        .leaflet-control-zoom a{background:#0a0f1e!important;color:#00d4ff!important;border-color:#1a2744!important;font-size:16px!important}
        .leaflet-control-zoom a:hover{background:#1a2744!important}
        @keyframes rexp{0%{transform:scale(1);opacity:0.6}100%{transform:scale(3.5);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes spin{to{transform:rotate(360deg)}}
      `}</style>

      {/* Accident Notifications */}
      <div style={{position:'fixed',top:66,right:16,zIndex:9999,display:'flex',flexDirection:'column',gap:8,pointerEvents:'none'}}>
        <AnimatePresence>
          {notifications.map(n=>(
            <motion.div key={n.id} initial={{opacity:0,x:80}} animate={{opacity:1,x:0}} exit={{opacity:0,x:80}}
              style={{background:'#0d1424',border:`1px solid ${NOTIF_COLOR[n.type]||'#ffb800'}50`,borderLeft:`3px solid ${NOTIF_COLOR[n.type]||'#ffb800'}`,borderRadius:10,padding:'10px 14px',maxWidth:320,pointerEvents:'all',boxShadow:'0 8px 32px rgba(0,0,0,0.6)'}}>
              <p style={{color:'#e2e8f0',fontSize:12,margin:0,lineHeight:1.5}}>{n.msg}</p>
              <p style={{color:'#475569',fontSize:10,margin:'4px 0 0',fontFamily:'monospace'}}>{n.time}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'sans-serif'}}>
        <Navbar/>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{maxWidth:1400,margin:'0 auto',padding:'16px 20px'}}>

          {/* Header */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div>
              <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:24,color:'#e2e8f0',letterSpacing:'0.06em',margin:0}}>🗺 LIVE TRAFFIC MAP</h1>
              <p style={{color:'#64748b',fontSize:12,margin:'3px 0 0'}}>Real-time India Monitoring · OSRM Route Engine · ML Traffic Trends & Heatmaps</p>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              {/* Map style switcher */}
              <div style={{display:'flex',gap:3,background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:9,padding:3}}>
                {(['dark','street','satellite'] as const).map(s=>(
                  <button key={s} onClick={()=>changeStyle(s)} style={{padding:'5px 10px',borderRadius:6,border:'none',background:mapStyle===s?'rgba(0,212,255,0.15)':'transparent',color:mapStyle===s?'#00d4ff':'#64748b',fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>
                    {s==='dark'?'🌑 DARK':s==='street'?'🗺 STREET':'🛰 SAT'}
                  </button>
                ))}
              </div>
              {/* Route search toggle */}
              <button onClick={()=>setShowRoutePanel(!showRoutePanel)}
                style={{padding:'6px 14px',borderRadius:8,border:`1px solid ${showRoutePanel?'rgba(0,255,136,0.5)':'rgba(0,212,255,0.3)'}`,background:showRoutePanel?'rgba(0,255,136,0.1)':'rgba(0,212,255,0.07)',color:showRoutePanel?'#00ff88':'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer',letterSpacing:'0.05em'}}>
                🔍 ROUTE SEARCH
              </button>
              <div style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',borderRadius:6,background:'rgba(0,255,136,0.07)',border:'1px solid rgba(0,255,136,0.2)'}}>
                <div style={{width:6,height:6,borderRadius:'50%',background:'#00ff88',animation:'blink 1.4s infinite'}}/>
                <span style={{fontFamily:'monospace',fontSize:11,color:'#00ff88'}}>{ts}</span>
              </div>
            </div>
          </div>

              
          {/* Route Result */}
<AnimatePresence>
{routeResult&&(
<motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} style={{marginTop:14}}>

<div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
{[
{label:'DISTANCE',value:`~${routeResult.distance} km`,color:'#00d4ff',icon:'📏'},
{label:'DURATION',value:`~${routeResult.duration} min`,color:'#ffb800',icon:'⏱'},
{label:'AVG SPEED',value:`${routeResult.avgSpeed} km/h`,color:'#00ff88',icon:'💨'},
{label:'ALTERNATIVES',value:routeResult.alternateRoute || "Primary",color:'#ff3b3b',icon:'🛣️'},
].map(s=>(
<div key={s.label} style={{
padding:'10px 12px',
borderRadius:9,
background:`${s.color}08`,
border:`1px solid ${s.color}25`
}}>
<div style={{
fontSize:11,
color:'#64748b',
fontFamily:'Rajdhani',
letterSpacing:'0.06em',
marginBottom:3
}}>
{s.icon} {s.label}
</div>

<div style={{
fontFamily:'Rajdhani',
fontWeight:700,
fontSize:16,
color:s.color
}}>
{s.value}
</div>
</div>
))}
</div>

{/* TURN BY TURN NAVIGATION PANEL */}
{steps.length>0 && (
<div style={{
background:"#0a0f1e",
border:"1px solid #1a2744",
borderRadius:12,
padding:12,
marginTop:10,
maxHeight:200,
overflowY:"auto"
}}>

<div style={{
fontSize:11,
color:"#64748b",
fontFamily:"Rajdhani"
}}>
TURN BY TURN NAVIGATION
</div>

{steps.map((s,i)=>(
<div
key={i}
style={{
padding:"6px 8px",
marginTop:4,
borderRadius:6,
background:i===activeStep
?"rgba(0,212,255,0.12)"
:"transparent",
color:i===activeStep
?"#00d4ff"
:"#94a3b8",
fontSize:12
}}
>
➡ {s}
</div>
))}

</div>
)}

</motion.div>
)}
</AnimatePresence>
          

          {/* Stats row */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:12}}>
            {[
              ['TOTAL VEHICLES',total.toLocaleString(),'#00d4ff'],
              ['AVG SPEED',(avgSpeed||0)+' km/h','#00ff88'],
              ['CONGESTION',(cong||0)+'%',(cong||0)>60?'#ff3b3b':'#ffb800'],
              ['ACTIVE CITIES','8','#7c3aed']
            ].map(([l,v,c])=>(
              <div key={String(l)} style={{background:'#0a0f1e',border:`1px solid ${c}20`,borderRadius:10,padding:'9px 14px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:10,color:'#64748b',letterSpacing:'0.08em'}}>{l}</span>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:c as string}}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 290px',gap:14}}>
            {/* MAP */}
            <div style={{borderRadius:14,overflow:'hidden',border:'1px solid #1a2744',position:'relative',height:520}}>
              <div ref={mapRef} style={{width:'100%',height:'100%'}}/>
              {!mapReady&&(
                <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',background:'#060d1f',flexDirection:'column',gap:14,zIndex:999}}>
                  <div style={{width:40,height:40,border:'3px solid #1a2744',borderTop:'3px solid #00d4ff',borderRadius:'50%',animation:'spin 1s linear infinite'}}/>
                  <p style={{color:'#475569',fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.1em',fontSize:13}}>LOADING MAP...</p>
                </div>
              )}
              {/* Fixed Legend */}
              <div style={{position:'absolute',bottom:36,left:12,zIndex:1000,background:'rgba(6,13,31,0.95)',backdropFilter:'blur(8px)',border:'1px solid #1a2744',borderRadius:9,padding:'8px 14px',display:'flex',gap:14,pointerEvents:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#e2e8f0'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#00ff88',boxShadow:'0 0 8px #00ff88,0 0 16px #00ff88'}}/>
                  <span style={{color:'#00ff88',fontWeight:600}}>Low</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#e2e8f0'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#ffb800',boxShadow:'0 0 8px #ffb800,0 0 16px #ffb800'}}/>
                  <span style={{color:'#ffb800',fontWeight:600}}>Medium</span>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:5,fontSize:11,color:'#e2e8f0'}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:'#ff3b3b',boxShadow:'0 0 8px #ff3b3b,0 0 16px #ff3b3b'}}/>
                  <span style={{color:'#ff3b3b',fontWeight:600}}>High</span>
                </div>
              </div>
            </div>

            {/* SIDE PANEL */}
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <AnimatePresence mode="wait">
                {selected?(
                  <motion.div key={selected.id} initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} style={{background:'#0a0f1e',border:`1px solid ${LEVEL_COLOR[selected.level]}40`,borderRadius:12,padding:14}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:17,color:'#e2e8f0'}}>{selected.city}</span>
                      <button onClick={()=>setSelected(null)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:16}}>✕</button>
                    </div>
                    <div style={{display:'inline-block',padding:'2px 10px',borderRadius:5,background:LEVEL_BG[selected.level],color:LEVEL_COLOR[selected.level],border:`1px solid ${LEVEL_COLOR[selected.level]}40`,fontFamily:'Rajdhani,sans-serif',fontSize:11,fontWeight:700,marginBottom:10}}>
                      {selected.level.toUpperCase()} TRAFFIC
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}>
                      {[['🚗 Vehicles',selected.vehicles+'/hr'],['💨 Speed',selected.speed_kmh+' km/h'],['⚠ Incidents',selected.incidents],['📍 Node','J-'+selected.id]].map(([k,v])=>(
                        <div key={String(k)} style={{background:'rgba(13,20,36,0.8)',border:'1px solid #1a2744',borderRadius:7,padding:'7px 9px'}}>
                          <div style={{fontSize:9,color:'#475569',marginBottom:2}}>{k}</div>
                          <div style={{fontSize:12,color:'#94a3b8',fontFamily:'monospace',fontWeight:600}}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>flyTo(selected)} style={{width:'100%',marginTop:8,padding:'8px',borderRadius:7,border:'1px solid rgba(0,212,255,0.3)',background:'rgba(0,212,255,0.07)',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                      🎯 ZOOM TO {selected.city?.toUpperCase()}
                    </button>
                    <button onClick={()=>{setShowRoutePanel(true);setFromCity(selected.city)}} style={{width:'100%',marginTop:6,padding:'8px',borderRadius:7,border:'1px solid rgba(0,255,136,0.3)',background:'rgba(0,255,136,0.07)',color:'#00ff88',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer'}}>
                      🔍 ROUTE FROM HERE
                    </button>
                  </motion.div>
                ):(
                  <motion.div key="empty" style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:18,textAlign:'center'}}>
                    <div style={{fontSize:26,marginBottom:6}}>🗺</div>
                    <p style={{color:'#475569',fontSize:11,fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.06em',lineHeight:1.7}}>CLICK ANY MARKER<br/>TO INSPECT CITY</p>
                    <p style={{color:'#334155',fontSize:10,marginTop:6}}>Heatmap updates real-time via WebSocket</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* City list */}
              <div style={{background:'#0a0f1e',border:'1px solid #1a2744',borderRadius:12,padding:12,flex:1,overflowY:'auto'}}>
                <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:11,color:'#64748b',letterSpacing:'0.1em',marginBottom:8,display:'flex',alignItems:'center',gap:5}}>
                  <span style={{width:3,height:11,borderRadius:2,background:'#00d4ff',display:'inline-block'}}/>ALL JUNCTIONS
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:4}}>
                  {data.map(j=>(
                    <div key={j.id} onClick={()=>flyTo(j)}
                      style={{display:'flex',alignItems:'center',gap:7,padding:'7px 8px',borderRadius:8,cursor:'pointer',transition:'all 0.15s',background:selected?.id===j.id?`${LEVEL_COLOR[j.level]}08`:'transparent',border:selected?.id===j.id?`1px solid ${LEVEL_COLOR[j.level]}30`:'1px solid transparent'}}
                      onMouseEnter={e=>(e.currentTarget.style.background='rgba(255,255,255,0.03)')}
                      onMouseLeave={e=>(e.currentTarget.style.background=selected?.id===j.id?`${LEVEL_COLOR[j.level]}08`:'transparent')}>
                      <div style={{width:9,height:9,borderRadius:'50%',flexShrink:0,background:LEVEL_COLOR[j.level],boxShadow:`0 0 8px ${LEVEL_COLOR[j.level]},0 0 16px ${LEVEL_COLOR[j.level]}66`}}/>
                      <span style={{color:'#94a3b8',fontSize:12,flex:1}}>{j.city}</span>
                      <span style={{color:LEVEL_COLOR[j.level],fontSize:10,fontFamily:'monospace',fontWeight:700}}>{j.vehicles}v</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  )
}
