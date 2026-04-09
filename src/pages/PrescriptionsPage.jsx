import { useState } from "react";

function PrescriptionsPage() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <div className="card">
                <div className="card-header border-0 pt-6">
                    <div className="card-title">
                        <h2 className="card-title align-items-start flex-column">
                            <span className="card-label fw-bolder fs-3 mb-1">Đơn thuốc</span>
                            <span className="text-muted mt-1 fw-bold fs-7">Danh sách đơn thuốc của bạn</span>
                        </h2>
                    </div>
                    <div className="card-toolbar">
                        <div className="d-flex justify-content-end">
                            <button type="button" className="btn btn-primary" id="createPatient" onClick={() => setShowModal(true)}>
                                <span className="svg-icon svg-icon-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <rect opacity="0.5" x="11.364" y="20.364" width="16" height="2" rx="1" transform="rotate(-90 11.364 20.364)" fill="black"></rect>
                                        <rect x="4.36396" y="11.364" width="16" height="2" rx="1" fill="black"></rect>
                                    </svg>
                                </span>
                                Thêm Bệnh Nhân mới
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card-body py-4">
                    <div id="rx_table_wrapper" className="dataTables_wrapper dt-bootstrap4 no-footer">
                        <div className="row align-items-center">
                            <div className="col-sm-6 d-none d-lg-block">
                                <div className="dt-buttons btn-group flex-wrap">
                                    <button className="btn btn-secondary btn-light btn-sm" type="button" aria-controls="rx_table">
                                        <span><i className="fas fa-search"></i> Tìm kiếm nâng cao</span>
                                    </button>
                                    <button className="btn btn-secondary buttons-copy buttons-html5 btn-light-primary btn-sm" type="button" aria-controls="rx_table">
                                        <span><i className="fas fa-copy"></i> Sao chép</span>
                                    </button>
                                    <button className="btn btn-secondary buttons-excel buttons-html5 btn-light-success btn-sm" type="button" aria-controls="rx_table">
                                        <span><i className="fas fa-file-excel"></i> Excel</span>
                                    </button>
                                    <button className="btn btn-secondary buttons-pdf buttons-html5 btn-light-danger btn-sm" type="button" aria-controls="rx_table">
                                        <span><i className="fas fa-file-pdf"></i> PDF</span>
                                    </button>
                                    <button className="btn btn-secondary btn-light-info btn-sm" type="button" aria-controls="rx_table">
                                        <span><i className="fas fa-print"></i> In đơn thuốc</span>
                                    </button>
                                </div>
                            </div>
                            <div className="col-sm-2">
                                <div className="daterange-container d-flex justify-content-start">
                                    <div className="d-flex align-items-center">
                                        <input
                                            type="text"
                                            className="form-control form-control-sm form-control-solid"
                                            placeholder="Tìm kiếm theo ngày, tháng"
                                            id="kt_daterangepicker_4"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-4">
                                <div id="rx_table_filter" className="dataTables_filter">
                                    <label>
                                        Tìm kiếm:
                                        <input type="search" className="form-control form-control-sm form-control-solid" placeholder="" aria-controls="rx_table" />
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <table id="rx_table" className="table align-middle table-striped table-row-dashed fs-5 g-1 align-middle dataTable no-footer dtr-inline" aria-describedby="rx_table_info">
                                    <thead>
                                        <tr className="text-start text-gray-900 fw-bolder fs-7 text-uppercase gs-0">
                                            <th className="sorting sorting_desc" tabIndex="0" aria-controls="rx_table" rowSpan="1" colSpan="1" aria-sort="descending" aria-label="Ngày: activate to sort column ascending">Ngày</th>
                                            <th className="sorting" tabIndex="0" aria-controls="rx_table" rowSpan="1" colSpan="1" aria-label="Họ &amp; Tên: activate to sort column ascending">Họ &amp; Tên</th>
                                            <th className="sorting" tabIndex="0" aria-controls="rx_table" rowSpan="1" colSpan="1" aria-label="Giới: activate to sort column ascending">Giới</th>
                                            <th className="sorting" tabIndex="0" aria-controls="rx_table" rowSpan="1" colSpan="1" aria-label="Năm sinh: activate to sort column ascending">Năm sinh</th>
                                            <th className="sorting" tabIndex="0" aria-controls="rx_table" rowSpan="1" colSpan="1" aria-label="Chẩn đoán: activate to sort column ascending">Chẩn đoán</th>
                                            <th className="sorting" tabIndex="0" aria-controls="rx_table" rowSpan="1" colSpan="1" aria-label="Thuốc: activate to sort column ascending">Thuốc</th>
                                            <th className="text-end min-w-100px sorting_disabled" rowSpan="1" colSpan="1" aria-label="Thao tác">Thao tác</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="odd">
                                            <td valign="top" colSpan="7" className="dataTables_empty">Không có dữ liệu</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div id="rx_table_processing" className="dataTables_processing" style={{ display: "none" }}>
                                    Đang xử lý...
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12 col-md-5">
                                <div className="dataTables_info" id="rx_table_info" role="status" aria-live="polite">
                                    Showing no records
                                </div>
                            </div>
                            <div className="col-sm-12 col-md-7">
                                <div className="dataTables_paginate paging_simple_numbers" id="rx_table_paginate">
                                    <ul className="pagination">
                                        <li className="paginate_button page-item previous disabled" id="rx_table_previous">
                                            <a href="#" aria-controls="rx_table" data-dt-idx="0" tabIndex="0" className="page-link">Lùi</a>
                                        </li>
                                        <li className="paginate_button page-item next disabled" id="rx_table_next">
                                            <a href="#" aria-controls="rx_table" data-dt-idx="1" tabIndex="0" className="page-link">Tiếp</a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showModal ? (
                <>
                    <div className="modal fade show d-block" id="modal-rx" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title"></h5>
                                    <button type="button" className="btn btn-icon btn-sm btn-active-light-primary ms-2" aria-label="Close" onClick={() => setShowModal(false)}>
                                        <span className="svg-icon svg-icon-2x">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <rect opacity="0.5" x="6" y="17.3137" width="16" height="2" rx="1" transform="rotate(-45 6 17.3137)" fill="black"></rect>
                                                <rect x="7.41422" y="6" width="16" height="2" rx="1" transform="rotate(45 7.41422 6)" fill="black"></rect>
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {/* Form content will be loaded here */}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show"></div>
                </>
            ) : null}
        </>
    );
}

export default PrescriptionsPage;
