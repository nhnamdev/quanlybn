import { useMemo, useState } from "react";
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

    const toCsv = (rows) => {
        const headers = ["Ma dang ky", "Ten thuoc", "Hoat chat", "Ham luong", "Duong dung", "So luong", "Don vi", "Gia", "Ghi chu"];
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

        return [headers, ...body]
            .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    const ensureRows = () => {
        if (filteredDrugs.length > 0) return true;
        window.alert("Chua co du lieu de xuat.");
        return false;
    };

    const handleSearch = async (value) => {
        setSearchQuery(value);
        await searchDrugs(value);
    };

    const handleCopy = async () => {
        if (!ensureRows()) return;
        await navigator.clipboard.writeText(toCsv(filteredDrugs));
        window.alert("Da sao chep du lieu.");
    };

    const handleExcel = () => {
        if (!ensureRows()) return;
        const blob = new Blob([`\uFEFF${toCsv(filteredDrugs)}`], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "danh-sach-thuoc.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const handlePrint = () => {
        if (!ensureRows()) return;
        const rows = filteredDrugs
            .map(
                (row) =>
                    `<tr><td>${row.registration_number || ""}</td><td>${row.drug_name || ""}</td><td>${row.active_ingredient || ""}</td><td>${row.concentration || ""}</td><td>${row.route || ""}</td><td>${row.quantity || ""}</td><td>${row.unit || ""}</td><td>${row.price ?? ""}</td><td>${row.notes || ""}</td></tr>`
            )
            .join("");
        const html = `<!doctype html><html><head><meta charset="UTF-8"/><title>Danh sach thuoc</title><style>body{font-family:Arial,sans-serif;padding:16px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:6px;font-size:12px}th{background:#f5f5f5}</style></head><body><h3>Danh sach thuoc</h3><table><thead><tr><th>Ma dang ky</th><th>Ten thuoc</th><th>Hoat chat</th><th>Ham luong</th><th>Duong dung</th><th>So luong</th><th>Don vi</th><th>Gia</th><th>Ghi chu</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
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
            window.alert("Da them thuoc moi thanh cong.");
        } catch (submitError) {
            window.alert(`Loi khi them thuoc: ${submitError.message}`);
        }
    };

    return (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title">
                    <h2 className="card-title align-items-start flex-column">
                        <span className="card-label fw-bolder fs-3 mb-1">Tu thuoc</span>
                        <span className="text-muted mt-1 fw-bold fs-7">Danh sach thuoc trong phong kham</span>
                    </h2>
                </div>
                <div className="card-toolbar">
                    <button type="button" className="btn btn-sm btn-light btn-active-success me-2" onClick={() => setShowImportModal(true)}>
                        Nhap thuoc tu Excel
                    </button>
                    <button type="button" className="btn btn-sm btn-light btn-active-info me-2" onClick={handleExcel}>
                        Xuat danh sach thuoc
                    </button>
                    <button type="button" className="btn btn-sm btn-light btn-active-primary" onClick={() => setShowCreateModal(true)}>
                        Them thuoc moi
                    </button>
                </div>
            </div>

            <div className="card-body py-4">
                {loading && <div className="alert alert-info">Dang tai du lieu...</div>}
                {error && <div className="alert alert-danger">Loi: {error}</div>}

                <div className="row align-items-center mb-4">
                    <div className="col-sm-8 d-none d-lg-block">
                        <div className="dt-buttons btn-group flex-wrap">
                            <button className="btn btn-secondary btn-light-primary btn-sm" type="button" onClick={handleCopy}>Sao chep</button>
                            <button className="btn btn-secondary btn-light-success btn-sm" type="button" onClick={handleExcel}>Excel</button>
                            <button className="btn btn-secondary btn-light-info btn-sm" type="button" onClick={handlePrint}>In bao cao</button>
                        </div>
                    </div>
                    <div className="col-sm-4">
                        <label className="w-100">
                            Tim kiem:
                            <input
                                type="search"
                                className="form-control form-control-sm form-control-solid"
                                placeholder="Ten thuoc hoac hoat chat"
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
                                <th style={{ width: "100px" }}>Ma dang ky</th>
                                <th style={{ width: "130px" }}>Ten thuoc</th>
                                <th style={{ width: "130px" }}>Hoat chat</th>
                                <th style={{ width: "90px" }}>Ham luong</th>
                                <th style={{ width: "100px" }}>Duong dung</th>
                                <th style={{ width: "80px" }}>So luong</th>
                                <th style={{ width: "70px" }}>Don vi</th>
                                <th style={{ width: "100px" }}>Gia</th>
                                <th style={{ width: "160px" }}>Ghi chu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDrugs.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center">Khong co du lieu</td>
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
                                                        Xem them
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
                                <h5 className="modal-title">Ghi chu</h5>
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
                                    <h5 className="modal-title">Nhap thuoc tu Excel</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowImportModal(false)} aria-label="Close"></button>
                                </div>
                                <div className="modal-body">
                                    <p className="text-muted mb-3">Vui long chon file de nhap du lieu.</p>
                                    <input type="file" className="form-control" accept=".xlsx,.xls,.csv" />
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-light" onClick={() => setShowImportModal(false)}>Dong</button>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            window.alert("Chuc nang nhap Excel dang duoc phat trien.");
                                            setShowImportModal(false);
                                        }}
                                    >
                                        Nhap
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
                                    <h5 className="modal-title">Them thuoc moi</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)} aria-label="Close"></button>
                                </div>
                                <form onSubmit={handleCreateSubmit}>
                                    <div className="modal-body">
                                        <div className="row g-3">
                                            <div className="col-md-6"><label className="form-label">Ma dang ky</label><input name="registration_number" type="text" className="form-control" value={newDrugForm.registration_number} onChange={handleCreateInput} required /></div>
                                            <div className="col-md-6"><label className="form-label">Ten thuoc</label><input name="drug_name" type="text" className="form-control" value={newDrugForm.drug_name} onChange={handleCreateInput} required /></div>
                                            <div className="col-md-6"><label className="form-label">Hoat chat</label><input name="active_ingredient" type="text" className="form-control" value={newDrugForm.active_ingredient} onChange={handleCreateInput} /></div>
                                            <div className="col-md-6"><label className="form-label">Ham luong</label><input name="concentration" type="text" className="form-control" value={newDrugForm.concentration} onChange={handleCreateInput} /></div>
                                            <div className="col-md-6"><label className="form-label">Duong dung</label><input name="route" type="text" className="form-control" value={newDrugForm.route} onChange={handleCreateInput} /></div>
                                            <div className="col-md-3"><label className="form-label">So luong</label><input name="quantity" type="number" min="0" className="form-control" value={newDrugForm.quantity} onChange={handleCreateInput} required /></div>
                                            <div className="col-md-3"><label className="form-label">Don vi</label><input name="unit" type="text" className="form-control" value={newDrugForm.unit} onChange={handleCreateInput} /></div>
                                            <div className="col-md-6"><label className="form-label">Gia</label><input name="price" type="number" min="0" step="0.01" className="form-control" value={newDrugForm.price} onChange={handleCreateInput} /></div>
                                            <div className="col-md-12"><label className="form-label">Ghi chu</label><textarea name="notes" rows="3" className="form-control" value={newDrugForm.notes} onChange={handleCreateInput}></textarea></div>
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button type="button" className="btn btn-light" onClick={() => setShowCreateModal(false)}>Dong</button>
                                        <button type="submit" className="btn btn-primary">Luu thuoc</button>
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
