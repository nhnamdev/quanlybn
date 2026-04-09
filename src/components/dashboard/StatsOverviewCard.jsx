const statsItems = [
    { title: "Bệnh nhân", subtitle: "trong tháng này", value: 0, trend: "up", icon: "fas fa-user-injured" },
    { title: "Tổng lượt khám", subtitle: "", value: 0, trend: "down", icon: "fas fa-notes-medical" },
    { title: "Lượt khám", subtitle: "trong tháng này", value: 0, trend: "up", icon: "fas fa-heartbeat" },
    { title: "Đơn thuốc", subtitle: "trong tháng này", value: 0, trend: "down", icon: "fas fa-file-medical" }
];

function TrendIcon({ trend }) {
    return trend === "up" ? ( <
        span className = "svg-icon svg-icon-5 svg-icon-success ms-1" > < i className = "fas fa-arrow-up" / > < /span>
    ) : ( <
        span className = "svg-icon svg-icon-5 svg-icon-danger ms-1" > < i className = "fas fa-arrow-down" / > < /span>
    );
}

function StatsOverviewCard() {
    return ( <
        div className = "card h-md-100" >
        <
        div className = "card-body p-0" >
        <
        div className = "px-9 pt-7 card-rounded h-275px w-100 bg-primary" >
        <
        div className = "d-flex flex-stack" >
        <
        h3 className = "m-0 text-white fw-bolder fs-3" > Thống kê < /h3> <
        /div> <
        div className = "d-flex text-center flex-column text-white pt-8" >
        <
        span className = "fw-bold fs-7" > Tổng số bệnh nhân < /span> <
        span className = "fw-bolder fs-2x pt-1" > 0 < /span> <
        /div> <
        /div>

        <
        div className = "bg-body shadow-sm card-rounded mx-9 mb-9 px-6 py-9 position-relative z-index-1"
        style = {
            { marginTop: "-100px" } } > {
            statsItems.map((item) => ( <
                    div className = "d-flex align-items-center mb-6"
                    key = { item.title } >
                    <
                    div className = "symbol symbol-45px w-40px me-5" >
                    <
                    span className = "symbol-label bg-lighten" >
                    <
                    span className = "svg-icon svg-icon-1" > < i className = { item.icon }
                    /></span >
                    <
                    /span> <
                    /div> <
                    div className = "d-flex align-items-center flex-wrap w-100" >
                    <
                    div className = "mb-1 pe-3 flex-grow-1" >
                    <
                    span className = "fs-5 text-hover-primary fw-bolder" > { item.title } < /span> {
                        item.subtitle ? < div className = "fs-6 text-text-hover-primary fw-bolder" > { item.subtitle } < /div> : null} <
                            /div> <
                            div className = "d-flex align-items-center" >
                            <
                            div className = "fw-bolder fs-5 text-gray-800 pe-1" > { item.value } < /div> <
                            TrendIcon trend = { item.trend }
                        /> <
                        /div> <
                        /div> <
                        /div>
                    ))
            } <
            /div> <
            /div> <
            /div>
        );
    }

    export default StatsOverviewCard;