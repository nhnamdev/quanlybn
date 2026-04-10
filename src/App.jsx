import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import DrugsPage from "./pages/DrugsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import ReportsPage from "./pages/ReportsPage";

function PlaceholderPage({ title }) {
    return (
        <div className="card">
            <div className="card-body p-10">
                <h2 className="fw-bolder mb-3">{title}</h2>
                <p className="text-muted mb-0">Chuc nang dang duoc hoan thien theo layout React moi.</p>
            </div>
        </div>
    );
}

function App() {
    return (
        <AppLayout>
            <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patient/" element={<PatientsPage />} />

                <Route path="/drugs" element={<DrugsPage />} />
                <Route path="/drugs/" element={<DrugsPage />} />

                <Route path="/prescriptions" element={<PrescriptionsPage />} />
                <Route path="/rx/" element={<PrescriptionsPage />} />

                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/report/" element={<ReportsPage />} />

                <Route path="/event/" element={<PlaceholderPage title="Lich hen" />} />
                <Route path="/working-schedule/" element={<PlaceholderPage title="Lich lam viec" />} />

                <Route path="/laboratory/" element={<PlaceholderPage title="Hoa sinh" />} />
                <Route path="/radiology/" element={<PlaceholderPage title="Chan doan hinh anh" />} />
                <Route path="/eus/" element={<PlaceholderPage title="Tham do chuc nang" />} />
                <Route path="/procedure/" element={<PlaceholderPage title="Thu thuat" />} />

                <Route path="/list-of-technical/" element={<PlaceholderPage title="Danh muc ky thuat BYT" />} />
                <Route path="/chatbot/" element={<PlaceholderPage title="Chatbot Ho Tro" />} />
                <Route path="/checkxray/" element={<PlaceholderPage title="Goi y chan doan XQuang Nguc" />} />
                <Route path="/checkhi/" element={<PlaceholderPage title="Thong tin BHYT" />} />
                <Route path="/drug-interactions/" element={<PlaceholderPage title="Tra cuu tuong tac thuoc" />} />
                <Route path="/paraclinical/" element={<PlaceholderPage title="Danh muc ky thuat" />} />

                <Route path="/tutorial/" element={<PlaceholderPage title="Huong dan su dung" />} />
                <Route path="/account/settings" element={<PlaceholderPage title="Cai dat tai khoan" />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AppLayout>
    );
}

export default App;