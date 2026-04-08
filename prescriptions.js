// Prescriptions Page JavaScript

$(document).ready(function() {
    // Set today's date
    $('input[name="prescription_date"]').val(new Date().toISOString().split('T')[0]);

    // Initialize Date Range Picker
    $('#dateRangePicker').daterangepicker({
        autoUpdateInput: false,
        locale: {
            format: 'DD/MM/YYYY',
            applyLabel: 'Áp dụng',
            cancelLabel: 'Hủy',
            fromLabel: 'Từ',
            toLabel: 'Đến',
            customRangeLabel: 'Tùy chọn',
            daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
            monthNames: [
                'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
                'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
            ]
        },
        ranges: {
            'Hôm nay': [moment(), moment()],
            'Hôm qua': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            '7 ngày qua': [moment().subtract(6, 'days'), moment()],
            '30 ngày qua': [moment().subtract(29, 'days'), moment()],
            'Tháng này': [moment().startOf('month'), moment().endOf('month')],
            'Tháng trước': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
    });

    $('#dateRangePicker').on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        table.ajax.reload();
    });

    $('#dateRangePicker').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        table.ajax.reload();
    });

    // Sample data for demonstration
    const sampleData = [
        {
            date: '08/04/2026',
            name: 'Nguyễn Văn A',
            gender: 'Nam',
            birth_year: '1985',
            diagnosis: 'Viêm họng cấp',
            medications: 'Amoxicillin 500mg, Paracetamol 500mg',
            id: 1
        },
        {
            date: '07/04/2026',
            name: 'Trần Thị B',
            gender: 'Nữ',
            birth_year: '1990',
            diagnosis: 'Đau đầu, chóng mặt',
            medications: 'Paracetamol 500mg, Vitamin B1',
            id: 2
        },
        {
            date: '06/04/2026',
            name: 'Lê Văn C',
            gender: 'Nam',
            birth_year: '1978',
            diagnosis: 'Tăng huyết áp',
            medications: 'Amlodipine 5mg, Losartan 50mg',
            id: 3
        }
    ];

    // Initialize DataTable
    const table = $('#prescriptionTable').DataTable({
        data: sampleData,
        columns: [
            { data: 'date' },
            { data: 'name' },
            { data: 'gender' },
            { data: 'birth_year' },
            { data: 'diagnosis' },
            { 
                data: 'medications',
                render: function(data) {
                    return '<small>' + data + '</small>';
                }
            },
            {
                data: null,
                orderable: false,
                className: 'text-end',
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-sm btn-light-primary" onclick="viewPrescription(${row.id})" title="Xem">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-light-info" onclick="printPrescription(${row.id})" title="In">
                                <i class="fas fa-print"></i>
                            </button>
                            <button class="btn btn-sm btn-light-warning" onclick="editPrescription(${row.id})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-light-danger" onclick="deletePrescription(${row.id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        order: [[0, 'desc']],
        pageLength: 10,
        language: {
            emptyTable: 'Không có dữ liệu',
            zeroRecords: 'Không tìm thấy kết quả',
            info: 'Hiển thị _START_ đến _END_ của _TOTAL_ bản ghi',
            infoEmpty: 'Hiển thị 0 đến 0 của 0 bản ghi',
            infoFiltered: '(lọc từ _MAX_ bản ghi)',
            lengthMenu: 'Hiển thị _MENU_ bản ghi',
            search: 'Tìm kiếm:',
            paginate: {
                first: 'Đầu',
                last: 'Cuối',
                next: 'Tiếp',
                previous: 'Trước'
            }
        },
        dom: 'rtip'
    });

    // Export buttons
    $('#btnCopy').on('click', function() {
        const data = table.rows().data().toArray();
        let text = 'Ngày\tHọ & Tên\tGiới\tNăm sinh\tChẩn đoán\tThuốc\n';
        data.forEach(row => {
            text += `${row.date}\t${row.name}\t${row.gender}\t${row.birth_year}\t${row.diagnosis}\t${row.medications}\n`;
        });
        navigator.clipboard.writeText(text);
        alert('Đã sao chép dữ liệu!');
    });

    $('#btnPrint').on('click', function() {
        window.print();
    });

    // Add medication row
    $('#addMedicationBtn').on('click', function() {
        const medicationItem = `
            <div class="medication-item border rounded p-3 mb-3">
                <div class="row">
                    <div class="col-md-4 mb-2">
                        <label class="form-label small">Tên thuốc</label>
                        <input type="text" class="form-control form-control-sm" name="drug_name[]" placeholder="Tên thuốc">
                    </div>
                    <div class="col-md-2 mb-2">
                        <label class="form-label small">Số lượng</label>
                        <input type="number" class="form-control form-control-sm" name="quantity[]" placeholder="10">
                    </div>
                    <div class="col-md-2 mb-2">
                        <label class="form-label small">Đơn vị</label>
                        <select class="form-select form-select-sm" name="unit[]">
                            <option>Viên</option>
                            <option>Vỉ</option>
                            <option>Hộp</option>
                            <option>Chai</option>
                            <option>Ống</option>
                        </select>
                    </div>
                    <div class="col-md-3 mb-2">
                        <label class="form-label small">Cách dùng</label>
                        <input type="text" class="form-control form-control-sm" name="usage[]" placeholder="Ngày 2 lần">
                    </div>
                    <div class="col-md-1 mb-2">
                        <label class="form-label small">&nbsp;</label>
                        <button type="button" class="btn btn-sm btn-danger w-100 remove-medication">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
        $('#medicationList').append(medicationItem);
    });

    // Remove medication row
    $(document).on('click', '.remove-medication', function() {
        $(this).closest('.medication-item').remove();
    });
});

// Global functions
function savePrescription() {
    const form = document.getElementById('addPrescriptionForm');
    if (form.checkValidity()) {
        alert('Đơn thuốc đã được lưu!');
        $('#addPrescriptionModal').modal('hide');
        form.reset();
    } else {
        form.reportValidity();
    }
}

function viewPrescription(id) {
    alert('Xem đơn thuốc #' + id);
}

function printPrescription(id) {
    alert('In đơn thuốc #' + id);
}

function editPrescription(id) {
    alert('Sửa đơn thuốc #' + id);
}

function deletePrescription(id) {
    if (confirm('Bạn có chắc muốn xóa đơn thuốc này?')) {
        alert('Đã xóa đơn thuốc #' + id);
    }
}
