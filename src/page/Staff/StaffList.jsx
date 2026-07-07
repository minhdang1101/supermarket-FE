import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import './StaffList.css';
import staffApi from '@/services/staffApi';

const StaffList = () => {
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [shiftFilter, setShiftFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState(null);

    const initialFormData = {
        id: '',
        name: '',
        role: 'CASHIER',
        shift: 'Morning',
        status: 'Active',
        phone: ''
    };
    const [formData, setFormData] = useState(initialFormData);

    // Fetch real staff from backend
    const fetchStaff = async () => {
        setLoading(true);
        try {
            const response = await staffApi.getAllStaff();
            // StaffDTO: { id: "EMP001", name, role, shift, status, phone }
            setStaffList(response.data || []);
        } catch (error) {
            console.error('Failed to fetch staff list', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    // Live clock
    const [currentTime, setCurrentTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter logic
    const filteredStaff = staffList.filter(staff => {
        const staffName = staff.name || '';
        const staffId = staff.id ? String(staff.id) : '';
        const matchesSearch = staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staffId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All' || staff.role === roleFilter;
        const matchesShift = shiftFilter === 'All' || staff.shift === shiftFilter;
        const matchesStatus = statusFilter === 'All' || staff.status === statusFilter;

        return matchesSearch && matchesRole && matchesShift && matchesStatus;
    });

    // --- Action Handlers ---

    const handleOpenAddModal = () => {
        setFormData(initialFormData);
        setModalMode('add');
        setShowModal(true);
    };

    const handleOpenEditModal = (staff) => {
        setFormData(staff);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(initialFormData);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveStaff = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                await staffApi.createStaff({
                    name: formData.name,
                    role: formData.role,
                    shift: formData.shift,
                    status: formData.status,
                    phone: formData.phone
                });
            } else {
                await staffApi.updateStaff(formData.id, {
                    name: formData.name,
                    role: formData.role,
                    shift: formData.shift,
                    status: formData.status,
                    phone: formData.phone
                });
            }
            await fetchStaff();
            handleCloseModal();
        } catch (error) {
            console.error('Failed to save staff:', error);
            // Hiển thị thông báo lỗi chi tiết từ backend
            const errMsg = error?.response?.data?.message
                || error?.response?.data
                || error?.message
                || 'Unknown error';
            alert(`Save failed: ${errMsg}`);
        }
    };

    const handleOpenDeleteModal = (staff) => {
        setStaffToDelete(staff);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setStaffToDelete(null);
    };

    const confirmDelete = async () => {
        if (!staffToDelete?.id) return;
        try {
            await staffApi.deleteStaff(staffToDelete.id);
            await fetchStaff();
            handleCloseDeleteModal();
        } catch (error) {
            console.error('Failed to delete staff', error);
            alert('Failed to delete staff.');
        }
    };

    return (
        <div className="staff-container">
            {/* Live Clock Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                padding: '12px 24px',
                marginBottom: '20px',
                color: '#fff',
                boxShadow: '0 4px 15px rgba(102,126,234,0.35)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i className="bi bi-clock-fill" style={{ fontSize: 22 }}></i>
                    <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
                        {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                    </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 15, opacity: 0.92 }}>
                    <i className="bi bi-calendar3"></i>
                    <span>
                        {currentTime.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </span>
                </div>
            </div>

            <div className="staff-header">
                <div>
                    <h1 className="page-title">Quản Lý Nhân Viên</h1>
                    <p className="page-subtitle">Quản lý nhân viên bao gồm Thu Ngân, Nhân Viên Kho và Bảo Vệ.</p>
                </div>
                <button className="btn-add-staff" onClick={handleOpenAddModal}>
                    <i className="bi bi-plus"></i> Thêm Nhân Viên
                </button>
            </div>

            <div className="staff-list-card">
                <div className="list-header">
                    <h2 className="list-title">Danh Sách Nhân Viên {!loading && <span className="text-muted fs-6 fw-normal">({staffList.length} nhân viên)</span>}</h2>
                </div>

                <div className="list-filters-container">
                    <div className="search-bar w-100 mb-3">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên hoặc ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdowns">
                        <div className="filter-dropdown">
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="custom-select">
                                <option value="All">Tất Cả Chức Vụ</option>
                                <option value="CASHIER">Thu Ngân</option>
                                <option value="WAREHOUSE_MANAGER">Quản Lý Kho</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div className="filter-dropdown">
                            <select value={shiftFilter} onChange={(e) => setShiftFilter(e.target.value)} className="custom-select">
                                <option value="All">Tất Cả Ca</option>
                                <option value="Morning">Buổi Sáng</option>
                                <option value="Afternoon">Buổi Chiều</option>
                                <option value="Night">Ban Đêm</option>
                            </select>
                        </div>
                        <div className="filter-dropdown">
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="custom-select">
                                <option value="All">Tất Cả Trạng Thái</option>
                                <option value="Active">Hoạt Động</option>
                                <option value="Inactive">Ngưng Hoạt Động</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Mã NV</th>
                                <th>Họ Tên</th>
                                <th>Chức Vụ</th>
                                <th>Ca Làm</th>
                                <th>Trạng Thái</th>
                                <th>Số Điện Thoại</th>
                                <th className="text-center">Thào Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        <i className="bi bi-arrow-repeat me-2"></i>Đang tải dữ liệu...
                                    </td>
                                </tr>
                            ) : filteredStaff.map((staff) => (
                                <tr key={staff.id}>
                                    <td className="fw-bold">{staff.id}</td>
                                    <td className="fw-medium text-dark">{staff.name}</td>
                                    <td>
                                        <span className={`role-badge role-${(staff.role || '').toLowerCase().replace('_', '-')}`}>
                                            {staff.role === 'CASHIER' ? 'Thu Ngân'
                                                : staff.role === 'WAREHOUSE_MANAGER' ? 'Quản Lý Kho'
                                                    : staff.role === 'ADMIN' ? 'Admin'
                                                        : staff.role}
                                        </span>
                                    </td>
                                    <td>{staff.shift}</td>
                                    <td>
                                        <span className={`status-badge status-${(staff.status || '').toLowerCase()}`}>
                                            {staff.status}
                                        </span>
                                    </td>
                                    <td>{staff.phone}</td>
                                    <td className="actions-cell">
                                        <button className="btn-action edit" title="Edit Staff" onClick={() => handleOpenEditModal(staff)}>
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button className="btn-action delete" title="Delete Staff" onClick={() => handleOpenDeleteModal(staff)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredStaff.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center py-4 text-muted">
                                        No staff found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{modalMode === 'add' ? 'Thêm Nhân Viên Mới' : 'Chỉnh Sửa Nhân Viên'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveStaff}>
                        <Form.Group className="mb-3">
                            <Form.Label>Họ Tên</Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleFormChange}
                                required
                                placeholder="Nhập họ và tên"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số Điện Thoại</Form.Label>
                            <Form.Control
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleFormChange}
                                required
                                placeholder="Nhập số điện thoại"
                            />
                        </Form.Group>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Chức Vụ</Form.Label>
                                    <Form.Select name="role" value={formData.role} onChange={handleFormChange}>
                                        <option value="CASHIER">Thu Ngân</option>
                                        <option value="WAREHOUSE_MANAGER">Quản Lý Kho</option>
                                        <option value="ADMIN">Admin</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Ca Làm Việc</Form.Label>
                                    <Form.Select name="shift" value={formData.shift} onChange={handleFormChange}>
                                        <option value="Morning">Buổi Sáng</option>
                                        <option value="Afternoon">Buổi Chiều</option>
                                        <option value="Night">Ban Đêm</option>
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>
                        <Form.Group className="mb-3">
                            <Form.Label>Trạng Thái</Form.Label>
                            <Form.Select name="status" value={formData.status} onChange={handleFormChange}>
                                <option value="Active">Hoạt Động</option>
                                <option value="Inactive">Ngưng Hoạt Động</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-light border" onClick={handleCloseModal}>
                                Hủy
                            </button>
                            <button type="submit" className="btn-add-staff" style={{ padding: '8px 16px' }}>
                                {modalMode === 'add' ? 'Thêm Nhân Viên' : 'Lưu Thay Đổi'}
                            </button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered backdrop="static">
                <Modal.Header closeButton className="border-0 pb-0">
                </Modal.Header>
                <Modal.Body className="text-center pt-0 pb-4">
                    <div className="mb-3 text-danger">
                        <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h4 className="mb-3">Xóa Nhân Viên?</h4>
                    <p className="text-muted mb-4">
                        Bạn có chắc muốn xóa <strong className="text-dark">{staffToDelete?.name}</strong>?
                        Hành động này không thể hoàn tác.
                    </p>
                    <div className="d-flex justify-content-center gap-3">
                        <button type="button" className="btn btn-light border px-4" onClick={handleCloseDeleteModal}>
                            Hủy
                        </button>
                        <button type="button" className="btn btn-danger px-4" onClick={confirmDelete}>
                            Xóa
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default StaffList;
