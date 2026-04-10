// Reports Page JavaScript

// Declare table at module scope to avoid temporal dead zone
let table;

$(document).ready(function() {
    // Sample report data
    const sampleReports = [
        {
            date: '08/04/2026',
            name: 'Nguyễn Văn A',
            gender: 'Nam',
            birth_year: '1985',
            diagnosis: 'Viêm họng cấp',
            treatment: 'Amoxicillin 500mg x 3 ngày, Paracetamol khi sốt',
            id: 1
        },
        {
            date: '08/04/2026',
            name: 'Trần Thị B',
            gender: 'Nữ',
            birth_year: '1990',
            diagnosis: 'Đau đầu, chóng mặt',
            treatment: 'Paracetamol 500mg, Vitamin B1, Nghỉ ngơi',
            id: 2
        },
        {
            date: '07/04/2026',
            name: 'Lê Văn C',
            gender: 'Nam',
            birth_year: '1978',
            diagnosis: 'Tăng huyết áp',
            treatment: 'Amlodipine 5mg, Losartan 50mg, Theo dõi huyết áp',
            id: 3
        },
        {
            date: '07/04/2026',
            name: 'Phạm Thị D',
            gender: 'Nữ',
            birth_year: '1995',
            diagnosis: 'Viêm dạ dày',
            treatment: 'Omeprazole 20mg, Ăn uống điều độ',
            id: 4
        },
        {
            date: '06/04/2026',
            name: 'Hoàng Văn E',
            gender: 'Nam',
            birth_year: '1988',
            diagnosis: 'Cảm cúm',
            treatment: 'Paracetamol, Vitamin C, Nghỉ ngơi',
            id: 5
        }
    ];

    // Update statistics
    $('#totalVisits').text(sampleReports.length);
    $('#totalRevenue').text('15,000,000đ');
    $('#totalPrescriptions').text(sampleReports.length);
    $('#newPatients').text('2');

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
        if (table) table.draw();
    });

    $('#dateRangePicker').on('cancel.daterangepicker', function(ev, picker) {
        $(this).val('');
        if (table) table.draw();
    });

    // Initialize DataTable
    table = $('#reportTable').DataTable({
        data: sampleReports,
        columns: [
            { data: 'date' },
            { data: 'name' },
            { data: 'gender' },
            { data: 'birth_year' },
            { data: 'diagnosis' },
            { 
                data: 'treatment',
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
                            <button class="btn btn-sm btn-light-primary" onclick="viewReport(${row.id})" title="Xem">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-light-info" onclick="printReport(${row.id})" title="In">
                                <i class="fas fa-print"></i>
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
        let text = 'Ngày\tHọ & Tên\tGiới\tNăm sinh\tChẩn đoán\tĐiều trị\n';
        data.forEach(row => {
            text += `${row.date}\t${row.name}\t${row.gender}\t${row.birth_year}\t${row.diagnosis}\t${row.treatment}\n`;
        });
        navigator.clipboard.writeText(text);
        alert('Đã sao chép dữ liệu!');
    });

    $('#btnPrint').on('click', function() {
        window.print();
    });

    // Initialize Charts
    initVisitsChart();
    initDiagnosisChart();
});

// Initialize Visits Chart
function initVisitsChart() {
    const ctx = document.getElementById('visitsChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Th 1', 'Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'Th 8', 'Th 9', 'Th 10', 'Th 11', 'Th 12'],
            datasets: [{
                label: 'Lượt khám',
                data: [45, 52, 48, 65, 70, 68, 75, 80, 72, 78, 85, 90],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Initialize Diagnosis Chart
function initDiagnosisChart() {
    const ctx = document.getElementById('diagnosisChart');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Viêm họng', 'Cảm cúm', 'Tăng huyết áp', 'Đau đầu', 'Viêm dạ dày', 'Tiểu đường', 'Viêm phế quản', 'Dị ứng', 'Đau lưng', 'Khác'],
            datasets: [{
                label: 'Số lượt',
                data: [25, 20, 18, 15, 12, 10, 8, 7, 5, 10],
                backgroundColor: [
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(14, 165, 233, 0.8)',
                    'rgba(34, 197, 94, 0.8)',
                    'rgba(251, 146, 60, 0.8)',
                    'rgba(156, 163, 175, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Global functions
function viewReport(id) {
    alert('Xem chi tiết báo cáo #' + id);
}

function printReport(id) {
    alert('In báo cáo #' + id);
}
