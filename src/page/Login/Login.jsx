import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { 
  Store, 
  Users, 
  Box, 
  BarChart3, 
  Heart, 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Loader2,
  CheckCircle2
} from 'lucide-react';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { fetchProfile } = useAuth();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await authService.login(username, password);
            const token = response.data?.token;
            if (!token) {
                setError('Đăng nhập thất bại: Không nhận được token.');
                return;
            }
            authService.setAccessToken(token);
            const user = await fetchProfile();
            const role = user?.role;
            if (role === 'CASHIER') {
                navigate('/checkout');
            } else {
                navigate('/home');
            }
        } catch (err) {
            console.error('Login failed:', err);
            setError(getErrorMessage(err, 'Đăng nhập thất bại. Vui lòng thử lại.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">

            {/* ── Left branding panel ── */}
            <div className="login-left-panel">
                <div className="lp-brand">
                    <div className="lp-brand-icon">
                        <Store size={28} />
                    </div>
                    <div>
                        <div className="lp-brand-name">SuperMart</div>
                        <div className="lp-brand-sub">Hệ Thống Quản Lý</div>
                    </div>
                </div>

                <h2 className="lp-headline">
                    Thông Minh & Hiệu Quả<br />
                    <span>Quản Lý Siêu Thị</span>
                </h2>

                <p className="lp-desc">
                    Nền tảng toàn diện giúp bạn quản lý nhân viên,
                    ca làm việc, kho hàng và doanh thu — tất cả trong một hệ thống.
                </p>

                <div className="lp-features">
                    <div className="lp-feature-item" style={{ animationDelay: '0.1s' }}>
                        <div className="lp-feature-dot indigo"><Users size={22} /></div>
                        <div className="lp-feature-text">
                            <strong>Quản Lý Nhân Viên</strong>
                            <span>Theo dõi nhân viên, ca làm và hiệu suất</span>
                        </div>
                    </div>
                    <div className="lp-feature-item" style={{ animationDelay: '0.2s' }}>
                        <div className="lp-feature-dot green"><Box size={22} /></div>
                        <div className="lp-feature-text">
                            <strong>Theo Dõi Kho Hàng</strong>
                            <span>Cảnh báo hàng tồn kho tự động</span>
                        </div>
                    </div>
                    <div className="lp-feature-item" style={{ animationDelay: '0.3s' }}>
                        <div className="lp-feature-dot orange"><BarChart3 size={22} /></div>
                        <div className="lp-feature-text">
                            <strong>Báo Cáo Doanh Thu</strong>
                            <span>Phân tích dữ liệu bán hàng trực quan</span>
                        </div>
                    </div>
                    <div className="lp-feature-item" style={{ animationDelay: '0.4s' }}>
                        <div className="lp-feature-dot rose"><Heart size={22} /></div>
                        <div className="lp-feature-text">
                            <strong>Chăm Sóc Khách Hàng</strong>
                            <span>Quản lý thành viên và chương trình thân thiết</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="login-right-panel">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <ShieldCheck size={32} />
                        </div>
                        <h1 className="login-title">Đăng Nhập</h1>
                        <p className="login-subtitle">Chào mừng trở lại! Vui lòng đăng nhập để tiếp tục</p>
                    </div>

                    {error && <div className="alert alert-danger mb-3" role="alert">{error}</div>}

                    <form onSubmit={handleLogin}>
                        <div className="form-group-custom">
                            <label className="form-label-custom">Tên đăng nhập</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon-left" />
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Nhập tên đăng nhập"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group-custom">
                            <label className="form-label-custom">Mật khẩu</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon-left" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                {showPassword ? (
                                    <EyeOff 
                                        size={18} 
                                        className="input-icon-right" 
                                        onClick={() => setShowPassword(false)} 
                                    />
                                ) : (
                                    <Eye 
                                        size={18} 
                                        className="input-icon-right" 
                                        onClick={() => setShowPassword(true)} 
                                    />
                                )}
                            </div>
                        </div>

                        <div className="login-options">
                            <div className="form-check">
                                <input type="checkbox" className="form-check-input" id="rememberMe" />
                                <label className="form-check-label" htmlFor="rememberMe" style={{ fontSize: 13 }}>
                                    Ghi nhớ đăng nhập
                                </label>
                            </div>
                            <Link to="/reset-password" className="forgot-password-link">Quên mật khẩu?</Link>
                        </div>

                        <button type="submit" className="btn-login" disabled={loading}>
                            {loading ? (
                                <Loader2 size={22} className="animate-spin" />
                            ) : (
                                <>
                                    <LogIn size={20} />
                                    <span>Đăng Nhập</span>
                                </>
                            )}
                        </button>

                        {/* <div className="register-prompt">
                            Don't have an account?{' '}
                            <Link to="/register" className="register-link">Sign Up Now</Link>
                        </div> */}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
