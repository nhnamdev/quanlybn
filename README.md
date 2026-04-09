# Hệ thống Quản lý Bệnh nhân (React)

Phiên bản hiện tại đã được chuyển sang React + Vite và tách cấu trúc giao diện thành các component.

## Tính năng

- 📊 **Dashboard** - Trang chủ với thống kê tổng quan
- 👥 **Quản lý Bệnh nhân** - Thêm, sửa, xóa thông tin bệnh nhân
- 💊 **Đơn thuốc** - Quản lý đơn thuốc với date range picker
- 🏥 **Tủ thuốc** - Quản lý kho thuốc, nhập/xuất Excel
- 📈 **Báo cáo** - Báo cáo khám bệnh với biểu đồ thống kê

## Công nghệ sử dụng

- React 18
- React Router DOM
- Vite
- CSS3
- Bootstrap 5
- Chart.js
- Font Awesome

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/nhnamdev/quanlybn.git
cd quanlybn
```

2. Cài dependencies:
```bash
npm install
```

3. Chạy dev server:
```bash
npm run dev
```

4. Build production:
```bash
npm run build
```

## Cấu trúc thư mục

```
quanlybn/
├── index.html              # Vite entry (mount React)
├── src/
│   ├── App.jsx             # Router chính
│   ├── main.jsx            # React bootstrap
│   ├── components/
│   │   ├── layout/         # Layout tổng (header/footer)
│   │   ├── sidebar/        # Sidebar component
│   │   ├── header/         # Header component
│   │   └── dashboard/      # Dashboard widgets/charts
│   └── pages/              # Các trang theo route
├── style.css               # CSS chung
├── script.js               # Legacy script cũ (có thể bỏ sau)
├── patients.js             # Legacy logic cũ
├── prescriptions.js        # Legacy logic cũ
├── drugs.js                # Legacy logic cũ
├── reports.js              # Legacy logic cũ
├── package.json            # Scripts/dependencies React
├── vite.config.js          # Vite config
└── README.md
```

## Sử dụng

1. Chạy `npm run dev`
2. Mở địa chỉ local do Vite cung cấp
3. Điều hướng bằng sidebar qua các route React

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
