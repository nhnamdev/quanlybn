// Drugs Page JavaScript

$(document).ready(function() {
    // Sample drug data
    const sampleDrugs = [
        {
            id: 1,
            registration_number: 'VD-12345-18',
            drug_name: 'Paracetamol 500mg',
            active_ingredient: 'Paracetamol',
            concentration: '500mg',
            route: 'Uống',
            quantity: 1000,
            unit: 'Viên',
            notes: 'Hạ sốt, giảm đau'
        },
        {
            id: 2,
            registration_number: 'VD-23456-19',
            drug_name: 'Amoxicillin 500mg',
            active_ingredient: 'Amoxicillin',
            concentration: '500mg',
            route: 'Uống',
            quantity: 500,
            unit: 'Viên',
            notes: 'Kháng sinh'
        },
        {
            id: 3,
            registration_number: 'VD-34567-20',
            drug_name: 'Vitamin B1',
            active_ingredient: 'Thiamine',
            concentration: '100mg',
            route: 'Uống',
            quantity: 200,
            unit: 'Viên',
            notes: 'Bổ sung vitamin'
        },
        {
            id: 4,
            registration_number: 'VD-45678-21',
            drug_name: 'Amlodipine 5mg',
            active_ingredient: 'Amlodipine',
            concentration: '5mg',
            route: 'Uống',
            quantity: 50,
            unit: 'Viên',
            notes: 'Hạ huyết áp - Sắp hết'
        }
    ];

    // Initialize DataTable
    const table = $('#drugTable').DataTable({
        data: sampleDrugs,
        columns: [
            { 
                data: null,
                render: function(data, type, row, meta) {
                    return meta.row + 1;
                }
            },
            { data: 'registration_number' },
            { data: 'drug_name' },
            { data: 'active_ingredient' },
            { data: 'concentration' },
            { data: 'route' },
            { 
                data: 'quantity',
                render: function(data, type, row) {
                    let badge = 'success';
                    if (data < 100) badge = 'danger';
                    else if (data < 300) badge = 'warning';
                    return `<span class="badge bg-${badge}">${data} ${row.unit}</span>`;
                }
            },
            { 
                data: 'notes',
                render: function(data) {
                    return data ? `<small>${data}</small>` : '';
                }
            },
            {
                data: null,
                orderable: false,
                className: 'text-end',
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-sm btn-light-warning" onclick="editDrug(${row.id})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-light-success" onclick="adjustQuantity(${row.id})" title="Điều chỉnh số lượng">
                                <i class="fas fa-plus-minus"></i>
                            </button>
                            <button class="btn btn-sm btn-light-danger" onclick="deleteDrug(${row.id})" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }
            }
        ],
        order: [[1, 'asc']],
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
        }
    });

    // Store table reference globally
    window.drugTable = table;
    window.sampleDrugs = sampleDrugs;
});

// Save drug function
function saveDrug() {
    const form = document.getElementById('addDrugForm');
    if (form.checkValidity()) {
        alert('Đã thêm thuốc thành công!');
        $('#addDrugModal').modal('hide');
        form.reset();
        // Reload table here
    } else {
        form.reportValidity();
    }
}

// Edit drug function
function editDrug(id) {
    alert('Sửa thông tin thuốc #' + id);
}

// Adjust quantity function
function adjustQuantity(id) {
    const quantity = prompt('Nhập số lượng cần thêm/bớt (số âm để giảm):');
    if (quantity !== null && quantity !== '') {
        alert('Đã điều chỉnh số lượng thuốc #' + id);
    }
}

// Delete drug function
function deleteDrug(id) {
    if (confirm('Bạn có chắc muốn xóa thuốc này?')) {
        alert('Đã xóa thuốc #' + id);
    }
}

// Export drugs function
function exportDrugs() {
    const data = window.sampleDrugs;
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Prepare data for export
    const exportData = data.map((drug, index) => ({
        'STT': index + 1,
        'Số đăng ký': drug.registration_number,
        'Tên thuốc': drug.drug_name,
        'Hoạt chất': drug.active_ingredient,
        'Hàm lượng': drug.concentration,
        'Đường dùng': drug.route,
        'Số lượng': drug.quantity,
        'Đơn vị': drug.unit,
        'Ghi chú': drug.notes || ''
    }));
    
    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 15 }, // Số đăng ký
        { wch: 30 }, // Tên thuốc
        { wch: 20 }, // Hoạt chất
        { wch: 12 }, // Hàm lượng
        { wch: 12 }, // Đường dùng
        { wch: 10 }, // Số lượng
        { wch: 10 }, // Đơn vị
        { wch: 30 }  // Ghi chú
    ];
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách thuốc');
    
    // Generate filename with current date
    const today = new Date();
    const filename = `Danh_sach_thuoc_${today.getFullYear()}${(today.getMonth()+1).toString().padStart(2,'0')}${today.getDate().toString().padStart(2,'0')}.xlsx`;
    
    // Save file
    XLSX.writeFile(wb, filename);
}

// Download template function
function downloadTemplate() {
    const wb = XLSX.utils.book_new();
    
    // Template data with sample row
    const templateData = [
        {
            'Số đăng ký': 'VD-12345-18',
            'Tên thuốc': 'Paracetamol 500mg',
            'Hoạt chất': 'Paracetamol',
            'Hàm lượng': '500mg',
            'Đường dùng': 'Uống',
            'Số lượng': 100,
            'Đơn vị': 'Viên',
            'Ghi chú': 'Hạ sốt, giảm đau'
        }
    ];
    
    const ws = XLSX.utils.json_to_sheet(templateData);
    
    // Set column widths
    ws['!cols'] = [
        { wch: 15 }, // Số đăng ký
        { wch: 30 }, // Tên thuốc
        { wch: 20 }, // Hoạt chất
        { wch: 12 }, // Hàm lượng
        { wch: 12 }, // Đường dùng
        { wch: 10 }, // Số lượng
        { wch: 10 }, // Đơn vị
        { wch: 30 }  // Ghi chú
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Mẫu nhập thuốc');
    XLSX.writeFile(wb, 'Mau_nhap_thuoc.xlsx');
}

// Start import function
function startImport() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('Vui lòng chọn file Excel!');
        return;
    }
    
    // Show progress
    $('#importProgress').removeClass('d-none');
    $('#startImportBtn').prop('disabled', true);
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            // Get first worksheet
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            
            // Simulate import progress
            let progress = 0;
            const total = jsonData.length;
            const interval = setInterval(() => {
                progress += 10;
                if (progress > 100) progress = 100;
                
                $('#progressBar').css('width', progress + '%').text(progress + '%');
                
                if (progress === 100) {
                    clearInterval(interval);
                    $('#importStatus').removeClass('alert-info').addClass('alert-success')
                        .html(`<i class="fas fa-check-circle me-2"></i>Đã nhập thành công ${total} thuốc!`);
                    
                    setTimeout(() => {
                        $('#importDrugsModal').modal('hide');
                        $('#importProgress').addClass('d-none');
                        $('#progressBar').css('width', '0%').text('0%');
                        $('#startImportBtn').prop('disabled', false);
                        fileInput.value = '';
                        
                        // Reload table
                        alert('Đã nhập ' + total + ' thuốc thành công!');
                    }, 2000);
                }
            }, 200);
            
        } catch (error) {
            $('#importStatus').removeClass('alert-info').addClass('alert-danger')
                .html(`<i class="fas fa-exclamation-circle me-2"></i>Lỗi: ${error.message}`);
            $('#startImportBtn').prop('disabled', false);
        }
    };
    
    reader.readAsArrayBuffer(file);
}
