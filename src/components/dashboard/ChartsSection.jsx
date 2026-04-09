import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip,
    ArcElement
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const barData = {
    labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"],
    datasets: [{
            label: "Lượt khám",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "#22c55e",
            borderColor: "#16a34a",
            borderWidth: 1,
            borderRadius: 6
        },
        {
            label: "Bệnh nhân",
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            backgroundColor: "#3b82f6",
            borderColor: "#2563eb",
            borderWidth: 1,
            borderRadius: 6
        }
    ]
};

const doughnutData = {
    labels: ["Chưa có dữ liệu"],
    datasets: [{
        data: [1],
        backgroundColor: ["#e5e7eb"],
        borderColor: "#ffffff",
        borderWidth: 2
    }]
};

const commonOptions = {
    responsive: true,
    maintainAspectRatio: false
};

function ChartsSection() {
    return ( <
        div className = "row g-5 g-lg-10" >
        <
        div className = "col-xl-6 mb-5 mb-xl-10" >
        <
        div className = "card h-xl-100" >
        <
        div className = "card-header border-0 pt-5" >
        <
        h3 className = "card-title align-items-start flex-column" >
        <
        span className = "card-label fw-bolder fs-3 mb-1" > Thống kê < /span> <
        span className = "text-muted mt-1 fw-bold fs-7" > Thống kê bệnh nhân và lượt khám trong năm < /span> <
        /h3> <
        /div> <
        div className = "card-body py-3" >
        <
        div className = "chart" > < Bar data = { barData }
        options = { commonOptions }
        /></div >
        <
        /div> <
        /div> <
        /div>

        <
        div className = "col-xl-6 mb-5 mb-xl-10" >
        <
        div className = "card h-xl-100" >
        <
        div className = "card-header border-0 pt-5" >
        <
        h3 className = "card-title align-items-start flex-column" >
        <
        span className = "card-label fw-bolder fs-3 mb-1" > Thống kê ICD < /span> <
        span className = "text-muted mt-1 fw-bold fs-7" > Thống kê các bệnh đã khám < /span> <
        /h3> <
        /div> <
        div className = "card-body py-3" >
        <
        div className = "chart" > < Doughnut data = { doughnutData }
        options = { commonOptions }
        /></div >
        <
        /div> <
        /div> <
        /div> <
        /div>
    );
}

export default ChartsSection;