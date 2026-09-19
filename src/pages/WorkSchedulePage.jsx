import { useMemo, useState } from "react";
import { useDoctorWorkSchedules } from "../hooks";

const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const formatUpdatedAt = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }).format(date);
};

function WorkSchedulePage() {
    const { workSchedules, loading, error, fetchWorkSchedules, updateWorkSchedule } = useDoctorWorkSchedules();
    const [editingKey, setEditingKey] = useState("");
    const [editForm, setEditForm] = useState({ day_label: "", schedule_text: "" });
    const [savingKey, setSavingKey] = useState("");
    const [saveError, setSaveError] = useState("");

    const todaySchedule = useMemo(() => {
        const todayKey = DAY_KEYS[new Date().getDay()];
        return workSchedules.find((item) => item.day_key === todayKey) || null;
    }, [workSchedules]);

    const weekendCount = useMemo(() =>
        workSchedules.filter((item) => item.day_key === "saturday" || item.day_key === "sunday").length,
        [workSchedules]
    );

    const startEdit = (item) => {
        setEditingKey(item.day_key);
        setEditForm({
            day_label: item.day_label || "",
            schedule_text: item.schedule_text || ""
        });
        setSaveError("");
    };

    const cancelEdit = () => {
        setEditingKey("");
        setEditForm({ day_label: "", schedule_text: "" });
        setSaveError("");
    };

    const handleEditInput = (event) => {
        const { name, value } = event.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const saveEdit = async(dayKey) => {
        try {
            setSavingKey(dayKey);
            setSaveError("");
            await updateWorkSchedule(dayKey, editForm);
            cancelEdit();
        } catch (err) {
            setSaveError(err.message);
        } finally {
            setSavingKey("");
        }
    };

    const renderEditActions = (item) => {
        const isEditing = editingKey === item.day_key;
        const isSaving = savingKey === item.day_key;

        if (isEditing) {
            return (
                <div className="schedule-action-group">
                    <button
                        type="button"
                        className="btn btn-sm btn-success"
                        onClick={() => saveEdit(item.day_key)}
                        disabled={isSaving}
                    >
                        {isSaving ? "Đang lưu..." : "Lưu"}
                    </button>
                    <button type="button" className="btn btn-sm btn-light" onClick={cancelEdit} disabled={isSaving}>
                        Hủy
                    </button>
                </div>
            );
        }

        return (
            <button type="button" className="btn btn-sm btn-primary" onClick={() => startEdit(item)}>
                Sửa
            </button>
        );
    };

    return (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title">
                    <h2 className="card-title align-items-start flex-column">
                        <span className="card-label fw-bolder fs-3 mb-1">Lịch làm việc</span>
                        <span className="text-muted mt-1 fw-bold fs-7">Thời gian làm việc theo từng ngày</span>
                    </h2>
                </div>
                <div className="card-toolbar d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                    <button type="button" className="btn btn-sm btn-light btn-active-primary" onClick={fetchWorkSchedules} disabled={loading}>
                        Tải lại
                    </button>
                </div>
            </div>

            <div className="card-body py-4">
                {loading && <div className="alert alert-info">Đang tải lịch làm việc...</div>}
                {error && <div className="alert alert-danger">Lỗi: {error}</div>}
                {saveError && <div className="alert alert-danger">Lỗi lưu lịch: {saveError}</div>}

                <div className="schedule-summary-grid mb-5">
                    <div className="schedule-summary-item">
                        <span className="text-muted fw-bold fs-7">Hôm nay</span>
                        <strong>{todaySchedule?.day_label || "-"}</strong>
                        <span>{todaySchedule?.schedule_text || "Chưa có lịch"}</span>
                    </div>
                    <div className="schedule-summary-item">
                        <span className="text-muted fw-bold fs-7">Số ngày hiển thị</span>
                        <strong>{workSchedules.length}</strong>
                        <span>ngày đang bật</span>
                    </div>
                    <div className="schedule-summary-item">
                        <span className="text-muted fw-bold fs-7">Cuối tuần</span>
                        <strong>{weekendCount}</strong>
                        <span>ngày có lịch</span>
                    </div>
                </div>

                <div className="schedule-mobile-list">
                    {workSchedules.length === 0 && !loading ? (
                        <div className="text-center text-muted py-6">Chưa có dữ liệu lịch làm việc.</div>
                    ) : (
                        workSchedules.map((item) => {
                            const isEditing = editingKey === item.day_key;
                            return (
                                <article className="schedule-day-card" key={item.day_key}>
                                    <div className="schedule-day-card-main">
                                        {isEditing ? (
                                            <div className="schedule-edit-stack">
                                                <label className="form-label mb-1">Ngày</label>
                                                <input
                                                    type="text"
                                                    name="day_label"
                                                    className="form-control form-control-sm"
                                                    value={editForm.day_label}
                                                    onChange={handleEditInput}
                                                />
                                                <label className="form-label mb-1 mt-2">Thời gian</label>
                                                <input
                                                    type="text"
                                                    name="schedule_text"
                                                    className="form-control form-control-sm"
                                                    value={editForm.schedule_text}
                                                    onChange={handleEditInput}
                                                    placeholder="Ví dụ: 17:00 - 20:30"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="schedule-day-title">{item.day_label}</div>
                                                <div className="schedule-day-time">{item.schedule_text}</div>
                                            </>
                                        )}
                                    </div>
                                    <div className="schedule-day-card-side">
                                        <span className="badge badge-light-success">Đang bật</span>
                                        {renderEditActions(item)}
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                <div className="table-responsive schedule-desktop-table">
                    <table className="table align-middle table-row-dashed fs-6 gy-3">
                        <thead>
                            <tr className="text-start text-gray-900 fw-bolder fs-7 text-uppercase">
                                <th style={{ width: "90px" }}>STT</th>
                                <th style={{ width: "180px" }}>Ngày</th>
                                <th>Thời gian</th>
                                <th style={{ width: "150px" }}>Trạng thái</th>
                                <th style={{ width: "220px" }}>Cập nhật</th>
                                <th style={{ width: "170px" }} className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workSchedules.length === 0 && !loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center text-muted py-6">Chưa có dữ liệu lịch làm việc.</td>
                                </tr>
                            ) : (
                                workSchedules.map((item, index) => {
                                    const isEditing = editingKey === item.day_key;
                                    return (
                                        <tr key={item.day_key}>
                                            <td>{index + 1}</td>
                                            <td className="fw-bold">
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="day_label"
                                                        className="form-control form-control-sm"
                                                        value={editForm.day_label}
                                                        onChange={handleEditInput}
                                                    />
                                                ) : (
                                                    item.day_label
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        name="schedule_text"
                                                        className="form-control form-control-sm"
                                                        value={editForm.schedule_text}
                                                        onChange={handleEditInput}
                                                        placeholder="Ví dụ: 17:00 - 20:30"
                                                    />
                                                ) : (
                                                    item.schedule_text || "-"
                                                )}
                                            </td>
                                            <td>
                                                {item.is_active ? (
                                                    <span className="badge badge-light-success">Đang bật</span>
                                                ) : (
                                                    <span className="badge badge-light-secondary">Đã tắt</span>
                                                )}
                                            </td>
                                            <td>{formatUpdatedAt(item.updated_at)}</td>
                                            <td className="text-end">{renderEditActions(item)}</td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default WorkSchedulePage;
