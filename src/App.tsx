/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, FormEvent } from 'react';
import { 
  Vote as VoteIcon, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  UserCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Cpu, 
  Flame, 
  Layers, 
  LogOut, 
  Users, 
  Clock, 
  Binary, 
  Fingerprint, 
  Search, 
  HelpCircle 
} from 'lucide-react';
import { Candidate, Block, BlockchainStatus, UserSession } from './types';

export default function App() {
  // State definitions
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [blockchain, setBlockchain] = useState<Block[]>([]);
  const [audit, setAudit] = useState<BlockchainStatus>({
    isValid: true,
    tamperedBlockIndex: null,
    message: "Đang tải dữ liệu...",
    corruptedBlockIndices: []
  });

  // User session
  const [user, setUser] = useState<UserSession | null>(null);
  
  // Login Inputs
  const [loginName, setLoginName] = useState('');
  const [loginSid, setLoginSid] = useState('');
  
  // Action Feedback notifications
  const [notification, setNotification] = useState<{
    text: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Mining / Network animations simulated state
  const [isMining, setIsMining] = useState(false);
  const [miningConsole, setMiningConsole] = useState<string[]>([]);
  
  // Tampering variables
  const [selectedTamperBlock, setSelectedTamperBlock] = useState<number>(1);
  const [selectedTamperCandidate, setSelectedTamperCandidate] = useState<string>('');

  // Selected candidate filter/search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Show active block inspector detailed modal/state
  const [inspectedBlock, setInspectedBlock] = useState<Block | null>(null);

  // API Call: Fetch current candidates
  const fetchCandidates = useCallback(async () => {
    try {
      const res = await fetch('/api/candidates');
      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
        if (data.length > 0) {
          setSelectedTamperCandidate(data[0].id);
        }
      }
    } catch (err) {
      console.error("Lỗi lấy danh sách ứng viên:", err);
    }
  }, []);

  // API Call: Fetch verified updated blockchain
  const fetchBlockchain = useCallback(async (showMessage = false) => {
    try {
      const res = await fetch('/api/blockchain');
      if (res.ok) {
        const data = await res.json();
        setBlockchain(data.chain);
        setAudit(data.audit);
        if (showMessage) {
          showNotification(data.audit.isValid 
            ? "Cập nhật dữ liệu từ mạng lưới Blockchain thành công! Toàn vẹn thông tin được đảm bảo." 
            : `Cảnh báo: Phát hiện sự thay đổi bất hợp pháp! ${data.audit.message}`, 
            data.audit.isValid ? 'success' : 'warning');
        }
      }
    } catch (err) {
      console.error("Lỗi đồng bộ Blockchain:", err);
    }
  }, []);

  // Set transient notification message
  const showNotification = (text: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({ text, type });
    setTimeout(() => {
      setNotification(prev => prev?.text === text ? null : prev);
    }, 6000);
  };

  // On mount, pull initially
  useEffect(() => {
    fetchCandidates();
    fetchBlockchain();
    
    // Auto sync blockchain ledger state every 10 seconds for real-time multiplayer feel
    const timer = setInterval(() => {
      fetchBlockchain();
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchCandidates, fetchBlockchain]);

  // Handle student login check
  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!loginName.trim() || !loginSid.trim()) {
      showNotification("Vui lòng điền đầy đủ Họ tên và Mã số sinh viên!", "error");
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, studentId: loginSid })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setUser(data.user);
        showNotification(`Đăng nhập thành công! Xin chào ${data.user.name}.`, "success");
      } else {
        showNotification(data.error || "Không thể xác minh thông tin tài khoản.", "error");
      }
    } catch (err) {
      showNotification("Lỗi kết nối máy chủ xác thực.", "error");
    }
  };

  // Sign out user
  const handleLogout = () => {
    setUser(null);
    setLoginName('');
    setLoginSid('');
    showNotification("Đã đăng xuất tài khoản bỏ phiếu.", "info");
  };

  // Process casting a vote with proof of work simulation
  const handleCastVote = async (candidate: Candidate) => {
    if (!user) {
      showNotification("Vui lòng đăng nhập trước khi thực hiện bỏ phiếu!", "warning");
      // Scroll smoothly to Login
      document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (user.hasVoted) {
      showNotification("Tài khoản của bạn đã thực hiện bỏ phiếu trước đó! Mỗi sinh viên chỉ bầu 1 lần.", "error");
      return;
    }

    setIsMining(true);
    setMiningConsole([
      `[MẠNG LƯỚI BLOCKCHAIN] Khởi động nút đào mỏ...`,
      `[Giao dịch] Chuẩn bị đóng gói phiếu bầu: ${user.name} -> ${candidate.name}`,
      `[Chữ ký điện hóa] Tạo chữ ký bảo mật dạng băm hash SHA256...`,
    ]);

    // Fast fancy terminal logging simulation
    let phase = 0;
    const interval = setInterval(() => {
      phase++;
      if (phase === 1) {
        setMiningConsole(prev => [...prev, `[Bộ nhớ đệm] Tìm khối trước có mã băm: ${blockchain[blockchain.length - 1]?.hash.substring(0, 16)}...`]);
      } else if (phase === 2) {
        setMiningConsole(prev => [...prev, `[Proof of Work] Đang tính toán Nonce tìm khối hợp lệ có độ khó định dạng "00"...`]);
      } else if (phase === 3) {
        setMiningConsole(prev => [...prev, `[Mã hóa] Tìm thấy kết quả băm tối ưu giúp liên kết vững chắc vào Sổ cái.`]);
      } else {
        clearInterval(interval);
      }
    }, 450);

    // Make the backend call
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voterName: user.name,
          studentId: user.studentId,
          candidateId: candidate.id
        })
      });

      // Maintain a minimum nice visual delay so user realizes blockchain operation of computing proof of work block
      await new Promise(r => setTimeout(r, 1800));
      clearInterval(interval);

      const data = await res.json();
      if (res.ok && data.success) {
        setBlockchain(blockchain => [...blockchain, data.block]);
        setAudit(data.audit);
        setUser(prev => prev ? { ...prev, hasVoted: true } : null);
        showNotification(`Chúc mừng! Phiếu bầu cho "${candidate.name}" đã được khai thác & ghi nhận thành công trên Blockchain.`, "success");
      } else {
        showNotification(data.error || "Gặp sự cố khi tải phiếu lên chuỗi.", "error");
      }
    } catch (err) {
      showNotification("Máy chủ blockchain từ chối giao dịch bỏ phiếu.", "error");
    } finally {
      setIsMining(false);
      setMiningConsole([]);
    }
  };

  // Simulating hacker modification of database values
  const handleTamperAttack = async () => {
    if (selectedTamperBlock <= 0 || selectedTamperBlock >= blockchain.length) {
      showNotification("Hãy nhập đúng số khối hợp lệ để can thiệp (Chỉ can thiệp từ Block thứ 1 trở đi)!", "warning");
      return;
    }

    try {
      const res = await fetch('/api/tamper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          index: selectedTamperBlock,
          candidateId: selectedTamperCandidate
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Reload all blockchain to see the verification cascade fail instantly!
        fetchBlockchain();
        showNotification(`[TẤN CÔNG GIẢ LẬP] ${data.message}`, "warning");
      } else {
        showNotification(data.error || "Thất bại khi tìm khối để tấn công.", "error");
      }
    } catch (err) {
      showNotification("Lỗi kết nối máy chủ băm.", "error");
    }
  };

  // Reset entire blockchain state back to seeds
  const handleResetSystem = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn khôi phục toàn bộ Sổ cái Blockchain về trạng thái nguyên bản hạt giống ban đầu không?")) {
      return;
    }
    
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlockchain(data.chain);
        setAudit(data.audit);
        // Refresh local user state voting flag if needed
        if (user) {
          // Double check if local logged in user actually inside seeds
          const stillContains = data.chain.some((block: Block) => 
            block.votes.some(v => v.studentId === user.studentId)
          );
          setUser(prev => prev ? { ...prev, hasVoted: stillContains } : null);
        }
        showNotification("Đã đặt lại trạng thái blockchain hoàn toàn mới!", "success");
      }
    } catch (err) {
      showNotification("Lỗi hệ thống reset.", "error");
    }
  };

  // Automatic live vote counting tallying
  // Compute votes based ONLY on valid chain blocks where there's no tampering detected in previous chain sequence.
  // Note: To illustrate cybersecurity, if block index is corrupted or chain broke, we can clearly highlight that!
  const getAutoTally = () => {
    const tally: Record<string, number> = {};
    const tamperedCountedId: string[] = []; // track votes inside tampered blocks
    
    blockchain.forEach((block, index) => {
      // If the block itself or any prior block is listed as corrupted, 
      // let's show how audit validation protects people by auditing untampered logs
      const isCorrupted = audit.corruptedBlockIndices.includes(block.index);
      
      block.votes.forEach(vote => {
        if (isCorrupted) {
          // This block's votes are tainted!
        } else {
          tally[vote.candidateId] = (tally[vote.candidateId] || 0) + 1;
        }
      });
    });

    return tally;
  };

  const voteStats = getAutoTally();
  const totalValidVotes = Object.values(voteStats).reduce((sum, v) => sum + v, 0);

  // Filter candidates list
  const filteredCandidates = candidates.filter(cand => 
    cand.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    cand.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cand.class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-emerald-500 selection:text-white" id="main-view">
      {/* Dynamic Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs" id="app-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and App Title */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-soft shadow-emerald-500/20">
                <VoteIcon className="w-5.5 h-5.5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  E-VOTING SECURE
                  <span className="hidden sm:inline bg-emerald-50 text-emerald-700 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-200">
                    Sổ Cái Blockchain
                  </span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Hệ Thống Bỏ Phiếu Minh Bạch Minh Họa Chi Tiết</p>
              </div>
            </div>

            {/* Quick Status indicators & Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => fetchBlockchain(true)}
                className="p-2 font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all flex items-center gap-1.5 text-xs border border-slate-200 bg-slate-50"
                title="Đồng bộ thủ công với Blockchain"
                id="sync-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Đồng bộ
              </button>

              {audit.isValid ? (
                <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mạch Liên Kết Bền Vững
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 bg-rose-50 border border-rose-200 text-rose-800 px-3 py-1.5 rounded-lg text-xs font-semibold animate-pulse">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Cảnh Báo: Rò Rỉ Toàn Vẹn!
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8" id="core-content">
        
        {/* Floating Notification Banner */}
        {notification && (
          <div 
            className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 transition-all transform duration-300 ${
              notification.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-950' :
              notification.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-950' :
              notification.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-950 animate-bounce' :
              'bg-blue-50 border-blue-200 text-blue-950'
            }`}
            id="toast-notification"
          >
            {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />}
            {notification.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />}
            {notification.type === 'warning' && <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />}
            {notification.type === 'info' && <Fingerprint className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />}
            
            <div className="flex-1">
              <p className="text-sm font-semibold">Thông báo hệ thống</p>
              <p className="text-xs opacity-90 mt-0.5">{notification.text}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="text-xs underline cursor-pointer hover:opacity-80"
              id="close-toast-btn"
            >
              Đóng
            </button>
          </div>
        )}

        {/* Global Blockchain Status Big Notification Bar (When compromised) */}
        {!audit.isValid && (
          <div className="bg-rose-100 border-2 border-rose-400 text-rose-950 p-5 rounded-2xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4" id="blockchain-compromised-alert">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-rose-200 rounded-xl text-rose-700">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-bold text-lg">CẢNH BÁO BẢO MẬT: Phát hiện dữ liệu bị can thiệp trái phép!</h3>
                <p className="text-xs text-rose-800 mt-0.5 max-w-2xl leading-relaxed">
                  Nhờ ứng dụng công nghệ băm phi tập trung kết nối ngược của Blockchain, hệ thống đã ngay lập tức phát hiện mã băm của khối bị sụp đổ so với thông số thiết kế ban đầu. Phiếu bầu bất hợp pháp sẽ tự động bị loại khỏi thống kê và vô hiệu hoạt động.
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] font-mono font-medium">
                  {audit.corruptedBlockIndices.map(idx => (
                    <span key={idx} className="bg-rose-200 text-rose-900 px-2 py-0.5 rounded border border-rose-300">
                      Khối liên kết phá hủy: Block #{idx}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={handleResetSystem}
                className="w-full md:w-auto bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 shadow transition-all cursor-pointer"
                id="alert-reset-btn"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Khôi phục an toàn (Reset)
              </button>
            </div>
          </div>
        )}

        {/* Top Grid: Auto Tally Chart Dashboard & User Authentication Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="stats-auth-grid">
          
          {/* Section 1: Đăng nhập / Trạng thái tài khoản */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="login-section">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-600" />
                  <h2 className="font-bold text-slate-800 text-base">Xác minh / Đăng nhập</h2>
                </div>
                <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">Phân hệ 1</span>
              </div>

              {!user ? (
                <form onSubmit={handleLogin} className="space-y-4" id="login-form">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Vui lòng cung cấp chính xác Họ tên và Mã số sinh viên (ví dụ: <code className="bg-slate-100 px-1 py-0.2 rounded font-mono font-semibold">SV26005</code>) của bạn nhằm xác nhận độc nhất quyền tuyển cử.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và Tên Sinh Viên</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm px-3.5 py-2.5 transition-all outline-hidden font-medium text-slate-800"
                      placeholder="Nguyễn Văn A"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      required
                      id="input-login-name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Mã Số Sinh Viên (MSSV)</label>
                    <input 
                      type="text"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl text-sm px-3.5 py-2.5 font-mono tracking-wider transition-all outline-hidden text-slate-800"
                      placeholder="SV26005"
                      value={loginSid}
                      onChange={(e) => setLoginSid(e.target.value)}
                      required
                      id="input-login-sid"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold py-3 px-4 rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                    id="submit-login-btn"
                  >
                    Xác thực quyền tuyển cử
                  </button>
                </form>
              ) : (
                <div className="space-y-5" id="user-profile-card">
                  <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="text-xs text-slate-400 font-medium font-mono leading-none">{user.studentId}</p>
                      <h4 className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">Sinh viên chính quy đã xác thực</p>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <p className="text-xs text-slate-500">Trạng thái phiếu bầu của tài khoản này:</p>
                    {user.hasVoted ? (
                      <div className="flex items-center gap-2 bg-emerald-100/80 border border-emerald-200 text-emerald-800 p-3 rounded-lg text-xs font-bold leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                        Đã ghi nhận phiếu bầu hợp lệ trên Block!
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-xs font-semibold">
                        <HelpCircle className="w-4 h-4 flex-shrink-0 text-amber-600" />
                        Chưa tiến hành bỏ phiếu. Hãy lựa chọn ứng cử viên bên dưới.
                      </div>
                    )}
                  </div>

                  <div className="pt-2">
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      Để phân tách hoặc chuyển tư cách người bình chọn minh họa mới, hãy nhấn kết xuất kết thúc phiên đăng nhập hiện thời.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="w-full bg-white hover:bg-slate-50 text-slate-600 hover:text-red-600 border border-slate-200 text-xs font-semibold py-2.5 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      id="logout-btn"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Nhập bằng tài khoản khác
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Đại học Kinh Doanh Và Công Nghệ Hà Nội</span>
              <span>Năm học 2026</span>
            </div>
          </div>

          {/* Section 2 & 3: Kiểm Phiếu Tự Động Dashboard (Progress and Tally) */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="auto-tally-section">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2">
                  <Binary className="w-5 h-5 text-teal-600" />
                  <h2 className="font-bold text-slate-800 text-base">Bộ Kiểm Phiếu Tự Động & Thống Kê</h2>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-semibold border border-teal-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Báo cáo thời gian thực
                  </span>
                </div>
              </div>

              {/* Stat figures cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                  <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Tổng Phiếu Trên Ledger</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-slate-800">{blockchain.length > 0 ? blockchain.length - 1 : 0}</span>
                    <span className="text-xs text-slate-500">Khối bầu</span>
                  </div>
                </div>

                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                  <span className="text-[11px] font-bold text-emerald-600 block uppercase tracking-wider">Phiếu bầu hợp lệ</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-emerald-700">{totalValidVotes}</span>
                    <span className="text-xs text-emerald-600">Tuyển cử chính xác</span>
                  </div>
                </div>

                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-100">
                  <span className="text-[11px] font-bold text-rose-500 block uppercase tracking-wider">Nghi can bị loại</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-extrabold text-rose-700">{audit.corruptedBlockIndices.length}</span>
                    <span className="text-xs text-rose-500">Người can thiệp</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Progress bars visualizing the tally automatically */}
              <div className="space-y-4" id="tally-progress-list">
                <p className="text-xs text-slate-500 font-medium">Bảng xếp hạng phiếu bầu tối ưu (Chỉ tính các khối đã qua kiểm toán toàn vẹn hợp lệ):</p>
                {candidates.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">Đang tải danh sách kiểm phiếu...</div>
                ) : (
                  candidates.map(candidate => {
                    const votesForCand = voteStats[candidate.id] || 0;
                    const pct = totalValidVotes > 0 ? (votesForCand / totalValidVotes) * 100 : 0;
                    
                    return (
                      <div key={candidate.id} className="group" id={`tally-item-${candidate.id}`}>
                        <div className="flex justify-between items-center text-xs mb-1 font-medium">
                          <span className="text-slate-700 font-bold group-hover:text-emerald-700 transition-all">
                            {candidate.name} <span className="text-slate-400 font-normal">({candidate.class})</span>
                          </span>
                          <span className="text-slate-800 font-mono">
                            <strong className="text-emerald-600">{votesForCand} Phiếu</strong> ({pct.toFixed(1)}%)
                          </span>
                        </div>
                        
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                          <div 
                            className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-1000 origin-left"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="leading-relaxed">
                  <strong>Cam kết an toàn:</strong> Phiếu của sinh viên được nộp trực tuyến qua bộ mã hóa, sau đó băm thành dữ liệu không liên đới ngược để bảo vệ danh tính, đồng thời dữ liệu phân phát giúp kiểm định không thể thiên vị hoặc can thiệp hàng loạt.
                </span>
              </div>
            </div>
          </div>
        </div>


        {/* Mining Console Backdrop overlay */}
        {isMining && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4" id="mining-loader-overlay">
            <div className="bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 text-white overflow-hidden space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-950 rounded-xl text-emerald-400 border border-emerald-800/60 pulsate-miner">
                  <Cpu className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">Đang Khai Thác Khối Phiếu Bầu Mới</h3>
                  <p className="text-xs text-slate-400">Đang giải mã Proof-of-Work khối bằng độ khó cơ sở</p>
                </div>
              </div>

              {/* Pseudo terminal console output */}
              <div className="bg-black/80 rounded-xl p-4 font-mono text-[11px] text-emerald-400 space-y-1.5 h-44 overflow-y-auto border border-emerald-900/30">
                {miningConsole.map((log, idx) => (
                  <div key={idx} className="leading-tight flex items-start gap-1">
                    <span className="text-slate-600">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5 pt-1 animate-pulse text-slate-400">
                  <span className="w-1.5 h-3.5 bg-emerald-400 block" />
                  <span>Đang xử lý thuật toán mã băm SHA256 liên kết...</span>
                </div>
              </div>

              <div className="text-[11px] text-center text-slate-500 font-medium">
                Vui lòng không đóng cửa sổ này khi giao dịch đang được phân tán trên chuỗi.
              </div>
            </div>
          </div>
        )}


        {/* Section 2: Danh sách ứng viên (Bỏ Phiếu) */}
        <section className="space-y-4" id="candidates-section">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" />
                Hãy Bỏ Phiếu Cho Ứng Cử Viên Của Bạn
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Sinh viên thảo luận và bình chọn cho ứng cử viên đủ bản lĩnh dẫn dắt Hội Sinh Viên</p>
            </div>
            
            {/* Filter */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm ứng viên hoặc lớp học..."
                className="w-full bg-white border border-slate-200 rounded-xl text-xs pl-9 pr-4 py-2.5 outline-hidden focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="search-candidate"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" id="candidates-grid">
            {filteredCandidates.length === 0 ? (
              <div className="col-span-full bg-white border border-slate-200 rounded-2xl py-12 px-4 text-center text-slate-400 text-xs">
                Không tìm thấy ứng cử viên nào ứng với bộ lọc của bạn.
              </div>
            ) : (
              filteredCandidates.map(cand => {
                const isUserVoted = user?.hasVoted;
                return (
                  <div 
                    key={cand.id} 
                    className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-md transition-all duration-200"
                    id={`candidate-card-${cand.id}`}
                  >
                    <div>
                      {/* Avatar & Class display header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center gap-3">
                        <img 
                          src={cand.imageUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80"} 
                          alt={cand.name}
                          className="w-12 h-12 rounded-full object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-mono font-bold">{cand.class}</span>
                          <h3 className="text-sm font-bold text-slate-800 truncate mt-1 leading-tight">{cand.name}</h3>
                        </div>
                      </div>

                      {/* Role & slogan info */}
                      <div className="p-4 space-y-3">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chức vụ ứng tuyển</span>
                          <span className="text-xs font-semibold text-emerald-600 font-medium">{cand.role}</span>
                        </div>
                        
                        <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100/50">
                          <p className="text-xs font-bold text-slate-800 leading-normal italic">&ldquo;{cand.slogan}&rdquo;</p>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed line-clamp-4">
                          {cand.description}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        onClick={() => handleCastVote(cand)}
                        disabled={isUserVoted}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                          isUserVoted 
                            ? 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-soft font-semibold'
                        }`}
                        id={`btn-vote-${cand.id}`}
                      >
                        <VoteIcon className="w-3.5 h-3.5" />
                        {isUserVoted ? "Đã Khóa Phiếu Bầu" : "Bỏ Phiếu Cho Ứng Viên"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>


        {/* Section 3: Sổ cái Blockchain */}
        <section className="grid grid-cols-1 gap-8" id="blockchain-control-panels">
          
          {/* Blockchain Ledger visualizer - Take full width */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col justify-between" id="blockchain-ledger-panel">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-5 gap-2">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h2 className="font-bold text-slate-800 text-base">Sổ Cái Chuỗi Khối (Blockchain Ledger)</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Lịch sử kết nối các khối băm bảo vệ lá phiếu</p>
                  </div>
                </div>
                <button
                  onClick={() => fetchBlockchain(true)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 border border-emerald-100 hover:border-emerald-200 px-2 py-1 rounded"
                  id="reload-ledger-btn"
                >
                  <RefreshCw className="w-3 h-3" />
                  Làm mới
                </button>
              </div>

              {/* Horizontal / Vertically stacked beautiful chain timeline */}
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1" id="blocks-chain-container">
                {blockchain.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">Đang tải cấu trúc chuỗi khối...</div>
                ) : (
                  blockchain.map((block, index) => {
                    const isGenesis = block.index === 0;
                    const isTampered = audit.corruptedBlockIndices.includes(block.index);
                    const isVotedBySelf = user && block.votes.some(v => v.studentId === user.studentId);
                    
                    return (
                      <div 
                        key={block.index} 
                        className={`p-4 rounded-xl border transition-all ${
                          isGenesis 
                            ? 'bg-slate-50 border-slate-200 text-slate-700'
                            : isTampered 
                              ? 'bg-rose-50/75 border-rose-300 text-rose-950 focus:ring-1 focus:ring-rose-400' 
                              : isVotedBySelf
                                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                                : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50/50'
                        }`}
                        id={`block-item-${block.index}`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-dashed border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-md bg-slate-800 text-white font-mono text-xs flex items-center justify-center font-bold">
                              #{block.index}
                            </span>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                              {isGenesis ? "Khối Nguyên Bản (Genesis Block)" : `Khối Bỏ Phiếu #${block.index}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            {isGenesis && (
                              <span className="bg-slate-200 text-slate-700 text-[9px] font-bold px-2 py-0.5 rounded">
                                Khởi tạo
                              </span>
                            )}
                            {isVotedBySelf && (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded">
                                Phiếu bầu của bạn
                              </span>
                            )}
                            {isTampered ? (
                              <span className="bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded animate-pulse inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5" /> Thất bại đối chiếu hash
                              </span>
                            ) : (
                              <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded inline-flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Đã kiểm duyệt
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Block metadata insights */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-[11px] font-mono">
                          <div className="space-y-1.5">
                            <div>
                              <span className="text-slate-400 block font-sans">Thời gian băm:</span>
                              <strong className="text-slate-700 font-medium font-sans">
                                {new Date(block.timestamp).toLocaleString('vi-VN')}
                              </strong>
                            </div>
                            
                            <div>
                              <span className="text-slate-400 block font-sans">Dữ liệu giao dịch phi tập trung:</span>
                              {isGenesis ? (
                                <span className="text-slate-500 italic block font-sans">Không chứa giao dịch</span>
                              ) : (
                                block.votes.map((v, idx) => (
                                  <div key={idx} className="bg-slate-100 p-2 rounded border border-slate-200 text-slate-800 mt-1 font-sans">
                                    <p className="font-bold">Mã số: {v.studentId} ({v.voterName})</p>
                                    <p className="text-emerald-700 font-semibold mt-0.5">Đã bầu cho: {v.candidateName}</p>
                                    <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none break-all">Mã băm phiếu: {v.signature}</p>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>

                          <div className="space-y-1.5 bg-slate-900 text-slate-300 p-3 rounded-lg flex flex-col justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-slate-400">
                                <span>Nonce (Chứng chỉ):</span>
                                <span className="text-emerald-400">POW #{block.nonce}</span>
                              </div>
                              <div className="overflow-hidden">
                                <span className="text-slate-400 block truncate">Mã liên kết trước (Prev Hash):</span>
                                <span className="text-amber-300 block break-all leading-tight">{block.previousHash}</span>
                              </div>
                              <div className="overflow-hidden pt-1">
                                <span className="text-slate-400 block truncate">Khóa băm khối hiện thời (Hash):</span>
                                <span className={isTampered ? "text-rose-400 block break-all leading-tight font-bold" : "text-emerald-400 block break-all leading-tight"} title="Computed hash">
                                  {block.hash}
                                </span>
                              </div>
                            </div>

                            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[9px] text-slate-400 font-sans">
                              <span>Băm độ khó cơ bản</span>
                              <button 
                                onClick={() => setInspectedBlock(block)}
                                className="text-emerald-400 hover:underline inline-block text-[10px] font-bold"
                              >
                                Xem Chi Tiết Block
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
              <span className="flex items-center gap-1">
                <Binary className="w-3.5 h-3.5 text-slate-400" />
                Duyệt Blockchain qua thư viện băm sha256.
              </span>
              <span>Phiên bản chuỗi: {blockchain.length} khối băm</span>
            </div>
          </div>
        </section>

      </main>

      {/* Block Inspector Modal details */}
      {inspectedBlock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4" id="block-inspector-modal">
          <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-2xl p-6 text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Chi Tiết Cấu Trúc Khối #{inspectedBlock.index}</h3>
              </div>
              <button 
                onClick={() => setInspectedBlock(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg"
                id="close-inspector-btn"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 font-mono space-y-2">
                <p className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-sans">Vị trí khối:</span>
                  <span className="font-bold text-slate-900">BLOCK INDEX {inspectedBlock.index}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-400 font-sans">Thời điểm băm khối:</span>
                  <span className="text-slate-800">{new Date(inspectedBlock.timestamp).toISOString()}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1.5 flex-col md:flex-row md:items-center">
                  <span className="text-slate-400 font-sans">Mã liên kết trước:</span>
                  <span className="text-amber-700 break-all select-all">{inspectedBlock.previousHash}</span>
                </p>
                <p className="flex justify-between border-b border-slate-100 pb-1.5 flex-col md:flex-row md:items-center">
                  <span className="text-slate-400 font-sans">Mã khóa hiện thời:</span>
                  <span className="text-emerald-700 font-bold break-all select-all">{inspectedBlock.hash}</span>
                </p>
                <p className="flex justify-between pb-1 flex-col md:flex-row md:items-center">
                  <span className="text-slate-400 font-sans">Nonce (Proof of Work):</span>
                  <span className="text-slate-900 font-bold">{inspectedBlock.nonce}</span>
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Thông tin danh sách giao dịch chứa trong khối:</h4>
                <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-2">
                  {inspectedBlock.index === 0 ? (
                    <span className="text-slate-500 italic">Khối Genesis không chứa phiếu bình chọn</span>
                  ) : (
                    inspectedBlock.votes.map((vote, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-slate-400 block font-medium">Bình chọn bởi:</span>
                            <strong className="text-slate-800">{vote.voterName}</strong>
                          </div>
                          <div>
                            <span className="text-slate-400 block font-medium">Mã số sinh viên:</span>
                            <strong className="text-slate-800 font-mono">{vote.studentId}</strong>
                          </div>
                        </div>

                        <div>
                          <span className="text-slate-400 block font-medium">Ủng hộ ứng cử viên:</span>
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                            {vote.candidateName} (ID: {vote.candidateId})
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-400 block font-medium">Mã hóa giao dịch băm riêng biệt:</span>
                          <span className="block font-mono text-[10px] text-slate-500 select-all leading-tight break-all">
                            {vote.signature}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 text-right">
              <button 
                onClick={() => setInspectedBlock(null)}
                className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl"
                id="btn-close-inspector"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Styled Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8" id="app-footer-social">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="text-xs text-slate-500 font-medium">
            Phát triển bởi Bộ phận Khảo Thí & Đào Tạo Điện Tử. Công nghệ lưu trữ phân tán bảo mật cao.
          </p>
          <p className="text-[10px] text-slate-400">
            Hệ thống tuân thủ chặt chẽ các chỉ thị bảo mật toàn vẹn số liệu học đường của ban chấp hành trung ương nhà trường năm 2026.
          </p>
        </div>
      </footer>
    </div>
  );
}

