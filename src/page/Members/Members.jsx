import React, { useState, useEffect } from 'react';
import { Modal, Form } from 'react-bootstrap';
import './Members.css';
import customerApi from '@/services/customerApi';

const Members = () => {
    const [members, setMembers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [rankFilter, setRankFilter] = useState('All');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [memberToDelete, setMemberToDelete] = useState(null);

    const initialFormData = {
        id: '', // Used for frontend state/edits, but backend might use a different ID depending on schema
        name: '',
        phone: '',
        email: '',
        points: 0,
        rank: 'Bronze'
    };
    const [formData, setFormData] = useState(initialFormData);

    const fetchCustomers = async () => {
        try {
            const response = await customerApi.getAllCustomers();
            // Assuming response.data returns an array of CustomerDTO objects
            setMembers(response.data || []);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    // Calculate stats
    const totalMembers = members.length;
    const totalPoints = members.reduce((sum, member) => sum + Number(member.points), 0);
    const averagePoints = totalMembers > 0 ? Math.round(totalPoints / totalMembers) : 0;

    // Filter logic
    const filteredMembers = members.filter(member => {
        const memberName = member.name || '';
        const memberPhone = member.phone || '';
        const memberId = member.id ? member.id.toString() : '';

        const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            memberPhone.includes(searchTerm) ||
            memberId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRank = rankFilter === 'All' || member.rank === rankFilter;

        return matchesSearch && matchesRank;
    });

    const formatPoints = (points) => {
        return new Intl.NumberFormat('de-DE').format(points);
    };

    // --- Action Handlers ---

    const handleOpenAddModal = () => {
        setFormData(initialFormData);
        setModalMode('add');
        setShowModal(true);
    };

    const handleOpenEditModal = (member) => {
        setFormData(member);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData(initialFormData);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'points' ? Number(value) : value }));
    };

    const handleSaveMember = async (e) => {
        e.preventDefault();

        try {
            if (modalMode === 'add') {
                const payload = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    points: formData.points,
                    rank: formData.rank || 'Bronze'
                };
                await customerApi.createCustomer(payload);
            } else {
                const payload = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    points: formData.points,
                    rank: formData.rank
                };
                await customerApi.updateCustomer(formData.id, payload);
            }
            await fetchCustomers();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save customer", error);
            alert("An error occurred while saving the member. Please try again.");
        }
    };

    const handleOpenDeleteModal = (member) => {
        setMemberToDelete(member);
        setShowDeleteModal(true);
    };

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false);
        setMemberToDelete(null);
    };

    const confirmDelete = async () => {
        if (!memberToDelete || !memberToDelete.id) return;
        try {
            await customerApi.deleteCustomer(memberToDelete.id);
            await fetchCustomers();
            handleCloseDeleteModal();
        } catch (error) {
            console.error("Failed to delete customer", error);
            alert("Failed to delete member.");
        }
    };


    return (
        <div className="members-container">
            <div className="members-header">
                <div>
                    <h1 className="page-title">Thành Viên Thân Thiết</h1>
                    <p className="page-subtitle">Quản lý thẻo và điểm tích lũy của khách hàng.</p>
                </div>
                <button className="btn-add-member" onClick={handleOpenAddModal}>
                    <i className="bi bi-plus"></i> Thêm Thành Viên
                </button>
            </div>

            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-title">
                        Tổng Thành Viên
                        <i className="bi bi-person-vcard text-muted"></i>
                    </div>
                    <div className="stat-value">{totalMembers}</div>
                    <div className="stat-desc">Tài khoản thân thiết hoạt động</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">
                        Tổng Điểm
                        <i className="bi bi-coin text-muted"></i>
                    </div>
                    <div className="stat-value">{formatPoints(totalPoints)}</div>
                    <div className="stat-desc">Điểm đang lưu hành</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">
                        Điểm Trung Bình
                        <i className="bi bi-graph-up text-muted"></i>
                    </div>
                    <div className="stat-value">{formatPoints(averagePoints)}</div>
                    <div className="stat-desc">Điểm mỗi thành viên</div>
                </div>
            </div>

            <div className="members-list-card">
                <div className="list-header">
                    <h2 className="list-title">Danh Sách Thành Viên</h2>
                </div>

                <div className="list-filters">
                    <div className="search-bar">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, điện thoại hoặc mã thẻ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-dropdown">
                        <select
                            value={rankFilter}
                            onChange={(e) => setRankFilter(e.target.value)}
                            className="rank-select"
                        >
                            <option value="All">Tất Cả Hạng</option>
                            <option value="Bronze">Bạc Đồng</option>
                            <option value="Silver">Bạc</option>
                            <option value="Gold">Vàng</option>
                            <option value="Platinum">Bạch Kim</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="members-table">
                        <thead>
                            <tr>
                                <th>Mã Thẻ</th>
                                <th>Họ Tên</th>
                                <th>Số Điện Thoại</th>
                                <th>Email</th>
                                <th>Số Điểm</th>
                                <th>Hạng</th>
                                <th>Ngày Tham Gia</th>
                                <th className="text-center">Thào Tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredMembers.map((member) => (
                                <tr key={member.id}>
                                    <td className="fw-medium">{member.id}</td>
                                    <td className="fw-semibold text-dark">{member.name}</td>
                                    <td>{member.phone}</td>
                                    <td>{member.email}</td>
                                    <td className="fw-semibold">{formatPoints(member.points)} pts</td>
                                    <td>
                                        <span className={`badge rank-${(member.rank || 'Bronze').toLowerCase()}`}>
                                            {member.rank || 'Bronze'}
                                        </span>
                                    </td>
                                    <td>{member.joinDate || 'N/A'}</td>
                                    <td className="actions-cell">
                                        <button className="btn-action edit" title="Edit Member" onClick={() => handleOpenEditModal(member)}>
                                            <i className="bi bi-pencil-square"></i>
                                        </button>
                                        <button className="btn-action delete" title="Delete Member" onClick={() => handleOpenDeleteModal(member)}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredMembers.length === 0 && (
                                <tr>
                                    <td colSpan="8" className="text-center py-4 text-muted">
                                        Không tìm thấy thành viên nào.
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
                    <Modal.Title>{modalMode === 'add' ? 'Thêm Thành Viên Mới' : 'Chỉnh Sửa Thành Viên'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSaveMember}>
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
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                required
                                placeholder="Nhập địa chỉ email"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số Điểm</Form.Label>
                            <Form.Control
                                type="number"
                                name="points"
                                value={formData.points}
                                onChange={handleFormChange}
                                required
                                min="0"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Hạng</Form.Label>
                            <Form.Select name="rank" value={formData.rank} onChange={handleFormChange}>
                                <option value="Bronze">Bronze</option>
                                <option value="Silver">Silver</option>
                                <option value="Gold">Gold</option>
                                <option value="Platinum">Platinum</option>
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-end gap-2 mt-4">
                            <button type="button" className="btn btn-light border" onClick={handleCloseModal}>
                                Hủy
                            </button>
                            <button type="submit" className="btn-add-member" style={{ padding: '8px 16px' }}>
                                {modalMode === 'add' ? 'Thêm Thành Viên' : 'Lưu Thay Đổi'}
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
                    <h4 className="mb-3">Xóa Thành Viên?</h4>
                    <p className="text-muted mb-4">
                        Bạn có chắc muốn xóa <strong className="text-dark">{memberToDelete?.name}</strong>?
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

export default Members;
