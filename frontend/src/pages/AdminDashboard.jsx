import React, { useState, useEffect } from 'react';
import API from '../api/axios';
import { 
  UserPlus, 
  ShieldCheck, 
  Activity, 
  Search,
  LayoutDashboard,
  Clock,
  LogOut
} from 'lucide-react';

const AdminDashboard = () => {
  const [pendingPayments, setPendingPayments] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [staffUsername, setStaffUsername] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payments, members] = await Promise.all([
        API.get('/admin/verify-queue'),
        API.get('/members')
      ]);
      setPendingPayments(payments.data);
      setAllMembers(members.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerify = async (paymentId) => {
    try {
      await API.patch(`/admin/confirm-payment/${paymentId}`);
      setMessage('ACTION_SUCCESS');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('ACTION_ERROR');
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/create-staff', { username: staffUsername, password: staffPassword });
      setMessage(`AUTH_SUCCESS: ${staffUsername.toUpperCase()}`);
      setStaffUsername('');
      setStaffPassword('');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('AUTH_ERROR');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  const filteredMembers = allMembers.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-6 md:p-12 font-sans selection:bg-white selection:text-black">
      <header className="max-w-7xl mx-auto mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 mb-2 tracking-[0.2em]">
            <Activity size={14} className="text-green-500" /> SYSTEM_ROOT
          </div>
          <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">
            Owner <span className="text-gray-500 underline decoration-1 underline-offset-8">Terminal</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="px-4 py-2 bg-[#151515] border border-[#222] rounded-sm text-right min-w-[120px]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Active</p>
            <p className="text-xl font-bold font-mono">{allMembers.filter(m => m.status === 'Active').length}</p>
          </div>
          <div className="px-4 py-2 bg-[#151515] border border-[#222] rounded-sm text-right min-w-[120px]">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest">Pending</p>
            <p className="text-xl font-bold font-mono text-yellow-500">{pendingPayments.length}</p>
          </div>
          <button onClick={handleLogout} className="p-3 bg-red-950/20 border border-red-900/50 text-red-500 hover:bg-red-500 hover:text-white transition-all">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4 space-y-10">
          <section className="bg-[#151515] p-8 border border-[#222] relative group">
            <div className="absolute top-0 left-0 w-1 h-0 bg-white group-hover:h-full transition-all duration-500"></div>
            <h2 className="text-xs font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-3">
              <UserPlus size={16} /> New Staff
            </h2>
            <form onSubmit={handleCreateStaff} className="space-y-6">
              <div className="group">
                <label className="block text-[10px] text-gray-600 uppercase mb-2 group-focus-within:text-white">Username</label>
                <input type="text" className="w-full bg-transparent border-b border-[#333] py-2 outline-none focus:border-white transition-all font-mono" value={staffUsername} onChange={(e) => setStaffUsername(e.target.value)} required />
              </div>
              <div className="group">
                <label className="block text-[10px] text-gray-600 uppercase mb-2 group-focus-within:text-white">Key</label>
                <input type="password" className="w-full bg-transparent border-b border-[#333] py-2 outline-none focus:border-white transition-all font-mono" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} required />
              </div>
              <button className="w-full bg-white text-black py-4 font-black uppercase text-xs tracking-widest hover:invert transition-all">
                AUTHORIZE
              </button>
            </form>
          </section>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors" size={18} />
            <input type="text" placeholder="SEARCH..." className="w-full bg-[#151515] border border-[#222] py-4 pl-12 pr-4 text-[10px] font-mono outline-none focus:border-gray-500 transition-all uppercase" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="lg:col-span-8 space-y-12">
          <section>
            <h2 className="text-xs font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3 text-yellow-500">
              <ShieldCheck size={16} /> Verification
            </h2>
            {pendingPayments.length === 0 ? (
              <div className="h-24 flex items-center justify-center border border-dashed border-[#222] text-gray-700 text-[10px] font-mono uppercase tracking-[0.4em]">
                Empty
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPayments.map((p) => (
                  <div key={p.payment_id} className="bg-[#151515] border border-[#222] p-6 hover:border-yellow-500/50 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-sm font-bold uppercase">{p.full_name}</h3>
                      <span className="text-[10px] font-mono text-gray-500">{p.membership_tier}</span>
                    </div>
                    <p className="font-mono text-xs mb-6 text-white bg-[#0f0f0f] p-2 inline-block border border-[#222]">{p.transaction_ref}</p>
                    <div className="flex justify-between items-center">
                      <span className="font-black text-lg">{p.amount} ETB</span>
                      <button onClick={() => handleVerify(p.payment_id)} className="bg-white text-black px-4 py-2 font-black text-[10px] tracking-widest hover:bg-yellow-500 transition-all">
                        VALIDATE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xs font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-3 text-blue-500">
              <LayoutDashboard size={16} /> Registry
            </h2>
            <div className="bg-[#151515] border border-[#222] overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-[#1a1a1a] border-b border-[#222]">
                  <tr className="text-[10px] font-black uppercase text-gray-600 tracking-widest">
                    <th className="p-6">Identity</th>
                    <th className="p-6 text-center">Status</th>
                    <th className="p-6 text-right">Cycle_End</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#222]">
                  {filteredMembers.map((m) => (
                    <tr key={m.id} className={`group hover:bg-[#1c1c1c] transition-colors ${m.is_expiring ? 'bg-red-950/10' : ''}`}>
                      <td className="p-6">
                        <p className="text-sm font-black uppercase tracking-tight">{m.full_name}</p>
                        <div className="flex gap-2 items-center mt-1">
                           <span className="text-[9px] font-mono text-gray-600">#{m.id.substring(0, 6)}</span>
                           <span className="text-[8px] bg-blue-950/30 text-blue-400 px-1.5 py-0.5 border border-blue-900/30 flex items-center gap-1 font-mono">
                             <Clock size={8} /> {m.total_months_active || 0}m_tenure
                           </span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 border text-[9px] font-black uppercase tracking-widest ${m.status === 'Active' ? 'border-green-900/50 text-green-500 bg-green-900/10' : 'border-yellow-900/50 text-yellow-500 bg-yellow-900/10'}`}>
                            {m.status}
                          </span>
                        </div>
                      </td>
                      <td className="p-6 text-right">
                        <p className={`text-xs font-mono ${m.is_expiring ? 'text-red-500 font-black' : 'text-gray-500'}`}>
                          {new Date(m.end_date).toLocaleDateString('en-GB')}
                        </p>
                        {m.is_expiring && <span className="text-[8px] text-red-500 font-mono tracking-widest animate-pulse">!!_EXPIRING_!!</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      {message && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-white text-black px-10 py-5 font-black text-xs tracking-[0.4em] shadow-2xl z-50 uppercase italic">
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;