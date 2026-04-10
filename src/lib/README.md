# Hướng Dẫn Sử Dụng Supabase Utility

## Cài đặt
Package `@supabase/supabase-js` đã được cài đặt trong `package.json`.

## Cấu hình

### 1. Environment Variables
File `.env.local` đã được tạo với các biến:
```
VITE_SUPABASE_URL=https://jbowxpffvkoykhjgieop.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_j_oEIq8bP-s7NrHeMLfXiw_MTfCliLB
```

## Cấu trúc File

```
src/
├── lib/
│   ├── supabaseClient.js       # Khởi tạo Supabase client
│   └── supabaseQueries.js      # Các helper functions cho database
├── hooks/
│   ├── usePatients.js          # Hook quản lý bệnh nhân
│   ├── usePrescriptions.js     # Hook quản lý đơn thuốc
│   └── useDrugs.js             # Hook quản lý thuốc
└── EXAMPLES.md                 # Ví dụ sử dụng
```

## API Reference

### 1. usePatients Hook

```javascript
import { usePatients } from '@/hooks/usePatients';

function MyComponent() {
    const {
        patients,           // Danh sách bệnh nhân
        loading,            // Đang tải?
        error,              // Lỗi nếu có
        fetchPatients,      // Làm mới danh sách
        searchPatients,     // Tìm kiếm
        addPatient,         // Thêm bệnh nhân
        updatePatient,      // Cập nhật
        deletePatient       // Xóa
    } = usePatients();
}
```

#### Ví dụ: Thêm bệnh nhân
```javascript
await addPatient({
    id: 'BN005',
    name: 'Nguyễn Văn D',
    dob: '1990-01-15',                    // YYYY-MM-DD
    gender: 'M',                           // 'M' hoặc 'F'
    phone_number: '0123456789',
    address: 'TP.HCM',
    bloodType: 'O+',
    identity_number: '123456789'
});
```

#### Ví dụ: Tìm kiếm
```javascript
await searchPatients('Nguyễn');      // Tìm theo tên hoặc SĐT
```

### 2. usePrescriptions Hook

```javascript
import { usePrescriptions } from '@/hooks/usePrescriptions';

function MyComponent() {
    const {
        prescriptions,                   // Danh sách đơn thuốc
        loading,
        error,
        fetchPrescriptions,
        getPrescription,                 // Chi tiết 1 đơn
        getPrescriptionsByDateRange,     // Lọc theo ngày
        createPrescription,              // Tạo mới
        updatePrescription,              // Cập nhật
        deletePrescription               // Xóa
    } = usePrescriptions(patientId);   // Optional: patientId để lọc
}
```

#### Ví dụ: Tạo đơn thuốc
```javascript
await createPrescription({
    id: 'KB001-3',
    patient_id: 'BN001',
    prescription_date: '2024-04-09',
    diagnosis: 'Viêm họng',
    doctor_name: 'BS. Nguyễn A',
    notes: 'Uống hết thuốc'
}, [
    {
        medicine_name: 'Paracetamol 500mg',
        usage: 'Uống',
        dose: '2 viên',
        days: 3
    }
]);
```

#### Ví dụ: Lọc theo ngày
```javascript
await getPrescriptionsByDateRange('2024-01-01', '2024-12-31');
```

### 3. useDrugs Hook

```javascript
import { useDrugs } from '@/hooks/useDrugs';

function MyComponent() {
    const {
        drugs,              // Danh sách thuốc
        loading,
        error,
        fetchDrugs,
        searchDrugs,        // Tìm kiếm
        getLowStockDrugs    // Thuốc gần hết
    } = useDrugs();
}
```

#### Ví dụ: Kiểm tra hết hàng
```javascript
const lowStock = await getLowStockDrugs(100);  // Dưới 100 viên
```

### 4. Direct Query Usage

Dùng trực tiếp từ `supabaseQueries.js` khi không cần hook:

```javascript
import {
    patientsQueries,
    prescriptionsQueries,
    drugsQueries,
    medicinesQueries
} from '@/lib/supabaseQueries';

// Get all patients
const patients = await patientsQueries.getAll();

// Get patient by ID
const patient = await patientsQueries.getById('BN001');

// Search
const results = await patientsQueries.search('Nguyễn');

// Get prescriptions by date
const rx = await prescriptionsQueries.getByDateRange(
    '2024-01-01',
    '2024-12-31'
);

// Get medicines for a disease
const meds = await medicinesQueries.getByDisease('Viêm họng');
```

## Bảng Dữ Liệu

### patients
```
id, name, dob, gender, phone, address, bloodType, insurance, 
phone_number, identity_number, createdAt, updated_at
```

### prescriptions
```
id, patient_id, prescription_date, diagnosis, doctor_name, notes,
created_at, updated_at
```

### prescription_items
```
id, prescription_id, drug_id, medicine_name, usage, dose, days, created_at
```

### drugs
```
id, registration_number, drug_name, active_ingredient, concentration,
route, quantity, unit, notes, created_at, updated_at
```

### medicines (tham khảo)
```
id, name, disease, usage, dose, days, createdAt
```

## Xử Lý Lỗi

```javascript
try {
    const patients = await usePatients();
} catch (error) {
    console.error('Error:', error.message);
    // Hiển thị thông báo lỗi cho user
}
```

## Best Practices

1. **Luôn sử dụng hooks trong components React** để tự động manage loading/error state
2. **Dùng direct queries** chỉ khi không cần reactive data
3. **Xử lý lỗi** bằng try-catch hoặc kiểm tra error state từ hook
4. **Validate data** trước khi submit lên database
5. **Giữ an toàn credentials** - không bao giờ commit `API_KEY` vào git

## Kiểm Tra Kết Nối

```javascript
import { testConnection } from '@/lib/supabaseClient';

// Gọi trong useEffect của App component
useEffect(() => {
    testConnection();
}, []);
```

## Cần Giúp?

- Xem file `EXAMPLES.md` để các ví dụ cụ thể
- Kiểm tra console.log trong browser dev tools
- Xem Supabase Dashboard: https://app.supabase.com
