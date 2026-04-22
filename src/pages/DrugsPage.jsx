import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useDrugs } from "../hooks";

function DrugsPage() {
    const { drugs, loading, error, searchDrugs, addDrug } = useDrugs();
    const [searchQuery, setSearchQuery] = useState("");
    const [showImportModal, setShowImportModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [notesText, setNotesText] = useState("");
    const [newDrugForm, setNewDrugForm] = useState({
        registration_number: "",
        drug_name: "",
        active_ingredient: "",
        concentration: "",
        route: "",
        quantity: "0",
        unit: "",
        price: "",
        notes: ""
    });

    const filteredDrugs = useMemo(() => {
        if (!searchQuery.trim()) return drugs;
        const keyword = searchQuery.toLowerCase();
        return drugs.filter((item) =>
            [item.registration_number, item.drug_name, item.active_ingredient]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(keyword))
        );
    }, [drugs, searchQuery]);

    const truncate = (text, length = 40) => {
        if (!text) return "-";
        return text.length > length ? `${text.slice(0, length)}...` : text;
    };

    const getExportRows = (rows) => {
        const headers = ["Mã đăng ký", "Tên thuốc", "Hoạt chất", "Hàm lượng", "Đường dùng", "Số lượng", "Đơn vị", "Giá", "Ghi chú"];
        const body = rows.map((row) => [
            row.registration_number || "",
            row.drug_name || "",
            row.active_ingredient || "",
            row.concentration || "",
            row.route || "",
            row.quantity || "",
            row.unit || "",
            row.price ?? "",
            row.notes || ""
        ]);

        return [headers, ...body];
    };

    const toCsv = (rows) => {
        return getExportRows(rows)
            .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    const ensureRows = () => {
        if (filteredDrugs.length > 0) return true;
        window.alert("Chưa có dữ liệu để xuất.");
        return false;
    };

    const handleSearch = async (value) => {
        setSearchQuery(value);
        await searchDrugs(value);
    };

    const handleCopy = async () => {
        if (!ensureRows()) return;
        await navigator.clipboard.writeText(toCsv(filteredDrugs));
        window.alert("Đã sao chép dữ liệu.");
    };

    const handleExcel = () => {
        if (!ensureRows()) return;
        const headers = ["Mã đăng ký", "Tên thuốc", "Hoạt chất", "Hàm lượng", "Đường dùng", "Số lượng", "Đơn vị", "Giá", "Ghi chú"];
        const body = filteredDrugs.map((row) => [
            row.registration_number || "",
            row.drug_name || "",
            row.active_ingredient || "",
            row.concentration || "",
            row.route || "",
            Number(row.quantity || 0),
            row.unit || "",
            Number(row.price || 0),
            row.notes || ""
        ]);

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body]);
        worksheet["!cols"] = [
            { wch: 16 },
            { wch: 30 },
            { wch: 24 },
            { wch: 14 },
            { wch: 14 },
            { wch: 10 },
            { wch: 10 },
            { wch: 14 },
            { wch: 32 }
        ];

        for (let rowIndex = 2; rowIndex <= body.length + 1; rowIndex += 1) {
            const quantityCell = worksheet[`F${rowIndex}`];
            if (quantityCell) {
                quantityCell.t = "n";
                quantityCell.z = "#,##0";
            }

            const priceCell = worksheet[`H${rowIndex}`];
            if (priceCell) {
                priceCell.t = "n";
                priceCell.z = "#,##0\ \"đ\"";
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sach thuoc");
        XLSX.writeFile(workbook, "danh-sach-thuoc.xlsx");
    };

    const handlePrint = () => {
        if (!ensureRows()) return;
        const rows = filteredDrugs
            .map(
                (row) =>
                    `<tr><td>${row.registration_number || ""}</td><td>${row.drug_name || ""}</td><td>${row.active_ingredient || ""}</td><td>${row.concentration || ""}</td><td>${row.route || ""}</td><td>${row.quantity || ""}</td><td>${row.unit || ""}</td><td>${row.price ?? ""}</td><td>${row.notes || ""}</td></tr>`
            )
            .join("");
        const html = `<!doctype html><html><head><meta charset="UTF-8"/><title>Danh sách thuốc</title><style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;font-size:12px}th{background:#f5f5f5}</style></head><body><h3>Danh sách thuốc</h3><table><thead><tr><th>Mã đăng ký</th><th>Tên thuốc</th><th>Hoạt chất</th><th>Hàm lượng</th><th>Đường dùng</th><th>Số lượng</th><th>Đơn vị</th><th>Giá</th><th>Ghi chú</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
        const popup = window.open("", "_blank", "width=1100,height=760");
        if (!popup) return;
        popup.document.open();
        popup.document.write(html);
        popup.document.close();
        popup.focus();
        popup.print();
    };

    const handleCreateInput = (event) => {
        const { name, value } = event.target;
        setNewDrugForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setNewDrugForm({
            registration_number: "",
            drug_name: "",
            active_ingredient: "",
            concentration: "",
            route: "",
            quantity: "0",
            unit: "",
            price: "",
            notes: ""
        });
    };

    const handleCreateSubmit = async (event) => {
        event.preventDefault();
        try {
            await addDrug({
                registration_number: newDrugForm.registration_number,
                drug_name: newDrugForm.drug_name,
                active_ingredient: newDrugForm.active_ingredient,
                concentration: newDrugForm.concentration,
                route: newDrugForm.route,
                quantity: Number(newDrugForm.quantity || 0),
                unit: newDrugForm.unit,
                price: newDrugForm.price === "" ? null : Number(newDrugForm.price),
                notes: newDrugForm.notes
            });
            setShowCreateModal(false);
            resetForm();
            await searchDrugs(searchQuery);
            window.alert("Đã thêm thuốc mới thành công.");
        } catch (submitError) {
            window.alert(`Lỗi khi thêm thuốc: ${submitError.message}`);
        }
    };

    return (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title">
                    <h2 className="card-title align-items-start flex-column">
                        <span className="card-label fw-bolder fs-3 mb-1">Tủ thuốc</span>
                        <span className="text-muted mt-1 fw-bold fs-7">Danh sách thuốc trong phòng khám</span>
                    </h2>
                </div>
                <div className="card-toolbar d-flex flex-wrap gap-2 justify-content-start justify-content-md-end">
                    <button type="button" className="btn btn-sm btn-light btn-active-success" onClick={() => setShowImportModal(true)}>
                        Nhập thuốc từ Excel
                    </button>
                    <button type="button" className="btn btn-sm btn-light btn-active-info" onClick={handleExcel}>
                        Xuất danh sách thuốc
                    </button>
                    <button type="button" className="btn btn-sm btn-light btn-active-primary" onClick={() => setShowCreateModal(true)}>
                        Thêm thuốc mới
                    </button>
                </div>
            </div>

            <div className="card-body py-4">
                {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}
                {error && <div className="alert alert-danger">Lỗi: {error}</div>}

                <div className="row align-items-center mb-4 g-2">
                    <div className="col-12 col-lg-8">
                        <div className="dt-buttons btn-group flex-wrap">
                            <button className="btn btn-secondary btn-light-primary btn-sm" type="button" onClick={handleCopy}>Sao chép</button>
                            <button className="btn btn-secondary btn-light-success btn-sm" type="button" onClick={handleExcel}>Excel</button>
                            <button className="btn btn-secondary btn-light-info btn-sm" type="button" onClick={handlePrint}>In báo cáo</button>
                        </div>
                    </div>
                    <div className="col-12 col-lg-4">
                        <label className="w-100">
                            Tìm kiếm:
                            <input
                                type="search"
                                className="form-control form-control-sm form-control-solid"
                                placeholder="Tên thuốc hoặc hoạt chất"
                                value={searchQuery}
                                onChange={(event) => handleSearch(event.target.value)}
                            />
                        </label>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table align-middle table-striped table-row-dashed fs-7 g-1">
                        <thead>
                            <tr className="text-start text-gray-900 fw-bolder text-uppercase gs-0">
                                <th style={{ width: "100px" }}>Mã đăng ký</th>
                                <th style={{ width: "130px" }}>Tên thuốc</th>
                                <th style={{ width: "130px" }}>Hoạt chất</th>
                                <th style={{ width: "90px" }}>Hàm lượng</th>
                                <th style={{ width: "100px" }}>Đường dùng</th>
                                <th style={{ width: "80px" }}>Số lượng</th>
                                <th style={{ width: "70px" }}>Đơn vị</th>
                                <th style={{ width: "100px" }}>Giá</th>
                                <th style={{ width: "160px" }}>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrugs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center">Không có dữ liệu</td>
                                </tr>
                            ) : (
                                filteredDrugs.map((row) => (
                                    <tr key={row.id}>
                                        <td>{row.registration_number || "-"}</td>
                                        <td>{row.drug_name || "-"}</td>
                                        <td>{row.active_ingredient || "-"}</td>
                                        <td>{row.concentration || "-"}</td>
                                        <td>{row.route || "-"}</td>
                                        <td>
                                            <span className={`badge badge-${Number(row.quantity) < 100 ? "danger" : "success"}`}>
                                                {row.quantity ?? 0}
                                            </span>
                                        </td>
                                        <td>{row.unit || "-"}</td>
                                        <td>{row.price != null ? Number(row.price).toLocaleString("vi-VN") : "-"}</td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <span>{truncate(row.notes, 40)}</span>
                                                {row.notes && row.notes.length > 40 && (
                                                    <button
                                                        type="button"
                                                        className="btn btn-xs btn-light-primary"
                                                        onClick={() => {
                                                            setNotesText(row.notes);
                                                            setShowNotesModal(true);
                                                        }}
                                                    >
                                                        Xem thêm
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showNotesModal && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "520px" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Ghi chú</h5>
                                <button type="button" className="btn-close" onClick={() => setShowNotesModal(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{notesText}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showImportModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Nhập thuốc từ Excel</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowImportModal(false)} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">Vui lòng chọn file để nhập dữ liệu.</p>
                                    <input type="file" className="form-control" accept=".xlsx,.xls,.csv" />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowImportModal(false)}>Đóng</button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            window.alert("Chức năng nhập Excel đang được phát triển.");
                                            setShowImportModal(false);
                                        }}
                                    >
                                        Nhập
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}

            {showCreateModal && (
                <>
                    <div className="modal fade show d-block" tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Thêm thuốc mới</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
                                </div>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="form-label">Mã đăng ký</label><input name="registration_number" type="text" className="form-control" value={newDrugForm.registration_number} onChange={handleCreateInput} required /></div>
                                            <div className="col-md-6"><label className="form-label">Tên thuốc</label><input name="drug_name" type="text" className="form-control" value={newDrugForm.drug_name} onChange={handleCreateInput} required /></div>
                                            <div className="col-md-6"><label className="form-label">Hoạt chất</label><input name="active_ingredient" type="text" className="form-control" value={newDrugForm.active_ingredient} onChange={handleCreateInput} /></div>
                                            <div className="col-md-6"><label className="form-label">Hàm lượng</label><input name="concentration" type="text" className="form-control" value={newDrugForm.concentration} onChange={handleCreateInput} /></div>
                                            <div className="col-md-6"><label className="form-label">Đường dùng</label><input name="route" type="text" className="form-control" value={newDrugForm.route} onChange={handleCreateInput} /></div>
                                            <div className="col-md-3"><label className="form-label">Số lượng</label><input name="quantity" type="number" min="0" className="form-control" value={newDrugForm.quantity} onChange={handleCreateInput} required /></div>
                                            <div className="col-md-3"><label className="form-label">Đơn vị</label><input name="unit" type="text" className="form-control" value={newDrugForm.unit} onChange={handleCreateInput} /></div>
                                            <div className="col-md-6"><label className="form-label">Giá</label><input name="price" type="number" min="0" step="0.01" className="form-control" value={newDrugForm.price} onChange={handleCreateInput} /></div>
                                            <div className="col-md-12"><label className="form-label">Ghi chú</label><textarea name="notes" rows="3" className="form-control" value={newDrugForm.notes} onChange={handleCreateInput}></textarea></div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Đóng</button>
                                        <button type="submit" className="btn btn-primary">Lưu thuốc</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            )}
        </div>
    );
}

export default DrugsPage;
