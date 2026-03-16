import Link from 'next/link'
import { useRouter } from 'next/router'

export default function Footer(){
  const router = useRouter()
  // Don't show footer on login page
  if(router.pathname==='/login') return null

  return(
    <footer style={{background:'#060d1f',borderTop:'1px solid #1a2744',marginTop:40,fontFamily:'Exo 2,sans-serif'}}>
      <div style={{maxWidth:1280,margin:'0 auto',padding:'40px 24px 24px'}}>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:32,marginBottom:32}}>

          {/* Brand */}
          <div>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:14}}>
              <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#00d4ff,#0055ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>⚡</div>
              <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:'#00d4ff',letterSpacing:'0.1em'}}>SMARTFLOW AI</span>
            </div>
            <p style={{color:'#475569',fontSize:13,lineHeight:1.7,maxWidth:280,margin:'0 0 16px'}}>
              AI-powered smart city traffic prediction system. Real-time congestion monitoring across 8 Indian cities using RandomForest ML.
            </p>
            <div style={{display:'flex',gap:10}}>
              {['GitHub','Twitter','LinkedIn'].map(s=>(
                <div key={s} style={{width:34,height:34,borderRadius:8,background:'rgba(255,255,255,0.04)',border:'1px solid #1a2744',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,transition:'all 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.borderColor='#00d4ff')} onMouseLeave={e=>(e.currentTarget.style.borderColor='#1a2744')}>
                  {s==='GitHub'?'🐙':s==='Twitter'?'🐦':'💼'}
                </div>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div>
            <h4 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',margin:'0 0 14px',textTransform:'uppercase'}}>Pages</h4>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[['⚡ Predict','/'],['🗺 Live Map','/map'],['📊 Dashboard','/dashboard'],['🏙 Compare','/compare'],['⚙ Admin','/admin']].map(([l,h])=>(
                <Link key={h} href={h} style={{color:'#475569',fontSize:13,textDecoration:'none',transition:'color 0.2s'}}
                  onMouseEnter={e=>(e.currentTarget.style.color='#00d4ff')} onMouseLeave={e=>(e.currentTarget.style.color='#475569')}>
                  {l}
                </Link>
              ))}
            </div>
          </div>

          {/* Technology */}
          <div>
            <h4 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',margin:'0 0 14px',textTransform:'uppercase'}}>Technology</h4>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {['Next.js 14','FastAPI','RandomForest ML','Leaflet Maps','Chart.js','Framer Motion'].map(t=>(
                <span key={t} style={{color:'#475569',fontSize:13}}>{t}</span>
              ))}
            </div>
          </div>

          {/* Live Stats */}
          <div>
            <h4 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#94a3b8',letterSpacing:'0.1em',margin:'0 0 14px',textTransform:'uppercase'}}>System</h4>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[['ML Model','Active ✅'],['API Server','Running ✅'],['Data Feed','Live ✅'],['Accuracy','87.6%'],['Cities','8 metros'],['Dataset','5,000 records']].map(([k,v])=>(
                <div key={k} style={{display:'flex',justifyContent:'space-between',fontSize:12}}>
                  <span style={{color:'#475569'}}>{k}</span>
                  <span style={{color:'#64748b',fontFamily:'monospace'}}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{height:1,background:'linear-gradient(90deg,transparent,#1a2744,transparent)',marginBottom:20}}/>

        {/* Bottom bar */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:7,height:7,borderRadius:'50%',background:'#00ff88',animation:'blink 1.4s infinite'}}/>
            <span style={{color:'#334155',fontSize:12,fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.06em'}}>
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>

          <p style={{color:'#334155',fontSize:12,fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.06em',margin:0,textAlign:'center'}}>
            © {new Date().getFullYear()} <span style={{color:'#475569'}}>SmartFlow AI</span> · All Rights Reserved · Built with ❤️ for Smart Cities
          </p>

          <div style={{display:'flex',gap:16}}>
            {['Privacy Policy','Terms of Service','Contact'].map(l=>(
              <span key={l} style={{color:'#334155',fontSize:12,cursor:'pointer',transition:'color 0.2s',fontFamily:'Rajdhani,sans-serif'}}
                onMouseEnter={e=>(e.currentTarget.style.color='#64748b')} onMouseLeave={e=>(e.currentTarget.style.color='#334155')}>
                {l}
              </span>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </footer>
  )
}
