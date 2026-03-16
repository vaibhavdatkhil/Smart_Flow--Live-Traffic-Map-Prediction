import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const links = [
  { href:'/', label:'PREDICT', emoji:'⚡' },
  { href:'/map', label:'MAP', emoji:'🗺' },
  { href:'/dashboard', label:'DASHBOARD', emoji:'📊' },
  { href:'/compare', label:'COMPARE', emoji:'🏙' },
  { href:'/news', label:'NEWS', emoji:'📰' },
  { href:'/leaderboard', label:'RANKS', emoji:'🏆' },
  { href:'/admin', label:'ADMIN', emoji:'⚙' },
]

export default function Navbar(){
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(()=>{
    setMounted(true)
    const u = localStorage.getItem('sf_user')
    if(u) setUser(JSON.parse(u))
  },[])

  // Close menu on outside click
  useEffect(()=>{
    const handler = () => setShowMenu(false)
    if(showMenu) document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  },[showMenu])

  const logout = () => {
    localStorage.removeItem('sf_user')
    localStorage.removeItem('sf_token')
    setUser(null)
    setShowMenu(false)
    router.push('/login')
  }

  return(
    <>
      <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:1000,background:'rgba(3,7,18,0.97)',backdropFilter:'blur(12px)',borderBottom:'1px solid #1a2744',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 16px',boxSizing:'border-box'}}>
        {/* Logo */}
        <Link href="/" style={{display:'flex',alignItems:'center',gap:8,textDecoration:'none',flexShrink:0}}>
          <div style={{width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#00d4ff,#0055ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>⚡</div>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:16,color:'#00d4ff',letterSpacing:'0.1em'}}>SMARTFLOW</span>
          <span style={{fontSize:9,padding:'2px 6px',borderRadius:20,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.25)',color:'#00d4ff'}}>AI v2.0</span>
        </Link>

        {/* Nav Links */}
        <div style={{display:'flex',alignItems:'center',gap:1,overflow:'hidden'}}>
          {links.map(({href,label,emoji})=>{
            const active=router.pathname===href
            return(
              <Link key={href} href={href} style={{textDecoration:'none'}}>
                <div style={{display:'flex',alignItems:'center',gap:4,padding:'5px 9px',borderRadius:7,cursor:'pointer',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:11,letterSpacing:'0.05em',color:active?'#00d4ff':'#64748b',background:active?'rgba(0,212,255,0.1)':'transparent',border:active?'1px solid rgba(0,212,255,0.25)':'1px solid transparent',transition:'all 0.2s',whiteSpace:'nowrap'}}>
                  <span style={{fontSize:11}}>{emoji}</span>{label}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Right side */}
        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',gap:4,padding:'4px 8px',borderRadius:6,background:'rgba(0,255,136,0.07)',border:'1px solid rgba(0,255,136,0.2)'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#00ff88',animation:'blink 1.4s infinite'}}/>
            <span style={{fontFamily:'monospace',fontSize:10,color:'#00ff88'}}>LIVE</span>
          </div>

          {/* Help */}
          <button onClick={e=>{e.stopPropagation();setShowHelp(true)}} style={{width:30,height:30,borderRadius:7,border:'1px solid #1a2744',background:'rgba(255,184,0,0.07)',color:'#ffb800',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center'}} title="Help">❓</button>

          {/* User */}
          {mounted&&(user?(
            <div style={{position:'relative'}}>
              <button onClick={e=>{e.stopPropagation();setShowMenu(!showMenu)}}
                style={{display:'flex',alignItems:'center',gap:6,padding:'4px 8px',borderRadius:7,border:'1px solid rgba(0,212,255,0.25)',background:'rgba(0,212,255,0.08)',cursor:'pointer'}}>
                <div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#00d4ff,#0055ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:'white',fontWeight:700}}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{fontFamily:'Rajdhani,sans-serif',fontSize:11,color:'#00d4ff',fontWeight:700,maxWidth:60,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user.name}</span>
                <span style={{color:'#475569',fontSize:9}}>{showMenu?'▲':'▼'}</span>
              </button>
              {showMenu&&(
                <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:38,right:0,background:'#0d1424',border:'1px solid #1a2744',borderRadius:12,padding:8,minWidth:190,boxShadow:'0 20px 60px rgba(0,0,0,0.6)',zIndex:2000}}>
                  <div style={{padding:'8px 12px',borderBottom:'1px solid #1a2744',marginBottom:6}}>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:'#e2e8f0'}}>{user.name}</div>
                    <div style={{fontSize:10,color:'#475569',marginTop:1}}>{user.email}</div>
                    <span style={{display:'inline-block',marginTop:4,padding:'1px 7px',borderRadius:4,background:'rgba(0,212,255,0.1)',color:'#00d4ff',fontSize:9,fontFamily:'Rajdhani,sans-serif',border:'1px solid rgba(0,212,255,0.2)'}}>{(user.role||'USER').toUpperCase()}</span>
                  </div>
                  {[
                    {icon:'👤',label:'My Profile',href:'/profile'},
                    {icon:'🏆',label:'Leaderboard',href:'/leaderboard'},
                    {icon:'📰',label:'Traffic News',href:'/news'},
                    {icon:'📊',label:'Dashboard',href:'/dashboard'},
                  ].map(item=>(
                    <button key={item.label} onClick={()=>{setShowMenu(false);router.push(item.href)}}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'7px 12px',borderRadius:7,border:'none',background:'transparent',color:'#94a3b8',cursor:'pointer',fontSize:12,fontFamily:'Exo 2,sans-serif',textAlign:'left',transition:'all 0.15s'}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.04)';e.currentTarget.style.color='#e2e8f0'}}
                      onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#94a3b8'}}>
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}
                  <div style={{borderTop:'1px solid #1a2744',marginTop:6,paddingTop:6}}>
                    <button onClick={logout}
                      style={{width:'100%',display:'flex',alignItems:'center',gap:8,padding:'7px 12px',borderRadius:7,border:'none',background:'transparent',color:'#ff3b3b',cursor:'pointer',fontSize:12,fontFamily:'Exo 2,sans-serif',textAlign:'left',transition:'all 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,59,59,0.08)'}
                      onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <span>🚪</span>Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ):(
            <Link href="/login" style={{textDecoration:'none'}}>
              <div style={{padding:'5px 12px',borderRadius:7,border:'1px solid rgba(0,212,255,0.3)',background:'rgba(0,212,255,0.08)',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:11,cursor:'pointer',letterSpacing:'0.05em'}}>
                🔑 LOGIN
              </div>
            </Link>
          ))}
        </div>
      </nav>

      {/* Help Modal */}
      {showHelp&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowHelp(false)}>
          <div style={{background:'#0d1424',border:'1px solid #1a2744',borderRadius:16,padding:28,maxWidth:460,width:'90%',boxShadow:'0 40px 120px rgba(0,0,0,0.6)'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h3 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:'#e2e8f0',margin:0,letterSpacing:'0.06em'}}>❓ HELP & SUPPORT</h3>
              <button onClick={()=>setShowHelp(false)} style={{background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:18}}>✕</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {[
                {icon:'💬',title:'WhatsApp Support',desc:'Chat with us instantly',color:'#00ff88',action:'https://wa.me/919999999999?text=Hi SmartFlow Support'},
                {icon:'📞',title:'Call Support',desc:'+91 99999 99999 (Mon-Sat 9AM-6PM)',color:'#00d4ff',action:'tel:+919999999999'},
                {icon:'📧',title:'Email Support',desc:'support@smartflow.ai',color:'#ffb800',action:'mailto:support@smartflow.ai'},
                {icon:'📖',title:'User Guide',desc:'Read full documentation',color:'#7c3aed',action:'#'},
              ].map(item=>(
                <a key={item.title} href={item.action} target="_blank" rel="noreferrer" style={{textDecoration:'none'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',borderRadius:10,background:`${item.color}08`,border:`1px solid ${item.color}25`,cursor:'pointer',transition:'all 0.2s'}}
                    onMouseEnter={e=>(e.currentTarget.style.background=`${item.color}15`)}
                    onMouseLeave={e=>(e.currentTarget.style.background=`${item.color}08`)}>
                    <span style={{fontSize:20}}>{item.icon}</span>
                    <div>
                      <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,color:item.color}}>{item.title}</div>
                      <div style={{fontSize:11,color:'#64748b',marginTop:1}}>{item.desc}</div>
                    </div>
                    <span style={{marginLeft:'auto',color:'#334155',fontSize:14}}>→</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </>
  )
}
