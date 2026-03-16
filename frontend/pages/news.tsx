import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Head from 'next/head'
import Navbar from '../components/Navbar'

const NEWS_ITEMS = [
  { id:1, title:'Mumbai-Pune Expressway Sees 40% Traffic Surge This Weekend', category:'Alert', city:'Mumbai', time:'5 min ago', severity:'High', icon:'🚨', desc:'Heavy traffic buildup reported near Khopoli and Lonavala due to weekend travel. AI model predicts congestion to peak between 4-7 PM.', source:'SmartFlow AI', color:'#ff3b3b' },
  { id:2, title:'Delhi Metro Phase 4 Reduces Surface Traffic by 12%', category:'News', city:'Delhi', time:'1 hour ago', severity:'Low', icon:'🚇', desc:'New metro stations operational reducing road vehicle count significantly during peak morning hours across North and Central Delhi corridors.', source:'Transport Dept', color:'#00ff88' },
  { id:3, title:'Bangalore IT Corridor Traffic Expected to Peak This Friday', category:'Forecast', city:'Bangalore', time:'2 hours ago', severity:'Medium', icon:'🤖', desc:'AI prediction model indicates 85% probability of High traffic levels on Outer Ring Road between 5:30-8:30 PM Friday.', source:'SmartFlow AI', color:'#ffb800' },
  { id:4, title:'Chennai Cyclone Warning: Coastal Roads Partially Closed', category:'Emergency', city:'Chennai', time:'3 hours ago', severity:'High', icon:'🌀', desc:'Cyclone Michaung approaching. Coastal highway ECR and OMR sections closed. Alternate routes via NH-32 recommended.', source:'Disaster Mgmt', color:'#ff3b3b' },
  { id:5, title:'Pune Smart Signal System Reduces Average Wait Time by 25%', category:'News', city:'Pune', time:'4 hours ago', severity:'Low', icon:'🚦', desc:'New AI-powered adaptive traffic signals installed at 45 junctions in Pune showing significant improvement in traffic flow.', source:'PMC Traffic', color:'#00ff88' },
  { id:6, title:'Hyderabad OUTER Ring Road Expansion Begins Next Month', category:'Update', city:'Hyderabad', time:'5 hours ago', severity:'Medium', icon:'🏗️', desc:'ORR expansion from 6-lane to 8-lane highway begins construction. Expect minor disruptions near Gachibowli and Narsingi.', source:'NHAI', color:'#ffb800' },
  { id:7, title:'Kolkata Flyover Inauguration Improves North-South Connectivity', category:'News', city:'Kolkata', time:'6 hours ago', severity:'Low', icon:'🌉', desc:'New Ultadanga-Salt Lake flyover reduces travel time between major business districts by 18 minutes during peak hours.', source:'KMDA', color:'#00d4ff' },
  { id:8, title:'AI Predicts Record Traffic on All Cities During Diwali Week', category:'Forecast', city:'All Cities', time:'8 hours ago', severity:'High', icon:'🎆', desc:'SmartFlow AI model predicts 60-80% increase in vehicle count across all 8 monitored cities during October 28 - November 3.', source:'SmartFlow AI', color:'#ff3b3b' },
]

