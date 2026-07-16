import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Login/Login.css';
import { authService } from '@/services/authService';
import {
  BarChart3,
  Box,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  Mail,
  Phone,
  Store,
  User,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      await authService.register({
        name: formData.name.trim(),
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'CASHIER',
        status: 'Active',
      });
      setSuccess('Tạo tài khoản thành công. Đang chuyển về màn đăng nhập...');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Không rõ lỗi';
      setError(`Tạo tài khoản thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

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
        Một nền tảng toàn diện giúp bạn quản lý nhân viên, ca làm việc, kho hàng và doanh thu trong cùng một hệ thống.
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
            <p className="login-subtitle">Tạo tài khoản nhân viên mới để sử dụng hệ thống</p>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="alert">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label className="form-label-custom">Họ Và Tên</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon-left" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="Nguyễn Văn A"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Tên Đăng Nhập</label>
              <div className="input-with-icon">
                <UserCheck size={18} className="input-icon-left" />
                <input
                  type="text"
                  className="form-control"
                  placeholder="nguyenvana"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Số Điện Thoại</label>
              <div className="input-with-icon">
                <Phone size={18} className="input-icon-left" />
                <input
                  type="tel"
                  className="form-control"
                  placeholder="0901234567"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group-custom">
              <label className="form-label-custom">Mật Khẩu</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon-left" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                {showConfirmPassword ? (
                  <EyeOff size={18} className="input-icon-right" onClick={() => setShowConfirmPassword(false)} />
                ) : (
                  <Eye size={18} className="input-icon-right" onClick={() => setShowConfirmPassword(true)} />
                )}
              </div>
            </div>

            <button type="submit" className="btn-login mt-4" disabled={loading}>
              {loading ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <>
                  <UserCheck size={20} />
                  <span>Đăng Ký Ngay</span>
                </>
              )}
            </button>

            <div className="register-prompt">
              Đã có tài khoản? <Link to="/login" className="register-link">Đăng nhập ngay</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
