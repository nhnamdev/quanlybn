import { useEffect } from "react";
import Chart from "chart.js/auto";

const dashboardHtml = `
<!--begin::Row-->
<div class="row g-5 g-lg-10">
    <div class="col-xl-4 mb-xl-10">
        <div class="card h-md-100">
            <div class="card-body p-0">
                <div class="px-9 pt-7 card-rounded h-275px w-100 bg-primary">
                    <div class="d-flex flex-stack">
                        <h3 class="m-0 text-white fw-bolder fs-3">Thống kê</h3>
                    </div>
                    <div class="d-flex text-center flex-column text-white pt-8">
                        <span class="fw-bold fs-7">Tổng số bệnh nhân</span>
                        <span class="fw-bolder fs-2x pt-1">0</span>
                    </div>
                </div>
                <div class="bg-body shadow-sm card-rounded mx-9 mb-9 px-6 py-9 position-relative z-index-1" style="margin-top: -100px">
                    <div class="d-flex align-items-center mb-6">
                        <div class="symbol symbol-45px w-40px me-5">
                            <span class="symbol-label bg-lighten">
                                <span class="svg-icon svg-icon-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.3" d="M18.4 5.59998C21.9 9.09998 21.9 14.8 18.4 18.3C14.9 21.8 9.2 21.8 5.7 18.3L18.4 5.59998Z" fill="black"></path>
                                        <path d="M12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2ZM19.9 11H13V8.8999C14.9 8.6999 16.7 8.00005 18.1 6.80005C19.1 8.00005 19.7 9.4 19.9 11ZM11 19.8999C9.7 19.6999 8.39999 19.2 7.39999 18.5C8.49999 17.7 9.7 17.2001 11 17.1001V19.8999ZM5.89999 6.90002C7.39999 8.10002 9.2 8.8 11 9V11.1001H4.10001C4.30001 9.4001 4.89999 8.00002 5.89999 6.90002ZM7.39999 5.5C8.49999 4.7 9.7 4.19998 11 4.09998V7C9.7 6.8 8.39999 6.3 7.39999 5.5ZM13 17.1001C14.3 17.3001 15.6 17.8 16.6 18.5C15.5 19.3 14.3 19.7999 13 19.8999V17.1001ZM13 4.09998C14.3 4.29998 15.6 4.8 16.6 5.5C15.5 6.3 14.3 6.80002 13 6.90002V4.09998ZM4.10001 13H11V15.1001C9.1 15.3001 7.29999 16 5.89999 17.2C4.89999 16 4.30001 14.6 4.10001 13ZM18.1 17.1001C16.6 15.9001 14.8 15.2 13 15V12.8999H19.9C19.7 14.5999 19.1 16.0001 18.1 17.1001Z" fill="black"></path>
                                    </svg>
                                </span>
                            </span>
                        </div>
                        <div class="d-flex align-items-center flex-wrap w-100">
                            <div class="mb-1 pe-3 flex-grow-1">
                                <span class="fs-5 text-hover-primary fw-bolder">Bệnh nhân</span>
                                <div class="fs-6 text-text-hover-primary fw-bolder">trong tháng này</div>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="fw-bolder fs-5 text-gray-800 pe-1">0</div>
                                <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="13" y="6" width="13" height="2" rx="1" transform="rotate(90 13 6)" fill="black"></rect>
                                        <path d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z" fill="black"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center mb-6">
                        <div class="symbol symbol-45px w-40px me-5">
                            <span class="symbol-label bg-lighten">
                                <span class="svg-icon svg-icon-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="2" width="9" height="9" rx="2" fill="black"></rect>
                                        <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="black"></rect>
                                        <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="black"></rect>
                                        <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="black"></rect>
                                    </svg>
                                </span>
                            </span>
                        </div>
                        <div class="d-flex align-items-center flex-wrap w-100">
                            <div class="mb-1 pe-3 flex-grow-1">
                                <span class="fs-5 text-hover-primary fw-bolder">Tổng lượt khám</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="fw-bolder fs-5 text-gray-800 pe-1">0</div>
                                <span class="svg-icon svg-icon-5 svg-icon-danger ms-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="11" y="18" width="13" height="2" rx="1" transform="rotate(-90 11 18)" fill="black"></rect>
                                        <path d="M11.4343 15.4343L7.25 11.25C6.83579 10.8358 6.16421 10.8358 5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75L11.2929 18.2929C11.6834 18.6834 12.3166 18.6834 12.7071 18.2929L18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25C17.8358 10.8358 17.1642 10.8358 16.75 11.25L12.5657 15.4343C12.2533 15.7467 11.7467 15.7467 11.4343 15.4343Z" fill="black"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center mb-6">
                        <div class="symbol symbol-45px w-40px me-5">
                            <span class="symbol-label bg-lighten">
                                <span class="svg-icon svg-icon-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.3" d="M15 19H7C5.9 19 5 18.1 5 17V7C5 5.9 5.9 5 7 5H15C16.1 5 17 5.9 17 7V17C17 18.1 16.1 19 15 19Z" fill="black"></path>
                                        <path d="M8.5 2H13.4C14 2 14.5 2.4 14.6 3L14.9 5H6.89999L7.2 3C7.4 2.4 7.9 2 8.5 2ZM7.3 21C7.4 21.6 7.9 22 8.5 22H13.4C14 22 14.5 21.6 14.6 21L14.9 19H6.89999L7.3 21ZM18.3 10.2C18.5 9.39995 18.5 8.49995 18.3 7.69995C18.2 7.29995 17.8 6.90002 17.3 6.90002H17V10.9H17.3C17.8 11 18.2 10.7 18.3 10.2Z" fill="black"></path>
                                    </svg>
                                </span>
                            </span>
                        </div>
                        <div class="d-flex align-items-center flex-wrap w-100">
                            <div class="mb-1 pe-3 flex-grow-1">
                                <span class="fs-5 text-text-hover-primary fw-bolder">Tổng lượt khám </span>
                                <div class="fs-6 text-text-hover-primary fw-bolder">trong tháng này</div>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="fw-bolder fs-5 text-gray-800 pe-1">0</div>
                                <span class="svg-icon svg-icon-5 svg-icon-success ms-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="13" y="6" width="13" height="2" rx="1" transform="rotate(90 13 6)" fill="black"></rect>
                                        <path d="M12.5657 8.56569L16.75 12.75C17.1642 13.1642 17.8358 13.1642 18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25L12.7071 5.70711C12.3166 5.31658 11.6834 5.31658 11.2929 5.70711L5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75C6.16421 13.1642 6.83579 13.1642 7.25 12.75L11.4343 8.56569C11.7467 8.25327 12.2533 8.25327 12.5657 8.56569Z" fill="black"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex align-items-center">
                        <div class="symbol symbol-45px w-40px me-5">
                            <span class="symbol-label bg-lighten">
                                <span class="svg-icon svg-icon-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.3" d="M19 22H5C4.4 22 4 21.6 4 21V3C4 2.4 4.4 2 5 2H14L20 8V21C20 21.6 19.6 22 19 22ZM12.5 18C12.5 17.4 12.6 17.5 12 17.5H8.5C7.9 17.5 8 17.4 8 18C8 18.6 7.9 18.5 8.5 18.5L12 18C12.6 18 12.5 18.6 12.5 18ZM16.5 13C16.5 12.4 16.6 12.5 16 12.5H8.5C7.9 12.5 8 12.4 8 13C8 13.6 7.9 13.5 8.5 13.5H15.5C16.1 13.5 16.5 13.6 16.5 13ZM12.5 8C12.5 7.4 12.6 7.5 12 7.5H8C7.4 7.5 7.5 7.4 7.5 8C7.5 8.6 7.4 8.5 8 8.5H12C12.6 8.5 12.5 8.6 12.5 8Z" fill="black"></path>
                                        <rect x="7" y="17" width="6" height="2" rx="1" fill="black"></rect>
                                        <rect x="7" y="12" width="10" height="2" rx="1" fill="black"></rect>
                                        <rect x="7" y="7" width="6" height="2" rx="1" fill="black"></rect>
                                        <path d="M15 8H20L14 2V7C14 7.6 14.4 8 15 8Z" fill="black"></path>
                                    </svg>
                                </span>
                            </span>
                        </div>
                        <div class="d-flex align-items-center flex-wrap w-100">
                            <div class="mb-1 pe-3 flex-grow-1">
                                <span class="fs-5 text-hover-primary fw-bolder">Đơn thuốc</span>
                                <div class="fs-6 text-text-hover-primary fw-bolder">trong tháng này</div>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="fw-bolder fs-5 text-gray-800 pe-1">0</div>
                                <span class="svg-icon svg-icon-5 svg-icon-danger ms-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="11" y="18" width="13" height="2" rx="1" transform="rotate(-90 11 18)" fill="black"></rect>
                                        <path d="M11.4343 15.4343L7.25 11.25C6.83579 10.8358 6.16421 10.8358 5.75 11.25C5.33579 11.6642 5.33579 12.3358 5.75 12.75L11.2929 18.2929C11.6834 18.6834 12.3166 18.6834 12.7071 18.2929L18.25 12.75C18.6642 12.3358 18.6642 11.6642 18.25 11.25C17.8358 10.8358 17.1642 10.8358 16.75 11.25L12.5657 15.4343C12.2533 15.7467 11.7467 15.7467 11.4343 15.4343Z" fill="black"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-8">
        <div class="row g-5 g-lg-10">
            <div class="col-lg-6 mb-5 mb-lg-10">
                <div class="card h-150px bgi-no-repeat bgi-size-cover h-150px mb-5 mb-lg-10" style="background-image:url('https://cdn.vicas.vn/media/stock/600x600/img-12.jpg')">
                    <div class="card-body p-6">
                        <a href="#" class="text-black text-hover-primary fw-bolder fs-2" data-bs-toggle="modal" data-bs-target="#kt_modal_create_app">Quảng cáo</a>
                    </div>
                </div>
                <div class="row g-5 g-lg-10">
                    <div class="col-lg-6">
                        <a href="/drugs/" class="card bg-danger h-150px">
                            <div class="card-body d-flex flex-column justify-content-between">
                                <span class="svg-icon svg-icon-white svg-icon-2hx ms-n1 flex-grow-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect x="2" y="2" width="9" height="9" rx="2" fill="black"></rect>
                                        <rect opacity="0.3" x="13" y="2" width="9" height="9" rx="2" fill="black"></rect>
                                        <rect opacity="0.3" x="13" y="13" width="9" height="9" rx="2" fill="black"></rect>
                                        <rect opacity="0.3" x="2" y="13" width="9" height="9" rx="2" fill="black"></rect>
                                    </svg>
                                </span>
                                <div class="d-flex flex-column">
                                    <div class="text-white fw-bolder fs-1 mb-0 mt-5"></div>
                                    <div class="text-white fw-bold fs-6">Thuốc sắp hết</div>
                                </div>
                            </div>
                        </a>
                    </div>
                    <div class="col-lg-6">
                        <a href="/drugs/" class="card bg-body h-150px">
                            <div class="card-body d-flex flex-column justify-content-between">
                                <span class="svg-icon svg-icon-2hx ms-n1 flex-grow-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path opacity="0.3" d="M10.9607 12.9128H18.8607C19.4607 12.9128 19.9607 13.4128 19.8607 14.0128C19.2607 19.0128 14.4607 22.7128 9.26068 21.7128C5.66068 21.0128 2.86071 18.2128 2.16071 14.6128C1.16071 9.31284 4.96069 4.61281 9.86069 4.01281C10.4607 3.91281 10.9607 4.41281 10.9607 5.01281V12.9128Z" fill="black"></path>
                                        <path d="M12.9607 10.9128V3.01281C12.9607 2.41281 13.4607 1.91281 14.0607 2.01281C16.0607 2.21281 17.8607 3.11284 19.2607 4.61284C20.6607 6.01284 21.5607 7.91285 21.8607 9.81285C21.9607 10.4129 21.4607 10.9128 20.8607 10.9128H12.9607Z" fill="black"></path>
                                    </svg>
                                </span>
                                <div class="d-flex flex-column">
                                    <div class="text-gray-900 fw-bolder fs-1 mb-0">0</div>
                                    <div class="text-gray-500 fw-bold me-2 fs-6">Thuốc trong tủ</div>
                                </div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>
            <div class="col-lg-6 mb-5 mb-lg-10">
                <div class="card bgi-no-repeat h-xl-100 " style="background-position: right top; background-size: 30% auto; background-image: url('https://cdn.vicas.vn/media/svg/shapes/abstract-4.svg');">
                    <div class="card-header align-items-center border-0 mt-4">
                        <h3 class="card-title align-items-start flex-column">
                            <span class="fw-bolder mb-2 text-dark">Lịch hẹn</span>
                            <span class="text-muted fw-bold fs-7">Lịch hẹn trong ngày</span>
                        </h3>
                    </div>
                    <div class="card-body pt-5 scroll-y mh-250px">
                        <div class="timeline-label"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="card h-175px bgi-no-repeat bgi-size-contain bg-primary h-200px mb-5 mb-lg-10" style="background-position: right; background-image:url('https://cdn.vicas.vn/media/misc/city.png')">
            <div class="card-body d-flex flex-column justify-content-start">
                <h2 class="text-white fw-bolder mb-1">
                    <span class="lh-lg">Điều tồi tệ nhất về thuốc men <br>là loại này khiến ta lại phải cần loại khác.</span>
                </h2>
                <div class="m-0">
                    <a href="/drugs/" class="btn btn-danger fw-bold px-6 py-3">Quản lý kho thuốc</a>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="row g-5 g-lg-10">
    <div class="col-xl-6 mb-5 mb-xl-10">
        <div class="card h-xl-100">
            <div class="card-header border-0 pt-5">
                <h3 class="card-title align-items-start flex-column">
                    <span class="card-label fw-bolder fs-3 mb-1">Thống kê</span>
                    <span class="text-muted mt-1 fw-bold fs-7">Thống kê bệnh nhân và lượt khám trong năm</span>
                </h3>
            </div>
            <div class="card-body py-3">
                <div class="chart">
                    <canvas id="barChart" style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;"></canvas>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-6 mb-5 mb-xl-10">
        <div class="card h-xl-100">
            <div class="card-header border-0 pt-5">
                <h3 class="card-title align-items-start flex-column">
                    <span class="card-label fw-bolder fs-3 mb-1">Thống kê ICD</span>
                    <span class="text-muted mt-1 fw-bold fs-7">Thống kê các bệnh đã khám</span>
                </h3>
            </div>
            <div class="card-body py-3">
                <div class="chart">
                    <canvas id="icdChart" style="min-height: 250px; height: 250px; max-height: 250px; max-width: 100%;"></canvas>
                </div>
            </div>
        </div>
    </div>
</div>
`;

function DashboardContentExact() {
    useEffect(() => {
        const barEl = document.getElementById("barChart");
        const icdEl = document.getElementById("icdChart");

        let barChart;
        let icdChart;

        if (barEl) {
            barChart = new Chart(barEl, {
                type: "bar",
                data: {
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
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        if (icdEl) {
            icdChart = new Chart(icdEl, {
                type: "doughnut",
                data: {
                    labels: ["Chưa có dữ liệu"],
                    datasets: [{ data: [1], backgroundColor: ["#e5e7eb"], borderColor: "#ffffff", borderWidth: 2 }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        return () => {
            if (barChart) barChart.destroy();
            if (icdChart) icdChart.destroy();
        };
    }, []);

    return <div dangerouslySetInnerHTML = {
        { __html: dashboardHtml }
    }
    />;
}

export default DashboardContentExact;