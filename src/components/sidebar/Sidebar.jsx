import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const topLinks = [
    { href: "/", title: "Trang chủ", icon: "fas fa-tachometer-alt" },
    { href: "/event/", title: "Lịch hẹn", icon: "fas fa-calendar-alt" },
    { href: "/working-schedule/", title: "Lịch làm việc", icon: "fas fa-business-time" }
];

const accordionItems = [{
        key: "benhnhan",
        title: "Bệnh Nhân",
        icon: "fas fa-hospital-user",
        children: [
            { href: "/patient/", title: "Danh sách Bệnh Nhân", icon: "fas fa-list" },
            { href: "#", id: "createPatient2", title: "Thêm Bệnh Nhân mới", icon: "fas fa-user-plus" }
        ]
    },
    {
        key: "thuoc",
        title: "Thuốc",
        icon: "fas fa-prescription-bottle-alt",
        children: [
            { href: "/rx/", title: "Đơn thuốc", icon: "fas fa-file-prescription" },
            { href: "/drugs/", title: "Tủ thuốc", icon: "fas fa-pills" }
        ]
    },
    {
        key: "canlamsang",
        title: "Cận lâm sàng",
        icon: "fas fa-microscope",
        children: [
            { href: "/laboratory/", title: "Hóa sinh", icon: "fas fa-vials" },
            { href: "/radiology/", title: "Chẩn đoán hình ảnh", icon: "fas fa-x-ray" },
            { href: "/eus/", title: "Thăm dò chức năng", icon: "fas fa-laptop-medical" },
            { href: "/procedure/", title: "Thủ thuật", icon: "fas fa-syringe" }
        ]
    },
    {
        key: "baocao",
        title: "Báo cáo & Hóa đơn",
        icon: "fas fa-chart-line",
        children: [{ href: "/report/", title: "Báo cáo khám bệnh", icon: "fas fa-copy" }]
    },
    {
        key: "tienich",
        title: "Tiện ích",
        icon: "fas fa-toolbox",
        children: [
            { href: "/list-of-technical/", title: "Danh mục kỹ thuật BYT", icon: "fas fa-list" },
            { href: "/chatbot/", title: "Chatbot Hỗ Trợ", icon: "fas fa-robot", badge: "AI" },
            { href: "/checkxray/", title: "Gợi ý chẩn đoán XQuang Ngực", icon: "fas fa-lungs-virus", badge: "AI" },
            {
                href: "https://demo.radiobotics.com/access/4pJZGOaV/rbfracture",
                title: "Gợi ý chẩn đoán XQuang Gãy Xương",
                icon: "fas fa-bone",
                badge: "AI",
                external: true
            },
            { href: "/checkhi/", title: "Thông tin BHYT", icon: "fas fa-file-medical" },
            { href: "/drug-interactions/", title: "Tra cứu tương tác thuốc", icon: "fas fa-capsules" }
        ]
    },
    {
        key: "quanly",
        title: "Quản lý",
        icon: "fas fa-cogs",
        children: [
            { href: "/account/settings", title: "Cài đặt tài khoản", icon: "fas fa-user-cog" },
            { href: "/drugs/", title: "Tủ thuốc", icon: "fas fa-pills" },
            { href: "/paraclinical/", title: "Danh mục kỹ thuật", icon: "fas fa-skull" }
        ]
    }
];

const footerLinks = [
    { href: "https://me.momo.vn/qr/huynh-nguyen-thuan-6rGc98C64y", title: "Ủng hộ chúng tôi", icon: "fas fa-donate", external: true },
    { href: "/tutorial/", title: "Hướng dẫn sử dụng", icon: "fas fa-info-circle" },
    { href: "#", title: "Về chúng tôi", icon: "fas fa-users" }
];

