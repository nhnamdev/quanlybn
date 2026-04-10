// Example of how to use Supabase hooks and queries in components

// ============= Example 1: Using usePatients Hook =============
/*
import { usePatients } from '../hooks/usePatients';

function PatientsExample() {
    const {
        patients,
        loading,
        error,
        searchPatients,
        addPatient,
        updatePatient,
        deletePatient
    } = usePatients();

    const handleSearch = (query) => {
        searchPatients(query);
    };

    const handleAddPatient = async () => {
        try {
            await addPatient({
                id: 'BN005',
                name: 'Bệnh nhân mới',
                dob: '1990-01-01',
                gender: 'M',
                phone_number: '0123456789',
                address: 'TP.HCM',
                bloodType: 'O+',
                identity_number: '123456789'
            });
        } catch (err) {
            console.error('Failed to add patient:', err);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div>
            <input
                type="text"
                placeholder="Tìm bệnh nhân..."
                onChange={(e) => handleSearch(e.target.value)}
            />
            <button onClick={handleAddPatient}>Thêm bệnh nhân</button>
            <table>
                <tbody>
                    {patients.map(patient => (
                        <tr key={patient.id}>
                            <td>{patient.name}</td>
                            <td>{patient.phone_number}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
*/

// ============= Example 2: Using usePrescriptions Hook =============
/*
import { usePrescriptions } from '../hooks/usePrescriptions';

function PrescriptionsExample({ patientId }) {
    const {
        prescriptions,
        loading,
        error,
        createPrescription,
        getPrescriptionsByDateRange
    } = usePrescriptions(patientId);

    const handleCreatePrescription = async () => {
        try {
            const items = [
                {
                    medicine_name: 'Paracetamol 500mg',
                    usage: 'Uống',
                    dose: '1 viên',
                    days: 3
                }
            ];
            
            await createPrescription({
                id: 'KB001-3',
                patient_id: patientId,
                prescription_date: new Date().toISOString().split('T')[0],
                diagnosis: 'Cảm cúm',
                doctor_name: 'BS. Nguyễn A',
                notes: 'Nghỉ ngơi'
            }, items);
        } catch (err) {
            console.error('Failed to create prescription:', err);
        }
    };

    const handleDateFilter = async (startDate, endDate) => {
        await getPrescriptionsByDateRange(startDate, endDate);
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div>Lỗi: {error}</div>;

    return (
        <div>
            <button onClick={handleCreatePrescription}>Tạo đơn thuốc mới</button>
            <button onClick={() => handleDateFilter('2024-01-01', '2024-12-31')}>
                Lọc theo năm 2024
            </button>
            <ul>
                {prescriptions.map(rx => (
                    <li key={rx.id}>
                        {rx.diagnosis} - {rx.prescription_date}
                    </li>
                ))}
            </ul>
        </div>
    );
}
*/

// ============= Example 3: Direct Queries Usage =============
/*
import { patientsQueries, prescriptionsQueries } from '../lib/supabaseQueries';

async function fetchAndDisplay() {
    try {
        // Get all patients
        const patients = await patientsQueries.getAll();
        console.log('Patients:', patients);

        // Search patients
        const results = await patientsQueries.search('Nguyễn');
        console.log('Search results:', results);

        // Get prescription by ID
        const prescription = await prescriptionsQueries.getById('KB001-1');
        console.log('Prescription:', prescription);

        // Get prescriptions by date range
        const rxByDate = await prescriptionsQueries.getByDateRange(
            '2024-01-01',
            '2024-12-31'
        );
        console.log('Prescriptions by date:', rxByDate);
    } catch (err) {
        console.error('Error:', err);
    }
}
*/

// ============= Example 4: Using useDrugs Hook =============
/*
import { useDrugs } from '../hooks/useDrugs';

function DrugsExample() {
    const { drugs, loading, error, searchDrugs, getLowStockDrugs } = useDrugs();

    const handleCheckLowStock = async () => {
        const lowStock = await getLowStockDrugs(100); // Ngưỡng dưới 100
        console.log('Low stock drugs:', lowStock);
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div>
            <button onClick={handleCheckLowStock}>Kiểm tra hết hàng</button>
            <select onChange={(e) => searchDrugs(e.target.value)}>
                <option value="">Chọn thuốc</option>
                {drugs.map(drug => (
                    <option key={drug.id} value={drug.drug_name}>
                        {drug.drug_name} - {drug.concentration}
                    </option>
                ))}
            </select>
        </div>
    );
}
*/
