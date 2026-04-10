import { useMemo, useState } from "react";
import { useDrugs, usePatients, usePrescriptions } from "../hooks";

function PrescriptionsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMoreModal, setViewMoreModal] = useState(false);
    const [viewMoreContent, setViewMoreContent] = useState({ title: "", text: "" });

    const [showDrugPickerModal, setShowDrugPickerModal] = useState(false);
    const [selectedPrescription, setSelectedPrescription] = useState(null);
    const [drugSearchQuery, setDrugSearchQuery] = useState("");
    const [selectedDrugItems, setSelectedDrugItems] = useState([]);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState("");

    const [createForm, setCreateForm] = useState({
        patientId: "",
        prescriptionDate: new Date().toISOString().slice(0, 10),
        diagnosis: "",
        notes: ""
    });

    const {
        prescriptions,
        loading,
        error,
        createPrescription,
        fetchPrescriptions,
        getPrescriptionItems,
        replacePrescriptionItems,
        updatePrescription
    } = usePrescriptions();
    const { drugs } = useDrugs();
    const { patients } = usePatients();

    const filteredPrescriptions = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return prescriptions;

        return prescriptions.filter((rx) => {
            const patient = rx.patients;
            const medicinesText = (rx.prescription_items || []).map((item) => item.medicine_name || "").join(" ");
            const text = [
                    rx.id,
                    rx.prescription_date,
                    patient ? .name || "",
                    patient ? .gender || "",
                    rx.diagnosis || "",
                    rx.notes || "",
                    medicinesText
                ]
                .join(" ")
                .toLowerCase();
            return text.includes(q);
        });
    }, [prescriptions, searchQuery]);

    const filteredDrugs = useMemo(() => {
        const q = drugSearchQuery.trim().toLowerCase();
        if (!q) return drugs;
        return drugs.filter((drug) => {
            const text = [
                    drug.registration_number || "",
                    drug.drug_name || "",
                    drug.active_ingredient || "",
                    drug.concentration || ""
                ]
                .join(" ")
                .toLowerCase();
            return text.includes(q);
        });
    }, [drugs, drugSearchQuery]);

    const totalAmount = useMemo(() => {
        return selectedDrugItems.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
    }, [selectedDrugItems]);

    const selectedPatientForCreate = useMemo(() => {
        if (!createForm.patientId) return null;
        return patients.find((patient) => patient.id === createForm.patientId) || null;
    }, [patients, createForm.patientId]);

    const truncateText = (text, maxLength = 40) => {
        if (!text) return "-";
        return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
    };

    const showViewMoreModal = (title, text) => {
        setViewMoreContent({ title, text: text || "-" });
        setViewMoreModal(true);
    };

    const getMedicineListText = (rx) => {
        const items = rx.prescription_items || [];
        if (!items.length) return "-";
        return items
            .map((item) => item.medicine_name)
            .filter(Boolean)
            .join(", ");
    };

    const addDrugToSelection = (drug) => {
        setSelectedDrugItems((prev) => {
            const idx = prev.findIndex((item) => item.drug_id === drug.id);
            if (idx !== -1) {
                const updated = [...prev];
                const currentQty = Number(updated[idx].quantity || 1);
                const unitPrice = Number(updated[idx].unit_price || 0);
                const nextQty = currentQty + 1;
                updated[idx] = {
                    ...updated[idx],
                    quantity: nextQty,
                    line_total: nextQty * unitPrice
                };
                return updated;
            }

            const unitPrice = Number(drug.price || 0);
            return [
                ...prev,
                {
                    drug_id: drug.id,
                    medicine_name: drug.drug_name || "",
                    usage: "",
                    dose: "",
                    days: 1,
                    quantity: 1,
                    unit_price: unitPrice,
                    line_total: unitPrice
                }
            ];
        });
    };

    const removeDrugFromSelection = (drugId) => {
        setSelectedDrugItems((prev) => prev.filter((item) => item.drug_id !== drugId));
    };

    const updateSelectedDrugField = (drugId, field, value) => {
        setSelectedDrugItems((prev) =>
            prev.map((item) => {
                if (item.drug_id !== drugId) return item;
                const next = {...item, [field]: value };
                const qty = Number(field === "quantity" ? value : next.quantity || 1);
                const price = Number(field === "unit_price" ? value : next.unit_price || 0);
                next.quantity = qty;
                next.unit_price = price;
                next.line_total = qty * price;
                return next;
            })
        );
    };

    const openDrugPicker = async(prescription) => {
        setSelectedPrescription(prescription);
        setDrugSearchQuery("");
        setSelectedDiagnosis(prescription ? .diagnosis || "");
        try {
            const existingItems = await getPrescriptionItems(prescription.id);
            const mapped = (existingItems || []).map((item) => ({
                drug_id: item.drug_id,
                medicine_name: item.medicine_name || "",
                usage: item.usage || "",
                dose: item.dose || "",
                days: Number(item.days || 1),
                quantity: Number(item.quantity || 1),
                unit_price: Number(item.unit_price || 0),
                line_total: Number(item.line_total || Number(item.quantity || 1) * Number(item.unit_price || 0))
            }));
            setSelectedDrugItems(mapped);
        } catch (err) {
            setSelectedDrugItems([]);
            window.alert(`Lỗi tải danh sách thuốc của đơn: ${err.message}`);
        }
        setShowDrugPickerModal(true);
    };

    const savePrescriptionItems = async() => {
        if (!selectedPrescription) return;
        try {
            await updatePrescription(selectedPrescription.id, {
                diagnosis: selectedDiagnosis,
                notes: selectedPrescription.notes || null,
                doctor_name: null
            });
            await replacePrescriptionItems(selectedPrescription.id, selectedDrugItems);
            await fetchPrescriptions();
            window.alert("Đã lưu danh sách thuốc cho đơn thuốc.");
            setShowDrugPickerModal(false);
        } catch (err) {
            window.alert(`Lỗi khi lưu thuốc: ${err.message}`);
        }
    };

    const onCreateInputChange = (event) => {
        const { name, value } = event.target;
        setCreateForm((prev) => ({...prev, [name]: value }));
    };

    const createPrescriptionId = () => {
        const maxNum = prescriptions
            .map((rx) => String(rx.id || ""))
            .map((id) => {
                const match = id.match(/(\d+)/);
                return match ? Number(match[1]) : 0;
            })
            .filter((n) => Number.isFinite(n));

        const next = maxNum.length ? Math.max(...maxNum) + 1 : 1;
        return `RX${String(next).padStart(4, "0")}`;
    };

    const handleCreatePrescription = async(event) => {
        event.preventDefault();
        if (!createForm.patientId) {
            window.alert("Vui lòng chọn bệnh nhân.");
            return;
        }

        try {
            const newId = createPrescriptionId();
            const created = await createPrescription({
                id: newId,
                patient_id: createForm.patientId,
                prescription_date: createForm.prescriptionDate,
                diagnosis: createForm.diagnosis,
                doctor_name: null,
                notes: createForm.notes
            }, []);

            const selectedPatient = patients.find((p) => p.id === createForm.patientId);
            const mergedPrescription = {
                ...created,
                patients: selectedPatient ?
                    {
                        name: selectedPatient.name,
                        dob: selectedPatient.dob,
                        gender: selectedPatient.gender,
                        phone_number: selectedPatient.phone_number
                    } :
                    null,
                prescription_items: []
            };

            setShowCreateModal(false);
            setCreateForm({
                patientId: "",
                prescriptionDate: new Date().toISOString().slice(0, 10),
                diagnosis: "",
                notes: ""
            });

            await fetchPrescriptions();
            await openDrugPicker(mergedPrescription);
        } catch (err) {
            window.alert(`Lỗi tạo đơn thuốc: ${err.message}`);
        }
    };

    const printPrescription = async(prescription) => {
        try {
            const items = await getPrescriptionItems(prescription.id);
            const normalized = (items || []).map((item) => ({
                ...item,
                quantity: Number(item.quantity || 1),
                unit_price: Number(item.unit_price || 0),
                line_total: Number(item.line_total || Number(item.quantity || 1) * Number(item.unit_price || 0))
            }));

            const total = normalized.reduce((sum, item) => sum + Number(item.line_total || 0), 0);
            const rowsHtml = normalized
                .map(
                    (item, idx) =>
                    `<tr>
                            <td>${idx + 1}</td>
                            <td>${item.medicine_name || ""}</td>
                            <td>${item.quantity || 1}</td>
                            <td>${item.dose || ""}</td>
                            <td>${Number(item.unit_price || 0).toLocaleString("vi-VN")}</td>
                            <td>${Number(item.line_total || 0).toLocaleString("vi-VN")}</td>
                        </tr>`
                )
                .join("");

            const html = `<!doctype html>
<html lang="vi">
<head>
<meta charset="UTF-8" />
<title>In đơn thuốc</title>
<style>
body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
h2, h3 { margin: 0 0 10px 0; }
.meta { margin-bottom: 14px; }
table { width: 100%; border-collapse: collapse; margin-top: 12px; }
th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; }
th { background: #f3f4f6; text-align: left; }
.total { margin-top: 14px; font-size: 16px; font-weight: 700; }
</style>
</head>
<body>
    <h2>Đơn thuốc</h2>
    <div class="meta">
        <div><strong>Mã đơn:</strong> ${prescription.id || ""}</div>
        <div><strong>Ngày:</strong> ${prescription.prescription_date || ""}</div>
        <div><strong>Bệnh nhân:</strong> ${prescription.patients?.name || ""}</div>
        <div><strong>Chẩn đoán:</strong> ${prescription.diagnosis || ""}</div>
    </div>

    <table>
        <thead>
            <tr>
                <th>STT</th>
                <th>Thuốc</th>
                <th>Số lượng</th>
                <th>Liều dùng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
            </tr>
        </thead>
        <tbody>
            ${rowsHtml || '<tr><td colspan="6">Chưa có thuốc trong đơn</td></tr>'}
        </tbody>
    </table>

    <div class="total">Tổng tiền: ${Number(total).toLocaleString("vi-VN")} VNĐ</div>
</body>
</html>`;

            const printWindow = window.open("", "_blank", "width=1050,height=760");
            if (!printWindow) return;
            printWindow.document.open();
            printWindow.document.write(html);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        } catch (err) {
            window.alert(`Lỗi in đơn thuốc: ${err.message}`);
        }
    };

    return ( <
            >
            <
            div className = "card" >
            <
            div className = "card-header border-0 pt-6" >
            <
            div className = "card-title" >
            <
            h2 className = "card-title align-items-start flex-column" >
            <
            span className = "card-label fw-bolder fs-3 mb-1" > Đơn thuốc < /span> <
            span className = "text-muted mt-1 fw-bold fs-7" > Danh sách đơn thuốc của bạn < /span> <
            /h2> <
            /div> <
            div className = "card-toolbar" >
            <
            div className = "d-flex justify-content-end" >
            <
            button type = "button"
            className = "btn btn-primary"
            id = "createPrescription"
            onClick = {
                () => setShowCreateModal(true) } >
            <
            span className = "svg-icon svg-icon-2" >
            <
            svg xmlns = "http://www.w3.org/2000/svg"
            width = "24"
            height = "24"
            viewBox = "0 0 24 24"
            fill = "none" >
            <
            rect opacity = "0.5"
            x = "11.364"
            y = "20.364"
            width = "16"
            height = "2"
            rx = "1"
            transform = "rotate(-90 11.364 20.364)"
            fill = "black" / >
            <
            rect x = "4.36396"
            y = "11.364"
            width = "16"
            height = "2"
            rx = "1"
            fill = "black" / >
            <
            /svg> <
            /span>
            Tạo đơn thuốc <
            /button> <
            /div> <
            /div> <
            /div>

            <
            div className = "card-body py-4" > {
                loading && < div className = "alert alert-info" > Đang tải dữ liệu... < /div>} {
                    error && < div className = "alert alert-danger" > Lỗi: { error } < /div>}

                    <
                    div id = "rx_table_wrapper"
                    className = "dataTables_wrapper dt-bootstrap4 no-footer" >
                        <
                        div className = "row align-items-center" >
                        <
                        div className = "col-sm-8 d-none d-lg-block" >
                        <
                        div className = "dt-buttons btn-group flex-wrap" >
                        <
                        button className = "btn btn-secondary btn-light btn-sm"
                    type = "button"
                    onClick = {
                            () => setSearchQuery("") } >
                        <
                        span > < i className = "fas fa-search me-1" > < /i> Tim kiem nang cao</span >
                        <
                        /button> <
                        /div> <
                        /div> <
                        div className = "col-sm-4" >
                        <
                        div id = "rx_table_filter"
                    className = "dataTables_filter" >
                        <
                        label >
                        Tim kiem:
                        <
                        input
                    type = "search"
                    className = "form-control form-control-sm form-control-solid"
                    placeholder = ""
                    aria - controls = "rx_table"
                    value = { searchQuery }
                    onChange = {
                        (e) => setSearchQuery(e.target.value) }
                    /> <
                    /label> <
                    /div> <
                    /div> <
                    /div>

                    <
                    div className = "row" >
                        <
                        div className = "col-sm-12" >
                        <
                        table id = "rx_table"
                    className = "table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline"
                    aria - describedby = "rx_table_info" >
                        <
                        thead >
                        <
                        tr className = "text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0" >
                        <
                        th style = {
                            { width: "90px" } } > Ngày < /th> <
                        th style = {
                            { width: "130px" } } > Họ & Tên < /th> <
                        th style = {
                            { width: "150px" } } > Chẩn đoán < /th> <
                        th style = {
                            { width: "180px" } } > Thuốc < /th> <
                        th style = {
                            { width: "180px" } } > Ghi chú < /th> <
                        th className = "text-end"
                    style = {
                            { width: "220px" } } > Thao tác < /th> <
                        /tr> <
                        /thead> <
                        tbody > {
                            filteredPrescriptions.length === 0 ? ( <
                                tr className = "odd" >
                                <
                                td valign = "top"
                                colSpan = "6"
                                className = "dataTables_empty" >
                                Không có dữ liệu <
                                /td> <
                                /tr>
                            ) : (
                                filteredPrescriptions.map((rx) => ( <
                                    tr key = { rx.id }
                                    className = "odd" >
                                    <
                                    td > { rx.prescription_date } < /td> <
                                    td > { rx.patients ? .name || "-" } < /td> <
                                    td >
                                    <
                                    div className = "d-flex align-items-center gap-2" >
                                    <
                                    span > { truncateText(rx.diagnosis, 40) } < /span> {
                                        rx.diagnosis && rx.diagnosis.length > 40 && ( <
                                            button className = "btn btn-xs btn-light-primary"
                                            onClick = {
                                                () => showViewMoreModal("Chẩn đoán", rx.diagnosis) }
                                            title = "Xem thêm" >
                                            <
                                            i className = "fas fa-eye"
                                            style = {
                                                { fontSize: "12px" } } > < /i> <
                                            /button>
                                        )
                                    } <
                                    /div> <
                                    /td> <
                                    td >
                                    <
                                    div className = "d-flex align-items-center gap-2" >
                                    <
                                    span > { truncateText(getMedicineListText(rx), 50) } < /span> {
                                        getMedicineListText(rx) !== "-" && getMedicineListText(rx).length > 50 && ( <
                                            button className = "btn btn-xs btn-light-primary"
                                            onClick = {
                                                () => showViewMoreModal("Danh sách thuốc", getMedicineListText(rx)) }
                                            title = "Xem thêm" >
                                            <
                                            i className = "fas fa-eye"
                                            style = {
                                                { fontSize: "12px" } } > < /i> <
                                            /button>
                                        )
                                    } <
                                    /div> <
                                    /td> <
                                    td >
                                    <
                                    div className = "d-flex align-items-center gap-2" >
                                    <
                                    span > { truncateText(rx.notes || "-", 50) } < /span> {
                                        rx.notes && rx.notes.length > 50 && ( <
                                            button className = "btn btn-xs btn-light-primary"
                                            onClick = {
                                                () => showViewMoreModal("Ghi chú", rx.notes) }
                                            title = "Xem thêm" >
                                            <
                                            i className = "fas fa-eye"
                                            style = {
                                                { fontSize: "12px" } } > < /i> <
                                            /button>
                                        )
                                    } <
                                    /div> <
                                    /td> <
                                    td className = "text-end" >
                                    <
                                    div className = "d-flex justify-content-end gap-2" >
                                    <
                                    button type = "button"
                                    className = "btn btn-sm btn-warning"
                                    onClick = {
                                        () => openDrugPicker(rx) } >
                                    Chọn thuốc <
                                    /button> <
                                    button type = "button"
                                    className = "btn btn-sm btn-success"
                                    onClick = {
                                        () => printPrescription(rx) } >
                                    In đơn <
                                    /button> <
                                    /div> <
                                    /td> <
                                    /tr>
                                ))
                            )
                        } <
                        /tbody> <
                        /table> <
                        div id = "rx_table_processing"
                    className = "dataTables_processing"
                    style = {
                            { display: "none" } } >
                        Đang xử lý... <
                        /div> <
                        /div> <
                        /div>

                    <
                    div className = "row" >
                        <
                        div className = "col-sm-12 col-md-5" >
                        <
                        div className = "dataTables_info"
                    id = "rx_table_info"
                    role = "status"
                    aria - live = "polite" >
                        Showing { filteredPrescriptions.length === 0 ? "no records" : `${filteredPrescriptions.length} records` } <
                        /div> <
                        /div> <
                        div className = "col-sm-12 col-md-7" >
                        <
                        div className = "dataTables_paginate paging_simple_numbers"
                    id = "rx_table_paginate" >
                        <
                        ul className = "pagination" >
                        <
                        li className = "paginate_button page-item previous disabled"
                    id = "rx_table_previous" >
                        <
                        a href = "#"
                    aria - controls = "rx_table"
                    data - dt - idx = "0"
                    tabIndex = "0"
                    className = "page-link" >
                        Lùi <
                        /a> <
                        /li> <
                        li className = "paginate_button page-item next disabled"
                    id = "rx_table_next" >
                        <
                        a href = "#"
                    aria - controls = "rx_table"
                    data - dt - idx = "1"
                    tabIndex = "0"
                    className = "page-link" >
                        Tiếp <
                        /a> <
                        /li> <
                        /ul> <
                        /div> <
                        /div> <
                        /div> <
                        /div> <
                        /div> <
                        /div>

                    {
                        showCreateModal && ( <
                            >
                            <
                            div className = "modal fade show d-block"
                            id = "modal-create-rx"
                            data - bs - backdrop = "static"
                            data - bs - keyboard = "false"
                            tabIndex = "-1"
                            aria - hidden = "true" >
                            <
                            div className = "modal-dialog modal-dialog-centered modal-lg" >
                            <
                            div className = "modal-content" >
                            <
                            div className = "modal-header" >
                            <
                            h5 className = "modal-title" > Tạo đơn thuốc mới < /h5> <
                            button type = "button"
                            className = "btn-close"
                            aria - label = "Close"
                            onClick = {
                                () => setShowCreateModal(false) } > < /button> <
                            /div> <
                            form onSubmit = { handleCreatePrescription } >
                            <
                            div className = "modal-body" >
                            <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Bệnh nhân < /label> <
                            select className = "form-select"
                            name = "patientId"
                            value = { createForm.patientId }
                            onChange = { onCreateInputChange }
                            required >
                            <
                            option value = "" > Chọn bệnh nhân < /option> {
                                patients.map((p) => ( <
                                    option key = { p.id }
                                    value = { p.id } > { p.id } - { p.name } <
                                    /option>
                                ))
                            } <
                            /select> <
                            /div> {
                                selectedPatientForCreate && ( <
                                    div className = "mb-3" >
                                    <
                                    label className = "form-label" > Ghi chú lâm sàng < /label> <
                                    textarea className = "form-control"
                                    rows = "3"
                                    value = { selectedPatientForCreate.notes || "" }
                                    readOnly placeholder = "Bệnh nhân chưa có ghi chú lâm sàng" >
                                    < /textarea> <
                                    /div>
                                )
                            } <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Ngày kê đơn < /label> <
                            input type = "date"
                            className = "form-control"
                            name = "prescriptionDate"
                            value = { createForm.prescriptionDate }
                            onChange = { onCreateInputChange }
                            required /
                            >
                            <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Chẩn đoán < /label> <
                            input type = "text"
                            className = "form-control"
                            name = "diagnosis"
                            value = { createForm.diagnosis }
                            onChange = { onCreateInputChange }
                            placeholder = "Nhập chẩn đoán" /
                            >
                            <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Ghi chú < /label> <
                            textarea className = "form-control"
                            rows = "3"
                            name = "notes"
                            value = { createForm.notes }
                            onChange = { onCreateInputChange }
                            placeholder = "Ghi chú thêm" >
                            < /textarea> <
                            /div> <
                            /div> <
                            div className = "modal-footer" >
                            <
                            button type = "button"
                            className = "btn btn-light"
                            onClick = {
                                () => setShowCreateModal(false) } >
                            Đóng <
                            /button> <
                            button type = "submit"
                            className = "btn btn-primary" >
                            Tạo và chọn thuốc <
                            /button> <
                            /div> <
                            /form> <
                            /div> <
                            /div> <
                            /div> <
                            div className = "modal-backdrop fade show" > < /div> <
                            />
                        )
                    }

                    {
                        showDrugPickerModal && ( <
                            >
                            <
                            div className = "modal fade show d-block"
                            id = "modal-drug-picker"
                            tabIndex = "-1"
                            aria - hidden = "true" >
                            <
                            div className = "modal-dialog modal-dialog-centered modal-xl"
                            style = {
                                { maxWidth: "1200px" } } >
                            <
                            div className = "modal-content" >
                            <
                            div className = "modal-header" >
                            <
                            h5 className = "modal-title" >
                            Chọn thuốc cho đơn { selectedPrescription ? .id } - { selectedPrescription ? .patients ? .name || "" } <
                            /h5> <
                            button type = "button"
                            className = "btn-close"
                            aria - label = "Close"
                            onClick = {
                                () => setShowDrugPickerModal(false) } > < /button> <
                            /div> <
                            div className = "modal-body" >
                            <
                            div className = "mb-4" >
                            <
                            label className = "form-label fw-semibold" > Chẩn đoán < /label> <
                            input type = "text"
                            className = "form-control"
                            value = { selectedDiagnosis }
                            onChange = {
                                (e) => setSelectedDiagnosis(e.target.value) }
                            placeholder = "Nhập chẩn đoán cho đơn thuốc" /
                            >
                            <
                            /div>

                            <
                            div className = "row g-4" >
                            <
                            div className = "col-md-5" >
                            <
                            h6 className = "fw-bold" > Danh sách thuốc trong kho < /h6> <
                            input type = "search"
                            className = "form-control form-control-sm mb-3"
                            placeholder = "Tìm thuốc theo tên, hoạt chất..."
                            value = { drugSearchQuery }
                            onChange = {
                                (e) => setDrugSearchQuery(e.target.value) }
                            />

                            <
                            div style = {
                                { maxHeight: "420px", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" } } >
                            <
                            table className = "table table-sm align-middle mb-0" >
                            <
                            thead >
                            <
                            tr >
                            <
                            th > Tên thuốc < /th> <
                            th > Giá < /th> <
                            th > < /th> <
                            /tr> <
                            /thead> <
                            tbody > {
                                filteredDrugs.map((drug) => ( <
                                    tr key = { drug.id } >
                                    <
                                    td >
                                    <
                                    div className = "fw-semibold" > { drug.drug_name } < /div> <
                                    div className = "text-muted fs-8" > { drug.active_ingredient || "" } < /div> <
                                    /td> <
                                    td > { Number(drug.price || 0).toLocaleString("vi-VN") } < /td> <
                                    td className = "text-end" >
                                    <
                                    button type = "button"
                                    className = "btn btn-xs btn-light-primary"
                                    onClick = {
                                        () => addDrugToSelection(drug) } >
                                    Chọn thuốc <
                                    /button> <
                                    /td> <
                                    /tr>
                                ))
                            } <
                            /tbody> <
                            /table> <
                            /div> <
                            /div>

                            <
                            div className = "col-md-7" >
                            <
                            h6 className = "fw-bold" > Thuốc đã chọn cho đơn < /h6> <
                            div style = {
                                { maxHeight: "420px", overflow: "auto", border: "1px solid #e5e7eb", borderRadius: "8px" } } >
                            <
                            table className = "table table-sm align-middle mb-0" >
                            <
                            thead >
                            <
                            tr >
                            <
                            th > Thuốc < /th> <
                            th style = {
                                { width: "85px" } } > SL < /th> <
                            th style = {
                                { width: "120px" } } > Đơn giá < /th> <
                            th style = {
                                { width: "120px" } } > Thành tiền < /th> <
                            th style = {
                                { width: "120px" } } > Liều dùng < /th> <
                            th style = {
                                { width: "100px" } } > < /th> <
                            /tr> <
                            /thead> <
                            tbody > {
                                selectedDrugItems.length === 0 ? ( <
                                    tr >
                                    <
                                    td colSpan = "6"
                                    className = "text-muted" > Chưa có thuốc nào được chọn. < /td> <
                                    /tr>
                                ) : (
                                    selectedDrugItems.map((item) => ( <
                                        tr key = { item.drug_id || item.medicine_name } >
                                        <
                                        td > { item.medicine_name } < /td> <
                                        td >
                                        <
                                        input type = "number"
                                        min = "1"
                                        className = "form-control form-control-sm"
                                        value = { item.quantity }
                                        onChange = {
                                            (e) => updateSelectedDrugField(item.drug_id, "quantity", e.target.value) }
                                        /> <
                                        /td> <
                                        td >
                                        <
                                        input type = "number"
                                        min = "0"
                                        step = "0.01"
                                        className = "form-control form-control-sm"
                                        value = { item.unit_price }
                                        onChange = {
                                            (e) => updateSelectedDrugField(item.drug_id, "unit_price", e.target.value) }
                                        /> <
                                        /td> <
                                        td className = "fw-semibold" > { Number(item.line_total || 0).toLocaleString("vi-VN") } < /td> <
                                        td >
                                        <
                                        input type = "text"
                                        className = "form-control form-control-sm"
                                        value = { item.dose || "" }
                                        onChange = {
                                            (e) => updateSelectedDrugField(item.drug_id, "dose", e.target.value) }
                                        placeholder = "VD: 2 viên/ngày" /
                                        >
                                        <
                                        /td> <
                                        td className = "text-end" >
                                        <
                                        button type = "button"
                                        className = "btn btn-xs btn-light-danger"
                                        onClick = {
                                            () => removeDrugFromSelection(item.drug_id) } >
                                        Bỏ <
                                        /button> <
                                        /td> <
                                        /tr>
                                    ))
                                )
                            } <
                            /tbody> <
                            /table> <
                            /div>

                            <
                            div className = "d-flex justify-content-end mt-3" >
                            <
                            div className = "fs-5 fw-bolder" > Tổng tiền: { Number(totalAmount).toLocaleString("vi-VN") }
                            VNĐ < /div> <
                            /div> <
                            /div> <
                            /div> <
                            /div> <
                            div className = "modal-footer" >
                            <
                            button type = "button"
                            className = "btn btn-light"
                            onClick = {
                                () => setShowDrugPickerModal(false) } >
                            Đóng <
                            /button> <
                            button type = "button"
                            className = "btn btn-primary"
                            onClick = { savePrescriptionItems } >
                            Lưu đơn thuốc <
                            /button> <
                            /div> <
                            /div> <
                            /div> <
                            /div> <
                            div className = "modal-backdrop fade show" > < /div> <
                            />
                        )
                    }

                    {
                        viewMoreModal && ( <
                            div className = "modal d-block"
                            style = {
                                { backgroundColor: "rgba(0, 0, 0, 0.5)" } } >
                            <
                            div className = "modal-dialog modal-dialog-centered"
                            style = {
                                { maxWidth: "500px" } } >
                            <
                            div className = "modal-content" >
                            <
                            div className = "modal-header" >
                            <
                            h5 className = "modal-title" > { viewMoreContent.title } < /h5> <
                            button type = "button"
                            className = "btn-close"
                            onClick = {
                                () => setViewMoreModal(false) }
                            aria - label = "Close" > < /button> <
                            /div> <
                            div className = "modal-body" >
                            <
                            p style = {
                                { whiteSpace: "pre-wrap", wordBreak: "break-word" } } > { viewMoreContent.text } < /p> <
                            /div> <
                            div className = "modal-footer" >
                            <
                            button type = "button"
                            className = "btn btn-secondary"
                            onClick = {
                                () => setViewMoreModal(false) } >
                            Đóng <
                            /button> <
                            /div> <
                            /div> <
                            /div> <
                            /div>
                        )
                    } <
                    />
                );
            }

            export default PrescriptionsPage;