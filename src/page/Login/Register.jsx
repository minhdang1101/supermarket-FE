import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Login/Login.css'; // Reusing the same styling
import { 
  Store, 
  Users, 
  Box, 
  BarChart3, 
  Heart, 
  UserPlus, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  UserCheck
} from 'lucide-react';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const LeftPanel = () => (
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
                Một nền tảng toàn diện giúp bạn quản lý nhân viên,
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
                        <span>Tự động cảnh báo khi tồn kho thấp</span>
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
                        <span>Quản lý thành viên và chương trình tri ân</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="login-container">
            <LeftPanel />
            <div className="login-right-panel">
                <div className="login-card">
                    <div className="login-logo">
                        <div className="login-logo-icon">
                            <UserPlus size={32} />
                        </div>
                        <h1 className="login-title">Đăng Ký</h1>
                        <p className="login-subtitle">Tạo tài khoản mới để trải nghiệm mua sắm tuyệt vời</p>
                    </div>

                <form>
                    <div className="form-group-custom">
                        <label className="form-label-custom">Họ Và Tên</label>
                        <div className="input-with-icon">
                            <User size={18} className="input-icon-left" />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>

                    <div className="form-group-custom">
                        <label className="form-label-custom">Email</label>
                        <div className="input-with-icon">
                            <Mail size={18} className="input-icon-left" />
                            <input
                                type="email"
                                className="form-control"
                                placeholder="example@email.com"
                            />
                        </div>
                    </div>

                    <div className="form-group-custom">
                        <label className="form-label-custom">Mật Khẩu</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon-left" />
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="••••••••"
                            />
                            {showPassword ? (
                                <EyeOff size={18} className="input-icon-right" onClick={() => setShowPassword(false)} />
                            ) : (
                                <Eye size={18} className="input-icon-right" onClick={() => setShowPassword(true)} />
                            )}
                        </div>
                    </div>

                    <div className="form-group-custom">
                        <label className="form-label-custom">Xác Nhận Mật Khẩu</label>
                        <div className="input-with-icon">
                            <Lock size={18} className="input-icon-left" />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                className="form-control"
                                placeholder="••••••••"
                            />
                            {showConfirmPassword ? (
                                <EyeOff size={18} className="input-icon-right" onClick={() => setShowConfirmPassword(false)} />
                            ) : (
                                <Eye size={18} className="input-icon-right" onClick={() => setShowConfirmPassword(true)} />
                            )}
                        </div>
                    </div>

                    <button type="button" className="btn-login mt-4">
                        <UserCheck size={20} />
                        <span>Đăng Ký Ngay</span>
                    </button>

                    <div className="register-prompt">
                        Đã có tài khoản? <Link to="/login" className="register-link">Đăng Nhập Ngay</Link>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
