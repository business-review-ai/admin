import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom"
import { 
  LayoutDashboard, Users, Shield, 
  MessageSquare, LogOut, 
  Key, Globe, Save
} from "lucide-react"


import { useState, useEffect } from "react"
import { Toaster, toast } from "react-hot-toast"
import { cn } from "./lib/utils"
import api from "./lib/axios"
import axios from "axios"


// Components
const Button = ({ children, className, variant = 'primary', ...props }: any) => {
  const variants: any = {
    primary: "bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20",
    ghost: "hover:bg-white/5 text-white/60 hover:text-white",
    outline: "border border-white/10 hover:bg-white/5"
  }
  return (
    <button className={cn("px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center", variants[variant], className)} {...props}>
      {children}
    </button>
  )
}

const Dashboard = () => {

  const [stats, setStats] = useState<any>(null)


  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, enquiriesRes, teamsRes] = await Promise.all([
          api.get('/users'),
          api.get('/enquiries'),
          api.get('/teams')
        ])
        setStats({
          users: usersRes.data.length,
          enquiries: enquiriesRes.data.length,
          teams: teamsRes.data.length,
        })
      } catch (err) {
        console.error(err)
      }
    }

    fetchStats()
  }, [])

  if (!stats) return <div className="animate-pulse space-y-6">
    <div className="h-10 w-48 bg-white/5 rounded-xl" />
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl" />)}
    </div>
  </div>


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Users", val: stats.users, icon: Users, color: "text-blue-500" },
          { label: "Active Teams", val: stats.teams, icon: Shield, color: "text-purple-500" },
          { label: "Enquiries", val: stats.enquiries, icon: MessageSquare, color: "text-green-500" },
          { label: "System Status", val: "Operational", icon: Globe, color: "text-pink-500" },
        ].map((s, i) => (
          <div key={i} className="glass-panel p-6 rounded-2xl space-y-2 group hover:border-primary/50 transition-all">
            <s.icon className={cn("w-6 h-6", s.color)} />
            <p className="text-sm text-white/60 font-medium">{s.label}</p>
            <p className="text-2xl font-bold tracking-tight">{s.val}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const Config = () => {
  const [configs, setConfigs] = useState<any[]>([])


  const fetchConfig = async () => {
    try {
      const res = await api.get('/config')
      setConfigs(res.data)
    } catch (e) { toast.error("Failed to fetch config") }
  }


  useEffect(() => { fetchConfig() }, [])

  const saveConfig = async (key: string, value: string) => {
    try {
      await api.post('/config', { key, value })
      toast.success(`${key} updated!`)
      fetchConfig()
    } catch (e) { toast.error("Failed to save config") }
  }

  const defaultKeys = [
    { key: "GOOGLE_CLIENT_ID", label: "Google OAuth Client ID", type: "text" },
    { key: "GOOGLE_CLIENT_SECRET", label: "Google OAuth Client Secret", type: "password" },
    { key: "OPENCODE_API_KEY", label: "OpenCode API Key", type: "password" },
    { key: "OPENCODE_BASE_URL", label: "OpenCode Base URL", type: "text" },
    { key: "RAZORPAY_KEY_ID", label: "Razorpay Key ID", type: "text" },
    { key: "RAZORPAY_KEY_SECRET", label: "Razorpay Key Secret", type: "password" },
  ]

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Global Configuration</h1>
        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-bold border border-blue-500/20">
          SuperAdmin Only
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {defaultKeys.map((item) => {
          const config = configs.find(c => c.key === item.key)
          return (
            <div key={item.key} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-end gap-4">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-bold text-white/40 uppercase tracking-wider">{item.label}</label>
                <input 
                  type={item.type}
                  defaultValue={config?.value || ""}
                  onBlur={(e) => saveConfig(item.key, e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-mono text-sm" 
                  placeholder={`Enter ${item.key}...`} 
                />
              </div>
              <Button onClick={() => toast.success("Saved automatically on blur")} className="h-12 w-12 md:w-auto px-4 rounded-xl">
                <Save className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Update</span>
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState<any[]>([])


  const fetchEnquiries = async () => {
    try {
      const res = await api.get('/enquiries')
      setEnquiries(res.data)
    } catch (e) { toast.error("Failed to fetch enquiries") }
  }


  useEffect(() => { fetchEnquiries() }, [])

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/enquiries/${id}/status`, { status })
      toast.success("Status updated")
      fetchEnquiries()
    } catch (e) {}
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Inbound Enquiries</h1>
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-[10px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5">
              <tr>
                <th className="p-6">Contact Details</th>
                <th className="p-6">Subject & Message</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {enquiries.length === 0 ? (
                <tr><td colSpan={4} className="p-20 text-center text-white/20">No enquiries found.</td></tr>
              ) : enquiries.map(e => (
                <tr key={e.id} className="hover:bg-white/5 transition-all">
                  <td className="p-6">
                    <p className="font-bold">{e.name}</p>
                    <p className="text-sm text-white/40">{e.email}</p>
                    <p className="text-[10px] text-white/20 mt-1">{new Date(e.createdAt).toLocaleString()}</p>
                  </td>
                  <td className="p-6 max-w-md">
                    <p className="font-semibold text-sm mb-1">{e.subject}</p>
                    <p className="text-sm text-white/60 line-clamp-2">{e.message}</p>
                  </td>
                  <td className="p-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      e.status === 'NEW' ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"
                    )}>
                      {e.status}
                    </span>
                  </td>
                  <td className="p-6 text-right">
                    <Button variant="ghost" onClick={() => updateStatus(e.id, 'RESOLVED')} className="text-xs">
                      Mark Resolved
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const UsersManagement = () => {
  const [users, setUsers] = useState<any[]>([])


  const fetchUsers = async () => {
    try {
      const res = await api.get('/users')
      setUsers(res.data)
    } catch (e) {}
  }


  useEffect(() => { fetchUsers() }, [])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-bold tracking-tight">Platform Users</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {users.map(u => (
          <div key={u.id} className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                {u.name?.charAt(0) || u.email.charAt(0)}
              </div>
              <span className="text-[10px] font-black uppercase bg-white/5 px-2 py-1 rounded text-white/40 tracking-widest">{u.role}</span>
            </div>
            <div>
              <p className="font-bold truncate">{u.name || 'Anonymous'}</p>
              <p className="text-sm text-white/40 truncate">{u.email}</p>
            </div>
            <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs text-white/40">
              <span>{u.businesses.length} Locations</span>
              <span>Joined {new Date(u.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navItems = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Keys & API", path: "/config", icon: Key },
    { label: "Users & Teams", path: "/users", icon: Users },
    { label: "Enquiries", path: "/enquiries", icon: MessageSquare },
  ]

  const logout = () => {
    localStorage.removeItem('admin_token')
    navigate('/auth')
  }

  return (
    <aside className="w-72 border-r border-white/5 bg-[#050505] flex flex-col p-8 gap-10">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <span className="font-black text-xl tracking-tighter block leading-none">ADMIN</span>
          <span className="text-[10px] font-bold text-white/20 tracking-[0.2em] uppercase">Control Panel</span>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
              location.pathname === item.path 
                ? "bg-primary text-white shadow-lg shadow-primary/20" 
                : "text-white/40 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className={cn("w-5 h-5", location.pathname === item.path ? "text-white" : "text-white/20 group-hover:text-white")} />
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="space-y-4">
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
          <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">System Health</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-white/60">All systems go</span>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-400/10 w-full transition-all">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  )
}

function App() {


  const [isAuth, setIsAuth] = useState(!!localStorage.getItem('admin_token'))

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 glass-panel p-10 rounded-[2.5rem] text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-black tracking-tighter">ADMIN LOGIN</h1>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const email = (e.target as any).email.value;
            const password = (e.target as any).password.value;
            // Mock login for now or hit auth endpoint
            toast.promise(
              axios.post('/api/auth/login', { email, password }),
              {


                loading: 'Authenticating...',
                success: (res) => {
                  if (res.data.user.role === 'USER') throw new Error("Unauthorized")
                  localStorage.setItem('admin_token', res.data.token);
                  setIsAuth(true);
                  return 'Welcome, Admin!';
                },
                error: (err) => err.message || 'Login failed'
              }
            )
          }}>
            <input name="email" type="email" placeholder="Admin Email" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all" />
            <input name="password" type="password" placeholder="Password" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-primary transition-all" />
            <Button className="w-full h-14 text-lg mt-4">Access Control Panel</Button>
          </form>
        </div>
        <Toaster position="bottom-right" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#020202] text-white flex">
        <Sidebar />
        <main className="flex-1 h-screen overflow-auto p-12">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/config" element={<Config />} />
            <Route path="/enquiries" element={<Enquiries />} />
            <Route path="/users" element={<UsersManagement />} />
          </Routes>
        </main>
        <Toaster position="bottom-right" />
      </div>
    </BrowserRouter>
  )
}

export default App
