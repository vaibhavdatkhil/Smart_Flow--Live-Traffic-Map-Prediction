import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function Login(){
  const router = useRouter()
  const [mode, setMode] = useState<'login'|'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPass, setShowPass] = useState(false)
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(()=>{
    const user = localStorage.getItem('sf_user')
    if(user) router.push('/')
  },[])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if(!email || !password){ setError('Please fill all fields.'); return }
    if(mode==='signup' && !name){ setError('Please enter your name.'); return }
    if(password.length < 6){ setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const body = mode === 'login'
        ? { email, password }
        : { name, email, password, role: 'user' }
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if(!res.ok) throw new Error(data.detail || 'Something went wrong')
      // Save to localStorage
      localStorage.setItem('sf_token', data.token)
      localStorage.setItem('sf_user', JSON.stringify(data.user))
      setSuccess(data.message)
      setTimeout(()=> router.push('/'), 1000)
    } catch(err: any) {
      setError(err.message || 'Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const demoLogin = async () => {
    setEmail('demo@smartflow.ai')
    setPassword('demo123')
    setName('Demo User')
    // Auto-submit after fill
    setLoading(true)
    setError('')
    try {
      // Try login first, if fails register demo user
      let res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@smartflow.ai', password: 'demo123' })
      })
      if(!res.ok) {
        // Register demo user
        res = await fetch(`${API}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Demo User', email: 'demo@smartflow.ai', password: 'demo123', role: 'analyst' })
        })
      }
      const data = await res.json()
      if(res.ok) {
        localStorage.setItem('sf_token', data.token)
        localStorage.setItem('sf_user', JSON.stringify(data.user))
        setSuccess('Demo login successful! Redirecting...')
        setTimeout(()=> router.push('/'), 800)
      }
    } catch {
      // Offline fallback
      localStorage.setItem('sf_user', JSON.stringify({ name: 'Demo User', email: 'demo@smartflow.ai', role: 'analyst' }))
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  return(
    <>
      <Head>
        <title>SmartFlow — Login</title>
        <link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Exo+2:wght@300;400;500;600&display=swap" rel="stylesheet"/>
      </Head>
      <div style={{minHeight:'100vh',background:'#030712',display:'flex',flexDirection:'column',fontFamily:'Exo 2,sans-serif',backgroundImage:'linear-gradient(rgba(0,212,255,.025)1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,.025)1px,transparent 1px)',backgroundSize:'40px 40px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'10%',left:'5%',width:400,height:400,borderRadius:'50%',background:'radial-gradient(circle,rgba(0,212,255,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:'10%',right:'5%',width:500,height:500,borderRadius:'50%',background:'radial-gradient(circle,rgba(124,58,237,0.06) 0%,transparent 70%)',pointerEvents:'none'}}/>

        {/* Top bar */}
        <div style={{padding:'20px 32px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:9,background:'linear-gradient(135deg,#00d4ff,#0055ff)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15}}>⚡</div>
          <span style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:'#00d4ff',letterSpacing:'0.1em'}}>SMARTFLOW</span>
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:20,background:'rgba(0,212,255,0.1)',border:'1px solid rgba(0,212,255,0.25)',color:'#00d4ff'}}>AI v2.0</span>
          <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6,padding:'4px 12px',borderRadius:6,background:'rgba(0,255,136,0.07)',border:'1px solid rgba(0,255,136,0.2)'}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:'#00ff88',animation:'blink 1.4s infinite'}}/>
            <span style={{fontFamily:'monospace',fontSize:11,color:'#00ff88'}}>MONGODB ATLAS</span>
          </div>
        </div>

        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:0,maxWidth:920,width:'100%',borderRadius:20,overflow:'hidden',border:'1px solid #1a2744',boxShadow:'0 40px 120px rgba(0,0,0,0.6)'}}>

            {/* Left panel */}
            <div style={{background:'linear-gradient(135deg,#060d1f 0%,#0a1628 50%,#060d1f 100%)',padding:'48px 40px',display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',overflow:'hidden'}}>
              <div style={{position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',border:'1px solid rgba(0,212,255,0.08)'}}/>
              <div style={{position:'absolute',bottom:-80,left:-80,width:250,height:250,borderRadius:'50%',border:'1px solid rgba(124,58,237,0.08)'}}/>
              <div>
                <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',borderRadius:20,background:'rgba(0,212,255,0.08)',border:'1px solid rgba(0,212,255,0.2)',marginBottom:24}}>
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#00d4ff',display:'inline-block'}}/>
                  <span style={{color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.1em'}}>SMART CITY PLATFORM</span>
                </div>
                <h1 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:34,lineHeight:1.15,color:'#e2e8f0',margin:'0 0 16px',letterSpacing:'0.04em'}}>
                  AI-POWERED<br/>
                  <span style={{background:'linear-gradient(135deg,#00d4ff,#0088ff)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>TRAFFIC</span><br/>
                  INTELLIGENCE
                </h1>
                <p style={{color:'#64748b',fontSize:13,lineHeight:1.7,margin:0}}>
                  Real-time traffic prediction across 8 Indian cities using RandomForest ML with MongoDB Atlas cloud storage.
                </p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10,margin:'28px 0'}}>
                {[
                  {icon:'🤖',text:'87.6% accurate ML model'},
                  {icon:'☁️',text:'MongoDB Atlas cloud database'},
                  {icon:'🔐',text:'Secure JWT authentication'},
                  {icon:'🗺',text:'Real-time interactive map'},
                  {icon:'📄',text:'Export predictions as CSV/PDF'},
                ].map((f,i)=>(
                  <motion.div key={i} initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} transition={{delay:0.2+i*0.1}} style={{display:'flex',alignItems:'center',gap:10}}>
                    <span style={{fontSize:15}}>{f.icon}</span>
                    <span style={{color:'#475569',fontSize:13}}>{f.text}</span>
                  </motion.div>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                {[['5,000+','Records'],['8','Cities'],['89%','Accuracy']].map(([v,l])=>(
                  <div key={l} style={{textAlign:'center',padding:'10px',borderRadius:10,background:'rgba(255,255,255,0.03)',border:'1px solid #1a2744'}}>
                    <div style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:18,color:'#00d4ff'}}>{v}</div>
                    <div style={{fontSize:10,color:'#475569',fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.04em'}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel - Form */}
            <div style={{background:'#0a0f1e',padding:'48px 40px',display:'flex',flexDirection:'column',justifyContent:'center'}}>
              <div style={{display:'flex',background:'rgba(13,20,36,0.8)',border:'1px solid #1a2744',borderRadius:10,padding:4,marginBottom:28}}>
                {(['login','signup'] as const).map(m=>(
                  <button key={m} onClick={()=>{setMode(m);setError('');setSuccess('')}}
                    style={{flex:1,padding:'9px',borderRadius:7,border:'none',background:mode===m?'rgba(0,212,255,0.15)':'transparent',color:mode===m?'#00d4ff':'#64748b',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:13,letterSpacing:'0.08em',cursor:'pointer',transition:'all 0.2s',textTransform:'uppercase'}}>
                    {m==='login'?'🔑 Sign In':'✨ Sign Up'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={mode} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.2}}>
                  <h2 style={{fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:22,color:'#e2e8f0',margin:'0 0 6px',letterSpacing:'0.06em'}}>
                    {mode==='login'?'Welcome Back 👋':'Create Account ✨'}
                  </h2>
                  <p style={{color:'#64748b',fontSize:13,margin:'0 0 22px'}}>
                    {mode==='login'?'Sign in to your SmartFlow account':'Join SmartFlow — data saved to MongoDB Atlas'}
                  </p>
                  <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:13}}>
                    {mode==='signup'&&(
                      <div>
                        <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>👤 Full Name</label>
                        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name"
                          style={{width:'100%',background:'#060d1f',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:9,padding:'10px 14px',fontFamily:'Exo 2,sans-serif',fontSize:14,outline:'none',boxSizing:'border-box'}}
                          onFocus={e=>e.target.style.borderColor='#00d4ff'} onBlur={e=>e.target.style.borderColor='#1a2744'}/>
                      </div>
                    )}
                    <div>
                      <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>📧 Email</label>
                      <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"
                        style={{width:'100%',background:'#060d1f',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:9,padding:'10px 14px',fontFamily:'Exo 2,sans-serif',fontSize:14,outline:'none',boxSizing:'border-box'}}
                        onFocus={e=>e.target.style.borderColor='#00d4ff'} onBlur={e=>e.target.style.borderColor='#1a2744'}/>
                    </div>
                    <div>
                      <label style={{display:'block',fontFamily:'Rajdhani,sans-serif',fontSize:11,letterSpacing:'0.08em',color:'#64748b',marginBottom:5,textTransform:'uppercase'}}>🔒 Password</label>
                      <div style={{position:'relative'}}>
                        <input type={showPass?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Min. 6 characters"
                          style={{width:'100%',background:'#060d1f',border:'1px solid #1a2744',color:'#e2e8f0',borderRadius:9,padding:'10px 44px 10px 14px',fontFamily:'Exo 2,sans-serif',fontSize:14,outline:'none',boxSizing:'border-box'}}
                          onFocus={e=>e.target.style.borderColor='#00d4ff'} onBlur={e=>e.target.style.borderColor='#1a2744'}/>
                        <button type="button" onClick={()=>setShowPass(!showPass)}
                          style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',color:'#475569',cursor:'pointer',fontSize:15}}>
                          {showPass?'🙈':'👁'}
                        </button>
                      </div>
                    </div>

                    {error&&(
                      <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
                        style={{padding:'10px 14px',borderRadius:8,background:'rgba(255,59,59,0.08)',border:'1px solid rgba(255,59,59,0.3)',color:'#ff3b3b',fontSize:12}}>
                        ⚠️ {error}
                      </motion.div>
                    )}
                    {success&&(
                      <motion.div initial={{opacity:0,y:-4}} animate={{opacity:1,y:0}}
                        style={{padding:'10px 14px',borderRadius:8,background:'rgba(0,255,136,0.08)',border:'1px solid rgba(0,255,136,0.3)',color:'#00ff88',fontSize:12}}>
                        ✅ {success}
                      </motion.div>
                    )}

                    <button type="submit" disabled={loading}
                      style={{padding:'12px',borderRadius:10,border:'1px solid rgba(0,212,255,0.4)',background:loading?'rgba(0,212,255,0.05)':'linear-gradient(135deg,rgba(0,212,255,0.18),rgba(0,136,255,0.18))',color:'#00d4ff',fontFamily:'Rajdhani,sans-serif',fontWeight:700,fontSize:14,letterSpacing:'0.1em',cursor:loading?'not-allowed':'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:10,transition:'all 0.2s',marginTop:4}}>
                      {loading
                        ?<><span style={{width:14,height:14,border:'2px solid rgba(0,212,255,0.3)',borderTop:'2px solid #00d4ff',borderRadius:'50%',animation:'spin 1s linear infinite',display:'inline-block'}}/> {mode==='login'?'SIGNING IN...':'CREATING ACCOUNT...'}</>
                        :mode==='login'?'🔑 SIGN IN →':'✨ CREATE ACCOUNT →'}
                    </button>

                    <button type="button" onClick={demoLogin} disabled={loading}
                      style={{padding:'10px',borderRadius:9,border:'1px solid #1a2744',background:'transparent',color:'#475569',fontFamily:'Rajdhani,sans-serif',fontSize:12,cursor:'pointer',letterSpacing:'0.04em',transition:'all 0.2s'}}
                      onMouseEnter={e=>(e.currentTarget.style.borderColor='#334155')} onMouseLeave={e=>(e.currentTarget.style.borderColor='#1a2744')}>
                      🚀 USE DEMO ACCOUNT
                    </button>
                  </form>

                  {/* MongoDB badge */}
                  <div style={{display:'flex',alignItems:'center',gap:8,marginTop:18,padding:'8px 12px',borderRadius:8,background:'rgba(0,255,136,0.04)',border:'1px solid rgba(0,255,136,0.12)'}}>
                    <span style={{fontSize:14}}>☁️</span>
                    <span style={{fontSize:11,color:'#334155',fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.04em'}}>
                      Data securely stored in <span style={{color:'#00ff88'}}>MongoDB Atlas</span> cloud
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{textAlign:'center',padding:'16px',borderTop:'1px solid #0d1424'}}>
          <p style={{color:'#1e293b',fontSize:12,fontFamily:'Rajdhani,sans-serif',letterSpacing:'0.06em',margin:0}}>
            © {new Date().getFullYear()} SmartFlow AI · All Rights Reserved · Powered by MongoDB Atlas
          </p>
        </div>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  )
}
