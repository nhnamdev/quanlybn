import { useMemo, useState } from "react";
import { usePatients } from "../hooks";

function PatientsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMoreModal, setViewMoreModal] = useState(false);
    const [viewMoreContent, setViewMoreContent] = useState({ title: "", text: "" });
    const { patients, loading, error, searchPatients, addPatient } = usePatients();
    const [formData, setFormData] = useState({
        name: "",
        gender: "M",
        dob: "2000-01-01",
        address: "",
        phone_number: "",
        identity_number: "",
        notes: "",
        examination_types: []
    });

    const examinationOptions = [
        { label: "Siêu âm", value: "ultrasound", price: 80000 },
        { label: "Kiểm tra máu", value: "blood_test", price: 50000 },
        { label: "Nội soi", value: "endoscopy", price: 500000 },
        { label: "Chụp phim", value: "xray", price: 120000 }
    ];

    const baseFee = 50000;
    const totalExaminationCost = formData.examination_types.reduce((sum, type) => {
        const option = examinationOptions.find(o => o.value === type);
        return sum + (option ? option.price : 0);
    }, 0);
    const totalCost = baseFee + totalExaminationCost;

    const filteredPatients = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return patients;

        return patients.filter((patient) => {
            const text = [
                    patient.id,
                    patient.name,
                    patient.gender === "M" ? "Nam" : "Nu",
                    patient.dob,
                    patient.address || "",
                    patient.phone_number || ""
                ]
                .join(" ")
                .toLowerCase();
            return text.includes(q);
        });
    }, [patients, searchQuery]);

    const genderLabel = (value) => (value === "F" ? "Nu" : "Nam");

    const truncateText = (text, maxLength = 40) => {
        if (!text) return "-";
        return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
    };

    const showViewMoreModal = (title, text) => {
        setViewMoreContent({ title, text: text || "-" });
        setViewMoreModal(true);
    };

    const toCsv = (rows) => {
        const headers = ["ID", "Ho va Ten", "Gioi", "Ngay sinh", "Dia chi", "Dien thoai"];
        const lines = rows.map((row) => [
            row.id,
            row.name,
            genderLabel(row.gender),
            row.dob,
            row.address || "",
            row.phone_number || ""
        ]);
        const allRows = [headers, ...lines];
        return allRows
            .map((cols) => cols.map((col) => `"${String(col ?? "").replace(/"/g, '""')}"`).join(","))
            .join("\n");
    };

    const downloadTextFile = (content, filename, mimeType) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        URL.revokeObjectURL(url);
    };

    const ensureRows = () => {
        if (filteredPatients.length > 0) return true;
        window.alert("Chua co du lieu de xuat.");
        return false;
    };

    const handleCopy = async() => {
        if (!ensureRows()) return;
        const csv = toCsv(filteredPatients);
        await navigator.clipboard.writeText(csv);
        window.alert("Da sao chep danh sach benh nhan.");
    };

    const handleExcel = () => {
        if (!ensureRows()) return;
        const bom = "\uFEFF";
        const csv = toCsv(filteredPatients);
        downloadTextFile(`${bom}${csv}`, "danh-sach-benh-nhan.csv", "text/csv;charset=utf-8;");
    };

    const openPrintableWindow = (title) => {
        const tableRows = filteredPatients
            .map(
                (p) =>
                `<tr><td>${p.id}</td><td>${p.name}</td><td>${genderLabel(p.gender)}</td><td>${p.dob}</td><td>${p.address || ""}</td><td>${p.phone_number || ""}</td></tr>`
            )
            .join("");

        const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8" /><title>${title}</title><style>body { font-family: Arial, sans-serif; padding: 24px; } h2 { margin-bottom: 16px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; } th { background: #f3f4f6; text-align: left; }</style></head><body><h2>${title}</h2><table><thead><tr><th>ID</th><th>Ho va Ten</th><th>Gioi</th><th>Ngay sinh</th><th>Dia chi</th><th>Dien thoai</th></tr></thead><tbody>${tableRows}</tbody></table></body></html>`;

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
        openPrintableWindow("Danh sach benh nhan (PDF)");
    };

    const handlePrint = () => {
        if (!ensureRows()) return;
        openPrintableWindow("Danh sach benh nhan");
    };

    const handleSearch = async(query) => {
        setSearchQuery(query);
        if (query.trim()) {
            await searchPatients(query);
        }
    };

    const printPatientInvoice = (patient) => {
        // Parse examination types from JSON string if needed
        let examinationTypes = [];
        if (patient.examination_types) {
            try {
                examinationTypes = typeof patient.examination_types === 'string' ?
                    JSON.parse(patient.examination_types) :
                    patient.examination_types;
            } catch (e) {
                examinationTypes = [];
            }
        }

        const examinationList = examinationTypes ?
            examinationTypes.map(type => {
                const option = examinationOptions.find(o => o.value === type);
                return `<tr><td>${option?.label || type}</td><td style="text-align: right">${Number(option?.price || 0).toLocaleString("vi-VN")} đ</td></tr>`;
            }).join("") :
            "";

        const patientBaseFee = examinationTypes ?
            examinationTypes.reduce((sum, type) => {
                const option = examinationOptions.find(o => o.value === type);
                return sum + (option ? option.price : 0);
            }, 0) :
            0;

        const html = `<!doctype html><html lang="vi"><head><meta charset="UTF-8"/><title>Đơn khám</title><style>body{font-family:Arial,sans-serif;padding:24px;color:#111827}h2,h3{margin:0 0 10px 0}p{margin:8px 0}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border:1px solid #d1d5db;padding:8px;font-size:13px}th{background:#f3f4f6;text-align:left}.total{margin-top:12px;font-size:16px;font-weight:700}</style></head><body><h2>Đơn Khám Sức Khỏe</h2><div><strong>Mã BN:</strong> ${patient.id}</div><div><strong>Họ và Tên:</strong> ${patient.name}</div><div><strong>Giới tính:</strong> ${genderLabel(patient.gender)}</div><div><strong>Ngày sinh:</strong> ${patient.dob}</div><div><strong>Điện thoại:</strong> ${patient.phone_number || "-"}</div><div><strong>Địa chỉ:</strong> ${patient.address || "-"}</div><div><strong>STT nhân dân:</strong> ${patient.identity_number || "-"}</div><table><thead><tr><th>Hình thức khám</th><th>Giá tiền</th></tr></thead><tbody><tr><td>Phí khám cố định</td><td style="text-align: right">${Number(baseFee).toLocaleString("vi-VN")} đ</td></tr>${examinationList}</tbody></table><div class="total">Tổng chi phí: ${Number(baseFee + patientBaseFee).toLocaleString("vi-VN")} đ</div></body></html>`;

        const printWindow = window.open("", "_blank", "width=800,height=600");
        if (!printWindow) return;
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    };

    const onInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({...prev, [name]: value }));
    };

    const onExaminationChange = (examType) => {
        setFormData((prev) => {
            const types = prev.examination_types.includes(examType) ?
                prev.examination_types.filter(t => t !== examType) :
                [...prev.examination_types, examType];
            return {...prev, examination_types: types };
        });
    };

    const handleCreatePatient = async(event) => {
        event.preventDefault();
        try {
            const maxId = patients
                .filter((p) => p.id.startsWith("BN"))
                .map((p) => parseInt(p.id.replace("BN", ""), 10))
                .filter((n) => !Number.isNaN(n));
            const nextNum = maxId.length > 0 ? Math.max(...maxId) + 1 : 1;

            await addPatient({
                id: `BN${String(nextNum).padStart(3, "0")}`,
                name: formData.name,
                dob: formData.dob,
                gender: formData.gender,
                phone_number: formData.phone_number,
                address: formData.address,
                identity_number: formData.identity_number,
                notes: formData.notes,
                examination_types: JSON.stringify(formData.examination_types)
            });

            setFormData({
                name: "",
                gender: "M",
                dob: "2000-01-01",
                address: "",
                phone_number: "",
                identity_number: "",
                notes: "",
                examination_types: []
            });
            setShowCreateModal(false);
        } catch (err) {
            window.alert(`Loi: ${err.message}`);
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
            span className = "card-label fw-bolder fs-3 mb-1" > Danh sach Benh Nhan < /span> <
            span className = "text-muted mt-1 fw-bold fs-7" > Danh sach Benh Nhan cua ban < /span> <
            /h2> <
            /div> <
            div className = "card-toolbar" >
            <
            div className = "d-flex justify-content-end" >
            <
            button type = "button"
            className = "btn btn-primary js-create-patient"
            id = "createPatient"
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
            Them Benh Nhan moi <
            /button> <
            /div> <
            /div> <
            /div>

            <
            div className = "card-body py-4" > {
                loading && < div className = "alert alert-info" > Dang tai du lieu... < /div>} {
                    error && < div className = "alert alert-danger" > Loi: { error } < /div>}

                    <
                    div id = "patient_table_wrapper"
                    className = "dataTables_wrapper dt-bootstrap4 no-footer" >
                        <
                        div className = "row align-items-center" >
                        <
                        div className = "col-sm-8 d-none d-lg-block" >
                        <
                        div className = "dt-buttons btn-group flex-wrap" >
                        <
                        button
                    className = "btn btn-secondary btn-light btn-sm"
                    type = "button"
                    onClick = {
                            () => setSearchQuery("") } >
                        <
                        span > < i className = "fas fa-search me-1" > < /i>Tim kiem nang cao</span >
                        <
                        /button> <
                        button
                    className = "btn btn-secondary buttons-copy buttons-html5 btn-light-primary btn-sm"
                    type = "button"
                    onClick = { handleCopy } >
                        <
                        span > < i className = "fas fa-copy me-1" > < /i>Sao chep</span >
                        <
                        /button> <
                        button
                    className = "btn btn-secondary buttons-excel buttons-html5 btn-light-success btn-sm"
                    type = "button"
                    onClick = { handleExcel } >
                        <
                        span > < i className = "fas fa-file-excel me-1" > < /i>Excel</span >
                        <
                        /button> <
                        button
                    className = "btn btn-secondary buttons-pdf buttons-html5 btn-light-danger btn-sm"
                    type = "button"
                    onClick = { handlePdf } >
                        <
                        span > < i className = "fas fa-file-pdf me-1" > < /i>PDF</span >
                        <
                        /button> <
                        button
                    className = "btn btn-secondary btn-light-info btn-sm"
                    type = "button"
                    onClick = { handlePrint } >
                        <
                        span > < i className = "fas fa-print me-1" > < /i>In bao cao</span >
                        <
                        /button> <
                        /div> <
                        /div> <
                        div className = "col-sm-4" >
                        <
                        div id = "patient_table_filter"
                    className = "dataTables_filter" >
                        <
                        label >
                        Tim kiem:
                        <
                        input
                    type = "search"
                    className = "form-control form-control-sm form-control-solid"
                    placeholder = ""
                    aria - controls = "patient_table"
                    value = { searchQuery }
                    onChange = {
                        (e) => handleSearch(e.target.value) }
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
                        table
                    id = "patient_table"
                    className = "table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline"
                    aria - describedby = "patient_table_info" >
                        <
                        thead >
                        <
                        tr className = "text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0" >
                        <
                        th style = {
                            { width: "80px" } } > Ma BN < /th> <
                        th style = {
                            { width: "130px" } } > Ho va Ten < /th> <
                        th style = {
                            { width: "80px" } } > Gioi tinh < /th> <
                        th style = {
                            { width: "90px" } } > Ngay sinh < /th> <
                        th style = {
                            { width: "100px" } } > So dien thoai < /th> <
                        th style = {
                            { width: "140px" } } > Dia chi < /th> <
                        th style = {
                            { width: "110px" } } > STT nhan dan < /th> <
                        th className = "text-end"
                    style = {
                            { width: "150px" } } > Thao tac < /th> <
                        /tr> <
                        /thead> <
                        tbody > {
                            filteredPatients.length === 0 ? ( <
                                tr className = "odd" >
                                <
                                td valign = "top"
                                colSpan = "8"
                                className = "dataTables_empty" >
                                Khong co du lieu <
                                /td> <
                                /tr>
                            ) : (
                                filteredPatients.map((patient) => ( <
                                    tr key = { patient.id }
                                    className = "odd" >
                                    <
                                    td > { patient.id } < /td> <
                                    td > { patient.name } < /td> <
                                    td > { genderLabel(patient.gender) } < /td> <
                                    td > { patient.dob } < /td> <
                                    td > { patient.phone_number || "-" } < /td> <
                                    td >
                                    <
                                    div className = "d-flex align-items-center gap-2" >
                                    <
                                    span > { truncateText(patient.address, 40) } < /span> {
                                        patient.address && patient.address.length > 40 && ( <
                                            button className = "btn btn-xs btn-light-primary"
                                            onClick = {
                                                () => showViewMoreModal("Dia chi", patient.address) }
                                            title = "Xem them" >
                                            <
                                            i className = "fas fa-eye"
                                            style = {
                                                { fontSize: "12px" } } > < /i> <
                                            /button>
                                        )
                                    } <
                                    /div> <
                                    /td> <
                                    td > { patient.identity_number || "-" } < /td> <
                                    td className = "text-end" >
                                    <
                                    button className = "btn btn-sm btn-info me-2"
                                    onClick = {
                                        () => showViewMoreModal("Chi tiết bệnh nhân",
                                            `Mã BN: ${patient.id}\nTên: ${patient.name}\nGiới tính: ${genderLabel(patient.gender)}\nNgày sinh: ${patient.dob}\nĐiện thoại: ${patient.phone_number || "-"}\nĐịa chỉ: ${patient.address || "-"}\nSTT nhân dân: ${patient.identity_number || "-"}\nGhi chú: ${patient.notes || "-"}`
                                        )
                                    } >
                                    Chi tiết <
                                    /button> <
                                    button className = "btn btn-sm btn-success"
                                    onClick = {
                                        () => printPatientInvoice(patient) } >
                                    In đơn <
                                    /button> <
                                    /td> <
                                    /tr>
                                ))
                            )
                        } <
                        /tbody> <
                        /table> <
                        div
                    id = "patient_table_processing"
                    className = "dataTables_processing"
                    style = {
                            { display: "none" } } >
                        Dang xu ly... <
                        /div> <
                        /div> <
                        /div>

                    <
                    div className = "row" >
                        <
                        div className = "col-sm-12 col-md-5" >
                        <
                        div
                    className = "dataTables_info"
                    id = "patient_table_info"
                    role = "status"
                    aria - live = "polite" >
                        Showing { filteredPatients.length === 0 ? "no records" : `${filteredPatients.length} records` } <
                        /div> <
                        /div> <
                        div className = "col-sm-12 col-md-7" >
                        <
                        div className = "dataTables_paginate paging_simple_numbers"
                    id = "patient_table_paginate" >
                        <
                        ul className = "pagination" >
                        <
                        li className = "paginate_button page-item previous disabled"
                    id = "patient_table_previous" >
                        <
                        a
                    href = "#"
                    aria - controls = "patient_table"
                    data - dt - idx = "0"
                    tabIndex = "0"
                    className = "page-link" >
                        Lui <
                        /a> <
                        /li> <
                        li className = "paginate_button page-item next disabled"
                    id = "patient_table_next" >
                        <
                        a
                    href = "#"
                    aria - controls = "patient_table"
                    data - dt - idx = "1"
                    tabIndex = "0"
                    className = "page-link" >
                        Tiep <
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
                            id = "modal_patient"
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
                            h5 className = "modal-title" > Them benh nhan moi < /h5> <
                            button type = "button"
                            className = "btn btn-icon btn-sm btn-active-light-primary ms-2"
                            aria - label = "Close"
                            onClick = {
                                () => setShowCreateModal(false) } >
                            <
                            span className = "svg-icon svg-icon-2x" >
                            <
                            svg xmlns = "http://www.w3.org/2000/svg"
                            width = "24"
                            height = "24"
                            viewBox = "0 0 24 24"
                            fill = "none" >
                            <
                            rect opacity = "0.5"
                            x = "6"
                            y = "17.3137"
                            width = "16"
                            height = "2"
                            rx = "1"
                            transform = "rotate(-45 6 17.3137)"
                            fill = "black" / >
                            <
                            rect x = "7.41422"
                            y = "6"
                            width = "16"
                            height = "2"
                            rx = "1"
                            transform = "rotate(45 7.41422 6)"
                            fill = "black" / >
                            <
                            /svg> <
                            /span> <
                            /button> <
                            /div> <
                            div className = "modal-body" >
                            <
                            form onSubmit = { handleCreatePatient } >
                            <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Ho va Ten < /label> <
                            input type = "text"
                            className = "form-control"
                            name = "name"
                            value = { formData.name }
                            onChange = { onInputChange }
                            required /
                            >
                            <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Gioi tinh < /label> <
                            select className = "form-select"
                            name = "gender"
                            value = { formData.gender }
                            onChange = { onInputChange } >
                            <
                            option value = "M" > Nam < /option> <
                            option value = "F" > Nu < /option> <
                            /select> <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Ngay sinh < /label> <
                            input type = "date"
                            className = "form-control"
                            name = "dob"
                            value = { formData.dob }
                            onChange = { onInputChange }
                            required /
                            >
                            <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > So dien thoai < /label> <
                            input type = "tel"
                            className = "form-control"
                            name = "phone_number"
                            value = { formData.phone_number }
                            onChange = { onInputChange }
                            /> <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Dia chi < /label> <
                            input type = "text"
                            className = "form-control"
                            name = "address"
                            value = { formData.address }
                            onChange = { onInputChange }
                            /> <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > STT nhan dan < /label> <
                            input type = "text"
                            className = "form-control"
                            name = "identity_number"
                            value = { formData.identity_number }
                            onChange = { onInputChange }
                            /> <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Ghi chu < /label> <
                            textarea className = "form-control"
                            name = "notes"
                            rows = "3"
                            value = { formData.notes }
                            onChange = { onInputChange } >
                            < /textarea> <
                            /div> <
                            div className = "mb-3" >
                            <
                            label className = "form-label" > Chọn hình thức khám < /label> <
                            div style = {
                                { border: "1px solid #ccc", borderRadius: "4px", padding: "8px", maxHeight: "150px", overflowY: "auto" } } > {
                                examinationOptions.map((option) => ( <
                                    div key = { option.value }
                                    className = "form-check" >
                                    <
                                    input className = "form-check-input"
                                    type = "checkbox"
                                    id = { `exam_${option.value}` }
                                    checked = { formData.examination_types.includes(option.value) }
                                    onChange = {
                                        () => onExaminationChange(option.value) }
                                    /> <
                                    label className = "form-check-label"
                                    htmlFor = { `exam_${option.value}` } > { option.label } - { Number(option.price).toLocaleString("vi-VN") }
                                    đ <
                                    /label> <
                                    /div>
                                ))
                            } <
                            /div> <
                            /div> <
                            div className = "mb-3" >
                            <
                            div style = {
                                { backgroundColor: "#f0f0f0", padding: "12px", borderRadius: "4px", fontSize: "14px" } } >
                            <
                            div > Phí khám cố định: { Number(baseFee).toLocaleString("vi-VN") }
                            đ < /div> <
                            div > Chi phí hình thức khám: { Number(totalExaminationCost).toLocaleString("vi-VN") }
                            đ < /div> <
                            div style = {
                                { fontWeight: "bold", fontSize: "16px", marginTop: "8px", color: "#d63031" } } >
                            Tổng chi phí: { Number(totalCost).toLocaleString("vi-VN") }
                            đ <
                            /div> <
                            /div> <
                            /div> <
                            div className = "modal-footer" >
                            <
                            button type = "button"
                            className = "btn btn-secondary"
                            onClick = {
                                () => setShowCreateModal(false) } >
                            Dong <
                            /button> <
                            button type = "submit"
                            className = "btn btn-primary" >
                            Luu <
                            /button> <
                            /div> <
                            /form> <
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
                            aria - label = "Close" >
                            < /button> <
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
                            Dong <
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

            export default PatientsPage;