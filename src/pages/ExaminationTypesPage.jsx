import { useMemo, useState } from "react";
import { useExaminationTypes } from "../hooks";

function ExaminationTypesPage() {
    const { examinationTypes, loading, error, addExaminationType, updateExaminationType, setExaminationTypeActive } = useExaminationTypes({ includeInactive: true });

    const [newLabel, setNewLabel] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [editingId, setEditingId] = useState("");
    const [editingLabel, setEditingLabel] = useState("");
    const [editingPrice, setEditingPrice] = useState("");

    const totalTypes = examinationTypes.length;
    const totalPrice = useMemo(() => examinationTypes.reduce((sum, item) => sum + (Number(item.price) || 0), 0), [examinationTypes]);

    const resetEdit = () => {
        setEditingId("");
        setEditingLabel("");
        setEditingPrice("");
    };

    const handleCreate = async(event) => {
        event.preventDefault();
        try {
            await addExaminationType({
                label: newLabel,
                price: Number(newPrice) || 0
            });
            setNewLabel("");
            setNewPrice("");
        } catch (err) {
            window.alert(err.message);
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditingLabel(item.label);
        setEditingPrice(String(item.price || ""));
    };

    const saveEdit = async() => {
        try {
            await updateExaminationType(editingId, {
                label: editingLabel,
                price: Number(editingPrice) || 0
            });
            resetEdit();
        } catch (err) {
            window.alert(err.message);
        }
    };

    const handleToggleActive = async(item) => {
        const actionLabel = item.is_active ? "tắt" : "bật";
        const ok = window.confirm(`Bạn có chắc chắn muốn ${actionLabel} hình thức khám này?`);
        if (!ok) return;
        await setExaminationTypeActive(item.id, !item.is_active);
        if (editingId === item.id) resetEdit();
    };

    return (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title d-flex flex-column">
                    <span className="card-label fw-bolder fs-3 mb-1">Các hình thức khám</span>
                    <span className="text-muted mt-1 fw-bold fs-7">Thêm, sửa, xóa danh sách hình thức khám để sử dụng ở form bệnh nhân</span>
                </div>
            </div>

            <div className="card-body py-4">
                {loading && <div className="alert alert-info">Đang tải danh sách hình thức khám...</div>}
                {error && <div className="alert alert-danger">Lỗi: {error}</div>}

                <form className="row g-3 mb-5" onSubmit={handleCreate}>
                    <div className="col-md-6">
                        <label className="form-label">Tên hình thức khám</label>
                        <input
                            type="text"
                            className="form-control"
                            value={newLabel}
                            onChange={(e) => setNewLabel(e.target.value)}
                            placeholder="Ví dụ: Khám tim thai"
                            required
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label">Giá (VNĐ)</label>
                        <input
                            type="number"
                            className="form-control"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            min="0"
                            step="1000"
                            placeholder="0"
                        />
                    </div>
                    <div className="col-md-2 d-flex align-items-end">
                        <button type="submit" className="btn btn-primary w-100">Thêm</button>
                    </div>
                </form>

                <div className="mb-4 p-3 rounded" style={{ background: "#f5f8fa" }}>
                    <div>Số hình thức khám: <strong>{totalTypes}</strong></div>
                    <div>Tổng mức giá danh mục: <strong>{Number(totalPrice).toLocaleString("vi-VN")} đ</strong></div>
                </div>

                <div className="table-responsive">
                    <table className="table align-middle table-row-dashed fs-6 gy-3">
                        <thead>
                            <tr className="text-start text-gray-900 fw-bolder fs-7 text-uppercase">
                                <th style={{ width: "70px" }}>STT</th>
                                <th>Tên hình thức khám</th>
                                <th style={{ width: "220px" }}>Giá</th>
                                <th style={{ width: "140px" }}>Trạng thái</th>
                                <th style={{ width: "220px" }} className="text-end">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examinationTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center text-muted py-6">Chưa có hình thức khám nào.</td>
                                </tr>
                            ) : (
                                examinationTypes.map((item, index) => {
                                    const isEditing = editingId === item.id;
                                    return (
                                        <tr key={item.id}>
                                            <td>{index + 1}</td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        value={editingLabel}
                                                        onChange={(e) => setEditingLabel(e.target.value)}
                                                    />
                                                ) : (
                                                    item.label
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        value={editingPrice}
                                                        onChange={(e) => setEditingPrice(e.target.value)}
                                                        min="0"
                                                        step="1000"
                                                    />
                                                ) : (
                                                    `${Number(item.price || 0).toLocaleString("vi-VN")} đ`
                                                )}
                                            </td>
                                            <td>
                                                {item.is_active ? (
                                                    <span className="badge badge-light-success">Đang bật</span>
                                                ) : (
                                                    <span className="badge badge-light-secondary">Đã tắt</span>
                                                )}
                                            </td>
                                            <td className="text-end">
                                                {isEditing ? (
                                                    <>
                                                        <button type="button" className="btn btn-sm btn-success me-2" onClick={saveEdit}>Lưu</button>
                                                        <button type="button" className="btn btn-sm btn-light" onClick={resetEdit}>Hủy</button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button type="button" className="btn btn-sm btn-primary me-2" onClick={() => startEdit(item)}>Sửa</button>
                                                        <button
                                                            type="button"
                                                            className={`btn btn-sm ${item.is_active ? "btn-danger" : "btn-success"}`}
                                                            onClick={() => handleToggleActive(item)}
                                                        >
                                                            {item.is_active ? "Tắt" : "Bật"}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
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

export default ExaminationTypesPage;