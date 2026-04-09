function DashboardTopWidgets() {
    return ( <
        div className = "col-xl-8" >
        <
        div className = "row g-5 g-lg-10" >
        <
        div className = "col-lg-6 mb-5 mb-lg-10" >
        <
        div className = "card h-150px bgi-no-repeat bgi-size-cover h-150px mb-5 mb-lg-10"
        style = {
            { backgroundImage: "url('https://cdn.vicas.vn/media/stock/600x600/img-12.jpg')" } } >
        <
        div className = "card-body p-6" >
        <
        a href = "#"
        className = "text-black text-hover-primary fw-bolder fs-2" > Quảng cáo < /a> <
        /div> <
        /div>

        <
        div className = "row g-5 g-lg-10" >
        <
        div className = "col-lg-6" >
        <
        a href = "/drugs"
        className = "card bg-danger h-150px" >
        <
        div className = "card-body d-flex flex-column justify-content-between" >
        <
        span className = "svg-icon svg-icon-white svg-icon-2hx ms-n1 flex-grow-1" > < i className = "fas fa-pills" / > < /span> <
        div className = "d-flex flex-column" >
        <
        div className = "text-white fw-bolder fs-1 mb-0 mt-5" / >
        <
        div className = "text-white fw-bold fs-6" > Thuốc sắp hết < /div> <
        /div> <
        /div> <
        /a> <
        /div> <
        div className = "col-lg-6" >
        <
        a href = "/drugs"
        className = "card bg-body h-150px" >
        <
        div className = "card-body d-flex flex-column justify-content-between" >
        <
        span className = "svg-icon svg-icon-2hx ms-n1 flex-grow-1" > < i className = "fas fa-chart-pie" / > < /span> <
        div className = "d-flex flex-column" >
        <
        div className = "text-gray-900 fw-bolder fs-1 mb-0 mt-5" > 0 < /div> <
        div className = "text-gray-500 fw-bold me-2 fs-6" > Thuốc trong tủ < /div> <
        /div> <
        /div> <
        /a> <
        /div> <
        /div> <
        /div>

        <
        div className = "col-lg-6 mb-5 mb-lg-10" >
        <
        div className = "card bgi-no-repeat h-xl-100"
        style = {
            {
                backgroundPosition: "right top",
                backgroundSize: "30% auto",
                backgroundImage: "url('https://cdn.vicas.vn/media/svg/shapes/abstract-4.svg')"
            }
        } >
        <
        div className = "card-header align-items-center border-0 mt-4" >
        <
        h3 className = "card-title align-items-start flex-column" >
        <
        span className = "fw-bolder mb-2 text-dark" > Lịch hẹn < /span> <
        span className = "text-muted fw-bold fs-7" > Lịch hẹn trong ngày < /span> <
        /h3> <
        /div> <
        div className = "card-body pt-5 scroll-y mh-250px" >
        <
        div className = "timeline-label" >
        <
        div className = "text-muted fs-7" > Chưa có lịch hẹn hôm nay < /div> <
        /div> <
        /div> <
        /div> <
        /div> <
        /div>

        <
        div className = "card h-175px bgi-no-repeat bgi-size-contain bg-primary h-200px mb-5 mb-lg-10"
        style = {
            {
                backgroundPosition: "right",
                backgroundImage: "url('https://cdn.vicas.vn/media/misc/city.png')"
            }
        } >
        <
        div className = "card-body d-flex flex-column justify-content-between" >
        <
        h2 className = "text-white fw-bolder mb-5" >
        <
        span className = "lh-lg" > Điều tồi tệ nhất về thuốc men < br / > là loại này khiến ta lại phải cần loại khác. < /span> <
        /h2> <
        div className = "m-0" >
        <
        a href = "/drugs"
        className = "btn btn-danger fw-bold px-6 py-3" > Quản lý kho thuốc < /a> <
        /div> <
        /div> <
        /div> <
        /div>
    );
}

export default DashboardTopWidgets;