const CATEGORIES = ['All', 'Alert', 'News', 'Forecast', 'Emergency', 'Update']
const CITIES_FILTER = ['All Cities', 'Mumbai', 'Delhi', 'Pune', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Ahmedabad']

export default function NewsPage() {
  const [filter, setFilter] = useState('All')
  const [cityFilter, setCityFilter] = useState('All Cities')
  const [search, setSearch] = useState('')
  const [bookmarked, setBookmarked] = useState<number[]>([])

  const filtered = NEWS_ITEMS.filter(n => {
    const matchCat = filter === 'All' || n.category === filter
    const matchCity = cityFilter === 'All Cities' || n.city === cityFilter || n.city === 'All Cities'
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.city.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchCity && matchSearch
  })

  const toggleBookmark = (id: number) => setBookmarked(p => p.includes(id) ? p.filter(x=>x!==id) : [...p,id])

  const SEV_COLOR: Record<string,string> = { High:'#ff3b3b', Medium:'#ffb800', Low:'#00ff88', Emergency:'#ff3b3b' }

  return (
    <>
      <Head><title>SmartFlow — Traffic News</title></Head>
      <div style={{minHeight:'100vh',background:'#030712',paddingTop:56,fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.02)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.02)1px,transparent 1px)',backgroundSize:'40px 40px'}}>
        <Navbar/>
        <motion.div initial={{opacity:0}} animate={{opacity:1}} style={{maxWidth:1200,margin:'0 auto',padding:'24px 20px'}}>

          <div style={{marginBottom:24}}>
            <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:26,color:'#e2e8f0',letterSpacing:'0.06em',margin:0}}>📰 TRAFFIC NEWS & ALERTS</h1>
            <p style={{color:'#64748b',fontSize:13,margin:'4px 0 0'}}>Real-time traffic news, AI forecasts, and city alerts</p>
          </div>

          {/* Search */}
          <div style={{position:'relative',marginBottom:16}}>
            <span style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',fontSize:16,pointerEvents:'none'}}>🔍</span>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search news, cities, alerts..."
              style={{width:'100%',background:'#0a0f1e',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:10,padding:'11px 14px 11px 42px',fontFamily:'Exo 2,sans-serif',fontSize:14,outline:'none',boxSizing:'border-box',transition:'border-color 0.2s'}}
              onFocus={e=>e.target.style.borderColor='#00d4ff'} onBlur={e=>e.target.style.borderColor='#1a2744'}/>
          </div>

          {/* Filters */}
          <div style={{display:'flex',gap:10,marginBottom:16,flexWrap:'wrap',alignItems:'center'}}>
            <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>setFilter(c)} style={{padding:'5px 12px',borderRadius:6,border:`1px solid ${filter===c?'rgba(0,212,255,0.5)':'#1a2744'}`,background:filter===c?'rgba(0,212,255,0.12)':'transparent',color:filter===c?'#00d4ff':'#475569',fontFamily:'Rajdhani,sans-serif',fontSize:12,fontWeight:700,cursor:'pointer',transition:'all 0.2s'}}>
                  {c}
                </button>
              ))}
            </div>
            <select value={cityFilter} onChange={e=>setCityFilter(e.target.value)} style={{background:'#0a0f1e',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:7,padding:'6px 10px',fontFamily:'Exo 2,sans-serif',fontSize:12,outline:'none',cursor:'pointer',appearance:'none',paddingRight:24}}>
              {CITIES_FILTER.map(c=><option key={c}>{c}</option>)}
            </select>
            <span style={{color:'#475569',fontSize:12,marginLeft:'auto'}}>{filtered.length} articles</span>
          </div>

          {/* Breaking news banner */}
          {filter==='All'&&(
            <div style={{padding:'12px 18px',borderRadius:10,background:'rgba(255,59,59,0.08)',border:'1px solid rgba(255,59,59,0.3)',marginBottom:16,display:'flex',alignItems:'center',gap:12}}>
              <span style={{padding:'2px 8px',borderRadius:4,background:'#ff3b3b',color:'white',fontSize:11,fontFamily:'Rajdhani,sans-serif',fontWeight:700,flexShrink:0}}>🔴 BREAKING</span>
              <span style={{color:'#fca5a5',fontSize:13,flex:1}}>Cyclone warning issued for Chennai coastal roads — avoid ECR and OMR highways</span>
              <span style={{color:'#475569',fontSize:11,flexShrink:0,fontFamily:'monospace'}}>Just now</span>
            </div>
          )}

          {/* News grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14}}>
            {filtered.map((n,i)=>(
              <motion.div key={n.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                style={{background:'#0a0f1e',border:`1px solid ${n.color}20`,borderRadius:12,padding:18,position:'relative',overflow:'hidden',cursor:'default'}}>
                <div style={{position:'absolute',top:-20,right:-20,width:80,height:80,borderRadius:'50%',background:n.color,filter:'blur(30px)',opacity:0.06}}/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    <span style={{padding:'2px 8px',borderRadius:4,background:`${n.color}15`,color:n.color,border:`1px solid ${n.color}30`,fontFamily:'Rajdhani,sans-serif',fontSize:10,fontWeight:700}}>{n.category.toUpperCase()}</span>
                    <span style={{padding:'2px 8px',borderRadius:4,background:'rgba(255,255,255,0.04)',color:'#64748b',fontSize:10,fontFamily:'Rajdhani,sans-serif'}}>{n.city}</span>
                  </div>
                  <button onClick={()=>toggleBookmark(n.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,opacity:bookmarked.includes(n.id)?1:0.3,transition:'all 0.2s'}}>
                    {bookmarked.includes(n.id)?'🔖':'🔖'}
                  </button>
                </div>
                <div style={{display:'flex',gap:10,marginBottom:8}}>
                  <span style={{fontSize:22,flexShrink:0}}>{n.icon}</span>
                  <h3 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:15,color:'#e2e8f0',margin:0,lineHeight:1.3}}>{n.title}</h3>
                </div>
                <p style={{color:'#64748b',fontSize:12,lineHeight:1.6,margin:'0 0 12px'}}>{n.desc}</p>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{width:6,height:6,borderRadius:'50%',background:SEV_COLOR[n.severity]||'#64748b',display:'inline-block'}}/>
                    <span style={{color:'#475569',fontSize:11}}>{n.source}</span>
                  </div>
                  <span style={{color:'#334155',fontSize:11,fontFamily:'monospace'}}>{n.time}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length===0&&(
            <div style={{textAlign:'center',padding:'60px 20px',color:'#334155'}}>
              <div style={{fontSize:40,marginBottom:12}}>📭</div>
              <p style={{fontFamily:'Rajdhani,sans-serif',fontSize:16,letterSpacing:'0.06em'}}>NO NEWS MATCHING YOUR FILTERS</p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  )
}
