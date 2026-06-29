import React, { useState, useEffect, useRef } from 'react';
import './Profile.css';
import userApi from '@/services/userApi';
import shiftApi from '@/services/shiftApi';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
    const { fetchProfile } = useAuth();
    // Component State
    const [isEditing, setIsEditing] = useState(false);

    const [userData, setUserData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        joinDate: '',
        avatarUrl: ''
    });

    const fileInputRef = useRef(null);

    // Form Temporary State (used while editing)
    const [formData, setFormData] = useState({ ...userData });

    // Fetch Profile on Mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await userApi.getProfile();
                const fetchedData = response.data;
                // Mapping DTO to internal state shape based on exact response schema: {name, email, phone, role, createdAt}
                const mappedData = {
                    name: fetchedData.name || '',
                    email: fetchedData.email || '',
                    phone: fetchedData.phone || '',
                    role: fetchedData.role || '',
                    joinDate: fetchedData.createdAt || fetchedData.joinDate || '',
                    avatarUrl: fetchedData.avatarUrl || fetchedData.avatar || ''
                };
                setUserData(mappedData);
                setFormData(mappedData);
                setFormErrors({});
            } catch (err) {
                console.error("Error fetching profile", err);
            }
        };
        fetchProfile();
    }, []);

    useEffect(() => {
        const fetchUpcomingShifts = async () => {
            setLoadingShifts(true);
            try {
                const res = await shiftApi.getMyUpcomingShifts();
                setUpcomingShifts(res.data || []);
            } catch (err) {
                console.error('Error fetching upcoming shifts', err);
                setUpcomingShifts([]);
            } finally {
                setLoadingShifts(false);
            }
        };
        fetchUpcomingShifts();
    }, []);

    // Upcoming shifts
    const [upcomingShifts, setUpcomingShifts] = useState([]);
    const [loadingShifts, setLoadingShifts] = useState(false);

    // Password Form State
    const [passwords, setPasswords] = useState({
        current: '',
        new: '',
        confirm: ''
    });

    // Handlers
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords({
            ...passwords,
            [name]: value
        });
    };

    // Error state for validation
    const [formErrors, setFormErrors] = useState({});

    const toggleEdit = () => {
        if (isEditing) {
            // Cancel edit - revert changes and clear errors
            setFormData({ ...userData });
            setFormErrors({});
        }
        setIsEditing(!isEditing);
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setFormErrors({});
        try {
            // Send exact request schema: {name, email, phone}
            await userApi.updateProfile({
                name: formData.name,
                email: formData.email,
                phone: formData.phone
            });
            setUserData({ ...formData });
            setIsEditing(false);
            alert('Cập nhật hồ sơ thành công!');
        } catch (error) {
            console.error('Failed to update profile', error);
            if (error.response && error.response.status === 400 && error.response.data) {
                // If backend provides a map or string of validation errors
                // Adjust this depending on exact Spring Boot global exception handler format
                const backendErrors = error.response.data.errors || error.response.data;
                const fieldErrors = {};

                if (typeof backendErrors === 'object') {
                    // example: { "email": "Email is invalid", "phone": "Phone must be 10 digits" }
                    Object.keys(backendErrors).forEach(key => {
                        fieldErrors[key] = backendErrors[key];
                    });
                    setFormErrors(fieldErrors);
                } else {
                    setFormErrors({ general: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.' });
                }
            } else {
                alert('Cập nhật hồ sơ thất bại, vui lòng thử lại.');
            }
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // Upload the file to backend
            const response = await userApi.uploadAvatar(file);

            // Backend returns: { name, email, phone, role, avatar, createdAt }
            const newAvatarUrl = response.data?.avatar || URL.createObjectURL(file);

            setUserData(prev => ({
                ...prev,
                avatarUrl: newAvatarUrl
            }));
            await fetchProfile(); // Cập nhật user trong AuthContext để Topbar hiển thị avatar mới

            alert('Cập nhật ảnh đại diện thành công!');
        } catch (error) {
            console.error('Failed to upload avatar', error);
            alert('Tải ảnh thất bại. Vui lòng thử lại.');
        }
    };

    const handleSavePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert('Mật khẩu xác nhận không khớp!');
            return;
        }

        try {
            await userApi.changePassword({
                oldPassword: passwords.current,
                newPassword: passwords.new,
                confirmPassword: passwords.confirm
            });
            alert('Đổi mật khẩu thành công!');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            console.error('Failed to change password', error);
            alert('Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu hiện tại.');
        }
    };

    return (
        <div className="profile-container">
            {/* Hero banner */}
            <div className="profile-hero">
                <div className="profile-page-header">
                    <h1>Hồ Sơ Cá Nhân</h1>
                    <p>Quản lý thông tin cá nhân và cài đặt tài khoản</p>
                </div>
            </div>

            <div className="profile-layout">
                {/* Left Column: Sidebar */}
                <div className="sidebar-column">
                    <div className="profile-card sidebar-card">
                        <div className="avatar-wrapper" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                            <div className="avatar-circle">
                                {userData.avatarUrl ? (
                                    <img src={userData.avatarUrl.startsWith('http') ? userData.avatarUrl : `http://localhost:8080${userData.avatarUrl}`} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    userData.name ? userData.name.charAt(0).toUpperCase() : '?'
                                )}
                            </div>
                            <div className="camera-icon">
                                <i className="bi bi-camera-fill"></i>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        <h2 className="user-name">{userData.name}</h2>
                        <div className="user-title">{userData.role}</div>

                        <div className="status-badge">
                            <span className="status-dot"></span> Hoạt Động
                        </div>

                        <div className="contact-info-list">
                            <div className="contact-item">
                                <i className="bi bi-envelope"></i>
                                <span>{userData.email || '—'}</span>
                            </div>
                            <div className="contact-item">
                                <i className="bi bi-telephone"></i>
                                <span>{userData.phone || '—'}</span>
                            </div>
                            <div className="contact-item">
                                <i className="bi bi-calendar3"></i>
                                <span>Ngày Việc: {userData.joinDate || '—'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Content */}
                <div className="content-column">

                    {/* Card 1: Details Form */}
                    <div className="profile-card">
                        <div className="card-header-custom">
                            <h3 className="card-title">Thông Tin Chi Tiết</h3>
                            <button
                                className={`btn-edit ${isEditing ? 'active' : ''}`}
                                onClick={toggleEdit}
                                type="button"
                            >
                                <i className="bi bi-pencil"></i> {isEditing ? 'Hủy' : 'Chỉnh Sửa'}
                            </button>
                        </div>

                        <form onSubmit={handleSaveProfile}>
                            {formErrors.general && (
                                <div className="alert alert-danger mb-3" role="alert">
                                    {formErrors.general}
                                </div>
                            )}
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label className="custom-label">Họ Tên</label>
                                    <input
                                        type="text"
                                        className={`custom-input ${formErrors.name ? 'is-invalid' : ''}`}
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                    {formErrors.name && <div className="invalid-feedback d-block">{formErrors.name}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-label">Email</label>
                                    <input
                                        type="email"
                                        className={`custom-input ${formErrors.email ? 'is-invalid' : ''}`}
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                    {formErrors.email && <div className="invalid-feedback d-block">{formErrors.email}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="custom-label">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className={`custom-input ${formErrors.phone ? 'is-invalid' : ''}`}
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                    />
                                    {formErrors.phone && <div className="invalid-feedback d-block">{formErrors.phone}</div>}
                                </div>
                            </div>

                            {isEditing && (
                                <div className="form-actions">
                                    <button type="submit" className="btn-save">Lưu Thay Đổi</button>
                                </div>
                            )}
                        </form>
                    </div>

                    {/* Card: Ca làm việc sắp tới */}
                    <div className="profile-card">
                        <div className="card-header-custom">
                            <h3 className="card-title">
                                <i className="bi bi-calendar-check" style={{ marginRight: '8px' }}></i>
                                Ca Làm Việc Sắp Tới
                            </h3>
                        </div>
                        {loadingShifts ? (
                            <div className="upcoming-shifts-loading">
                                <span className="loading-spinner"></span>
                                Đang tải...
                            </div>
                        ) : upcomingShifts.length === 0 ? (
                            <div className="upcoming-shifts-empty">
                                <i className="bi bi-calendar-x"></i>
                                <p>Bạn chưa có ca làm việc nào sắp tới</p>
                            </div>
                        ) : (
                            <div className="upcoming-shifts-list">
                                {upcomingShifts.map((shift) => {
                                    const shiftTypeLabel = shift.shiftType === 'MORNING' ? 'Sáng' : shift.shiftType === 'AFTERNOON' ? 'Chiều' : 'Tối';
                                    const shiftTypeClass = shift.shiftType === 'MORNING' ? 'shift-morning' : shift.shiftType === 'AFTERNOON' ? 'shift-afternoon' : 'shift-night';
                                    const fmtTime = (t) => t ? String(t).slice(0, 5) : '--:--';
                                    const dateStr = shift.shiftDate ? new Date(shift.shiftDate).toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : '';
                                    return (
                                        <div key={shift.shiftId} className={`upcoming-shift-item ${shiftTypeClass}`}>
                                            <div className="shift-badge">{shiftTypeLabel}</div>
                                            <div className="shift-details">
                                                <span className="shift-date">{dateStr}</span>
                                                <span className="shift-time">Ca {fmtTime(shift.startTime)} – {fmtTime(shift.endTime)}</span>
                                                {shift.note && <span className="shift-note">{shift.note}</span>}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Card 2: Change Password */}
                    <div className="profile-card">
                        <div className="card-header-custom">
                            <h3 className="card-title">Đổi Mật Khẩu</h3>
                        </div>

                        <form onSubmit={handleSavePassword}>
                            <div className="form-grid">
                                <div className="form-group form-group-full">
                                    <label className="custom-label">Mật Khẩu Hiện Tại</label>
                                    <input
                                        type="password"
                                        className="custom-input"
                                        name="current"
                                        value={passwords.current}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-label">Mật Khẩu Mới</label>
                                    <input
                                        type="password"
                                        className="custom-input"
                                        name="new"
                                        value={passwords.new}
                                        onChange={handlePasswordChange}
                                        placeholder="Nhập mật khẩu mới"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="custom-label">Xác Nhận Mật Khẩu Mới</label>
                                    <input
                                        type="password"
                                        className="custom-input"
                                        name="confirm"
                                        value={passwords.confirm}
                                        onChange={handlePasswordChange}
                                        placeholder="Xác nhận mật khẩu mới"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="btn-save">Đổi Mật Khẩu</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;
