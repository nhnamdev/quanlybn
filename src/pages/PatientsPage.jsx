import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function PatientsPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [patients, setPatients] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        gender: "M",
        dob: "2000",
        address: "",
        phone_number: "",
        identity_number: "",
        medical_history: ""
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.openCreatePatientModal) {
            setShowCreateModal(true);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.pathname, location.state, navigate]);

    const years = useMemo(() => {
        const list = [];
        for (let y = 1920; y <= 2025; y += 1) list.push(y);
        return list;
    }, []);

    const filteredPatients = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return patients;

        return patients.filter((patient) => {
            const text = [
                    patient.id,
                    patient.name,
                    patient.gender,
                    patient.dob,
                    patient.address,
                    patient.phone_number,
                    patient.medical_history
                ]
                .join(" ")
                .toLowerCase();
            return text.includes(q);
        });
    }, [patients, searchQuery]);

    const genderLabel = (value) => (value === "F" ? "Nữ" : "Nam");

    const toCsv = (rows) => {
        const headers = ["ID", "Họ & Tên", "Giới", "Năm sinh", "Địa chỉ", "Điện thoại", "Tiền căn"];
        const lines = rows.map((row) => [
            row.id,
            row.name,
            genderLabel(row.gender),
            row.dob,
            row.address,
            row.phone_number,
            row.medical_history
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
        window.alert("Chưa có dữ liệu để xuất.");
        return false;
    };

    const handleCopy = async() => {
        if (!ensureRows()) return;
        const csv = toCsv(filteredPatients);
        await navigator.clipboard.writeText(csv);
        window.alert("Đã sao chép danh sách bệnh nhân.");
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
                (p) => `<tr>
                    <td>${p.id}</td>
                    <td>${p.name}</td>
                    <td>${genderLabel(p.gender)}</td>
                    <td>${p.dob}</td>
                    <td>${p.address}</td>
                    <td>${p.phone_number || ""}</td>
                    <td>${p.medical_history || ""}</td>
                </tr>`
            )
            .join("");

        const html = `<!doctype html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <title>${title}</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h2 { margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #d1d5db; padding: 8px; font-size: 13px; }
        th { background: #f3f4f6; text-align: left; }
    </style>
</head>
<body>
    <h2>${title}</h2>
    <table>
        <thead>
            <tr>
                <th>ID</th><th>Họ & Tên</th><th>Giới</th><th>Năm sinh</th><th>Địa chỉ</th><th>Điện thoại</th><th>Tiền căn</th>
            </tr>
        </thead>
        <tbody>${tableRows}</tbody>
    </table>
</body>
</html>`;

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

    const onInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({...prev, [name]: value }));
    };

    const handleCreatePatient = (event) => {
        event.preventDefault();
        const nextId = patients.length > 0 ? Math.max(...patients.map((p) => Number(p.id))) + 1 : 1;
        const patient = {
            id: String(nextId),
            ...formData
        };
        setPatients((prev) => [...prev, patient]);
        setFormData({
            name: "",
            gender: "M",
            dob: "2000",
            address: "",
            phone_number: "",
            identity_number: "",
            medical_history: ""
        });
        setShowCreateModal(false);
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
        span className = "card-label fw-bolder fs-3 mb-1" > Danh sách Bệnh Nhân < /span> <
        span className = "text-muted mt-1 fw-bold fs-7" > Danh sách Bệnh Nhân của bạn < /span> <
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
        fill = "black" > < /rect> <
        rect x = "4.36396"
        y = "11.364"
        width = "16"
        height = "2"
        rx = "1"
        fill = "black" > < /rect> <
        /svg> <
        /span>
        Thêm Bệnh Nhân mới <
        /button> <
        /div> <
        /div> <
        /div> <
        div className = "card-body py-4" >
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
        button className = "btn btn-secondary btn-light btn-sm"
        type = "button"
        onClick = {
            () => setSearchQuery("") } > < span > < i className = "fas fa-search" > < /i> Tìm kiếm nâng cao</span > < /button> <
        button className = "btn btn-secondary buttons-copy buttons-html5 btn-light-primary btn-sm"
        type = "button"
        onClick = { handleCopy } > < span > < i className = "fas fa-copy" > < /i> Sao chép</span > < /button> <
        button className = "btn btn-secondary buttons-excel buttons-html5 btn-light-success btn-sm"
        type = "button"
        onClick = { handleExcel } > < span > < i className = "fas fa-file-excel" > < /i> Excel</span > < /button> <
        button className = "btn btn-secondary buttons-pdf buttons-html5 btn-light-danger btn-sm"
        type = "button"
        onClick = { handlePdf } > < span > < i className = "fas fa-file-pdf" > < /i> PDF</span > < /button> <
        button className = "btn btn-secondary btn-light-info btn-sm"
        type = "button"
        onClick = { handlePrint } > < span > < i className = "fas fa-print" > < /i> In báo cáo</span > < /button> <
        /div> <
        /div> <
        div className = "col-sm-4" >
        <
        div id = "patient_table_filter"
        className = "dataTables_filter" >
        <
        label >
        Tìm kiếm:
        <
        input type = "search"
        className = "form-control form-control-sm form-control-solid"
        placeholder = ""
        aria-controls = "patient_table"
        value = { searchQuery }
        onChange = {
            (e) => setSearchQuery(e.target.value) }
        /> <
        /label> <
        /div> <
        /div> <
        /div> <
        div className = "row" >
        <
        div className = "col-sm-12" >
        <
        table id = "patient_table"
        className = "table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline"
        aria-describedby = "patient_table_info" >
        <
        thead >
        <
        tr className = "text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0" >
        <
        th > ID < /th> <
        th > Họ & amp; Tên < /th> <
        th > Giới < /th> <
        th > Năm sinh < /th> <
        th > Địa chỉ < /th> <
        th > Điện thoại < /th> <
        th > Tiền căn < /th> <
        th className = "text-end min-w-100px" > Thao tác < /th> <
        /tr> <
        /thead> <
        tbody > {
            filteredPatients.length === 0 ? ( <
                tr className = "odd" >
                <
                td colSpan = "8"
                className = "dataTables_empty" > Không có dữ liệu < /td> <
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
                    td > { patient.address } < /td> <
                    td > { patient.phone_number } < /td> <
                    td > { patient.medical_history } < /td> <
                    td className = "text-end" > - < /td> <
                    /tr>
                ))
            )
        } <
        /tbody> <
        /table> <
        /div> <
        /div> <
        div className = "row" >
        <
        div className = "col-sm-5" > < div className = "dataTables_info"
        id = "patient_table_info"
        role = "status"
        aria-live = "polite" > Showing { filteredPatients.length === 0 ? "no records" : `${filteredPatients.length} records` } < /div></div >
        <
        div className = "col-sm-7" >
        <
        div className = "dataTables_paginate paging_simple_numbers"
        id = "patient_table_paginate" >
        <
        ul className = "pagination" >
        <
        li className = "paginate_button page-item previous disabled" > < a href = "#"
        className = "page-link" > Lùi < /a></li >
        <
        li className = "paginate_button page-item next disabled" > < a href = "#"
        className = "page-link" > Tiếp < /a></li >
        <
        /ul> <
        /div> <
        /div> <
        /div> <
        /div> <
        /div> <
        /div>

        {
            showCreateModal ? ( <
                >
                <
                div className = "modal-backdrop fade show" > < /div> <
                div className = "modal fade show d-block"
                tabIndex = "-1"
                role = "dialog"
                aria-modal = "true" >
                <
                div className = "modal-dialog modal-dialog-centered modal-xl" >
                <
                div className = "modal-content rounded" >
                <
                div className = "modal-header" >
                <
                h2 > Thêm bệnh nhân mới < /h2> <
                div className = "btn btn-sm btn-icon btn-active-color-primary"
                onClick = {
                    () => setShowCreateModal(false) } >
                <
                span className = "svg-icon svg-icon-1" >
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
                fill = "black" > < /rect> <
                rect x = "7.41422"
                y = "6"
                width = "16"
                height = "2"
                rx = "1"
                transform = "rotate(45 7.41422 6)"
                fill = "black" > < /rect> <
                /svg> <
                /span> <
                /div> <
                /div> <
                div className = "modal-body scroll-y mx-5 mx-xl-5 my-0" >
                <
                form className = "js-patient-create-form"
                onSubmit = { handleCreatePatient } >
                <
                input id = "id_accountID"
                type = "hidden"
                name = "accountID"
                value = "1907" / >

                <
                div className = "d-flex flex-column mb-8 fv-row" >
                <
                label htmlFor = "id_name"
                className = "d-flex align-items-center fs-6 fw-bold mb-2" >
                <
                span className = "required" > Họ & amp; Tên < /span> <
                /label> <
                input id = "id_name"
                maxLength = "250"
                name = "name"
                type = "text"
                className = "form-control form-control-solid"
                placeholder = "Nguyễn Văn A"
                autoComplete = "off"
                required value = { formData.name }
                onChange = { onInputChange }
                /> <
                span id = "editpatient" > < /span> <
                /div>

                <
                div className = "row g-9 mb-8" >
                <
                div className = "col-md-6 fv-row" >
                <
                label htmlFor = "id_gender"
                className = "required fs-6 fw-bold mb-2" > Giới tính < /label> <
                select className = "form-select form-select-solid"
                id = "id_gender"
                name = "gender"
                value = { formData.gender }
                onChange = { onInputChange } >
                <
                option value = "M" > Nam < /option> <
                option value = "F" > Nữ < /option> <
                /select> <
                /div> <
                div className = "col-md-6 fv-row" >
                <
                label htmlFor = "id_dob"
                className = "required fs-6 fw-bold mb-2" > Ngày sinh < /label> <
                select className = "form-select form-select-solid"
                id = "id_dob"
                name = "dob"
                value = { formData.dob }
                onChange = { onInputChange } > {
                    years.map((year) => ( <
                        option key = { year }
                        value = { String(year) } > { year } < /option>
                    ))
                } <
                /select> <
                /div> <
                /div>

                <
                div className = "d-flex flex-column mb-8 fv-row" >
                <
                label htmlFor = "id_address"
                className = "d-flex align-items-center fs-6 fw-bold mb-2" > < span className = "required" > Địa chỉ < /span></label >
                <
                input className = "form-control form-control-solid"
                id = "id_address"
                type = "text"
                name = "address"
                placeholder = "Quận Tân Bình, TP Hồ Chí Minh"
                required value = { formData.address }
                onChange = { onInputChange }
                /> <
                /div>

                <
                div className = "row g-9 mb-8" >
                <
                div className = "col-md-6 fv-row" >
                <
                label htmlFor = "id_phone_number"
                className = "d-flex align-items-center fs-6 fw-bold mb-2" > < span > Điện thoại < /span></label >
                <
                input className = "form-control form-control-solid"
                id = "id_phone_number"
                maxLength = "250"
                type = "text"
                name = "phone_number"
                placeholder = "0909123456"
                value = { formData.phone_number }
                onChange = { onInputChange }
                /> <
                /div> <
                div className = "col-md-6 fv-row" >
                <
                label htmlFor = "id_identity_number"
                className = "d-flex align-items-center fs-6 fw-bold mb-2" > < span > CCCD / CMND < /span></label >
                <
                input className = "form-control form-control-solid"
                id = "id_identity_number"
                maxLength = "12"
                type = "text"
                name = "identity_number"
                placeholder = "Số Căn cước công dân"
                value = { formData.identity_number }
                onChange = { onInputChange }
                /> <
                /div> <
                /div>

                <
                div className = "d-flex flex-column mb-8 fv-row" >
                <
                label htmlFor = "id_medical_history"
                className = "d-flex align-items-center fs-6 fw-bold mb-2" > < span > Tiền căn < /span></label >
                <
                input className = "form-control form-control-solid"
                id = "id_medical_history"
                maxLength = "250"
                type = "text"
                name = "medical_history"
                placeholder = "Tăng huyết áp"
                value = { formData.medical_history }
                onChange = { onInputChange }
                /> <
                /div>

                <
                div className = "text-center pb-5" >
                <
                button type = "button"
                className = "btn btn-light me-3"
                onClick = {
                    () => setShowCreateModal(false) } > Hủy < /button> <
                button type = "submit"
                className = "btn btn-primary"
                id = "submitbutton" >
                <
                span className = "indicator-label" > Thêm bệnh nhân < /span> <
                /button> <
                /div> <
                /form> <
                /div> <
                /div> <
                /div> <
                /div> <
                />
            ) : null
        } <
        />
    );
}

export default PatientsPage;