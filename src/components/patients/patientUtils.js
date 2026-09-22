/**
 * Bóc tách chuỗi structured notes của bệnh nhân thành các trường dữ liệu riêng biệt.
 */
export const parsePatientNotes = (rawNotes) => {
    if (!rawNotes || typeof rawNotes !== "string") {
        return {
            height: "",
            weight: "",
            bloodPressure: "",
            history: "",
            parity: "",
            gestationalAge: "",
            dueDate: "",
            extraNote: "",
            legacyNote: "",
            services: "",
            hasStructured: false
        };
    }

    const text = rawNotes.trim();

    // Regex trích xuất các chỉ số đã lưu (hỗ trợ cả dạng Chiều cao:, Cao:, Cân nặng:, Nặng:, Huyết áp:, HA:)
    const heightMatch = text.match(/(?:Chiều cao|Cao):\s*([^|\n]+)/i);
    const weightMatch = text.match(/(?:Cân nặng|Nặng):\s*([^|\n]+)/i);
    const bpMatch = text.match(/(?:Huyết áp|HA):\s*([^|\n]+)/i);

    // Tiền căn: hỗ trợ dạng Tiền căn: hoặc [Tiền căn]:
    const historyMatch = text.match(/(?:\[Tiền căn\]:|Tiền căn:)\s*([^\n]+)/i);

    // Sản khoa: hỗ trợ Con lần thứ, Con mấy lần, Con lần
    const parityMatch = text.match(/(?:Con lần thứ|Con mấy lần|Con lần):\s*([^|\n]+)/i);
    const gestationalAgeMatch = text.match(/Tuổi thai:\s*([^|\n]+)/i);
    const dueDateMatch = text.match(/Dự sinh:\s*([^|\n]+)/i);

    // Dịch vụ tiếp nhận: [Dịch vụ tiếp nhận]: ... hoặc Dịch vụ: ...
    const servicesMatch = text.match(/(?:\[Dịch vụ tiếp nhận\]:|Dịch vụ:)\s*([^\n]+)/i);

    // Trích xuất Ghi chú thêm và Ghi chú cũ (hỗ trợ cả [Ghi chú khám]:)
    const extraMatch = text.match(
        /(?:Ghi chú thêm:|\[Ghi chú khám\]:)\s*([\s\S]*?)(?=(?:\nGhi chú cũ:|\[Dịch vụ tiếp nhận\]:|--- Hẹn khám lại:|--- Ghi chu|$))/i
    );
    const legacyMatch = text.match(/Ghi chú cũ:\s*([\s\S]*?)(?=(?:--- Hẹn khám lại:|$))/i);

    const cleanField = (val) => {
        if (!val) return "";
        return val.replace(/^[\]:]+\s*/, "").replace(/\[.*?\]/g, "").trim();
    };

    const height = heightMatch ? cleanField(heightMatch[1]) : "";
    const weight = weightMatch ? cleanField(weightMatch[1]) : "";
    const bloodPressure = bpMatch ? cleanField(bpMatch[1]) : "";
    const history = historyMatch ? cleanField(historyMatch[1]) : "";
    const parity = parityMatch ? cleanField(parityMatch[1]) : "";
    const gestationalAge = gestationalAgeMatch ? cleanField(gestationalAgeMatch[1]) : "";
    const dueDate = dueDateMatch ? cleanField(dueDateMatch[1]) : "";
    const services = servicesMatch ? cleanField(servicesMatch[1]) : "";
    let extraNote = extraMatch ? extraMatch[1].trim() : "";
    let legacyNote = legacyMatch ? legacyMatch[1].trim() : "";

    const hasStructured = Boolean(
        height || weight || bloodPressure || history || parity || gestationalAge || dueDate || services || extraMatch || legacyMatch
    );

    // Nếu không khớp cấu trúc có sẵn mà chỉ là một đoạn text đơn thuần
    if (!hasStructured && text) {
        extraNote = text
            .replace(/--- Hẹn khám lại: (.*?) ---/g, "")
            .replace(/--- Ghi chu lam sang benh nhan ---[\s\S]*/g, "")
            .trim();
    }

    return {
        height,
        weight,
        bloodPressure,
        history,
        parity,
        gestationalAge,
        dueDate,
        extraNote,
        legacyNote,
        services,
        hasStructured
    };
};

/**
 * Xây dựng chuỗi ghi chú tổng hợp từ form
 */
