import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

const links = [
  { href:'/', label:'Predict', emoji:'⚡' },
  { href:'/map', label:'Map', emoji:'🗺' },
  { href:'/dashboard', label:'Dashboard', emoji:'📊' },
  { href:'/compare', label:'Compare', emoji:'🏙' },
  { href:'/news', label:'News', emoji:'📰' },
  { href:'/leaderboard', label:'Ranks', emoji:'🏆' },
]

export default function Navbar(){
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [showMenu, setShowMenu] = useState(false)

  useEffect(()=>{
    const u = localStorage.getItem('sf_user')
    if(u) setUser(JSON.parse(u))
  },[])

  const logout = () => {
    localStorage.clear()
    router.push('/login')
  }

  return(
    <>
      <nav className="navbar">
        
        {/* LOGO */}
        <Link href="/" className="logo">
          <div className="logo-icon">⚡</div>
          <span>SMARTFLOW</span>
        </Link>

        {/* LINKS */}
        <div className="nav-links">
          {links.map(({href,label,emoji})=>{
            const active = router.pathname === href
            return(
              <Link key={href} href={href} className={`nav-item ${active?'active':''}`}>
                <span>{emoji}</span> {label}
              </Link>
            )
          })}
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="live">
            <span className="dot"></span> LIVE
          </div>

          {user ? (
            <div className="user-box">
              <button onClick={()=>setShowMenu(!showMenu)} className="user-btn">
                {user.name[0]}
              </button>

              {showMenu && (
                <div className="dropdown">
                  <p>{user.name}</p>
                  <p className="email">{user.email}</p>

                  <button onClick={()=>router.push('/profile')}>👤 Profile</button>
                  <button onClick={()=>router.push('/dashboard')}>📊 Dashboard</button>
                  <button onClick={logout} className="logout">🚪 Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="login-btn">Login</Link>
          )}
        </div>
      </nav>

      <style jsx>{`
        .navbar{
          position:fixed;
          top:0;
          width:100%;
          display:flex;
          justify-content:space-between;
          align-items:center;
          padding:12px 20px;
          backdrop-filter: blur(15px);
          background: rgba(10,15,30,0.7);
          border-bottom:1px solid rgba(255,255,255,0.1);
          z-index:1000;
        }

        .logo{
          display:flex;
          align-items:center;
          gap:10px;
          font-weight:700;
          color:#00d4ff;
          text-decoration:none;
        }

        .logo-icon{
          background:linear-gradient(135deg,#00d4ff,#0055ff);
          padding:6px;
          border-radius:8px;
        }

        .nav-links{
          display:flex;
          gap:10px;
        }

        .nav-item{
          padding:8px 12px;
          border-radius:8px;
          color:#94a3b8;
          text-decoration:none;
          transition:0.3s;
        }

        .nav-item:hover{
          background:rgba(0,212,255,0.1);
          color:#00d4ff;
        }

        .active{
          background:rgba(0,212,255,0.2);
          color:#00d4ff;
        }

        .right{
          display:flex;
          align-items:center;
          gap:12px;
        }

        .live{
          display:flex;
          align-items:center;
          gap:6px;
          color:#00ff88;
          font-size:12px;
        }

        .dot{
          width:6px;
          height:6px;
          border-radius:50%;
          background:#00ff88;
          animation:blink 1s infinite;
        }

        .user-btn{
          width:35px;
          height:35px;
          border-radius:50%;
          border:none;
          background:linear-gradient(135deg,#00d4ff,#0055ff);
          color:white;
          cursor:pointer;
        }

        .dropdown{
          position:absolute;
          right:20px;
          top:60px;
          background:#0d1424;
          padding:12px;
          border-radius:12px;
          width:180px;
          box-shadow:0 10px 40px rgba(0,0,0,0.5);
          animation:fade 0.2s ease;
        }

        .dropdown button{
          width:100%;
          background:none;
          border:none;
          padding:8px;
          text-align:left;
          color:#cbd5e1;
          cursor:pointer;
        }

        .dropdown button:hover{
          background:rgba(255,255,255,0.05);
        }

        .logout{
          color:#ff4d4d;
        }

        .login-btn{
          padding:8px 14px;
          border-radius:8px;
          background:rgba(0,212,255,0.2);
          color:#00d4ff;
          text-decoration:none;
        }

        @keyframes blink{
          50%{opacity:0.3}
        }

        @keyframes fade{
          from{opacity:0;transform:translateY(-5px)}
          to{opacity:1}
        }

        @media(max-width:768px){
          .nav-links{
            display:none;
          }
        }
      `}</style>
    </>
  )
}
