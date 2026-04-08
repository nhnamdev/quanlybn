// Patients Page JavaScript

$(document).ready(function() {
    // Generate year options for birth year select
    const currentYear = new Date().getFullYear();
    const dobSelect = $('#id_dob');
    for (let year = currentYear; year >= 1920; year--) {
        dobSelect.append(`<option value="${year}">${year}</option>`);
    }
    dobSelect.val(2000);

    // Sample patient data
    const samplePatients = [
        {
            id: 1,
            name: 'Nguyễn Văn A',
            gender: 'Nam',
            birth_year: 1985,
            address: 'Quận 1, TP.HCM',
            phone: '0909123456',
            medical_history: 'Tăng huyết áp'
        },
        {
            id: 2,
            name: 'Trần Thị B',
            gender: 'Nữ',
            birth_year: 1990,
            address: 'Quận Tân Bình, TP.HCM',
            phone: '0912345678',
            medical_history: 'Tiểu đường'
        },
        {
            id: 3,
            name: 'Lê Văn C',
            gender: 'Nam',
            birth_year: 1978,
            address: 'Quận 3, TP.HCM',
            phone: '0987654321',
            medical_history: 'Không'
        }
    ];

    // Initialize DataTable
    const table = $('#patientTable').DataTable({
        data: samplePatients,
        columns: [
            { data: 'id' },
            { data: 'name' },
            { data: 'gender' },
            { data: 'birth_year' },
            { data: 'address' },
            { data: 'phone' },
            { data: 'medical_history' },
            {
                data: null,
                orderable: false,
                className: 'text-end',
                render: function(data, type, row) {
                    return `
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-sm btn-light-primary" onclick="viewPatient(${row.id})" title="Xem">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-light-warning" onclick="editPatient(${row.id})" title="Sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-light-success" onclick="createQueue(${row.id})" title="Tạo số thứ tự">
                                <i class="fas fa-list-ol"></i>
                            </button>
                            <button class="btn btn-sm btn-light-danger" onclick="deletePatient(${row.id})" title="Xóa">
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
        }
    });

    // Handle form submission
    $('#addPatientForm').on('submit', function(e) {
        e.preventDefault();
        savePatient();
    });
});

// Global functions
function savePatient() {
    const form = document.getElementById('addPatientForm');
    if (form.checkValidity()) {
        // Show loading state
        const submitBtn = document.getElementById('submitbutton');
        submitBtn.querySelector('.indicator-label').classList.add('d-none');
        submitBtn.querySelector('.indicator-progress').classList.remove('d-none');
        
        // Simulate API call
        setTimeout(() => {
            alert('Đã thêm bệnh nhân thành công!');
            $('#addPatientModal').modal('hide');
            form.reset();
            
            // Reset button state
            submitBtn.querySelector('.indicator-label').classList.remove('d-none');
            submitBtn.querySelector('.indicator-progress').classList.add('d-none');
        }, 1000);
    } else {
        form.reportValidity();
    }
}

function viewPatient(id) {
    alert('Xem thông tin bệnh nhân #' + id);
}

function editPatient(id) {
    alert('Sửa thông tin bệnh nhân #' + id);
}

function createQueue(id) {
    if (confirm('Tạo số thứ tự khám cho bệnh nhân này?')) {
        alert('Đã tạo số thứ tự khám!');
    }
}

function deletePatient(id) {
    if (confirm('Bạn có chắc muốn xóa bệnh nhân này?')) {
        alert('Đã xóa bệnh nhân #' + id);
    }
}

function updatePatient() {
    const form = document.getElementById('editPatientForm');
    if (form.checkValidity()) {
        alert('Đã cập nhật thông tin bệnh nhân!');
        $('#editPatientModal').modal('hide');
    } else {
        form.reportValidity();
    }
}