export const buildStructuredNotes = (values) => {
    const sections = [
        { label: "Chiều cao", value: values.note_height },
        { label: "Cân nặng", value: values.note_weight },
        { label: "Huyết áp", value: values.note_blood_pressure },
        { label: "Tiền căn", value: values.note_history },
        { label: "Con lần thứ", value: values.note_parity },
        { label: "Tuổi thai", value: values.note_gestational_age },
        { label: "Dự sinh", value: values.note_due_date }
    ]
        .filter((item) => String(item.value || "").trim())
        .map((item) => `${item.label}: ${String(item.value).trim()}`);

    const extraNote = String(values.note_extra || "").trim();
    if (extraNote) {
        sections.push(`Ghi chú thêm:\n${extraNote}`);
    }

    const legacyNote = String(values.notes || "").trim();
    if (legacyNote) {
        sections.push(`Ghi chú cũ:\n${legacyNote}`);
    }

    return sections.join("\n");
};

export const genderLabel = (value) => (value === "F" ? "Nữ" : "Nam");

export const calculateAge = (dob) => {
    if (!dob) return "";
    const birthDate = new Date(dob);
    if (Number.isNaN(birthDate.getTime())) return "";
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 0 ? `${age} tuổi` : "";
};

export const formatCurrency = (amount) => {
    return Number(amount || 0).toLocaleString("vi-VN") + " đ";
};

/**
 * Hợp nhất thông tin sinh hiệu, tiền căn, ghi chú và dịch vụ của lượt khám (record)
 * Ưu tiên dữ liệu cụ thể của lượt khám, nếu chưa có thì lấy từ hồ sơ tổng thể của bệnh nhân.
 */
export const getResolvedVisitNotes = (record) => {
    const rxNotes = record?.prescription?.notes || record?.notes || "";
    const patientNotes = record?.patient?.notes || "";
    const rxParsed = parsePatientNotes(rxNotes);
    const patientParsed = parsePatientNotes(patientNotes);

    const isLatest = record?.isLatestVisit !== false;

    // Khi người dùng cập nhật hồ sơ bệnh nhân, patientParsed chứa thông tin mới nhất.
    // Đối với lượt khám mới nhất / hiện tại (hoặc khi bệnh nhân chỉ có 1 lượt khám), ưu tiên thông tin cập nhật từ hồ sơ bệnh nhân.
    const height = isLatest ? (patientParsed.height || rxParsed.height || "") : (rxParsed.height || patientParsed.height || "");
    const weight = isLatest ? (patientParsed.weight || rxParsed.weight || "") : (rxParsed.weight || patientParsed.weight || "");
    const bloodPressure = isLatest ? (patientParsed.bloodPressure || rxParsed.bloodPressure || "") : (rxParsed.bloodPressure || patientParsed.bloodPressure || "");
    const history = isLatest ? (patientParsed.history || rxParsed.history || "") : (rxParsed.history || patientParsed.history || "");
    const parity = isLatest ? (patientParsed.parity || rxParsed.parity || "") : (rxParsed.parity || patientParsed.parity || "");
    const gestationalAge = isLatest ? (patientParsed.gestationalAge || rxParsed.gestationalAge || "") : (rxParsed.gestationalAge || patientParsed.gestationalAge || "");
    const dueDate = isLatest ? (patientParsed.dueDate || rxParsed.dueDate || "") : (rxParsed.dueDate || patientParsed.dueDate || "");
    const extraNote = isLatest ? (patientParsed.extraNote || rxParsed.extraNote || "") : (rxParsed.extraNote || patientParsed.extraNote || "");
    const legacyNote = isLatest ? (patientParsed.legacyNote || rxParsed.legacyNote || "") : (rxParsed.legacyNote || patientParsed.legacyNote || "");
    const services = rxParsed.services || patientParsed.services || "";

    const rxDiagnosis = record?.prescription?.diagnosis;
    const diagnosis = rxDiagnosis && rxDiagnosis !== "Tiếp nhận khám bệnh" ? rxDiagnosis : "";
    const displayServiceOrDiagnosis = services || diagnosis || "";

    const vitalsList = [height, weight, bloodPressure].filter(Boolean);
    const vitalsSummary = vitalsList.join(" | ");

    return {
        height,
        weight,
        bloodPressure,
        history,
        parity,
        gestationalAge,
        dueDate,
        extraNote,
        legacyNote,
        services,
        diagnosis,
        displayServiceOrDiagnosis,
        vitalsList,
        vitalsSummary,
        hasVitals: vitalsList.length > 0
    };
};
