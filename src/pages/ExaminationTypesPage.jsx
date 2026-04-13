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
        const actionLabel = item.is_active ? "tat" : "bat";
        const ok = window.confirm(`Ban co chac chan muon ${actionLabel} hinh thuc kham nay?`);
        if (!ok) return;
        await setExaminationTypeActive(item.id, !item.is_active);
        if (editingId === item.id) resetEdit();
    };

    return ( <
            div className = "card" >
            <
            div className = "card-header border-0 pt-6" >
            <
            div className = "card-title d-flex flex-column" >
            <
            span className = "card-label fw-bolder fs-3 mb-1" > Cac hinh thuc kham < /span> <
            span className = "text-muted mt-1 fw-bold fs-7" > Them, sua, xoa danh sach hinh thuc kham de su dung o form benh nhan < /span> <
            /div> <
            /div>

            <
            div className = "card-body py-4" > {
                loading && < div className = "alert alert-info" > Dang tai danh sach hinh thuc kham... < /div>} {
                    error && < div className = "alert alert-danger" > Loi: { error } < /div>}

                    <
                    form className = "row g-3 mb-5"
                    onSubmit = { handleCreate } >
                        <
                        div className = "col-md-6" >
                        <
                        label className = "form-label" > Ten hinh thuc kham < /label> <
                        input
                    type = "text"
                    className = "form-control"
                    value = { newLabel }
                    onChange = {
                        (e) => setNewLabel(e.target.value) }
                    placeholder = "Vi du: Kham tim thai"
                    required
                        /
                        >
                        <
                        /div> <
                        div className = "col-md-4" >
                        <
                        label className = "form-label" > Gia(VND) < /label> <
                        input
                    type = "number"
                    className = "form-control"
                    value = { newPrice }
                    onChange = {
                        (e) => setNewPrice(e.target.value) }
                    min = "0"
                    step = "1000"
                    placeholder = "0" /
                        >
                        <
                        /div> <
                        div className = "col-md-2 d-flex align-items-end" >
                        <
                        button type = "submit"
                    className = "btn btn-primary w-100" > Them < /button> <
                        /div> <
                        /form>

                    <
                    div className = "mb-4 p-3 rounded"
                    style = {
                            { background: "#f5f8fa" } } >
                        <
                        div > So hinh thuc kham: < strong > { totalTypes } < /strong></div >
                        <
                        div > Tong muc gia danh muc: < strong > { Number(totalPrice).toLocaleString("vi-VN") }
                    đ < /strong></div >
                        <
                        /div>

                    <
                    div className = "table-responsive" >
                        <
                        table className = "table align-middle table-row-dashed fs-6 gy-3" >
                        <
                        thead >
                        <
                        tr className = "text-start text-gray-900 fw-bolder fs-7 text-uppercase" >
                        <
                        th style = {
                            { width: "70px" } } > STT < /th> <
                        th > Ten hinh thuc kham < /th> <
                        th style = {
                            { width: "220px" } } > Gia < /th> <
                        th style = {
                            { width: "140px" } } > Trang thai < /th> <
                        th style = {
                            { width: "220px" } }
                    className = "text-end" > Thao tac < /th> <
                        /tr> <
                        /thead> <
                        tbody > {
                            examinationTypes.length === 0 ? ( <
                                tr >
                                <
                                td colSpan = "5"
                                className = "text-center text-muted py-6" > Chua co hinh thuc kham nao. < /td> <
                                /tr>
                            ) : (
                                examinationTypes.map((item, index) => {
                                    const isEditing = editingId === item.id;
                                    return ( <
                                        tr key = { item.id } >
                                        <
                                        td > { index + 1 } < /td> <
                                        td > {
                                            isEditing ? ( <
                                                input type = "text"
                                                className = "form-control"
                                                value = { editingLabel }
                                                onChange = {
                                                    (e) => setEditingLabel(e.target.value) }
                                                />
                                            ) : (
                                                item.label
                                            )
                                        } <
                                        /td> <
                                        td > {
                                            isEditing ? ( <
                                                input type = "number"
                                                className = "form-control"
                                                value = { editingPrice }
                                                onChange = {
                                                    (e) => setEditingPrice(e.target.value) }
                                                min = "0"
                                                step = "1000" /
                                                >
                                            ) : (
                                                `${Number(item.price || 0).toLocaleString("vi-VN")} đ`
                                            )
                                        } <
                                        /td> <
                                        td > {
                                            item.is_active ? ( <
                                                span className = "badge badge-light-success" > Dang bat < /span>
                                            ) : ( <
                                                span className = "badge badge-light-secondary" > Da tat < /span>
                                            )
                                        } <
                                        /td> <
                                        td className = "text-end" > {
                                            isEditing ? ( <
                                                >
                                                <
                                                button type = "button"
                                                className = "btn btn-sm btn-success me-2"
                                                onClick = { saveEdit } > Luu < /button> <
                                                button type = "button"
                                                className = "btn btn-sm btn-light"
                                                onClick = { resetEdit } > Huy < /button> <
                                                />
                                            ) : ( <
                                                >
                                                <
                                                button type = "button"
                                                className = "btn btn-sm btn-primary me-2"
                                                onClick = {
                                                    () => startEdit(item) } > Sua < /button> <
                                                button type = "button"
                                                className = { `btn btn-sm ${item.is_active ? "btn-danger" : "btn-success"}` }
                                                onClick = {
                                                    () => handleToggleActive(item) } >
                                                { item.is_active ? "Tat" : "Bat" } <
                                                /button> <
                                                />
                                            )
                                        } <
                                        /td> <
                                        /tr>
                                    );
                                })
                            )
                        } <
                        /tbody> <
                        /table> <
                        /div> <
                        /div> <
                        /div>
                );
            }

            export default ExaminationTypesPage;