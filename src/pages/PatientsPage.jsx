import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useExaminationTypes, usePatients, usePrescriptions } from "../hooks";
import { prescriptionsQueries } from "../lib/supabaseQueries";
import PatientDetailModal from "../components/patients/PatientDetailModal";
import {
    calculateAge,
    formatCurrency,
    genderLabel,
    parsePatientNotes,
    buildStructuredNotes,
    getResolvedVisitNotes
} from "../components/patients/patientUtils";

function PatientsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMoreModal, setViewMoreModal] = useState(false);
    const [viewMoreContent, setViewMoreContent] = useState({ title: "", text: "" });
    const [detailPatient, setDetailPatient] = useState(null);
    const [examSearchQuery, setExamSearchQuery] = useState("");
    const {
        patients,
        loading: patientsLoading,
        error: patientsError,
        searchPatients,
        addPatient,
        updatePatient,
        fetchPatients
    } = usePatients();
    const {
        prescriptions,
        loading: prescriptionsLoading,
        error: prescriptionsError,
        fetchPrescriptions
    } = usePrescriptions();

    const loading = patientsLoading || prescriptionsLoading;
    const error = patientsError || prescriptionsError;
    const {
        examinationTypes: examinationOptions,
        loading: examinationTypesLoading,
        error: examinationTypesError
    } = useExaminationTypes();

    const filteredExaminationOptions = useMemo(() => {
        const q = examSearchQuery.trim().toLowerCase();
        if (!q) return examinationOptions;
        return examinationOptions.filter((o) => (o.label || "").toLowerCase().includes(q));
    }, [examinationOptions, examSearchQuery]);

    const initialFormState = {
        name: "",
        gender: "M",
        dob: "2000-01-01",
        address: "",
        phone_number: "",
        identity_number: "",
        note_height: "",
        note_weight: "",
        note_blood_pressure: "",
        note_history: "",
        note_parity: "",
        note_gestational_age: "",
        note_due_date: "",
        note_extra: "",
        notes: "",
        examination_types: []
    };

    const [formData, setFormData] = useState(initialFormState);
    const [editingPatientId, setEditingPatientId] = useState(null);
    const [modalMode, setModalMode] = useState("create"); // "create" | "new_visit" | "edit"
    const [detectedExistingPatient, setDetectedExistingPatient] = useState(null);

    const baseFee = 50000;
    const totalExaminationCost = formData.examination_types.reduce((sum, type) => {
        const option = examinationOptions.find((o) => o.id === type);
        return sum + (option ? option.price : 0);
    }, 0);
    const totalCost = baseFee + totalExaminationCost;

    // Tạo danh sách từng lượt khám từ patients và prescriptions
    const visitRecords = useMemo(() => {
        if (!patients || patients.length === 0) return [];

        const prescriptionsByPatient = {};
        (prescriptions || []).forEach((rx) => {
            if (!rx.patient_id) return;
            if (!prescriptionsByPatient[rx.patient_id]) {
                prescriptionsByPatient[rx.patient_id] = [];
            }
            prescriptionsByPatient[rx.patient_id].push(rx);
        });

        const records = [];

        patients.forEach((patient) => {
            const patientPrescriptions = prescriptionsByPatient[patient.id] || [];

            if (patientPrescriptions.length === 0) {
                // Bệnh nhân chưa có phiếu khám trong prescriptions
                records.push({
                    recordId: `${patient.id}_initial`,
                    patientId: patient.id,
                    patient: patient,
                    prescription: null,
                    visitNumber: 1,
                    visitDate: patient.createdAt ? String(patient.createdAt).split("T")[0] : "",
                    notes: patient.notes || "",
                    createdAt: patient.createdAt || ""
                });
            } else {
                // Sắp xếp các đơn khám theo thời gian tăng dần để đánh số lần khám: 1, 2, 3...
                const sorted = [...patientPrescriptions].sort((a, b) => {
                    const timeA = a.created_at || a.prescription_date || "";
                    const timeB = b.created_at || b.prescription_date || "";
                    if (timeA !== timeB) return timeA.localeCompare(timeB);
                    return String(a.id || "").localeCompare(String(b.id || ""));
                });

                sorted.forEach((rx, idx) => {
                    records.push({
                        recordId: `${patient.id}_${rx.id}`,
                        patientId: patient.id,
                        patient: patient,
                        prescription: rx,
                        visitNumber: idx + 1,
                        visitDate: rx.prescription_date || "",
                        notes: rx.notes || patient.notes || "",
                        createdAt: rx.created_at || rx.prescription_date || ""
                    });
                });
            }
        });

        // Sắp xếp danh sách hiển thị: Lượt khám vừa tạo mới nhất luôn lên dòng đầu tiên
        records.sort((a, b) => {
            // 1. So sánh thời gian tạo thực tế (created_at có cả giờ:phút:giây)
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (a.visitDate ? new Date(a.visitDate).getTime() : 0);
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (b.visitDate ? new Date(b.visitDate).getTime() : 0);
            if (timeA !== timeB && !Number.isNaN(timeA) && !Number.isNaN(timeB)) {
                return timeB - timeA;
            }

            // 2. Nếu không có timestamp hoặc trùng nhau: So sánh ngày khám
            const dateA = a.visitDate || "";
            const dateB = b.visitDate || "";
            if (dateA !== dateB) return dateB.localeCompare(dateA);

            // 3. So sánh mã phiếu khám số thứ tự lớn hơn (RX0005 > RX0004)
            const rxNumA = a.prescription?.id ? parseInt(String(a.prescription.id).replace(/\D/g, ""), 10) : 0;
            const rxNumB = b.prescription?.id ? parseInt(String(b.prescription.id).replace(/\D/g, ""), 10) : 0;
            if (rxNumA !== rxNumB && !Number.isNaN(rxNumA) && !Number.isNaN(rxNumB)) {
                return rxNumB - rxNumA;
            }

            // 4. Số lần khám cao hơn lên trước
            return b.visitNumber - a.visitNumber;
        });

        return records;
    }, [patients, prescriptions]);

    const filteredRecords = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return visitRecords;

        return visitRecords.filter((record) => {
            const p = record.patient;
            const resolved = getResolvedVisitNotes(record);
            const text = [
                record.patientId,
                p.name || "",
                p.gender === "M" ? "Nam" : "Nữ",
                p.dob || "",
                p.phone_number || "",
                p.identity_number || "",
                `lần ${record.visitNumber}`,
                String(record.visitNumber),
                record.visitDate || "",
                resolved.extraNote || "",
                resolved.bloodPressure || "",
                resolved.weight || "",
                resolved.height || "",
                resolved.displayServiceOrDiagnosis || ""
            ]
                .join(" ")
                .toLowerCase();
            return text.includes(q);
        });
    }, [visitRecords, searchQuery]);

    const truncateText = (text, maxLength = 40) => {
        if (!text) return "-";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const showViewMoreModal = (title, text) => {
        setViewMoreContent({ title, text: text || "-" });
        setViewMoreModal(true);
    };

    const getExportRows = (rows) => {
        const headers = ["Mã BN", "Họ và Tên", "Giới", "Ngày sinh", "Điện thoại", "CCCD", "Lần khám", "Ngày khám", "Ghi chú & Sinh hiệu"];
        const lines = rows.map((row) => {
            const resolved = getResolvedVisitNotes(row);
            const noteParts = [];
            if (resolved.vitalsList.length > 0) noteParts.push(`Sinh hiệu: ${resolved.vitalsSummary}`);
            if (resolved.history) noteParts.push(`Tiền căn: ${resolved.history}`);
            if (resolved.extraNote) noteParts.push(resolved.extraNote);
            if (resolved.legacyNote && !resolved.extraNote) noteParts.push(resolved.legacyNote);
            if (resolved.displayServiceOrDiagnosis) noteParts.push(`Dịch vụ: ${resolved.displayServiceOrDiagnosis}`);
            const notesCell = noteParts.join("; ") || row.notes || "-";

            return [
                row.patientId,
                row.patient.name,
                genderLabel(row.patient.gender),
                row.patient.dob,
                row.patient.phone_number || "",
                row.patient.identity_number || "",
                `Lần ${row.visitNumber}`,
                row.visitDate || "",
                notesCell
            ];
        });

        return [headers, ...lines];
    };

    const toCsv = (rows) => {
        const allRows = getExportRows(rows);
        return allRows
            .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    const ensureRows = () => {
        if (filteredRecords.length > 0) return true;
        window.alert("Chưa có dữ liệu để xuất.");
        return false;
    };

    const handleCopy = async () => {
        if (!ensureRows()) return;
        const csv = toCsv(filteredRecords);
        await navigator.clipboard.writeText(csv);
        window.alert("Đã sao chép danh sách bệnh nhân.");
    };

    const handleExcel = () => {
        if (!ensureRows()) return;
        const headers = ["Mã BN", "Họ và Tên", "Giới", "Ngày sinh", "Điện thoại", "CCCD", "Lần khám", "Ngày khám", "Ghi chú & Sinh hiệu"];
        const body = filteredRecords.map((row) => {
            const parsedDob = row.patient.dob ? new Date(row.patient.dob) : null;
            const dobCell = parsedDob && !Number.isNaN(parsedDob.getTime()) ? parsedDob : row.patient.dob || "";

            const resolved = getResolvedVisitNotes(row);
            const noteParts = [];
            if (resolved.vitalsList.length > 0) noteParts.push(`Sinh hiệu: ${resolved.vitalsSummary}`);
            if (resolved.history) noteParts.push(`Tiền căn: ${resolved.history}`);
            if (resolved.extraNote) noteParts.push(resolved.extraNote);
            if (resolved.legacyNote && !resolved.extraNote) noteParts.push(resolved.legacyNote);
            if (resolved.displayServiceOrDiagnosis) noteParts.push(`Dịch vụ: ${resolved.displayServiceOrDiagnosis}`);
            const notesCell = noteParts.join("; ") || row.notes || "-";

            return [
                row.patientId,
                row.patient.name,
                genderLabel(row.patient.gender),
                dobCell,
                row.patient.phone_number || "",
                row.patient.identity_number || "",
                `Lần ${row.visitNumber}`,
                row.visitDate || "",
                notesCell
            ];
        });

        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...body], { cellDates: true });
        worksheet["!cols"] = [
            { wch: 12 },
            { wch: 24 },
            { wch: 10 },
            { wch: 14 },
            { wch: 16 },
            { wch: 18 },
            { wch: 12 },
            { wch: 14 },
            { wch: 40 }
        ];

        for (let rowIndex = 2; rowIndex <= body.length + 1; rowIndex += 1) {
            const dobCell = worksheet[`D${rowIndex}`];
            if (dobCell && (dobCell.t === "d" || dobCell.t === "n")) {
                dobCell.z = "dd/mm/yyyy";
            }
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Danh sach luot kham");
        XLSX.writeFile(workbook, "danh-sach-luot-kham.xlsx");
    };

    const openPrintableWindow = (title) => {
        const tableRows = filteredRecords
            .map((r) => {
                const resolved = getResolvedVisitNotes(r);
                const noteParts = [];
                if (resolved.vitalsList.length > 0) noteParts.push(`Sinh hiệu: ${resolved.vitalsSummary}`);
                if (resolved.history) noteParts.push(`Tiền căn: ${resolved.history}`);
                if (resolved.extraNote) noteParts.push(resolved.extraNote);
                if (resolved.legacyNote && !resolved.extraNote) noteParts.push(resolved.legacyNote);
                if (resolved.displayServiceOrDiagnosis) noteParts.push(`Dịch vụ: ${resolved.displayServiceOrDiagnosis}`);
                const notesCell = noteParts.join("; ") || r.notes || "-";

                return `<tr><td>${r.patientId}</td><td>${r.patient.name}</td><td>${genderLabel(r.patient.gender)}</td><td>${r.patient.dob}</td><td>${r.patient.phone_number || ""}</td><td>${r.patient.identity_number || ""}</td><td>Lần ${r.visitNumber}</td><td>${r.visitDate || ""}</td><td>${notesCell}</td></tr>`;
            })
            .join("");

        const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8" /><title>${title}</title><style>body { font-family: Arial, sans-serif; padding: 24px; } h2 { margin-bottom: 16px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; } th { background: #f3f4f6; text-align: left; }</style></head><body><h2>${title}</h2><table><thead><tr><th>Mã BN</th><th>Họ và Tên</th><th>Giới</th><th>Ngày sinh</th><th>Điện thoại</th><th>CCCD</th><th>Lần khám</th><th>Ngày khám</th><th>Ghi chú &amp; Sinh hiệu</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

        const printWindow = window.open("", "_blank", "width=1000,height=700");
        if (!printWindow) return;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const handlePdf = () => {
        if (!ensureRows()) return;
        openPrintableWindow("Danh sách bệnh nhân (PDF)");
    };

    const handlePrint = () => {
        if (!ensureRows()) return;
        openPrintableWindow("Danh sách bệnh nhân");
    };

    const handleSearch = async(query) => {
        setSearchQuery(query);
        if (query.trim()) {
            await searchPatients(query);
        }
    };

    const printPatientInvoice = (patient) => {
        let examinationTypes = [];
        if (patient.examination_types) {
            try {
                examinationTypes =
                    typeof patient.examination_types === "string" ?
                    JSON.parse(patient.examination_types) :
                    patient.examination_types;
            } catch (e) {
                examinationTypes = [];
            }
        }

        const examinationList = examinationTypes ?
            examinationTypes
            .map((type) => {
                const option = examinationOptions.find((o) => o.id === type);
                return `<tr><td>${option?.label || type}</td><td style="text-align: right">${Number(option?.price || 0).toLocaleString("vi-VN")} đ</td></tr>`;
            })
            .join("") :
            "";

        const patientExamCost = examinationTypes ?
            examinationTypes.reduce((sum, type) => {
                const option = examinationOptions.find((o) => o.id === type);
                return sum + (option ? option.price : 0);
            }, 0) :
            0;

        const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><title>Đơn khám</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h2,h3{margin:0 0 10px 0}p{margin:8px 0}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #d1d5db;padding:8px;font-size:13px}th{background:#f3f4f6;text-align:left}.total{margin-top:12px;font-size:16px;font-weight:700}</style></head><body><h2>Đơn Khám Sức Khỏe</h2><div><strong>Mã BN:</strong> ${patient.id}</div><div><strong>Họ và Tên:</strong> ${patient.name}</div><div><strong>Giới tính:</strong> ${genderLabel(patient.gender)}</div><div><strong>Ngày sinh:</strong> ${patient.dob}</div><div><strong>Điện thoại:</strong> ${patient.phone_number || "-"}</div><div><strong>Địa chỉ:</strong> ${patient.address || "-"}</div><div><strong>CCCD:</strong> ${patient.identity_number || "-"}</div><table><thead><tr><th>Hình thức khám</th><th>Giá tiền</th></tr></thead><tbody><tr><td>Phí khám cố định</td><td style="text-align: right">${Number(baseFee).toLocaleString("vi-VN")} đ</td></tr>${examinationList}</tbody></table><div class="total">Tổng chi phí: ${Number(baseFee + patientExamCost).toLocaleString("vi-VN")} đ</div></body></html>`;

        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const createPrescriptionVisit = async (patientId, patientData) => {
        const selectedExamLabels = (patientData.examination_types || [])
            .map((typeId) => {
                const opt = examinationOptions.find((o) => o.id === typeId);
                return opt ? opt.label : typeId;
            })
            .filter(Boolean);

        const diagnosisText = selectedExamLabels.length > 0
            ? selectedExamLabels.join(", ")
            : "Tiếp nhận khám bệnh";

        const lines = [];
        const vitals = [];
        if (patientData.note_height?.trim()) vitals.push(`Chiều cao: ${patientData.note_height.trim()}`);
        if (patientData.note_weight?.trim()) vitals.push(`Cân nặng: ${patientData.note_weight.trim()}`);
        if (patientData.note_blood_pressure?.trim()) vitals.push(`Huyết áp: ${patientData.note_blood_pressure.trim()}`);
        if (vitals.length > 0) lines.push(vitals.join(" | "));
        if (patientData.note_history?.trim()) lines.push(`Tiền căn: ${patientData.note_history.trim()}`);

        const obstetric = [];
        if (patientData.note_parity?.trim()) obstetric.push(`Con lần thứ: ${patientData.note_parity.trim()}`);
        if (patientData.note_gestational_age?.trim()) obstetric.push(`Tuổi thai: ${patientData.note_gestational_age.trim()}`);
        if (patientData.note_due_date?.trim()) obstetric.push(`Dự sinh: ${patientData.note_due_date.trim()}`);
        if (obstetric.length > 0) lines.push(obstetric.join(" | "));

        if (patientData.note_extra?.trim()) lines.push(`Ghi chú thêm:\n${patientData.note_extra.trim()}`);
        if (selectedExamLabels.length > 0) lines.push(`[Dịch vụ tiếp nhận]: ${selectedExamLabels.join(", ")}`);

        const visitNotes = lines.join("\n");

        return await prescriptionsQueries.create({
            patient_id: patientId,
            prescription_date: new Date().toISOString().split("T")[0],
            diagnosis: diagnosisText,
            doctor_name: null,
            notes: visitNotes || null
        }, []);
    };

    const handleApplyExistingPatient = (existing) => {
        openNewVisitModal(existing);
    };

    const onInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        // Tự động phát hiện hồ sơ bệnh nhân cũ qua số CCCD
        if (name === "identity_number") {
            const clean = value.trim().toLowerCase();
            if (clean.length >= 9) {
                const found = patients.find(
                    (p) =>
                        p.id !== editingPatientId &&
                        (p.identity_number || "").trim().toLowerCase() === clean
                );
                setDetectedExistingPatient(found || null);
            } else {
                setDetectedExistingPatient(null);
            }
        }
    };

    const onExaminationChange = (examType) => {
        setFormData((prev) => {
            const types = prev.examination_types.includes(examType) ?
                prev.examination_types.filter((t) => t !== examType) :
                [...prev.examination_types, examType];
            return { ...prev, examination_types: types };
        });
    };

    const openCreateModal = () => {
        setModalMode("create");
        setEditingPatientId(null);
        setDetectedExistingPatient(null);
        setFormData(initialFormState);
        setShowCreateModal(true);
        setExamSearchQuery("");
    };

    const openNewVisitModal = (patient) => {
        setModalMode("new_visit");
        setEditingPatientId(patient.id);
        setDetectedExistingPatient(null);

        const parsed = parsePatientNotes(patient.notes || "");

        // Kế thừa thông tin cá nhân và sinh hiệu gần nhất để không bị mất khi nhân viên chỉ tạo nhanh lần khám
        setFormData({
            name: patient.name || "",
            gender: patient.gender || "M",
            dob: patient.dob || "2000-01-01",
            address: patient.address || "",
            phone_number: patient.phone_number || "",
            identity_number: patient.identity_number || "",
            note_height: parsed.height || "",
            note_weight: parsed.weight || "", // Điền sẵn cân nặng gần nhất
            note_blood_pressure: parsed.bloodPressure || "", // Điền sẵn huyết áp gần nhất
            note_history: parsed.history || "",
            note_parity: parsed.parity || "",
            note_gestational_age: parsed.gestationalAge || "",
            note_due_date: parsed.dueDate || "",
            note_extra: "", // Lý do / triệu chứng đợt này
            notes: parsed.legacyNote || "",
            examination_types: [] // Chọn dịch vụ khám đợt này
        });
        setShowCreateModal(true);
        setExamSearchQuery("");
    };

    const openEditModal = (patient) => {
        setModalMode("edit");
        setEditingPatientId(patient.id);
        setDetectedExistingPatient(null);
        let examTypes = [];
        try {
            examTypes = patient.examination_types
                ? typeof patient.examination_types === 'string'
                    ? JSON.parse(patient.examination_types)
                    : patient.examination_types
                : [];
        } catch (e) {
            examTypes = [];
        }

        const parsed = parsePatientNotes(patient.notes || "");

        setFormData({
            name: patient.name || "",
            gender: patient.gender || "M",
            dob: patient.dob || "2000-01-01",
            address: patient.address || "",
            phone_number: patient.phone_number || "",
            identity_number: patient.identity_number || "",
            note_height: parsed.height,
            note_weight: parsed.weight,
            note_blood_pressure: parsed.bloodPressure,
            note_history: parsed.history,
            note_parity: parsed.parity,
            note_gestational_age: parsed.gestationalAge,
            note_due_date: parsed.dueDate,
            note_extra: parsed.extraNote,
            notes: parsed.legacyNote,
            examination_types: examTypes
        });
        setShowCreateModal(true);
        setExamSearchQuery("");
    };

    const handleCreatePatient = async(event) => {
        event.preventDefault();
        try {
            const maxId = patients
                .filter((p) => p.id.startsWith("BN"))
                .map((p) => parseInt(p.id.replace("BN", ""), 10))
                .filter((n) => !Number.isNaN(n));
            const nextNum = maxId.length > 0 ? Math.max(...maxId) + 1 : 1;
            const newPatientId = `BN${String(nextNum).padStart(3, "0")}`;

            await addPatient({
                id: newPatientId,
                name: formData.name,
                dob: formData.dob,
                gender: formData.gender,
                phone_number: formData.phone_number,
                address: formData.address,
                identity_number: formData.identity_number,
                notes: buildStructuredNotes(formData),
                examination_types: JSON.stringify(formData.examination_types)
            });

            // Tự động tạo lần khám đầu tiên (phiếu khám) cho bệnh nhân mới
            try {
                await createPrescriptionVisit(newPatientId, formData);
            } catch (errVisit) {
                console.error("Lỗi tạo lần khám đầu tiên:", errVisit);
            }

            if (fetchPrescriptions) await fetchPrescriptions();
            if (fetchPatients) await fetchPatients();

            setFormData(initialFormState);
            setDetectedExistingPatient(null);
            setShowCreateModal(false);
            window.alert(`Đã tiếp nhận bệnh nhân "${formData.name}" (${newPatientId}) và tạo phiếu khám thành công!`);
        } catch (err) {
            window.alert(`Lỗi: ${err.message}`);
        }
    };

    const handleUpdatePatient = async(event) => {
        event.preventDefault();
        if (!editingPatientId) return;
        try {
            // Nếu đang tạo lần khám mới, hợp nhất dữ liệu sinh hiệu để bảo tồn dữ liệu cũ của bệnh nhân nếu đợt này chưa đo lại
            const currentPatient = patients.find((p) => p.id === editingPatientId);
            const prevParsed = parsePatientNotes(currentPatient?.notes || "");

            const mergedForm = {
                ...formData,
                note_height: formData.note_height?.trim() || prevParsed.height,
                note_weight: formData.note_weight?.trim() || prevParsed.weight,
                note_blood_pressure: formData.note_blood_pressure?.trim() || prevParsed.bloodPressure,
                note_history: formData.note_history?.trim() || prevParsed.history,
                note_parity: formData.note_parity?.trim() || prevParsed.parity,
                note_gestational_age: formData.note_gestational_age?.trim() || prevParsed.gestationalAge,
                note_due_date: formData.note_due_date?.trim() || prevParsed.dueDate,
                notes: formData.notes?.trim() || prevParsed.legacyNote
            };

            await updatePatient(editingPatientId, {
                name: formData.name,
                dob: formData.dob,
                gender: formData.gender,
                phone_number: formData.phone_number,
                address: formData.address,
                identity_number: formData.identity_number,
                notes: buildStructuredNotes(mergedForm),
                examination_types: JSON.stringify(formData.examination_types)
            });

            // Nếu đang trong chế độ tiếp nhận đợt khám mới cho bệnh nhân cũ
            if (modalMode === "new_visit") {
                try {
                    await createPrescriptionVisit(editingPatientId, mergedForm);
                    window.alert(`Đã tiếp nhận đợt khám mới thành công cho bệnh nhân "${formData.name}"!`);
                } catch (errVisit) {
                    console.error("Lỗi tạo lần khám mới:", errVisit);
                    window.alert(`Đã cập nhật thông tin nhưng gặp lỗi khi tạo phiếu khám mới: ${errVisit.message}`);
                }
            } else {
                window.alert(`Đã cập nhật hồ sơ bệnh nhân "${formData.name}" thành công!`);
            }

            if (fetchPrescriptions) await fetchPrescriptions();
            if (fetchPatients) await fetchPatients();

            setEditingPatientId(null);
            setDetectedExistingPatient(null);
            setShowCreateModal(false);
        } catch (err) {
            window.alert(`Lỗi: ${err.message}`);
        }
    };

    return (
        <>
            <div className="card">
                <div className="card-header border-0 pt-6">
                    <div className="card-title">
                        <h2 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bolder fs-3 mb-1">Danh sách Bệnh Nhân</span>
                            <span className="text-muted mt-1 fw-bold fs-7">Danh sách bệnh nhân của bạn</span>
                        </h2>
                    </div>
                    <div className="card-toolbar">
                        <div className="d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-primary js-create-patient"
                                id="createPatient"
                                onClick={openCreateModal}
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

                    <div id="patient_table_wrapper" className="dataTables_wrapper dt-bootstrap4 no-footer">
                        <div className="row align-items-center g-2">
                            <div className="col-12 col-lg-8">
                                <div className="dt-buttons btn-group flex-wrap">
                                    <button
                                        className="btn btn-secondary btn-light btn-sm"
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                    >
                                        <span><i className="fas fa-search me-1"></i>Tìm kiếm nâng cao</span>
                                    </button>
                                    <button
                                        className="btn btn-secondary buttons-copy buttons-html5 btn-light-primary btn-sm"
                                        type="button"
                                        onClick={handleCopy}
                                    >
                                        <span><i className="fas fa-copy me-1"></i>Sao chép</span>
                                    </button>
                                    <button
                                        className="btn btn-secondary buttons-excel buttons-html5 btn-light-success btn-sm"
                                        type="button"
                                        onClick={handleExcel}
                                    >
                                        <span><i className="fas fa-file-excel me-1"></i>Excel</span>
                                    </button>
                                    <button
                                        className="btn btn-secondary buttons-pdf buttons-html5 btn-light-danger btn-sm"
                                        type="button"
                                        onClick={handlePdf}
                                    >
                                        <span><i className="fas fa-file-pdf me-1"></i>PDF</span>
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-light-info btn-sm"
                                        type="button"
                                        onClick={handlePrint}
                                    >
                                        <span><i className="fas fa-print me-1"></i>In báo cáo</span>
                                    </button>
                                </div>
                            </div>
                            <div className="col-12 col-lg-4">
                                <div id="patient_table_filter" className="dataTables_filter">
                                    <label>
                                        Tìm kiếm:
                                        <input
                                            type="search"
                                            className="form-control form-control-sm form-control-solid"
                                            placeholder="Tìm kiếm theo Tên, CCCD, SĐT, Mã BN..."
                                            aria-controls="patient_table"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-12">
                                <div className="table-responsive">
                                <table
                                    id="patient_table"
                                    className="table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline"
                                    aria-describedby="patient_table_info"
                                >
                                    <thead>
                                        <tr className="text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0">
                                            <th style={{ width: "85px" }}>Mã BN</th>
                                            <th style={{ width: "150px" }}>Họ và Tên</th>
                                            <th style={{ width: "95px" }}>Ngày sinh</th>
                                            <th style={{ width: "110px" }}>Số điện thoại</th>
                                            <th style={{ width: "220px" }}>Ghi chú &amp; Sinh hiệu</th>
                                            <th style={{ width: "95px" }}>Lần khám</th>
                                            <th className="text-end" style={{ width: "240px" }}>Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRecords.length === 0 ? (
                                            <tr className="odd">
                                                <td valign="top" colSpan="7" className="dataTables_empty">Không có dữ liệu</td>
                                            </tr>
                                        ) : (
                                            filteredRecords.map((record) => {
                                                const patient = record.patient;
                                                const resolved = getResolvedVisitNotes(record);
                                                const vitalsList = resolved.vitalsList;
                                                const vitalsSummary = resolved.vitalsSummary;
                                                const serviceOrDiag = resolved.displayServiceOrDiagnosis;

                                                return (
                                                    <tr key={record.recordId} className="odd">
                                                        <td>
                                                            <strong className="text-dark">{record.patientId}</strong>
                                                        </td>
                                                        <td>
                                                            <div className="fw-bold text-gray-800">{patient.name}</div>
                                                            <span className="text-muted fs-8">{genderLabel(patient.gender)}</span>
                                                        </td>
                                                        <td>{patient.dob}</td>
                                                        <td>{patient.phone_number || "-"}</td>
                                                        <td>
                                                            {(!resolved.extraNote && vitalsList.length === 0 && !resolved.legacyNote && !resolved.history && !serviceOrDiag) ? (
                                                                <span className="text-muted">-</span>
                                                            ) : (
                                                                <div>
                                                                    {vitalsList.length > 0 && (
                                                                        <div className="mb-1">
                                                                            <span className="badge bg-light-primary text-primary border border-primary border-opacity-25 fs-8">
                                                                                <i className="fas fa-heartbeat me-1 fs-9"></i>
                                                                                {vitalsSummary}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                    {resolved.extraNote ? (
                                                                        <div className="d-flex align-items-center gap-1">
                                                                            <span className="text-dark fw-semibold fs-7" title={resolved.extraNote}>
                                                                                {truncateText(resolved.extraNote, 28)}
                                                                            </span>
                                                                            <button
                                                                                type="button"
                                                                                className="btn btn-xs btn-light-warning p-1"
                                                                                onClick={() =>
                                                                                    showViewMoreModal(
                                                                                        `Ghi chú - ${patient.name} (Lần ${record.visitNumber})`,
                                                                                        `Bệnh nhân: ${patient.name} (${patient.id}) - Lần khám: ${record.visitNumber}\n` +
                                                                                            (record.visitDate ? `Ngày khám: ${record.visitDate}\n` : "") +
                                                                                            (vitalsSummary ? `Sinh hiệu: ${vitalsSummary}\n` : "") +
                                                                                            (resolved.history ? `Tiền căn: ${resolved.history}\n` : "") +
                                                                                            (resolved.gestationalAge ? `Tuổi thai: ${resolved.gestationalAge} - Dự sinh: ${resolved.dueDate || "-"}\n` : "") +
                                                                                            (serviceOrDiag ? `Dịch vụ: ${serviceOrDiag}\n` : "") +
                                                                                            `\nGhi chú thêm:\n${resolved.extraNote}` +
                                                                                            (resolved.legacyNote ? `\n\n--- Ghi chú cũ ---\n${resolved.legacyNote}` : "")
                                                                                    )
                                                                                }
                                                                                title="Xem chi tiết ghi chú"
                                                                            >
                                                                                <i className="fas fa-eye" style={{ fontSize: "11px" }}></i>
                                                                            </button>
                                                                        </div>
                                                                    ) : vitalsList.length > 0 ? (
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-xs btn-light text-muted border py-0 px-2 fs-8"
                                                                            onClick={() =>
                                                                                showViewMoreModal(
                                                                                    `Chỉ số sinh hiệu - ${patient.name} (Lần ${record.visitNumber})`,
                                                                                    `Bệnh nhân: ${patient.name} (${patient.id}) - Lần khám: ${record.visitNumber}\n` +
                                                                                        (record.visitDate ? `Ngày khám: ${record.visitDate}\n\n` : "\n") +
                                                                                        `Chiều cao: ${resolved.height || "-"}\n` +
                                                                                        `Cân nặng: ${resolved.weight || "-"}\n` +
                                                                                        `Huyết áp: ${resolved.bloodPressure || "-"}\n` +
                                                                                        `Tiền căn: ${resolved.history || "-"}` +
                                                                                        (serviceOrDiag ? `\nDịch vụ tiếp nhận: ${serviceOrDiag}` : "")
                                                                                )
                                                                            }
                                                                        >
                                                                            Chi tiết chỉ số
                                                                        </button>
                                                                    ) : serviceOrDiag ? (
                                                                        <span className="badge bg-light-info text-info border border-info border-opacity-25 fs-8" title={serviceOrDiag}>
                                                                            <i className="fas fa-stethoscope me-1 fs-9"></i>
                                                                            {truncateText(serviceOrDiag, 26)}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted fs-8">{truncateText(resolved.legacyNote, 30)}</span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <span className="badge bg-light-primary text-primary fw-bolder fs-8 border border-primary border-opacity-25 px-2 py-1">
                                                                Lần {record.visitNumber}
                                                            </span>
                                                            {record.visitDate && (
                                                                <div className="text-muted fs-9 mt-1" style={{ whiteSpace: "nowrap" }}>
                                                                    <i className="far fa-calendar-alt me-1"></i>
                                                                    {record.visitDate}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="text-end">
                                                            <div className="d-flex flex-nowrap justify-content-end gap-1">
                                                                <button
                                                                    className="btn btn-sm btn-primary"
                                                                    style={{ whiteSpace: "nowrap" }}
                                                                    onClick={() => openNewVisitModal(patient)}
                                                                    title="Tiếp nhận khám đợt mới cho bệnh nhân này"
                                                                >
                                                                    <i className="fas fa-stethoscope me-1"></i>
                                                                    Khám mới
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-info"
                                                                    style={{ whiteSpace: "nowrap" }}
                                                                    onClick={() => setDetailPatient(patient)}
                                                                    title="Xem hồ sơ chi tiết, đơn thuốc và các lần khám cũ/mới"
                                                                >
                                                                    <i className="fas fa-history me-1"></i>
                                                                    Lịch sử khám
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-warning"
                                                                    style={{ whiteSpace: "nowrap" }}
                                                                    onClick={() => openEditModal(patient)}
                                                                    title="Chỉnh sửa thông tin bệnh nhân"
                                                                >
                                                                    <i className="fas fa-edit me-1"></i>
                                                                    Sửa
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    style={{ whiteSpace: "nowrap" }}
                                                                    onClick={() => printPatientInvoice(patient)}
                                                                    title="In phiếu đăng ký khám"
                                                                >
                                                                    <i className="fas fa-print me-1"></i>
                                                                    In đơn
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                                </div>
                                <div
                                    id="patient_table_processing"
                                    className="dataTables_processing"
                                    style={{ display: "none" }}
                                >
                                    Đang xử lý...
                                </div>
                            </div>
                        </div>

                        <div className="row">
                            <div className="col-sm-12 col-md-5">
                                <div
                                    className="dataTables_info"
                                    id="patient_table_info"
                                    role="status"
                                    aria-live="polite"
                                >
                                    Hiển thị {filteredRecords.length === 0 ? "không có bản ghi" : `${filteredRecords.length} bản ghi`}
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-7">
                                <div className="dataTables_paginate paging_simple_numbers" id="patient_table_paginate">
                                    <ul className="pagination">
                                        <li className="paginate_button page-item previous disabled" id="patient_table_previous">
                                            <a
                                                href="#"
                                                aria-controls="patient_table"
                                                data-dt-idx="0"
                                                tabIndex="0"
                                                className="page-link"
                                            >
                                                Lùi
                                            </a>
                                        </li>
                                        <li className="paginate_button page-item next disabled" id="patient_table_next">
                                            <a
                                                href="#"
                                                aria-controls="patient_table"
                                                data-dt-idx="1"
                                                tabIndex="0"
                                                className="page-link"
                                            >
                                                Tiếp
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {showCreateModal && (
                        <>
                            <div
                                className="modal fade show d-block"
                                id="modal_patient"
                                data-bs-backdrop="static"
                                data-bs-keyboard="false"
                                tabIndex="-1"
                                aria-hidden="true"
                            >
                                <div className="modal-dialog modal-dialog-centered modal-lg">
                                    <div className="modal-content">
                                                <div className="modal-header">
                                                    <div>
                                                        <h5 className="modal-title mb-0">
                                                            {modalMode === "new_visit"
                                                                ? "Tiếp nhận đợt khám mới"
                                                                : modalMode === "edit"
                                                                ? "Sửa hồ sơ bệnh nhân"
                                                                : "Thêm bệnh nhân mới & Tiếp nhận khám"}
                                                        </h5>
                                                        {editingPatientId && (
                                                            <span className="text-muted fs-8">
                                                                Mã BN: <strong className="text-primary">{editingPatientId}</strong>
                                                            </span>
                                                        )}
                                                    </div>
                                            <button
                                                type="button"
                                                className="btn btn-icon btn-sm btn-active-light-primary ms-2"
                                                aria-label="Close"
                                                onClick={() => {
                                                    setShowCreateModal(false);
                                                    setDetectedExistingPatient(null);
                                                }}
                                            >
                                                <span className="svg-icon svg-icon-2x">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="black" />
                                                        <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="black" />
                                                    </svg>
                                                </span>
                                            </button>
                                        </div>
                                        <div className="modal-body">
                                            <form onSubmit={editingPatientId ? handleUpdatePatient : handleCreatePatient}>
                                                {/* BANNER THÔNG BÁO NẾU ĐANG TIẾP NHẬN / CẬP NHẬT CHO BỆNH NHÂN CŨ */}
                                                {editingPatientId && (
                                                    <div
                                                        className={`alert ${
                                                            modalMode === "new_visit"
                                                                ? "alert-primary border-primary"
                                                                : "alert-info border-info"
                                                        } py-2 px-3 mb-3 d-flex flex-column flex-sm-row align-items-sm-center justify-content-between rounded-3 border gap-2`}
                                                    >
                                                        <div className="d-flex align-items-center gap-2">
                                                            <i
                                                                className={`fas ${
                                                                    modalMode === "new_visit"
                                                                        ? "fa-stethoscope text-primary"
                                                                        : "fa-user-edit text-info"
                                                                } fs-4`}
                                                            ></i>
                                                            <div>
                                                                <span className="fw-bold text-dark fs-7">
                                                                    {modalMode === "new_visit"
                                                                        ? "Đang tiếp nhận đợt khám mới cho:"
                                                                        : "Đang chỉnh sửa hồ sơ:"}
                                                                </span>{" "}
                                                                <span className="text-primary fw-bold fs-7">
                                                                    {formData.name || "(Chưa có tên)"} ({editingPatientId})
                                                                </span>
                                                                {modalMode === "new_visit" && (
                                                                    <div className="text-muted fs-8 mt-0">
                                                                        Hệ thống sẽ ghi nhận 1 lần khám mới cho ngày hôm nay và chuyển tới hàng đợi khám/kê đơn.
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-outline-info text-nowrap"
                                                                onClick={() => {
                                                                    const p = patients.find((x) => x.id === editingPatientId);
                                                                    if (p) setDetailPatient(p);
                                                                }}
                                                                title="Xem toàn bộ bệnh án và các lần khám cũ của bệnh nhân này"
                                                            >
                                                                <i className="fas fa-history me-1"></i> Xem các lần khám cũ
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="btn btn-xs btn-outline-secondary text-nowrap"
                                                                onClick={() => {
                                                                    setEditingPatientId(null);
                                                                    setModalMode("create");
                                                                }}
                                                                title="Hủy liên kết với mã BN này để lưu thành hồ sơ bệnh nhân mới độc lập"
                                                            >
                                                                <i className="fas fa-plus me-1"></i> Tạo BN mới
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* KHỐI 1: THÔNG TIN HÀNH CHÍNH */}
                                                <div className="card border p-3 rounded mb-3 bg-light-subtle">
                                                    <div className="fw-bold text-gray-800 mb-2 fs-7 d-flex align-items-center gap-1">
                                                        <i className="fas fa-id-card text-primary"></i>
                                                        <span>Thông tin hành chính</span>
                                                    </div>
                                                    <div className="row g-2">
                                                        <div className="col-12 col-md-6">
                                                            <label className="form-label required">Họ và Tên</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="name"
                                                                value={formData.name}
                                                                onChange={onInputChange}
                                                                placeholder="Nguyễn Văn A"
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-6 col-md-3">
                                                            <label className="form-label required">Giới tính</label>
                                                            <select
                                                                className="form-select"
                                                                name="gender"
                                                                value={formData.gender}
                                                                onChange={onInputChange}
                                                            >
                                                                <option value="M">Nam</option>
                                                                <option value="F">Nữ</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-6 col-md-3">
                                                            <label className="form-label required">Ngày sinh</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="dob"
                                                                value={formData.dob}
                                                                onChange={onInputChange}
                                                                required
                                                            />
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <label className="form-label">Số điện thoại</label>
                                                            <input
                                                                type="tel"
                                                                className="form-control"
                                                                name="phone_number"
                                                                value={formData.phone_number}
                                                                onChange={onInputChange}
                                                                placeholder="0901234567"
                                                            />
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <label className="form-label">CCCD / Định danh</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="identity_number"
                                                                value={formData.identity_number}
                                                                onChange={onInputChange}
                                                                placeholder="Số CCCD"
                                                            />
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <label className="form-label">Địa chỉ</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="address"
                                                                value={formData.address}
                                                                onChange={onInputChange}
                                                                placeholder="Địa chỉ cư trú"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* THÔNG TIN GỢI Ý HỒ SƠ BỆNH NHÂN CŨ THEO CCCD */}
                                                    {detectedExistingPatient && (
                                                        <div
                                                            className="alert border border-primary border-opacity-25 rounded-3 p-3 mt-3 mb-0 shadow-sm"
                                                            style={{ backgroundColor: "#f0f9ff" }}
                                                        >
                                                            <div className="d-flex align-items-start gap-3">
                                                                <div
                                                                    className="d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
                                                                    style={{ width: "36px", height: "36px", fontSize: "16px" }}
                                                                >
                                                                    <i className="fas fa-user-check"></i>
                                                                </div>
                                                                <div className="flex-grow-1">
                                                                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                                                                        <h6 className="fw-bold text-dark mb-0 fs-6">
                                                                            Tìm thấy hồ sơ bệnh nhân cũ: <span className="text-primary">{detectedExistingPatient.name}</span>
                                                                        </h6>
                                                                        <span className="badge bg-light-primary text-primary fw-bold">
                                                                            Mã BN: {detectedExistingPatient.id}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-gray-700 fs-7 mt-1">
                                                                        <strong>Ngày sinh:</strong> {detectedExistingPatient.dob || "-"} | {" "}
                                                                        <strong>SĐT:</strong> {detectedExistingPatient.phone_number || "-"} | {" "}
                                                                        <strong>Địa chỉ:</strong> {truncateText(detectedExistingPatient.address, 35)}
                                                                    </div>
                                                                    {detectedExistingPatient.notes && (
                                                                        <div className="mt-1 fs-8 text-muted fst-italic">
                                                                            <i className="fas fa-info-circle me-1"></i>
                                                                            Ghi chú cũ: {truncateText(parsePatientNotes(detectedExistingPatient.notes).extraNote || detectedExistingPatient.notes, 80)}
                                                                        </div>
                                                                    )}
                                                                    <div className="d-flex align-items-center flex-wrap gap-2 mt-2 pt-2 border-top border-primary border-opacity-25">
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-info d-flex align-items-center gap-1"
                                                                            onClick={() => setDetailPatient(detectedExistingPatient)}
                                                                            title="Xem toàn bộ hồ sơ, chẩn đoán và đơn thuốc của những lần khám trước"
                                                                        >
                                                                            <i className="fas fa-history"></i>
                                                                            <span>Xem các lần khám cũ</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-primary d-flex align-items-center gap-1"
                                                                            onClick={() => handleApplyExistingPatient(detectedExistingPatient)}
                                                                            title="Nạp thông tin bệnh nhân này và bắt đầu tiếp nhận đợt khám mới"
                                                                        >
                                                                            <i className="fas fa-stethoscope"></i>
                                                                            <span>Tiếp nhận đợt khám mới</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            className="btn btn-sm btn-light text-muted ms-auto"
                                                                            onClick={() => setDetectedExistingPatient(null)}
                                                                        >
                                                                            Đóng
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* KHỐI 2: CHỈ SỐ SINH HIỆU & TIỀN CĂN */}
                                                <div className="card border p-3 rounded mb-3 bg-light-subtle">
                                                    <div className="fw-bold text-gray-800 mb-2 fs-7 d-flex align-items-center gap-1">
                                                        <i className="fas fa-heartbeat text-danger"></i>
                                                        <span>Chỉ số sinh hiệu &amp; Lâm sàng</span>
                                                    </div>
                                                    <div className="row g-2">
                                                        <div className="col-4 col-md-4">
                                                            <label className="form-label">Chiều cao</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="note_height"
                                                                value={formData.note_height}
                                                                onChange={onInputChange}
                                                                placeholder="VD: 160 cm"
                                                            />
                                                        </div>
                                                        <div className="col-4 col-md-4">
                                                            <label className="form-label">Cân nặng</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="note_weight"
                                                                value={formData.note_weight}
                                                                onChange={onInputChange}
                                                                placeholder="VD: 55 kg"
                                                            />
                                                        </div>
                                                        <div className="col-4 col-md-4">
                                                            <label className="form-label">Huyết áp</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="note_blood_pressure"
                                                                value={formData.note_blood_pressure}
                                                                onChange={onInputChange}
                                                                placeholder="VD: 120/80"
                                                            />
                                                        </div>
                                                        <div className="col-12">
                                                            <label className="form-label">Tiền căn bệnh lý</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="note_history"
                                                                value={formData.note_history}
                                                                onChange={onInputChange}
                                                                placeholder="Tiền căn bệnh nền (tiểu đường, tim mạch, dị ứng...)"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* KHỐI 3: THÔNG TIN SẢN KHOA */}
                                                <div
                                                    className="card border p-3 rounded mb-3"
                                                    style={{ backgroundColor: "#fef9fc", borderColor: "#fbcfe8" }}
                                                >
                                                    <div className="fw-bold text-danger mb-2 fs-7 d-flex align-items-center gap-1">
                                                        <i className="fas fa-baby"></i>
                                                        <span>Thông tin sản khoa (nếu có)</span>
                                                    </div>
                                                    <div className="row g-2">
                                                        <div className="col-12 col-md-4">
                                                            <label className="form-label">Con lần thứ</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="note_parity"
                                                                value={formData.note_parity}
                                                                onChange={onInputChange}
                                                                placeholder="VD: Con lần 2"
                                                            />
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <label className="form-label">Tuổi thai</label>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                name="note_gestational_age"
                                                                value={formData.note_gestational_age}
                                                                onChange={onInputChange}
                                                                placeholder="VD: 32 tuần"
                                                            />
                                                        </div>
                                                        <div className="col-12 col-md-4">
                                                            <label className="form-label">Dự sinh</label>
                                                            <input
                                                                type="date"
                                                                className="form-control"
                                                                name="note_due_date"
                                                                value={formData.note_due_date}
                                                                onChange={onInputChange}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* KHỐI 4: GHI CHÚ THÊM */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold text-gray-800 d-flex align-items-center gap-1">
                                                        <i className="fas fa-sticky-note text-warning"></i>
                                                        <span>Ghi chú thêm</span>
                                                        <span className="text-muted fw-normal fs-8">(dị ứng thuốc, lưu ý đặc biệt khi thăm khám, dặn dò...)</span>
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        name="note_extra"
                                                        rows="3"
                                                        value={formData.note_extra}
                                                        onChange={onInputChange}
                                                        placeholder="Nhập nội dung ghi chú chi tiết cho bệnh nhân..."
                                                        style={{ borderColor: "#fde68a", backgroundColor: "#fffefb" }}
                                                    ></textarea>
                                                    {formData.notes && (
                                                        <div className="mt-2 p-2 bg-light border rounded fs-8 text-muted">
                                                            <strong className="text-secondary">Ghi chú lưu trữ cũ:</strong>
                                                            <div style={{ whiteSpace: "pre-wrap" }}>{formData.notes}</div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* KHỐI 5: HÌNH THỨC KHÁM */}
                                                <div className="mb-3">
                                                    <label className="form-label fw-bold">Chọn hình thức khám</label>
                                                    <input
                                                        type="text"
                                                        className="form-control mb-2"
                                                        placeholder="Tìm kiếm hình thức khám..."
                                                        value={examSearchQuery}
                                                        onChange={(e) => setExamSearchQuery(e.target.value)}
                                                    />
                                                    <div style={{ border: "1px solid #dee2e6", borderRadius: "6px", padding: "10px", maxHeight: "150px", overflowY: "auto", backgroundColor: "#fff" }}>
                                                        {examinationTypesLoading && <div className="text-muted">Đang tải danh sách...</div>}
                                                        {examinationTypesError && <div className="text-danger">Lỗi tải danh sách hình thức khám.</div>}
                                                        {filteredExaminationOptions.map((option) => (
                                                            <div key={option.id} className="form-check mb-1">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`exam_${option.id}`}
                                                                    checked={formData.examination_types.includes(option.id)}
                                                                    onChange={() => onExaminationChange(option.id)}
                                                                />
                                                                <label className="form-check-label" htmlFor={`exam_${option.id}`}>
                                                                    {option.label} - <span className="text-danger fw-semibold">{Number(option.price).toLocaleString("vi-VN")} đ</span>
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {!examinationTypesLoading && examinationOptions.length === 0 && (
                                                            <div className="text-muted">Chưa có hình thức khám nào.</div>
                                                        )}
                                                        {!examinationTypesLoading && examinationOptions.length > 0 && filteredExaminationOptions.length === 0 && (
                                                            <div className="text-muted">Không tìm thấy hình thức khám nào.</div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* TỔNG CHI PHÍ */}
                                                <div className="mb-3">
                                                    <div style={{ backgroundColor: "#f1f5f9", padding: "12px 16px", borderRadius: "6px", fontSize: "14px" }}>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className="text-muted">Phí khám cố định:</span>
                                                            <strong>{Number(baseFee).toLocaleString("vi-VN")} đ</strong>
                                                        </div>
                                                        <div className="d-flex justify-content-between mb-1">
                                                            <span className="text-muted">Chi phí dịch vụ đã chọn:</span>
                                                            <strong>{Number(totalExaminationCost).toLocaleString("vi-VN")} đ</strong>
                                                        </div>
                                                        <div className="d-flex justify-content-between pt-2 border-top border-secondary border-opacity-25" style={{ fontWeight: "bold", fontSize: "16px", color: "#dc2626" }}>
                                                            <span>Tổng chi phí:</span>
                                                            <span>{Number(totalCost).toLocaleString("vi-VN")} đ</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="modal-footer px-0 pb-0">
                                                    <button
                                                        type="button"
                                                        className="btn btn-secondary"
                                                        onClick={() => {
                                                            setShowCreateModal(false);
                                                            setDetectedExistingPatient(null);
                                                        }}
                                                    >
                                                        Đóng
                                                    </button>
                                                    <button type="submit" className="btn btn-primary px-4 d-flex align-items-center gap-2">
                                                        <i className={modalMode === "new_visit" ? "fas fa-stethoscope" : modalMode === "edit" ? "fas fa-save" : "fas fa-user-plus"}></i>
                                                        <span>
                                                            {modalMode === "new_visit"
                                                                ? "Lưu & Tạo lần khám mới"
                                                                : modalMode === "edit"
                                                                ? "Cập nhật hồ sơ"
                                                                : "Lưu bệnh nhân & Tiếp nhận khám"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-backdrop fade show"></div>
                        </>
                    )}

                    {viewMoreModal && (
                        <div className="modal d-block" style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
                            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "500px" }}>
                                <div className="modal-content">
                                    <div className="modal-header">
                                        <h5 className="modal-title">{viewMoreContent.title}</h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            onClick={() => setViewMoreModal(false)}
                                            aria-label="Close"
                                        ></button>
                                    </div>
                                    <div className="modal-body">
                                        <p style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{viewMoreContent.text}</p>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={() => setViewMoreModal(false)}
                                        >
                                            Đóng
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL CHI TIẾT BỆNH NHÂN CHUYÊN SÂU */}
                    {detailPatient && (
                        <PatientDetailModal
                            patient={detailPatient}
                            examinationOptions={examinationOptions}
                            baseFee={baseFee}
                            onClose={() => setDetailPatient(null)}
                            onNewVisit={(p) => {
                                setDetailPatient(null);
                                openNewVisitModal(p);
                            }}
                            onEdit={(p) => {
                                setDetailPatient(null);
                                openEditModal(p);
                            }}
                            onPrintInvoice={(p) => printPatientInvoice(p)}
                        />
                    )}
                </div>
            </div>
        </>
    );
}

export default PatientsPage;