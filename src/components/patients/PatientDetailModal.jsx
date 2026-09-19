import { useEffect, useMemo, useState } from "react";
import { prescriptionsQueries } from "../../lib/supabaseQueries";
import {
    calculateAge,
    formatCurrency,
    genderLabel,
    parsePatientNotes
} from "./patientUtils";

function PatientDetailModal({
    patient,
    examinationOptions = [],
    baseFee = 50000,
    onClose,
    onNewVisit,
    onEdit,
    onPrintInvoice
}) {
    const [prescriptions, setPrescriptions] = useState([]);
    const [loadingPrescriptions, setLoadingPrescriptions] = useState(true);
    const [errorPrescriptions, setErrorPrescriptions] = useState(null);
    const [expandedOlderVisits, setExpandedOlderVisits] = useState({});

    // Tải toàn bộ các lần khám (prescriptions) của bệnh nhân từ database
    useEffect(() => {
        let isMounted = true;
        const fetchHistory = async () => {
            if (!patient?.id) return;
            try {
                setLoadingPrescriptions(true);
                setErrorPrescriptions(null);
                const data = await prescriptionsQueries.getByPatientId(patient.id);
                if (isMounted) {
                    setPrescriptions(data || []);
                }
            } catch (err) {
                if (isMounted) {
                    setErrorPrescriptions(err.message || "Lỗi tải lịch sử khám bệnh");
                }
            } finally {
                if (isMounted) {
                    setLoadingPrescriptions(false);
                }
            }
        };

        fetchHistory();
        return () => {
            isMounted = false;
        };
    }, [patient?.id]);

    // Tách lần khám mới nhất và các lần khám cũ
    const latestPrescription = useMemo(() => {
        return prescriptions.length > 0 ? prescriptions[0] : null;
    }, [prescriptions]);

    const olderPrescriptions = useMemo(() => {
        return prescriptions.length > 1 ? prescriptions.slice(1) : [];
    }, [prescriptions]);

    // Bóc tách ghi chú bệnh nhân (kết hợp với đơn khám mới nhất nếu hồ sơ chưa ghi nhận)
    const parsedNotes = useMemo(() => {
        const patientParsed = parsePatientNotes(patient?.notes || "");
        const latestParsed = latestPrescription ? parsePatientNotes(latestPrescription.notes || "") : null;

        return {
            height: patientParsed.height || latestParsed?.height || "",
            weight: patientParsed.weight || latestParsed?.weight || "",
            bloodPressure: patientParsed.bloodPressure || latestParsed?.bloodPressure || "",
            history: patientParsed.history || latestParsed?.history || "",
            parity: patientParsed.parity || latestParsed?.parity || "",
            gestationalAge: patientParsed.gestationalAge || latestParsed?.gestationalAge || "",
            dueDate: patientParsed.dueDate || latestParsed?.dueDate || "",
            extraNote: patientParsed.extraNote || latestParsed?.extraNote || "",
            legacyNote: patientParsed.legacyNote || latestParsed?.legacyNote || "",
            services: patientParsed.services || latestParsed?.services || "",
            hasStructured: Boolean(
                patientParsed.hasStructured || latestParsed?.hasStructured
            )
        };
    }, [patient?.notes, latestPrescription]);

    // Giải mã hình thức khám đã đăng ký
    const registeredExamTypes = useMemo(() => {
        let types = [];
        if (patient?.examination_types) {
            try {
                types =
                    typeof patient.examination_types === "string"
                        ? JSON.parse(patient.examination_types)
                        : patient.examination_types;
            } catch {
                types = [];
            }
        }
        return Array.isArray(types)
            ? types.map((typeId) => {
                  const option = examinationOptions.find((o) => o.id === typeId);
                  return {
                      id: typeId,
                      label: option?.label || typeId,
                      price: Number(option?.price || 0)
                  };
              })
            : [];
    }, [patient?.examination_types, examinationOptions]);

    const examCost = useMemo(() => {
        return registeredExamTypes.reduce((sum, item) => sum + item.price, 0);
    }, [registeredExamTypes]);

    // Toggle xem chi tiết lần khám cũ
    const toggleOlderVisit = (id) => {
        setExpandedOlderVisits((prev) => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    // Trích xuất ngày hẹn tái khám từ ghi chú đơn thuốc nếu có
    const extractNextAppointment = (notes) => {
        if (!notes) return null;
        const match = notes.match(/--- Hẹn khám lại: (.*?) ---/);
        return match ? match[1] : null;
    };

    // Làm sạch ghi chú đơn thuốc khi đã tách hẹn tái khám
    const cleanPrescriptionNotes = (notes) => {
        if (!notes) return "";
        return notes
            .replace(/--- Hẹn khám lại: (.*?) ---/g, "")
            .replace(/--- Ghi chu lam sang benh nhan ---[\s\S]*/g, "")
            .trim();
    };

    // Tính tổng chi phí của một lần khám
    const calculateVisitTotal = (prescription) => {
        const items = prescription?.prescription_items || [];
        const medicineTotal = items.reduce((sum, item) => {
            const explicit = Number(item.line_total);
            if (Number.isFinite(explicit) && explicit > 0) return sum + explicit;
            return sum + Number(item.quantity || 0) * Number(item.unit_price || 0);
        }, 0);
        return medicineTotal + baseFee + examCost;
    };

    if (!patient) return null;

    const ageText = calculateAge(patient.dob);
    const hasVitals =
        parsedNotes.height ||
        parsedNotes.weight ||
        parsedNotes.bloodPressure ||
        parsedNotes.history;
    const hasObstetric =
        parsedNotes.parity || parsedNotes.gestationalAge || parsedNotes.dueDate;

    return (
        <>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{ backgroundColor: "rgba(17, 24, 39, 0.65)", zIndex: 1070 }}
                aria-modal="true"
                role="dialog"
            >
                <div
                    className="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable"
                    style={{ maxWidth: "1140px", margin: "1.75rem auto" }}
                >
                    <div className="modal-content shadow-lg border-0 rounded-3 overflow-hidden">
                        {/* HEADER */}
                        <div
                            className="modal-header text-white px-4 py-3"
                            style={{
                                background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)"
                            }}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle bg-white text-primary shadow-sm"
                                    style={{ width: "52px", height: "52px", fontSize: "22px" }}
                                >
                                    <i className="fas fa-user-injured"></i>
                                </div>
                                <div>
                                    <div className="d-flex align-items-center flex-wrap gap-2">
                                        <h4 className="modal-title fw-bold text-white mb-0 fs-4">
                                            {patient.name}
                                        </h4>
                                        <span className="badge bg-light text-primary fw-bold fs-7 px-2 py-1">
                                            {patient.id}
                                        </span>
                                        <span
                                            className={`badge fs-7 px-2 py-1 ${
                                                patient.gender === "F"
                                                    ? "bg-danger text-white"
                                                    : "bg-info text-white"
                                            }`}
                                        >
                                            {genderLabel(patient.gender)}
                                        </span>
                                        {ageText && (
                                            <span className="badge bg-secondary text-white fs-7 px-2 py-1">
                                                {ageText}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-white-50 fs-7 mt-1">
                                        Hồ sơ bệnh nhân &amp; Lịch sử khám bệnh
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="btn-close btn-close-white"
                                aria-label="Close"
                                onClick={onClose}
                            ></button>
                        </div>

                        {/* BODY */}
                        <div className="modal-body p-3 p-md-4" style={{ backgroundColor: "#f8fafc" }}>
                            {/* KHỐI 1: THÔNG TIN HÀNH CHÍNH & LÂM SÀNG TỔNG QUAN */}
                            <div className="row g-3 mb-4">
                                {/* Cột thông tin hành chính */}
                                <div className="col-12 col-lg-5">
                                    <div className="card h-100 border-0 shadow-sm rounded-3">
                                        <div className="card-header bg-white border-bottom py-2 px-3">
                                            <div className="fw-bold text-gray-800 d-flex align-items-center gap-2">
                                                <i className="fas fa-id-card text-primary"></i>
                                                <span>Thông tin cá nhân &amp; Tiếp nhận</span>
                                            </div>
                                        </div>
                                        <div className="card-body p-3 fs-7">
                                            <div className="row g-2">
                                                <div className="col-sm-6">
                                                    <span className="text-muted d-block">Điện thoại:</span>
                                                    <strong className="text-dark">
                                                        {patient.phone_number ? (
                                                            <a
                                                                href={`tel:${patient.phone_number}`}
                                                                className="text-decoration-none text-primary"
                                                            >
                                                                <i className="fas fa-phone-alt me-1 fs-8"></i>
                                                                {patient.phone_number}
                                                            </a>
                                                        ) : (
                                                            "-"
                                                        )}
                                                    </strong>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="text-muted d-block">Ngày sinh:</span>
                                                    <strong className="text-dark">
                                                        {patient.dob || "-"}
                                                    </strong>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="text-muted d-block">CCCD / Định danh:</span>
                                                    <strong className="text-dark">
                                                        {patient.identity_number || "-"}
                                                    </strong>
                                                </div>
                                                <div className="col-sm-6">
                                                    <span className="text-muted d-block">Giới tính:</span>
                                                    <strong className="text-dark">
                                                        {genderLabel(patient.gender)}
                                                    </strong>
                                                </div>
                                                <div className="col-12">
                                                    <span className="text-muted d-block">Địa chỉ:</span>
                                                    <span className="text-dark fw-semibold">
                                                        {patient.address || "-"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Dịch vụ khám đã chọn */}
                                            <hr className="my-2 border-dashed" />
                                            <div>
                                                <span className="text-muted d-block mb-1">
                                                    Hình thức khám đăng ký:
                                                </span>
                                                {registeredExamTypes.length === 0 ? (
                                                    <span className="text-muted fst-italic">
                                                        Khám cơ bản cố định
                                                    </span>
                                                ) : (
                                                    <div className="d-flex flex-wrap gap-1">
                                                        {registeredExamTypes.map((item) => (
                                                            <span
                                                                key={item.id}
                                                                className="badge bg-light-primary text-primary border border-primary border-opacity-25"
                                                            >
                                                                {item.label} (
                                                                {formatCurrency(item.price)})
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <div className="mt-2 text-end text-muted fs-8">
                                                    Phí khám đăng ký:{" "}
                                                    <strong className="text-danger fs-7">
                                                        {formatCurrency(baseFee + examCost)}
                                                    </strong>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Cột chỉ số sinh hiệu & Ghi chú thêm */}
                                <div className="col-12 col-lg-7">
                                    <div className="card h-100 border-0 shadow-sm rounded-3">
                                        <div className="card-header bg-white border-bottom py-2 px-3">
                                            <div className="fw-bold text-gray-800 d-flex align-items-center gap-2">
                                                <i className="fas fa-heartbeat text-danger"></i>
                                                <span>Sinh hiệu &amp; Ghi chú bổ sung</span>
                                            </div>
                                        </div>
                                        <div className="card-body p-3 fs-7 d-flex flex-column gap-2">
                                            {/* Sinh hiệu */}
                                            <div className="row g-2">
                                                <div className="col-4 col-sm-4">
                                                    <div className="p-2 rounded bg-light text-center border">
                                                        <div className="text-muted fs-8">Chiều cao</div>
                                                        <strong className="text-dark fs-7">
                                                            {parsedNotes.height || "-"}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-4 col-sm-4">
                                                    <div className="p-2 rounded bg-light text-center border">
                                                        <div className="text-muted fs-8">Cân nặng</div>
                                                        <strong className="text-dark fs-7">
                                                            {parsedNotes.weight || "-"}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-4 col-sm-4">
                                                    <div className="p-2 rounded bg-light text-center border">
                                                        <div className="text-muted fs-8">Huyết áp</div>
                                                        <strong className="text-danger fs-7">
                                                            {parsedNotes.bloodPressure || "-"}
                                                        </strong>
                                                    </div>
                                                </div>
                                                <div className="col-12">
                                                    <span className="text-muted d-inline-block me-1">
                                                        Tiền căn bệnh lý:
                                                    </span>
                                                    <strong className="text-dark">
                                                        {parsedNotes.history || "Chưa ghi nhận"}
                                                    </strong>
                                                </div>
                                            </div>

                                            {/* Thông tin thai sản nếu có */}
                                            {hasObstetric && (
                                                <div className="p-2 rounded bg-pink-light border border-danger border-opacity-10">
                                                    <div className="fw-bold text-danger fs-8 mb-1 d-flex align-items-center gap-1">
                                                        <i className="fas fa-baby"></i>
                                                        <span>Thông tin thai sản</span>
                                                    </div>
                                                    <div className="row g-2 fs-8">
                                                        <div className="col-4">
                                                            <span className="text-muted">Con lần:</span>{" "}
                                                            <strong>{parsedNotes.parity || "-"}</strong>
                                                        </div>
                                                        <div className="col-4">
                                                            <span className="text-muted">Tuổi thai:</span>{" "}
                                                            <strong>
                                                                {parsedNotes.gestationalAge || "-"}
                                                            </strong>
                                                        </div>
                                                        <div className="col-4">
                                                            <span className="text-muted">Dự sinh:</span>{" "}
                                                            <strong>{parsedNotes.dueDate || "-"}</strong>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* MỤC GHI CHÚ THÊM */}
                                            <div
                                                className="p-2 rounded border"
                                                style={{
                                                    backgroundColor: "#fffdf5",
                                                    borderColor: "#fde68a"
                                                }}
                                            >
                                                <div className="fw-bold text-warning-emphasis fs-8 mb-1 d-flex align-items-center gap-1">
                                                    <i className="fas fa-sticky-note text-warning"></i>
                                                    <span>Ghi chú thêm từ hồ sơ:</span>
                                                </div>
                                                <div
                                                    className="text-dark fw-semibold"
                                                    style={{
                                                        whiteSpace: "pre-wrap",
                                                        wordBreak: "break-word"
                                                    }}
                                                >
                                                    {parsedNotes.extraNote || (
                                                        <span className="text-muted fst-italic fw-normal">
                                                            Không có ghi chú thêm nào được lưu.
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Ghi chú cũ nếu có */}
                                            {parsedNotes.legacyNote && (
                                                <div className="p-2 rounded bg-light border text-muted fs-8">
                                                    <span className="fw-bold text-secondary">
                                                        Ghi chú lưu trữ cũ:
                                                    </span>{" "}
                                                    <span style={{ whiteSpace: "pre-wrap" }}>
                                                        {parsedNotes.legacyNote}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* KHỐI 2: LỊCH SỬ KHÁM BỆNH - TÁCH BIỆT RÕ RÀNG CŨ VÀ MỚI */}
                            <div className="card border-0 shadow-sm rounded-3 mb-2">
                                <div className="card-header bg-white border-bottom py-3 px-3 px-md-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                    <div className="d-flex align-items-center gap-2">
                                        <i className="fas fa-stethoscope fs-4 text-primary"></i>
                                        <div>
                                            <h5 className="mb-0 fw-bolder text-gray-900">
                                                Lịch sử các lần khám bệnh
                                            </h5>
                                            <span className="text-muted fs-8">
                                                Hồ sơ lâm sàng, chẩn đoán và đơn thuốc qua các lần khám
                                            </span>
                                        </div>
                                    </div>
                                    <span className="badge bg-light-primary text-primary fw-bold px-3 py-2 fs-7">
                                        Tổng: {prescriptions.length} lần khám
                                    </span>
                                </div>

                                <div className="card-body p-3 p-md-4">
                                    {loadingPrescriptions && (
                                        <div className="text-center py-5">
                                            <div
                                                className="spinner-border text-primary"
                                                role="status"
                                            ></div>
                                            <div className="text-muted mt-2 fs-7">
                                                Đang tải dữ liệu hồ sơ khám bệnh...
                                            </div>
                                        </div>
                                    )}

                                    {errorPrescriptions && (
                                        <div className="alert alert-danger py-2 fs-7">
                                            <i className="fas fa-exclamation-triangle me-2"></i>
                                            {errorPrescriptions}
                                        </div>
                                    )}

                                    {!loadingPrescriptions && prescriptions.length === 0 && (
                                        <div className="text-center py-4">
                                            <div className="text-muted mb-2 fs-1">
                                                <i className="fas fa-notes-medical text-secondary opacity-50"></i>
                                            </div>
                                            <h6 className="fw-bold text-gray-700">
                                                Chưa có đơn khám nào được ghi nhận
                                            </h6>
                                            <p className="text-muted fs-7 mb-0">
                                                Bệnh nhân hiện đang ở trạng thái tiếp nhận / chờ khám.
                                                Khi bác sĩ kê đơn tại mục &quot;Kê Đơn Thuốc&quot;, lịch
                                                sử lần khám sẽ tự động cập nhật vào đây.
                                            </p>
                                        </div>
                                    )}

                                    {!loadingPrescriptions && prescriptions.length > 0 && (
                                        <div className="d-flex flex-column gap-4">
                                            {/* PHẦN 1: LẦN KHÁM MỚI NHẤT */}
                                            {latestPrescription && (
                                                <div
                                                    className="border border-2 border-primary rounded-3 shadow-sm overflow-hidden"
                                                    style={{ backgroundColor: "#ffffff" }}
                                                >
                                                    {/* Header lần khám mới */}
                                                    <div className="bg-light-primary px-3 py-2 px-md-4 py-md-3 border-bottom border-primary border-opacity-25 d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="badge bg-success text-white px-2 py-1 fs-7 fw-bold d-flex align-items-center gap-1">
                                                                <i className="fas fa-star fs-8"></i>
                                                                <span>LẦN KHÁM MỚI NHẤT</span>
                                                            </span>
                                                            <span className="fw-bold text-dark fs-6">
                                                                Ngày khám:{" "}
                                                                {latestPrescription.prescription_date}
                                                            </span>
                                                            <span className="badge bg-light text-secondary border fs-8">
                                                                Mã đơn: {latestPrescription.id}
                                                            </span>
                                                        </div>
                                                        <div className="text-muted fs-7">
                                                            Bác sĩ:{" "}
                                                            <strong className="text-dark">
                                                                {latestPrescription.doctor_name ||
                                                                    "BS. Phòng khám"}
                                                            </strong>
                                                        </div>
                                                    </div>

                                                    {/* Chi tiết lần khám mới */}
                                                    <div className="p-3 p-md-4">
                                                        {/* Chẩn đoán */}
                                                        <div className="mb-3 p-3 rounded-2 bg-light border-start border-4 border-primary">
                                                            <span className="text-muted fs-8 text-uppercase fw-bold d-block">
                                                                Chẩn đoán bệnh:
                                                            </span>
                                                            <div className="fs-6 fw-bold text-primary">
                                                                {latestPrescription.diagnosis ||
                                                                    "Chưa ghi nhận chẩn đoán"}
                                                            </div>
                                                        </div>

                                                        {/* Danh sách thuốc kê đơn */}
                                                        <div className="mb-3">
                                                            <h6 className="fw-bold text-gray-800 mb-2 d-flex align-items-center gap-2 fs-7">
                                                                <i className="fas fa-pills text-success"></i>
                                                                <span>
                                                                    Đơn thuốc đã kê (
                                                                    {
                                                                        (
                                                                            latestPrescription.prescription_items ||
                                                                            []
                                                                        ).length
                                                                    }{" "}
                                                                    loại thuốc)
                                                                </span>
                                                            </h6>
                                                            {(
                                                                latestPrescription.prescription_items || []
                                                            ).length === 0 ? (
                                                                <div className="text-muted fs-7 fst-italic p-2 bg-light rounded">
                                                                    Không có thuốc trong đơn này.
                                                                </div>
                                                            ) : (
                                                                <div className="table-responsive">
                                                                    <table className="table table-sm table-bordered align-middle fs-7 mb-0">
                                                                        <thead className="table-light">
                                                                            <tr>
                                                                                <th
                                                                                    style={{ width: "40px" }}
                                                                                    className="text-center"
                                                                                >
                                                                                    #
                                                                                </th>
                                                                                <th>Tên thuốc</th>
                                                                                <th
                                                                                    style={{ width: "90px" }}
                                                                                    className="text-center"
                                                                                >
                                                                                    Số lượng
                                                                                </th>
                                                                                <th>Cách dùng / Liều lượng</th>
                                                                                <th
                                                                                    style={{ width: "120px" }}
                                                                                    className="text-end"
                                                                                >
                                                                                    Thành tiền
                                                                                </th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {latestPrescription.prescription_items.map(
                                                                                (item, idx) => (
                                                                                    <tr key={idx}>
                                                                                        <td className="text-center text-muted">
                                                                                            {idx + 1}
                                                                                        </td>
                                                                                        <td>
                                                                                            <strong className="text-dark">
                                                                                                {item.medicine_name}
                                                                                            </strong>
                                                                                        </td>
                                                                                        <td className="text-center">
                                                                                            <span className="badge bg-light-dark text-dark fw-bold">
                                                                                                {item.quantity}{" "}
                                                                                                {item.unit || ""}
                                                                                            </span>
                                                                                        </td>
                                                                                        <td className="text-muted">
                                                                                            {[
                                                                                                item.usage,
                                                                                                item.dose,
                                                                                                item.days
                                                                                                    ? `dùng ${item.days} ngày`
                                                                                                    : ""
                                                                                            ]
                                                                                                .filter(Boolean)
                                                                                                .join(" - ") || "-"}
                                                                                        </td>
                                                                                        <td className="text-end text-dark fw-semibold">
                                                                                            {formatCurrency(
                                                                                                item.line_total ||
                                                                                                    Number(
                                                                                                        item.quantity ||
                                                                                                            0
                                                                                                    ) *
                                                                                                        Number(
                                                                                                            item.unit_price ||
                                                                                                                0
                                                                                                        )
                                                                                            )}
                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            )}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Lời dặn & Hẹn tái khám */}
                                                        <div className="row g-2 pt-2 border-top">
                                                            <div className="col-md-8">
                                                                <span className="text-muted fs-8 d-block fw-bold">
                                                                    Lời dặn / Ghi chú của bác sĩ:
                                                                </span>
                                                                <div
                                                                    className="text-dark fs-7"
                                                                    style={{ whiteSpace: "pre-wrap" }}
                                                                >
                                                                    {cleanPrescriptionNotes(
                                                                        latestPrescription.notes
                                                                    ) || (
                                                                        <span className="text-muted fst-italic">
                                                                            Không có lời dặn đặc biệt.
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4 text-md-end">
                                                                {extractNextAppointment(
                                                                    latestPrescription.notes
                                                                ) && (
                                                                    <div className="p-2 rounded bg-warning bg-opacity-10 border border-warning text-dark fs-7 mb-2 text-start text-md-end">
                                                                        <span className="text-muted fs-8 d-block">
                                                                            Lịch hẹn tái khám:
                                                                        </span>
                                                                        <strong className="text-warning-emphasis">
                                                                            <i className="fas fa-calendar-check me-1"></i>
                                                                            {extractNextAppointment(
                                                                                latestPrescription.notes
                                                                            )}
                                                                        </strong>
                                                                    </div>
                                                                )}
                                                                <div className="text-muted fs-8">
                                                                    Tổng chi phí lần khám này:
                                                                </div>
                                                                <div className="fs-5 fw-bold text-danger">
                                                                    {formatCurrency(
                                                                        calculateVisitTotal(
                                                                            latestPrescription
                                                                        )
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* PHẦN 2: CÁC LẦN KHÁM CŨ (LỊCH SỬ KHÁM TRƯỚC ĐÂY) */}
                                            <div className="mt-2">
                                                <div className="d-flex align-items-center justify-content-between mb-3">
                                                    <h6 className="fw-bold text-gray-700 mb-0 d-flex align-items-center gap-2">
                                                        <i className="fas fa-history text-secondary"></i>
                                                        <span>Lịch sử các lần khám cũ</span>
                                                        <span className="badge bg-secondary text-white fs-8">
                                                            {olderPrescriptions.length} lần
                                                        </span>
                                                    </h6>
                                                </div>

                                                {olderPrescriptions.length === 0 ? (
                                                    <div className="alert alert-light border text-muted fs-7 py-3 px-3 rounded-2">
                                                        <i className="fas fa-info-circle me-2 text-info"></i>
                                                        Bệnh nhân chưa có lịch sử lần khám cũ nào trước
                                                        đây (Lần khám trên là lần đầu tiên).
                                                    </div>
                                                ) : (
                                                    <div className="d-flex flex-column gap-3">
                                                        {olderPrescriptions.map((olderRx, idx) => {
                                                            const isExpanded =
                                                                !!expandedOlderVisits[olderRx.id];
                                                            const rxItems =
                                                                olderRx.prescription_items || [];
                                                            const nextAppt = extractNextAppointment(
                                                                olderRx.notes
                                                            );

                                                            return (
                                                                <div
                                                                    key={olderRx.id}
                                                                    className="card border rounded-3 overflow-hidden shadow-none"
                                                                    style={{
                                                                        backgroundColor: "#fafbfc"
                                                                    }}
                                                                >
                                                                    <div
                                                                        className="card-header py-2 px-3 bg-light d-flex align-items-center justify-content-between flex-wrap gap-2 cursor-pointer"
                                                                        onClick={() =>
                                                                            toggleOlderVisit(olderRx.id)
                                                                        }
                                                                        style={{ cursor: "pointer" }}
                                                                    >
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <span className="badge bg-secondary text-white fs-8">
                                                                                Lần khám {idx + 2}
                                                                            </span>
                                                                            <strong className="text-dark fs-7">
                                                                                <i className="fas fa-calendar-alt text-muted me-1"></i>
                                                                                {olderRx.prescription_date}
                                                                            </strong>
                                                                            <span className="text-muted fs-8">
                                                                                | Chẩn đoán:{" "}
                                                                                <span className="text-dark fw-semibold">
                                                                                    {olderRx.diagnosis ||
                                                                                        "Không rõ"}
                                                                                </span>
                                                                            </span>
                                                                        </div>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <span className="text-danger fw-bold fs-7">
                                                                                {formatCurrency(
                                                                                    calculateVisitTotal(
                                                                                        olderRx
                                                                                    )
                                                                                )}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-xs btn-outline-secondary"
                                                                            >
                                                                                <i
                                                                                    className={`fas fa-chevron-${
                                                                                        isExpanded
                                                                                            ? "up"
                                                                                            : "down"
                                                                                    }`}
                                                                                ></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>

                                                                    {isExpanded && (
                                                                        <div className="card-body p-3 bg-white border-top fs-7">
                                                                            <div className="mb-2">
                                                                                <span className="text-muted fs-8 d-block fw-bold">
                                                                                    Đơn thuốc lần này ({rxItems.length} loại):
                                                                                </span>
                                                                                {rxItems.length === 0 ? (
                                                                                    <span className="text-muted fst-italic">
                                                                                        Không có thuốc.
                                                                                    </span>
                                                                                ) : (
                                                                                    <ul className="list-unstyled mb-0 mt-1 ps-2 border-start border-2 border-muted">
                                                                                        {rxItems.map(
                                                                                            (it, itIdx) => (
                                                                                                <li
                                                                                                    key={itIdx}
                                                                                                    className="mb-1"
                                                                                                >
                                                                                                    <strong className="text-dark">
                                                                                                        {it.medicine_name}
                                                                                                    </strong>{" "}
                                                                                                    - SL:{" "}
                                                                                                    {it.quantity}{" "}
                                                                                                    {it.unit || ""}{" "}
                                                                                                    {it.usage
                                                                                                        ? `(${it.usage})`
                                                                                                        : ""}{" "}
                                                                                                    -{" "}
                                                                                                    <span className="text-muted">
                                                                                                        {formatCurrency(
                                                                                                            it.line_total ||
                                                                                                                0
                                                                                                        )}
                                                                                                    </span>
                                                                                                </li>
                                                                                            )
                                                                                        )}
                                                                                    </ul>
                                                                                )}
                                                                            </div>

                                                                            {olderRx.notes && (
                                                                                <div className="mt-2 pt-2 border-top text-muted fs-8">
                                                                                    <strong>Lời dặn:</strong>{" "}
                                                                                    {cleanPrescriptionNotes(
                                                                                        olderRx.notes
                                                                                    ) || "-"}
                                                                                    {nextAppt && (
                                                                                        <div className="text-warning-emphasis fw-bold mt-1">
                                                                                            Hẹn tái khám: {nextAppt}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="modal-footer bg-white px-4 py-3 d-flex justify-content-between flex-wrap gap-2">
                            <div className="d-flex align-items-center flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="btn btn-sm btn-primary"
                                    onClick={() => {
                                        onClose();
                                        if (onNewVisit) onNewVisit(patient);
                                    }}
                                >
                                    <i className="fas fa-stethoscope me-1"></i> Tiếp nhận đợt khám mới
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => onPrintInvoice && onPrintInvoice(patient)}
                                >
                                    <i className="fas fa-print me-1"></i> In phiếu đăng ký
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => {
                                        onClose();
                                        if (onEdit) onEdit(patient);
                                    }}
                                >
                                    <i className="fas fa-edit me-1"></i> Sửa thông tin
                                </button>
                            </div>
                            <button
                                type="button"
                                className="btn btn-sm btn-secondary px-4"
                                onClick={onClose}
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
    );
}

export default PatientDetailModal;
