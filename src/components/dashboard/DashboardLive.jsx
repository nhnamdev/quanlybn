import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Tooltip
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { useDrugs, usePatients, usePrescriptions } from "../../hooks";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

const MONTH_LABELS = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
const LOW_STOCK_THRESHOLD = 100;

const numberFormatter = new Intl.NumberFormat("vi-VN");

function parseDate(value) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function DashboardLive() {
    const { patients, loading: patientsLoading, error: patientsError } = usePatients();
    const { prescriptions, loading: prescriptionsLoading, error: prescriptionsError } = usePrescriptions();
    const { drugs, loading: drugsLoading, error: drugsError } = useDrugs();

    const now = useMemo(() => new Date(), []);
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const todayKey = now.toISOString().slice(0, 10);

    const stats = useMemo(() => {
        const visitsThisMonth = prescriptions.filter((item) => {
            const date = parseDate(item.prescription_date);
            return date && date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        }).length;

        const prescriptionsThisMonth = visitsThisMonth;

        const patientsThisMonth = patients.filter((item) => {
            const date = parseDate(item.createdAt || item.created_at);
            return date && date.getFullYear() === currentYear && date.getMonth() === currentMonth;
        }).length;

        const patientsPerMonth = Array(12).fill(0);
        patients.forEach((item) => {
            const date = parseDate(item.createdAt || item.created_at);
            if (!date || date.getFullYear() !== currentYear) return;
            patientsPerMonth[date.getMonth()] += 1;
        });

        const visitsPerMonth = Array(12).fill(0);
        prescriptions.forEach((item) => {
            const date = parseDate(item.prescription_date);
            if (!date || date.getFullYear() !== currentYear) return;
            visitsPerMonth[date.getMonth()] += 1;
        });

        const diagnosisCounter = new Map();
        prescriptions.forEach((item) => {
            const diagnosis = String(item.diagnosis || "").trim();
            if (!diagnosis) return;
            diagnosisCounter.set(diagnosis, (diagnosisCounter.get(diagnosis) || 0) + 1);
        });

        const topDiagnoses = [...diagnosisCounter.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);

        const lowStockDrugs = drugs.filter((item) => Number(item.quantity || 0) < LOW_STOCK_THRESHOLD).length;
        const appointmentsToday = prescriptions.filter((item) => String(item.prescription_date || "") === todayKey).length;

        return {
            totalPatients: patients.length,
            patientsThisMonth,
            totalVisits: prescriptions.length,
            visitsThisMonth,
            prescriptionsThisMonth,
            patientsPerMonth,
            visitsPerMonth,
            topDiagnoses,
            lowStockDrugs,
            totalDrugs: drugs.length,
            appointmentsToday
        };
    }, [patients, prescriptions, drugs, currentYear, currentMonth, todayKey]);

    const barData = useMemo(() => ({
        labels: MONTH_LABELS,
        datasets: [
            {
                label: "Lượt khám",
                data: stats.visitsPerMonth,
                backgroundColor: "#22c55e",
                borderColor: "#16a34a",
                borderWidth: 1,
                borderRadius: 6
            },
            {
                label: "Bệnh nhân mới",
                data: stats.patientsPerMonth,
                backgroundColor: "#3b82f6",
                borderColor: "#2563eb",
                borderWidth: 1,
                borderRadius: 6
            }
        ]
    }), [stats.patientsPerMonth, stats.visitsPerMonth]);

    const doughnutData = useMemo(() => {
        if (!stats.topDiagnoses.length) {
            return {
                labels: ["Chưa có dữ liệu"],
                datasets: [
                    {
                        data: [1],
                        backgroundColor: ["#e5e7eb"],
                        borderColor: "#ffffff",
                        borderWidth: 2
                    }
                ]
            };
        }

        return {
            labels: stats.topDiagnoses.map(([name]) => name),
            datasets: [
                {
                    data: stats.topDiagnoses.map(([, count]) => count),
                    backgroundColor: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#8b5cf6"],
                    borderColor: "#ffffff",
                    borderWidth: 2
                }
            ]
        };
    }, [stats.topDiagnoses]);

    const isLoading = patientsLoading || prescriptionsLoading || drugsLoading;
    const dataError = patientsError || prescriptionsError || drugsError;

    return (
        <div className="row g-5 g-lg-10">
            {isLoading && <div className="col-12 alert alert-info">Đang tải dữ liệu dashboard...</div>}
            {dataError && <div className="col-12 alert alert-danger">Lỗi tải dashboard: {dataError}</div>}

            <div className="col-xl-4 mb-xl-10">
                <div className="card h-md-100">
                    <div className="card-body p-0">
                        <div className="px-9 pt-7 pb-12 card-rounded h-225px w-100 bg-primary">
                            <h3 className="m-0 text-white fw-bolder fs-3">Thống kê</h3>
                            <div className="d-flex flex-column text-white pt-6 align-items-start">
                                <span className="fw-bold fs-7">Tổng số bệnh nhân</span>
                                <span className="fw-bolder fs-2x pt-1">{numberFormatter.format(stats.totalPatients)}</span>
                            </div>
                        </div>

                        <div className="bg-body shadow-sm card-rounded mx-9 mb-9 px-6 py-9 position-relative z-index-1" style={{ marginTop: "-36px" }}>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bolder">Bệnh nhân mới (tháng này)</span>
                                <span className="fw-bold text-primary">{numberFormatter.format(stats.patientsThisMonth)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bolder">Tổng lượt khám</span>
                                <span className="fw-bold text-success">{numberFormatter.format(stats.totalVisits)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="fw-bolder">Lượt khám (tháng này)</span>
                                <span className="fw-bold text-success">{numberFormatter.format(stats.visitsThisMonth)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span className="fw-bolder">Đơn thuốc (tháng này)</span>
                                <span className="fw-bold text-info">{numberFormatter.format(stats.prescriptionsThisMonth)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-8">
                <div className="row g-5 g-lg-10">
                    <div className="col-lg-4">
                        <Link to="/drugs" className="card bg-danger h-150px text-decoration-none">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <span className="text-white fs-2"><i className="fas fa-pills" /></span>
                                <div className="d-flex flex-column">
                                    <div className="text-white fw-bolder fs-1 mb-0 mt-3">{numberFormatter.format(stats.lowStockDrugs)}</div>
                                    <div className="text-white fw-bold fs-6">Thuốc sắp hết</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="col-lg-4">
                        <Link to="/drugs" className="card bg-body h-150px text-decoration-none">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <span className="text-primary fs-2"><i className="fas fa-capsules" /></span>
                                <div className="d-flex flex-column">
                                    <div className="text-gray-900 fw-bolder fs-1 mb-0 mt-3">{numberFormatter.format(stats.totalDrugs)}</div>
                                    <div className="text-gray-500 fw-bold fs-6">Thuốc trong tủ</div>
                                </div>
                            </div>
                        </Link>
                    </div>

                    <div className="col-lg-4">
                        <Link to="/reports" className="card bg-body h-150px text-decoration-none">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <span className="text-success fs-2"><i className="fas fa-calendar-day" /></span>
                                <div className="d-flex flex-column">
                                    <div className="text-gray-900 fw-bolder fs-1 mb-0 mt-3">{numberFormatter.format(stats.appointmentsToday)}</div>
                                    <div className="text-gray-500 fw-bold fs-6">Lịch hẹn hôm nay</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                <div className="card h-175px bgi-no-repeat bgi-size-contain bg-primary h-200px mt-5">
                    <div className="card-body d-flex flex-column justify-content-between">
                        <h2 className="text-white fw-bolder mb-5">
                            <span className="lh-lg">Phần thống kê này được thống kê và cập nhật tự động.</span>
                        </h2>
                        <div className="m-0">
                            <Link to="/reports" className="btn btn-danger fw-bold px-6 py-3">Xem báo cáo khám bệnh</Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-6 mb-5 mb-xl-10">
                <div className="card h-xl-100">
                    <div className="card-header border-0 pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bolder fs-3 mb-1">Thống kê theo tháng</span>
                            <span className="text-muted mt-1 fw-bold fs-7">Lượt khám và bệnh nhân mới trong năm {currentYear}</span>
                        </h3>
                    </div>
                    <div className="card-body py-3">
                        <div className="chart">
                            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-xl-6 mb-5 mb-xl-10">
                <div className="card h-xl-100">
                    <div className="card-header border-0 pt-5">
                        <h3 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bolder fs-3 mb-1">Thống kê chẩn đoán</span>
                            <span className="text-muted mt-1 fw-bold fs-7">Top chẩn đoán từ các lần khám đã lưu</span>
                        </h3>
                    </div>
                    <div className="card-body py-3">
                        <div className="chart">
                            <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardLive;
