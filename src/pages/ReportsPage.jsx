import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { useExaminationTypes, usePrescriptions } from "../hooks";

function ReportsPage() {
    const navigate = useNavigate();
    const { prescriptions, loading, error } = usePrescriptions();
    const { examinationTypes } = useExaminationTypes();

    const [searchQuery, setSearchQuery] = useState("");
    const [monthFilter, setMonthFilter] = useState("");
    const [modalShow, setModalShow] = useState(false);
    const [modalContent, setModalContent] = useState({ title: "", text: "" });

    const truncateText = (text, maxLength = 40) => {
        if (!text) return "-";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const getBirthYear = (dob) => {
        if (!dob) return "";
        const value = String(dob);
        const match = value.match(/^(\d{4})/);
        return match ? match[1] : value;
    };

    const getMedicineList = (prescription) => {
        const items = prescription?.prescription_items || [];
        const medicines = items.map((item) => item?.medicine_name).filter(Boolean);
        return medicines.length ? medicines.join(", ") : "";
    };

    const getVisitTotal = (prescription) => {
        const baseExamFee = 50000;
        const items = prescription?.prescription_items || [];
        const medicineTotal = items.reduce((sum, item) => {
            const explicitTotal = Number(item?.line_total);
            if (Number.isFinite(explicitTotal) && explicitTotal > 0) return sum + explicitTotal;
            const quantity = Number(item?.quantity || 0);
            const unitPrice = Number(item?.unit_price || 0);
            return sum + quantity * unitPrice;
        }, 0);

        let selectedExaminationTypes = [];
        const rawExaminationTypes = prescription?.patients?.examination_types;
        if (Array.isArray(rawExaminationTypes)) {
            selectedExaminationTypes = rawExaminationTypes;
        } else if (typeof rawExaminationTypes === "string" && rawExaminationTypes.trim()) {
            try {
                const parsed = JSON.parse(rawExaminationTypes);
                if (Array.isArray(parsed)) selectedExaminationTypes = parsed;
            } catch {
                selectedExaminationTypes = [];
            }
        }

        const paraclinicalTotal = selectedExaminationTypes.reduce((sum, typeId) => {
            const typeOption = examinationTypes.find((item) => item.id === typeId);
            return sum + Number(typeOption?.price || 0);
        }, 0);

        return medicineTotal + baseExamFee + paraclinicalTotal;
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
                getBirthYear(rx.patients?.dob) || "",
                rx.diagnosis || "",
                getMedicineList(rx) || "",
                String(getVisitTotal(rx) || "")
            ]
                .join(" ")
                .toLowerCase();

            return text.includes(q);
        });
    }, [prescriptions, searchQuery, monthFilter]);

    const getExportRows = (rows) => {
        const headers = ["Ngày", "Họ và Tên", "Năm sinh", "Chẩn đoán", "Thuốc", "Tổng tiền"];
        const body = rows.map((row) => [
            row.prescription_date || "",
            row.patients?.name || "",
            getBirthYear(row.patients?.dob) || "",
            row.diagnosis || "",
            getMedicineList(row) || "",
            getVisitTotal(row)
        ]);

        return [headers, ...body];
    };

    const toCsv = (rows) => {
        return getExportRows(rows)
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
        const headers = ["Ngày", "Họ và Tên", "Năm sinh", "Chẩn đoán", "Thuốc", "Tổng tiền"];
        const body = reportRows.map((row) => {
            const parsedDate = row.prescription_date ? new Date(row.prescription_date) : null;
            const dateCell = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : row.prescription_date || "";
            return [
                dateCell,
                row.patients?.name || "",
                getBirthYear(row.patients?.dob) || "",
                row.diagnosis || "",
                getMedicineList(row) || "",
                Number(getVisitTotal(row) || 0)
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body], { cellDates: true });
        worksheet["!cols"] = [
            { wch: 13 },
            { wch: 24 },
            { wch: 10 },
            { wch: 26 },
            { wch: 40 },
            { wch: 16 }
        ];

        for (let rowIndex = 2; rowIndex <= body.length + 1; rowIndex += 1) {
            const dateCell = worksheet[`A${rowIndex}`];
            if (dateCell && (dateCell.t === "d" || dateCell.t === "n")) {
                dateCell.z = "dd/mm/yyyy";
            }

            const totalCell = worksheet[`F${rowIndex}`];
            if (totalCell) {
                totalCell.t = "n";
                totalCell.z = "#,##0\ \"đ\"";
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bao cao kham benh");
        XLSX.writeFile(workbook, "bao-cao-kham-benh.xlsx");
    };

    const openPrintableWindow = (title) => {
        const tableRows = reportRows
            .map(
                (row) =>
                    `<tr><td>${row.prescription_date || ""}</td><td>${row.patients?.name || ""}</td><td>${getBirthYear(row.patients?.dob) || ""}</td><td>${row.diagnosis || ""}</td><td>${getMedicineList(row) || ""}</td><td>${Number(getVisitTotal(row) || 0).toLocaleString("vi-VN")} đ</td></tr>`
            )
            .join("");

        const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><title>${title}</title><style>body{font-family:Arial,sans-serif;padding:24px;}h2{margin-bottom:16px;}table{width:100%;border-collapse:collapse;}th,td{border:1px solid #d1d5db;padding:8px;font-size:13px;}th{background:#f3f4f6;text-align:left;}</style></head><body><h2>${title}</h2><table><thead><tr><th>Ngày</th><th>Họ và Tên</th><th>Năm sinh</th><th>Chẩn đoán</th><th>Thuốc</th><th>Tổng tiền</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

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
                    <div className="row align-items-center g-2">
                        <div className="col-12 col-lg-6">
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

                        <div className="col-12 col-md-4 col-lg-2">
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

                        <div className="col-12 col-md-8 col-lg-4">
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
                            <div className="table-responsive">
                            <table
                                id="report_table"
                                className="table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline"
                                aria-describedby="report_table_info"
                            >
                                <thead>
                                    <tr className="text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0">
                                        <th style={{ width: "90px" }}>Ngày</th>
                                        <th style={{ width: "150px" }}>Họ &amp; Tên</th>
                                        <th style={{ width: "80px" }}>Năm sinh</th>
                                        <th style={{ width: "150px" }}>Chẩn đoán</th>
                                        <th style={{ width: "200px" }}>Thuốc</th>
                                        <th className="text-end" style={{ width: "120px" }}>Tổng tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportRows.length === 0 ? (
                                        <tr className="odd">
                                            <td valign="top" colSpan="6" className="dataTables_empty">
                                                Không có dữ liệu
                                            </td>
                                        </tr>
                                    ) : (
                                        reportRows.map((row) => (
                                            <tr key={row.id} className="odd">
                                                <td>{row.prescription_date || "-"}</td>
                                                <td>{row.patients?.name || "-"}</td>
                                                <td>{getBirthYear(row.patients?.dob) || "-"}</td>
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
                                                        <span>{truncateText(getMedicineList(row), 40)}</span>
                                                        {getMedicineList(row) && getMedicineList(row).length > 40 && (
                                                            <button
                                                                className="btn btn-xs btn-light-primary"
                                                                onClick={() => showModal("Thuốc", getMedicineList(row))}
                                                                title="Xem thêm"
                                                            >
                                                                <i className="fas fa-eye" style={{ fontSize: "12px" }}></i>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-end fw-semibold">{Number(getVisitTotal(row) || 0).toLocaleString("vi-VN")} đ</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            </div>

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