function Sidebar({ collapsed, mobileOpen, onToggle, onCloseMobile }) {
    const { pathname } = useLocation();
    const navigate = useNavigate();

    const defaultAccordion = useMemo(() => {
        const group = accordionItems.find((item) =>
            item.children.some((child) => child.href !== "#" && pathname.startsWith(child.href.replace(/\/$/, "")))
        );
        return group ? group.key : "benhnhan";
    }, [pathname]);

    const [openAccordion, setOpenAccordion] = useState(defaultAccordion);

    useEffect(() => {
        setOpenAccordion(defaultAccordion);
    }, [defaultAccordion]);

    const isActivePath = (href) => {
        if (!href || href === "#" || href.startsWith("http")) return false;
        const normalizedPath = pathname.replace(/\/$/, "") || "/";
        const normalizedHref = href.replace(/\/$/, "") || "/";
        return normalizedPath === normalizedHref;
    };

    const openCreatePatientModal = (event) => {
        event.preventDefault();
        onCloseMobile();
        navigate("/patient/", { state: { openCreatePatientModal: Date.now() } });
    };

    const sidebarClass = [
            "aside aside-dark aside-hoverable sidebar",
            collapsed ? "collapsed" : "",
            mobileOpen ? "show active" : ""
        ]
        .join(" ")
        .trim();

    return ( <
        > {
            mobileOpen ? < div className = "sidebar-overlay"
            onClick = { onCloseMobile }
            /> : null} <
            div className = { sidebarClass }
            id = "kt_aside" >
            <
            div className = "aside-logo sidebar-logo flex-column-auto"
            id = "kt_aside_logo" >
            <
            a href = "/"
            className = "logo-link"
            style = {
                { margin: "0 auto" } }
            onClick = { onCloseMobile } >
            <
            img alt = "Logo"
            src = "/logoBN.png"
            className = "h-40px logo logo-img" / >
            <
            /a> <
            button
            type = "button"
            id = "kt_aside_toggle"
            className = "btn btn-icon w-auto px-0 btn-active-color-primary aside-toggle btn-toggle-sidebar"
            title = "Minimize sidebar"
            onClick = { onToggle } >
            <
            span className = "svg-icon svg-icon-1 rotate-180" >
            <
            i className = { `fas ${collapsed ? "fa-angle-right" : "fa-angle-left"}` }
            /> <
            /span> <
            /button> <
            /div>

            <
            div className = "aside-menu sidebar-menu flex-column-fluid" >
            <
            div className = "hover-scroll-overlay-y my-5 my-lg-5 menu-scroll"
            id = "kt_aside_menu_wrapper" >
            <
            div className = "menu menu-column menu-arrow-gray-500"
            id = "kt_aside_menu" > {
                topLinks.map((link) => ( <
                    div className = "menu-item"
                    key = { link.title } >
                    <
                    a className = { `menu-link ${isActivePath(link.href) ? "active" : ""}` }
                    href = { link.href }
                    title = { link.title }
                    onClick = { onCloseMobile } >
                    <
                    span className = "menu-icon" > < i className = { link.icon }
                    /></span >
                    <
                    span className = "menu-title" > { link.title } < /span> <
                    /a> <
                    /div>
                ))
            }

            <
            div className = "menu-item" >
            <
            div className = "menu-content pt-8 pb-2" >
            <
            span className = "text-gray-100 text-uppercase fs-8 ls-1" > Chức năng < /span> <
            /div> <
            /div>

            {
                accordionItems.map((item) => {
                    const isOpen = openAccordion === item.key;
                    return ( <
                        div key = { item.key }
                        className = { `menu-item menu-accordion ${isOpen ? "active" : ""}` } >
                        <
                        button type = "button"
                        className = "menu-link menu-link-button"
                        onClick = {
                            () => setOpenAccordion(isOpen ? "" : item.key) } >
                        <
                        span className = "menu-icon" > < i className = { item.icon }
                        /></span >
                        <
                        span className = "menu-title" > { item.title } < /span> <
                        span className = "menu-arrow" > < i className = "fas fa-chevron-right" / > < /span> <
                        /button> <
                        div className = "menu-sub menu-sub-accordion menu-active-bg" > {
                            item.children.map((child) => ( <
                                div key = { child.title }
                                className = "menu-item" >
                                <
                                a className = { `menu-link ${isActivePath(child.href) ? "active" : ""}` }
                                id = { child.id }
                                href = { child.href }
                                title = { child.title }
                                target = { child.external ? "_blank" : undefined }
                                rel = { child.external ? "noreferrer" : undefined }
                                onClick = { child.id === "createPatient2" ? openCreatePatientModal : onCloseMobile } >
                                <
                                span className = "menu-icon" > < i className = { child.icon }
                                /></span >
                                <
                                span className = "menu-title" > { child.title } < /span> {
                                    child.badge ? ( <
                                        span className = "menu-badge" > < span className = "badge badge-success" > { child.badge } < /span></span >
                                    ) : null
                                } <
                                /a> <
                                /div>
                            ))
                        } <
                        /div> <
                        /div>
                    );
                })
            }

            <
            div className = "menu-item" >
            <
            div className = "menu-content" >
            <
            div className = "separator mx-1 my-4" / >
            <
            /div> <
            /div>

            {
                footerLinks.map((link) => ( <
                    div className = "menu-item"
                    key = { link.title } >
                    <
                    a className = "menu-link"
                    href = { link.href }
                    title = { link.title }
                    target = { link.external ? "_blank" : undefined }
                    rel = { link.external ? "noreferrer" : undefined }
                    onClick = { onCloseMobile } >
                    <
                    span className = "menu-icon" > < i className = { link.icon }
                    /></span >
                    <
                    span className = "menu-title" > { link.title } < /span> <
                    /a> <
                    /div>
                ))
            } <
            /div> <
            /div> <
            /div>

            <
            div className = "aside-footer sidebar-footer flex-column-auto pt-5 pb-7 px-5"
            id = "kt_aside_footer" >
            <
            a href = "https://www.facebook.com/groups/vicas.vn"
            className = "btn btn-custom btn-primary btn-contact w-100"
            title = "Liên hệ & Góp Ý"
            target = "_blank"
            rel = "noreferrer" >
            <
            span className = "btn-label" > Liên hệ & Góp Ý < /span> <
            span className = "svg-icon btn-icon svg-icon-2 ms-2" > < i className = "fas fa-file-alt" / > < /span> <
            /a> <
            /div> <
            /div> <
            />
        );
    }

    export default Sidebar;