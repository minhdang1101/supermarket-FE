import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../Login/Login.css';
import { authService } from '@/services/authService';
import {
  ArrowLeft,
  BarChart3,
  Box,
  Eye,
  EyeOff,
  Heart,
  Loader2,
  Lock,
  LogIn,
  Mail,
  MailCheck,
  SendHorizontal,
  ShieldCheck,
  Store,
  Users,
} from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setResetLink('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      const data = response.data || {};
      setSent(true);
      setSuccess(data.message || 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.');
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Không rõ lỗi';
      setError(`Gửi thất bại: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      setSuccess(response.data?.message || 'Mật khẩu đã được đặt lại thành công.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'Không rõ lỗi';
      setError(`Đặt lại thất bại: ${msg}`);
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

  if (token) {
    return (
      <div className="login-container">
        <LeftPanel />
        <div className="login-right-panel">
          <div className="login-card">
            <div className="login-logo">
              <div className="login-logo-icon">
                <ShieldCheck size={32} />
              </div>
              <h1 className="login-title">Đặt Lại Mật Khẩu</h1>
              <p className="login-subtitle">Nhập mật khẩu mới của bạn bên dưới</p>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            {success && <div className="alert alert-success" role="alert">{success}</div>}

            {!success && (
              <form onSubmit={handleResetPassword}>
                <div className="form-group-custom">
                  <label className="form-label-custom">Mật Khẩu Mới</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon-left" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    {showNew ? (
                      <EyeOff size={18} className="input-icon-right" onClick={() => setShowNew(false)} />
                    ) : (
                      <Eye size={18} className="input-icon-right" onClick={() => setShowNew(true)} />
                    )}
                  </div>
                </div>

                <div className="form-group-custom">
                  <label className="form-label-custom">Xác Nhận Mật Khẩu Mới</label>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon-left" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      className="form-control"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    {showConfirm ? (
                      <EyeOff size={18} className="input-icon-right" onClick={() => setShowConfirm(false)} />
                    ) : (
                      <Eye size={18} className="input-icon-right" onClick={() => setShowConfirm(true)} />
                    )}
                  </div>
                </div>

                <button type="submit" className="btn-login mt-3" disabled={loading}>
                  {loading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <>
                      <LogIn size={20} />
                      <span>Đặt Lại Mật Khẩu</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="register-prompt" style={{ marginTop: 16 }}>
              <Link to="/login" className="register-link">
                <ArrowLeft size={16} className="me-1 inline" /> Quay lại đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <LeftPanel />
      <div className="login-right-panel">
        <div className="login-card">
          <div className="login-logo">
            <div className="login-logo-icon">
              <Mail size={32} />
            </div>
            <h1 className="login-title">Quên Mật Khẩu</h1>
            <p className="login-subtitle">Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu</p>
          </div>

          {error && <div className="alert alert-danger" role="alert">{error}</div>}
          {success && <div className="alert alert-success" role="alert">{success}</div>}

          {!sent ? (
            <form onSubmit={handleForgotPassword}>
              <div className="form-group-custom">
                <label className="form-label-custom">Email Đã Đăng Ký</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon-left" />
                  <input
                    type="email"
                    className="form-control"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-login mt-4" disabled={loading}>
                {loading ? (
                  <Loader2 size={22} className="animate-spin" />
                ) : (
                  <>
                    <SendHorizontal size={20} />
                    <span>Gửi Liên Kết Đặt Lại</span>
                  </>
                )}
              </button>

              <div className="register-prompt">
                Nhớ mật khẩu?{' '}
                <Link to="/login" className="register-link">
                  <ArrowLeft size={16} className="me-1 inline" /> Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div style={{ textAlign: 'center', paddingTop: 8 }}>
              <MailCheck size={64} className="mx-auto mb-4" style={{ color: '#16a34a' }} />
              <p className="reset-instruction">
                Kiểm tra hộp thư của bạn tại <strong>{email}</strong> và nhấn vào liên kết để đặt lại mật khẩu.
              </p>
              {resetLink && (
                <div className="alert alert-info text-start" style={{ wordBreak: 'break-word' }}>
                  <strong>Link test vì chưa cấu hình gửi mail:</strong>
                  <br />
                  <a href={resetLink}>{resetLink}</a>
                </div>
              )}
              <p className="reset-expiry-note">
                Liên kết có hiệu lực trong <strong>15 phút</strong>.
              </p>
              <div className="register-prompt" style={{ marginTop: 12 }}>
                <Link to="/login" className="register-link">
                  <ArrowLeft size={16} className="me-1 inline" /> Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
