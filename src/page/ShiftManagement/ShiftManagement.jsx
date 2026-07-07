import React, { useState, useEffect, useCallback } from 'react';
import './ShiftManagement.css';
import shiftApi from '@/services/shiftApi';
import staffApi from '@/services/staffApi';
import { FilterBar } from '@/components/common/filter-bar';

// Helper: get Monday of the week containing refDate
const getWeekBounds = (refDate) => {
    const d = new Date(refDate);
    const day = d.getDay(); // 0=Sun, 1=Mon...
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
};

const formatDate = (date) => date.toISOString().split('T')[0];

const getWeekDays = (monday) => {
    const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();
    return dayLabels.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return {
            label,
            date: d.getDate(),
            fullDate: formatDate(d),
            isActive: formatDate(d) === formatDate(today)
        };
    });
};

const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const ShiftManagement = () => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [weekDays, setWeekDays] = useState([]);
    // shiftsByDay: { "YYYY-MM-DD": { Morning: [ShiftDTO], Afternoon: [ShiftDTO], Night: [ShiftDTO] } }
    const [shiftsByDay, setShiftsByDay] = useState({});
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Add shift modal state
    const [showAddModal, setShowAddModal] = useState(false);
    const [addForm, setAddForm] = useState({ staffId: '', shiftDate: '', shiftType: 'MORNING', startTime: '', endTime: '', note: '' });
    const [saving, setSaving] = useState(false);

    // Staff detail panel state
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [staffShifts, setStaffShifts] = useState([]);
    const [loadingStaffShifts, setLoadingStaffShifts] = useState(false);
    const [showStaffModal, setShowStaffModal] = useState(false);

    // Search state
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchShifts = useCallback(async (refDate) => {
        const { monday, sunday } = getWeekBounds(refDate);
        const days = getWeekDays(monday);
        setWeekDays(days);
        setLoading(true);

        try {
            const start = formatDate(monday);
            const end = formatDate(sunday);
            const response = await shiftApi.getShiftsBetweenDates(start, end);
            const data = response.data || [];

            // Group by shiftDate and shiftType — exact field names from ShiftDTO
            const grouped = {};
            days.forEach(d => {
                grouped[d.fullDate] = { MORNING: [], AFTERNOON: [], NIGHT: [] };
            });

            data.forEach(shift => {
                const date = shift.shiftDate; // "YYYY-MM-DD" from LocalDate
                const type = shift.shiftType; // "MORNING" | "AFTERNOON" | "NIGHT"

                if (date && grouped[date]) {
                    if (grouped[date][type] !== undefined) {
                        grouped[date][type].push(shift);
                    }
                }
            });

            setShiftsByDay(grouped);
        } catch (error) {
            console.error('Failed to fetch shifts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchStaff = useCallback(async () => {
        try {
            const response = await staffApi.getAllStaff();
            setStaffList(response.data || []);
        } catch (error) {
            console.error('Failed to fetch staff:', error);
        }
    }, []);

    useEffect(() => {
        fetchShifts(currentDate);
        fetchStaff();
    }, [currentDate, fetchShifts, fetchStaff]);

    const goToPrevWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() - 7);
        setCurrentDate(d);
    };

    const goToNextWeek = () => {
        const d = new Date(currentDate);
        d.setDate(d.getDate() + 7);
        setCurrentDate(d);
    };

    const goToToday = () => setCurrentDate(new Date());

    const handleOpenAddModal = (date, type) => {
        setAddForm({ staffId: staffList[0]?.id || '', shiftDate: date, shiftType: type, startTime: '', endTime: '', note: '' });
        setShowAddModal(true);
    };

    const handleAddFormChange = (e) => {
        const { name, value } = e.target;
        setAddForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveShift = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Spring Boot LocalTime requires "HH:mm:ss" format, HTML time input sends "HH:mm"
            const toLocalTime = (t) => t ? `${t}:00` : null;

            await shiftApi.createShift({
                staffId: addForm.staffId,
                shiftDate: addForm.shiftDate,
                shiftType: addForm.shiftType,
                startTime: toLocalTime(addForm.startTime),
                endTime: toLocalTime(addForm.endTime),
                note: addForm.note || null
            });
            setShowAddModal(false);
            fetchShifts(currentDate);
        } catch (error) {
            console.error('Failed to create shift:', error);
            const errMsg = error?.response?.data?.message
                || error?.response?.data
                || error?.message
                || 'Unknown error';
            alert(`Failed to create shift: ${errMsg}`);
        } finally {
            setSaving(false);
        }
    };

    const handleStaffCardClick = async (staff) => {
        setSelectedStaff(staff);
        setShowStaffModal(true);
        setLoadingStaffShifts(true);
        try {
            const response = await shiftApi.getShiftsByStaff(staff.id);
            setStaffShifts(response.data || []);
        } catch (err) {
            console.error('Failed to fetch staff shifts:', err);
            setStaffShifts([]);
        } finally {
            setLoadingStaffShifts(false);
        }
    };

    const handleCloseStaffModal = () => {
        setShowStaffModal(false);
        setSelectedStaff(null);
        setStaffShifts([]);
    };

    const handleDeleteShift = async (shiftId) => {
        if (!window.confirm('Bạn có chắc muốn xóa ca làm việc này?')) return;
        try {
            await shiftApi.deleteShift(shiftId);
            if (isSearching) {
                const response = await shiftApi.searchShifts(searchQuery);
                setSearchResults(response.data || []);
            } else {
                fetchShifts(currentDate);
            }
        } catch (error) {
            console.error('Failed to delete shift:', error);
            alert('Failed to delete shift.');
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query || query.trim() === '') {
            setIsSearching(false);
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        setLoading(true);
        try {
            const response = await shiftApi.searchShifts(query);
            setSearchResults(response.data || []);
        } catch (error) {
            console.error('Lỗi khi tìm kiếm ca làm việc:', error);
            alert('Lỗi tìm kiếm: ' + (error.response?.data?.message || error.message));
        } finally {
            setLoading(false);
        }
    };

    const { monday } = getWeekBounds(currentDate);
    const monthLabel = `${MONTH_NAMES[monday.getMonth()]} ${monday.getFullYear()}`;

    const renderShiftBlock = (dayObj, type, labelClass, displayLabel) => {
        const dayShifts = shiftsByDay[dayObj.fullDate] || {};
        const shifts = dayShifts[type] || [];

        return (
            <div className="shift-block">
                <div className="shift-header">
                    <span className={`shift-label ${labelClass}`}>{displayLabel}</span>
                    <i
                        className="bi bi-plus add-shift-icon"
                        style={{ cursor: 'pointer' }}
                        title={`Thêm ca ${displayLabel}`}
                        onClick={() => handleOpenAddModal(dayObj.fullDate, type)}
                    ></i>
                </div>
                {shifts.map((shift, idx) => (
                    <div key={shift.shiftId || idx} className="staff-name text-truncate" title={shift.staffName}
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{shift.staffName}</span>
                        <i
                            className="bi bi-x text-danger"
                            style={{ cursor: 'pointer', flexShrink: 0 }}
                            title="Xóa ca làm việc"
                            onClick={() => handleDeleteShift(shift.shiftId)}
                        ></i>
                    </div>
                ))}
            </div>
        );
    };

    // Build staff overview from staffList (real API data now)
    const staffWithShiftCount = staffList.map(staff => {
        let count = 0;
        Object.values(shiftsByDay).forEach(day => {
            ['Morning', 'Afternoon', 'Night'].forEach(type => {
                count += (day[type] || []).filter(s => s.staffId === staff.id).length;
            });
        });
        return { ...staff, shiftCount: count, initials: (staff.name || '').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() };
    });

    return (
        <div className="shift-management-container">
            <div className="page-header pb-4 border-bottom mb-4">
                <h1 className="page-title">Quản Lý Ca Làm Việc</h1>
                <p className="page-subtitle">Phân công nhân viên vào ca Sáng, Chiều và Tối.</p>

                <div className="mt-4 max-w-md">
                    <FilterBar
                        onSearch={handleSearch}
                        onReset={() => handleSearch('')}
                    />
                </div>
            </div>

            {isSearching ? (
                <div className="search-results-panel">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="m-0">
                            Kết quả tìm kiếm cho: <span className="text-primary">"{searchQuery}"</span>
                        </h4>
                        <span className="text-muted">{searchResults.length} ca làm việc được tìm thấy</span>
                    </div>

                    {loading ? (
                        <div className="text-center py-5 text-muted"><i className="bi bi-arrow-repeat me-2"></i>Đang tải dữ liệu...</div>
                    ) : searchResults.length === 0 ? (
                        <div className="alert alert-info py-4 text-center">
                            Không tìm thấy ca làm việc nào khớp với từ khóa.
                        </div>
                    ) : (
                        <div className="card shadow-sm border-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>#</th>
                                            <th>Nhân Viên</th>
                                            <th>Ngày</th>
                                            <th>Ca Làm</th>
                                            <th>Giờ Bắt Đầu</th>
                                            <th>Giờ Kết Thúc</th>
                                            <th>Ghi Chú</th>
                                            <th className="text-center">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((shift, idx) => (
                                            <tr key={shift.shiftId || idx}>
                                                <td className="text-muted">{idx + 1}</td>
                                                <td className="fw-medium">{shift.staffName}</td>
                                                <td>{shift.shiftDate}</td>
                                                <td>
                                                    <span className={`shift-label ${shift.shiftType === 'MORNING' ? 'label-morning' : shift.shiftType === 'AFTERNOON' ? 'label-afternoon' : 'label-night'}`}>
                                                        {shift.shiftType === 'MORNING' ? 'Buổi Sáng' : shift.shiftType === 'AFTERNOON' ? 'Buổi Chiều' : 'Ban Đêm'}
                                                    </span>
                                                </td>
                                                <td>{shift.startTime || '—'}</td>
                                                <td>{shift.endTime || '—'}</td>
                                                <td>{shift.note || '—'}</td>
                                                <td className="text-center">
                                                    <button
                                                        className="btn btn-sm btn-outline-danger border-0"
                                                        onClick={() => handleDeleteShift(shift.shiftId)}
                                                        title="Xóa ca làm"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <>
                    <div className="calendar-panel">
                        <div className="calendar-header">
                            <h2 className="month-title">{monthLabel}</h2>
                            <div className="calendar-nav">
                                <button className="nav-btn" onClick={goToPrevWeek}><i className="bi bi-chevron-left"></i></button>
                                <button className="nav-btn-today" onClick={goToToday}>Hôm Nay</button>
                                <button className="nav-btn" onClick={goToNextWeek}><i className="bi bi-chevron-right"></i></button>
                            </div>
                        </div>

                        <div className="calendar-legend">
                            <div className="legend-item"><span className="dot dot-morning"></span><strong>Buổi Sáng</strong> (06:00 - 14:00)</div>
                            <div className="legend-item"><span className="dot dot-afternoon"></span><strong>Buổi Chiều</strong> (14:00 - 22:00)</div>
                            <div className="legend-item"><span className="dot dot-night"></span><strong>Ban Đêm</strong> (22:00 - 06:00)</div>
                        </div>

                        {loading ? (
                            <div className="text-center py-5 text-muted"><i className="bi bi-arrow-repeat me-2"></i>Đang tải dữ liệu...</div>
                        ) : (
                            <div className="calendar-grid">
                                {weekDays.map((dayObj, index) => (
                                    <div key={index} className={`day-column ${dayObj.isActive ? 'active-day' : ''}`}>
                                        <div className="day-header">
                                            <div className="day-name">{dayObj.label}</div>
                                            <div className="day-number">{dayObj.date}</div>
                                        </div>
                                        {renderShiftBlock(dayObj, 'MORNING', 'label-morning', 'Buổi Sáng')}
                                        {renderShiftBlock(dayObj, 'AFTERNOON', 'label-afternoon', 'Buổi Chiều')}
                                        {renderShiftBlock(dayObj, 'NIGHT', 'label-night', 'Ban Đêm')}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Staff Overview Panel */}
                    <div className="staff-overview-panel">
                        <h3 className="overview-title">
                            Tổng Quan Nhân Viên
                            <small className="text-muted fs-6 fw-normal ms-2">({staffWithShiftCount.length} nhân viên)</small>
                        </h3>
                        {staffWithShiftCount.length === 0 ? (
                            <p className="text-muted">Không có dữ liệu nhân viên.</p>
                        ) : (
                            <div className="staff-grid">
                                {staffWithShiftCount.map(staff => (
                                    <div
                                        key={staff.id}
                                        className="staff-card"
                                        onClick={() => handleStaffCardClick(staff)}
                                        style={{ cursor: 'pointer' }}
                                        title={`Xem lịch làm việc của ${staff.name}`}
                                    >
                                        <div className="staff-avatar">{staff.initials}</div>
                                        <div className="staff-info">
                                            <div className="staff-name-full text-truncate" title={staff.name}>{staff.name}</div>
                                            <div className="staff-role">{staff.role}</div>
                                        </div>
                                        <div className="staff-shift-count">{staff.shiftCount} ca</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Add Shift Modal */}
            {showAddModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Thêm Ca Làm Việc</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddModal(false)}></button>
                            </div>
                            <form onSubmit={handleSaveShift}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Nhân Viên</label>
                                        <select className="form-select" name="staffId" value={addForm.staffId} onChange={handleAddFormChange} required>
                                            <option value="">-- Chọn Nhân Viên --</option>
                                            {staffList.map(s => (
                                                <option key={s.id} value={s.id}>{s.id} - {s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Ngày Làm</label>
                                        <input type="date" className="form-control" name="shiftDate" value={addForm.shiftDate} onChange={handleAddFormChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Loại Ca</label>
                                        <select className="form-select" name="shiftType" value={addForm.shiftType} onChange={handleAddFormChange}>
                                            <option value="MORNING">Buổi Sáng (06:00 - 14:00)</option>
                                            <option value="AFTERNOON">Buổi Chiều (14:00 - 22:00)</option>
                                            <option value="NIGHT">Ban Đêm (22:00 - 06:00)</option>
                                        </select>
                                    </div>
                                    <div className="row">
                                        <div className="col">
                                            <label className="form-label">Giờ Bắt Đầu</label>
                                            <input type="time" className="form-control" name="startTime" value={addForm.startTime} onChange={handleAddFormChange} />
                                        </div>
                                        <div className="col">
                                            <label className="form-label">Giờ Kết Thúc</label>
                                            <input type="time" className="form-control" name="endTime" value={addForm.endTime} onChange={handleAddFormChange} />
                                        </div>
                                    </div>
                                    <div className="mb-3 mt-3">
                                        <label className="form-label">Ghi Chú</label>
                                        <input type="text" className="form-control" name="note" value={addForm.note} onChange={handleAddFormChange} placeholder="Tùy chọn..." />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light border" onClick={() => setShowAddModal(false)}>Hủy</button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? 'Đang Lưu...' : 'Lưu Ca Làm'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Staff Detail Modal */}
            {showStaffModal && selectedStaff && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="staff-avatar" style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                                        {selectedStaff.initials}
                                    </div>
                                    <div>
                                        <h5 className="modal-title mb-0">{selectedStaff.name}</h5>
                                        <small className="text-muted">{selectedStaff.role} · {selectedStaff.id}</small>
                                    </div>
                                </div>
                                <button type="button" className="btn-close" onClick={handleCloseStaffModal}></button>
                            </div>
                            <div className="modal-body">
                                {loadingStaffShifts ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="bi bi-arrow-repeat me-2"></i>Đang tải lịch làm việc...
                                    </div>
                                ) : staffShifts.length === 0 ? (
                                    <div className="text-center py-4 text-muted">
                                        <i className="bi bi-calendar-x fs-2 d-block mb-2"></i>
                                        Chưa có ca làm việc nào được lên lịch.
                                    </div>
                                ) : (
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th>#</th>
                                                <th>Ngày</th>
                                                <th>Ca Làm</th>
                                                <th>Giờ Bắt Đầu</th>
                                                <th>Giờ Kết Thúc</th>
                                                <th>Ghi Chú</th>
                                                <th className="text-center">Xóa</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {staffShifts.map((shift, idx) => (
                                                <tr key={shift.shiftId || idx}>
                                                    <td className="text-muted">{idx + 1}</td>
                                                    <td>{shift.shiftDate}</td>
                                                    <td>
                                                        <span className={`shift-label ${shift.shiftType === 'MORNING' ? 'label-morning' : shift.shiftType === 'AFTERNOON' ? 'label-afternoon' : 'label-night'}`}>
                                                            {shift.shiftType === 'MORNING' ? 'Buổi Sáng' : shift.shiftType === 'AFTERNOON' ? 'Buổi Chiều' : 'Ban Đêm'}
                                                        </span>
                                                    </td>
                                                    <td>{shift.startTime || '—'}</td>
                                                    <td>{shift.endTime || '—'}</td>
                                                    <td>{shift.note || '—'}</td>
                                                    <td className="text-center">
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={async () => {
                                                                if (!window.confirm('Xóa ca làm việc này?')) return;
                                                                try {
                                                                    await shiftApi.deleteShift(shift.shiftId);
                                                                    setStaffShifts(prev => prev.filter(s => s.shiftId !== shift.shiftId));
                                                                    fetchShifts(currentDate);
                                                                } catch {
                                                                    alert('Xóa thất bại.');
                                                                }
                                                            }}
                                                        >
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="modal-footer">
                                <span className="me-auto text-muted small">Tổng: {staffShifts.length} ca làm việc</span>
                                <button type="button" className="btn btn-light border" onClick={handleCloseStaffModal}>Đóng</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShiftManagement;
