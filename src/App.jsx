import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import DrugsPage from "./pages/DrugsPage";
import PrescriptionsPage from "./pages/PrescriptionsPage";
import ReportsPage from "./pages/ReportsPage";

function PlaceholderPage({ title }) {
    return ( <
        div className = "card" >
        <
        div className = "card-body p-10" >
        <
        h2 className = "fw-bolder mb-3" > { title } < /h2> <
        p className = "text-muted mb-0" > Chức năng đang được hoàn thiện theo layout React mới. < /p> <
        /div> <
        /div>
    );
}

function App() {
    return ( <
        AppLayout >
        <
        Routes >
        <
        Route path = "/"
        element = { < DashboardPage / > }
        /> <
        Route path = "/patients"
        element = { < PatientsPage / > }
        /> <
        Route path = "/patient/"
        element = { < PatientsPage / > }
        /> <
        Route path = "/drugs"
        element = { < DrugsPage / > }
        /> <
        Route path = "/drugs/"
        element = { < DrugsPage / > }
        /> <
        Route path = "/prescriptions"
        element = { < PrescriptionsPage / > }
        /> <
        Route path = "/rx/"
        element = { < PrescriptionsPage / > }
        /> <
        Route path = "/reports"
        element = { < ReportsPage / > }
        /> <
        Route path = "/report/"
        element = { < ReportsPage / > }
        /> <
        Route path = "/event/"
        element = { < PlaceholderPage title = "Lịch hẹn" / > }
        /> <
        Route path = "/working-schedule/"
        element = { < PlaceholderPage title = "Lịch làm việc" / > }
        /> <
        Route path = "/laboratory/"
        element = { < PlaceholderPage title = "Hóa sinh" / > }
        /> <
        Route path = "/radiology/"
        element = { < PlaceholderPage title = "Chẩn đoán hình ảnh" / > }
        /> <
        Route path = "/eus/"
        element = { < PlaceholderPage title = "Thăm dò chức năng" / > }
        /> <
        Route path = "/procedure/"
        element = { < PlaceholderPage title = "Thủ thuật" / > }
        /> <
        Route path = "/list-of-technical/"
        element = { < PlaceholderPage title = "Danh mục kỹ thuật BYT" / > }
        /> <
        Route path = "/chatbot/"
        element = { < PlaceholderPage title = "Chatbot Hỗ Trợ" / > }
        /> <
        Route path = "/checkxray/"
        element = { < PlaceholderPage title = "Gợi ý chẩn đoán XQuang Ngực" / > }
        /> <
        Route path = "/checkhi/"
        element = { < PlaceholderPage title = "Thông tin BHYT" / > }
        /> <
        Route path = "/drug-interactions/"
        element = { < PlaceholderPage title = "Tra cứu tương tác thuốc" / > }
        /> <
        Route path = "/paraclinical/"
        element = { < PlaceholderPage title = "Danh mục kỹ thuật" / > }
        /> <
        Route path = "/tutorial/"
        element = { < PlaceholderPage title = "Hướng dẫn sử dụng" / > }
        /> <
        Route path = "/account/settings"
        element = { < PlaceholderPage title = "Cài đặt tài khoản" / > }
        /> <
        Route path = "*"
        element = { < Navigate to = "/"
            replace / > }
        /> <
        /Routes> <
        /AppLayout>
    );
}

export default App;