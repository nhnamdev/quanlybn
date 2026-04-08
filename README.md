# Hệ thống Quản lý Bệnh nhân

Hệ thống quản lý bệnh nhân đơn giản được xây dựng với HTML, CSS, JavaScript và Bootstrap 5.

## Tính năng

- 📊 **Dashboard** - Trang chủ với thống kê tổng quan
- 👥 **Quản lý Bệnh nhân** - Thêm, sửa, xóa thông tin bệnh nhân
- 💊 **Đơn thuốc** - Quản lý đơn thuốc với date range picker
- 🏥 **Tủ thuốc** - Quản lý kho thuốc, nhập/xuất Excel
- 📈 **Báo cáo** - Báo cáo khám bệnh với biểu đồ thống kê

## Công nghệ sử dụng

- HTML5
- CSS3
- JavaScript (jQuery)
- Bootstrap 5
- DataTables
- Chart.js
- Font Awesome
- Date Range Picker
- SheetJS (xlsx)

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/nhnamdev/quanlybn.git
cd quanlybn
```

2. Mở file `index.html` trong trình duyệt

Không cần cài đặt thêm, tất cả dependencies được load từ CDN.

## Cấu trúc thư mục

```
quanlybn/
├── index.html              # Trang chủ
├── patients.html           # Danh sách bệnh nhân
├── prescriptions.html      # Đơn thuốc
├── drugs.html              # Tủ thuốc
├── reports.html            # Báo cáo
├── style.css               # CSS chung
├── script.js               # JavaScript chung
├── patients.js             # Logic bệnh nhân
├── prescriptions.js        # Logic đơn thuốc
├── drugs.js                # Logic tủ thuốc
├── reports.js              # Logic báo cáo
└── README.md
```

## Sử dụng

1. Mở `index.html` để xem trang chủ
2. Sử dụng menu sidebar để điều hướng giữa các trang
3. Dữ liệu mẫu đã được tích hợp sẵn để demo

## Tính năng chi tiết

### Quản lý Bệnh nhân
- Thêm bệnh nhân mới với form đầy đủ
- Tìm kiếm và lọc bệnh nhân
- Xuất danh sách ra Excel/PDF
- Các thao tác: Xem, Sửa, Xóa

### Đơn thuốc
- Tạo đơn thuốc mới
- Thêm nhiều thuốc vào đơn
- Lọc theo khoảng thời gian
- In và xuất đơn thuốc

### Tủ thuốc
- Quản lý kho thuốc
- Nhập thuốc từ Excel
- Xuất danh sách thuốc
- Cảnh báo thuốc sắp hết
- Điều chỉnh số lượng

### Báo cáo
- Thống kê tổng quan
- Biểu đồ lượt khám theo tháng
- Top 10 chẩn đoán phổ biến
- Xuất báo cáo Excel/PDF

## Phát triển tiếp

Để phát triển thành hệ thống hoàn chỉnh, cần:

1. Backend API (Node.js, PHP, Python, etc.)
2. Database (MySQL, PostgreSQL, MongoDB)
3. Authentication & Authorization
4. Real-time updates
5. Mobile responsive optimization

## License

MIT License

## Liên hệ

- GitHub: [@nhnamdev](https://github.com/nhnamdev)
