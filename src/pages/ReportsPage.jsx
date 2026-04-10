import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePrescriptions } from "../hooks";

function ReportsPage() {
    const navigate = useNavigate();
    const { prescriptions, loading, error } = usePrescriptions();

    const [searchQuery, setSearchQuery] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [modalShow, setModalShow] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", text: "" });

    const genderLabel = (value) => (value === "F" ? "Nữ" : "Nam");

    const truncateText = (text, maxLength = 40) => {
        if (!text) return "-";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const showModal = (title, content) => {
        setModalContent({ title, text: content || "-" });
        setModalShow(true);
    };

    const reportRows = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();

        return prescriptions.filter((rx) => {
            const inMonth = monthFilter ? String(rx.prescription_date || "").startsWith(monthFilter) : true;
            if (!inMonth) return false;

            if (!q) return true;

            const text = [
                rx.prescription_date || "",
                rx.patients?.name || "",
                rx.patients?.gender ? genderLabel(rx.patients.gender) : "",
                rx.patients?.dob || "",
                rx.diagnosis || "",
                rx.notes || ""
            ]
                .join(" ")
                .toLowerCase();

            return text.includes(q);
        });
    }, [prescriptions, searchQuery, monthFilter]);

    const toCsv = (rows) => {
        const headers = ["Ngày", "Họ và Tên", "Giới", "Năm sinh", "Chẩn đoán", "Điều trị"];
        const body = rows.map((row) => [
            row.prescription_date || "",
            row.patients?.name || "",
            row.patients?.gender ? genderLabel(row.patients.gender) : "",
            row.patients?.dob || "",
            row.diagnosis || "",
            row.notes || ""
        ]);

        return [headers, ...body]
            .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    const ensureRows = () => {
        if (reportRows.length > 0) return true;
        window.alert("Chưa có dữ liệu để xuất.");
        return false;
    };

    const handleCopy = async () => {
        if (!ensureRows()) return;
        await navigator.clipboard.writeText(toCsv(reportRows));
        window.alert("Đã sao chép dữ liệu báo cáo.");
    };

    const handleExcel = () => {
        if (!ensureRows()) return;
        const blob = new Blob([`\uFEFF${toCsv(reportRows)}`], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = "bao-cao-kham-benh.csv";
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const openPrintableWindow = (title) => {
        const tableRows = reportRows
            .map(
                (row) =>
                    `<tr><td>${row.prescription_date || ""}</td><td>${row.patients?.name || ""}</td><td>${row.patients?.gender ? genderLabel(row.patients.gender) : ""}</td><td>${row.patients?.dob || ""}</td><td>${row.diagnosis || ""}</td><td>${row.notes || ""}</td></tr>`
            )
            .join("");

        const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:24px;}h2{margin-bottom:16px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #d1d5db;padding:8px;font-size:13px;}th{background:#f3f4f6;text-align:left;}</style></head><body><h2>${title}</h2><table><thead><tr><th>Ngày</th><th>Họ và Tên</th><th>Giới</th><th>Năm sinh</th><th>Chẩn đoán</th><th>Điều trị</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

        const printWindow = window.open("", "_blank", "width=1100,height=760");
        if (!printWindow) return;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handlePdf = () => {
        if (!ensureRows()) return;
        openPrintableWindow("Báo cáo khám bệnh (PDF)");
    };

    const handlePrint = () => {
        if (!ensureRows()) return;
        openPrintableWindow("Báo cáo khám bệnh");
    };

    return (
        <div className="card">
            <div className="card-header border-0 pt-6">
                <div className="card-title">
                    <h2 className="card-title align-items-start flex-column">
                        <span className="card-label fw-bolder fs-3 mb-1">Báo cáo khám bệnh</span>
                        <span className="text-muted mt-1 fw-bold fs-7">Báo cáo khám bệnh của bạn</span>
                    </h2>
                </div>

                <div className="card-toolbar">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            className="btn btn-primary js-create-patient"
                            id="createPatient"
                            onClick={() => navigate("/patient/", { state: { openCreatePatientModal: Date.now() } })}
                        >
                            <span className="svg-icon svg-icon-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <rect opacity="0.5" x="11.364" y="20.364" width="16" height="2" rx="1" transform="rotate(-90 11.364 20.364)" fill="black" />
                                    <rect x="4.36396" y="11.364" width="16" height="2" rx="1" fill="black" />
                                </svg>
                            </span>
                            Thêm Bệnh Nhân mới
                        </button>
                    </div>
                </div>
            </div>

            <div className="card-body py-4">
                {loading && <div className="alert alert-info">Đang tải dữ liệu...</div>}
                {error && <div className="alert alert-danger">Lỗi: {error}</div>}

                <div id="report_table_wrapper" className="dataTables_wrapper dt-bootstrap4 no-footer">
                    <div className="row align-items-center">
                        <div className="col-sm-6 d-none d-lg-block">
                            <div className="dt-buttons btn-group flex-wrap">
                                <button className="btn btn-secondary btn-light btn-sm" type="button" onClick={() => setSearchQuery("")}>
                                    <span>
                                        <i className="fas fa-search me-1"></i> Tim kiem nang cao
                                    </span>
                                </button>
                                <button className="btn btn-secondary buttons-copy buttons-html5 btn-light-primary btn-sm" type="button" onClick={handleCopy}>
                                    <span>
                                        <i className="fas fa-copy me-1"></i> Sao chep
                                    </span>
                                </button>
                                <button className="btn btn-secondary buttons-excel buttons-html5 btn-light-success btn-sm" type="button" onClick={handleExcel}>
                                    <span>
                                        <i className="fas fa-file-excel me-1"></i> Excel
                                    </span>
                                </button>
                                <button className="btn btn-secondary buttons-pdf buttons-html5 btn-light-danger btn-sm" type="button" onClick={handlePdf}>
                                    <span>
                                        <i className="fas fa-file-pdf me-1"></i> PDF
                                    </span>
                                </button>
                                <button className="btn btn-secondary btn-light-info btn-sm" type="button" onClick={handlePrint}>
                                    <span>
                                        <i className="fas fa-print me-1"></i> In bao cao
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="col-sm-2">
                            <div className="daterange-container d-flex justify-content-start">
                                <div className="d-flex align-items-center w-100">
                                    <input
                                        type="month"
                                        className="form-control form-control-sm form-control-solid"
                                        placeholder="Tìm kiếm theo ngày, tháng"
                                        value={monthFilter}
                                        onChange={(e) => setMonthFilter(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-sm-4">
                            <div id="report_table_filter" className="dataTables_filter">
                                <label>
                                    Tim kiem:
                                    <input
                                        type="search"
                                        className="form-control form-control-sm form-control-solid"
                                        placeholder=""
                                        aria-controls="report_table"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12">
                            <table
                                id="report_table"
                                className="table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline"
                                aria-describedby="report_table_info"
                            >
                                <thead>
                                    <tr className="text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0">
                                        <th style={{ width: "90px" }}>Ngày</th>
                                        <th style={{ width: "150px" }}>Họ &amp; Tên</th>
                                        <th style={{ width: "60px" }}>Giới</th>
                                        <th style={{ width: "80px" }}>Năm sinh</th>
                                        <th style={{ width: "150px" }}>Chẩn đoán</th>
                                        <th style={{ width: "150px" }}>Điều trị</th>
                                        <th className="text-end" style={{ width: "80px" }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportRows.length === 0 ? (
                                        <tr className="odd">
                                            <td valign="top" colSpan="7" className="dataTables_empty">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        reportRows.map((row) => (
                                            <tr key={row.id} className="odd">
                                                <td>{row.prescription_date || "-"}</td>
                                                <td>{row.patients?.name || "-"}</td>
                                                <td>{row.patients?.gender ? genderLabel(row.patients.gender) : "-"}</td>
                                                <td>{row.patients?.dob || "-"}</td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span>{truncateText(row.diagnosis, 40)}</span>
                                                        {row.diagnosis && row.diagnosis.length > 40 && (
                                                            <button
                                                                className="btn btn-xs btn-light-primary"
                                                                onClick={() => showModal("Chẩn đoán", row.diagnosis)}
                                                                title="Xem thêm"
                                                            >
                                                                <i className="fas fa-eye" style={{ fontSize: "12px" }}></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <span>{truncateText(row.notes, 40)}</span>
                                                        {row.notes && row.notes.length > 40 && (
                                                            <button
                                                                className="btn btn-xs btn-light-primary"
                                                                onClick={() => showModal("Điều trị", row.notes)}
                                                                title="Xem thêm"
                                                            >
                                                                <i className="fas fa-eye" style={{ fontSize: "12px" }}></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-end">-</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                            <div id="report_table_processing" className="dataTables_processing" style={{ display: "none" }}>
                                Đang xử lý...
                            </div>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-sm-12 col-md-5">
                            <div className="dataTables_info" id="report_table_info" role="status" aria-live="polite">
                                Showing {reportRows.length === 0 ? "no records" : `${reportRows.length} records`}
                            </div>
                        </div>
                        <div className="col-sm-12 col-md-7">
                            <div className="dataTables_paginate paging_simple_numbers" id="report_table_paginate">
                                <ul className="pagination">
                                    <li className="paginate_button page-item previous disabled" id="report_table_previous">
                                        <a href="#" aria-controls="report_table" data-dt-idx="0" tabIndex="0" className="page-link">
                                            Lùi
                                        </a>
                                    </li>
                                    <li className="paginate_button page-item next disabled" id="report_table_next">
                                        <a href="#" aria-controls="report_table" data-dt-idx="1" tabIndex="0" className="page-link">
                                            Tiếp
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {modalShow && (
                <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                    <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{modalContent.title}</h5>
                                <button type="button" className="btn-close" onClick={() => setModalShow(false)} aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{modalContent.text}</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setModalShow(false)}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
