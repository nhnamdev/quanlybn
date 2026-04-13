import { useState } from "react";
import { useLocation } from "react-router-dom";

function Header({ onToggleSidebar, onLogout }) {
    const { pathname } = useLocation();
    const [showUserMenu, setShowUserMenu] = useState(false);

    const isPatientsPage = pathname === "/patient/" || pathname === "/patients";
    const isRxPage = pathname === "/rx/" || pathname === "/prescriptions";
    const pageTitle = isPatientsPage ? "Danh sách Bệnh Nhân" : isRxPage ? "Đơn thuốc" : "Bảng điều khiển";

    const handleLogout = () => {
        if (window.confirm("Bạn có chắc chắn muốn đăng xuất?")) {
            setShowUserMenu(false);
            onLogout();
        }
    };

    return (
        <div id="kt_header" className="header align-items-stretch">
            <div className="container-fluid d-flex align-items-stretch justify-content-between position-relative">
                <div className="header-mobile-title d-lg-none">{pageTitle}</div>

                <div className="d-flex align-items-center d-lg-none ms-n2 me-2" title="Show aside menu">
                    <button
                        type="button"
                        className="btn btn-icon btn-active-light-primary w-30px h-30px w-md-40px h-md-40px"
                        id="kt_aside_mobile_toggle"
                        onClick={onToggleSidebar}
                    >
                        <span className="svg-icon svg-icon-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M21 7H3C2.4 7 2 6.6 2 6V4C2 3.4 2.4 3 3 3H21C21.6 3 22 3.4 22 4V6C22 6.6 21.6 7 21 7Z" fill="black" />
                                <path
                                    opacity="0.3"
                                    d="M21 14H3C2.4 14 2 13.6 2 13V11C2 10.4 2.4 10 3 10H21C21.6 10 22 10.4 22 11V13C22 13.6 21.6 14 21 14ZM22 20V18C22 17.4 21.6 17 21 17H3C2.4 17 2 17.4 2 18V20C2 20.6 2.4 21 3 21H21C21.6 21 22 20.6 22 20Z"
                                    fill="black"
                                />
                            </svg>
                        </span>
                    </button>
                </div>

                <div className="d-flex align-items-center flex-grow-1 flex-lg-grow-0">
                    <a href="/" className="d-lg-none">
                        <img alt="Logo" src="/logoBN.png" className="h-30px app-header-logo" />
                    </a>
                </div>

                <div className="d-flex align-items-stretch justify-content-between flex-lg-grow-1">
                    <div className="d-flex align-items-center" id="kt_header_nav">
                        <div className="page-title d-none d-lg-flex align-items-center flex-wrap me-3 mb-5 mb-lg-0">
                            <h1 className="d-flex align-items-center text-dark fw-bolder fs-3 my-1">{pageTitle}</h1>
                            <span className="h-20px border-gray-300 border-start mx-4"></span>
                            <ul className="breadcrumb breadcrumb-separatorless fw-bold fs-7 my-1">
                                <li className="breadcrumb-item text-muted">
                                    <a href="/" className="text-muted text-hover-primary">
                                        Trang chủ
                                    </a>
                                </li>
                                <li className="breadcrumb-item">
                                    <span className="bullet bg-gray-300 w-5px h-2px"></span>
                                </li>
                                {isPatientsPage ? (
                                    <>
                                        <li className="breadcrumb-item text-muted">Bệnh Nhân</li>
                                        <li className="breadcrumb-item">
                                            <span className="bullet bg-gray-300 w-5px h-2px"></span>
                                        </li>
                                        <li className="breadcrumb-item text-dark">Danh sách Bệnh Nhân</li>
                                    </>
                                ) : null}
                                {isRxPage ? (
                                    <>
                                        <li className="breadcrumb-item text-muted">Thuốc</li>
                                        <li className="breadcrumb-item">
                                            <span className="bullet bg-gray-300 w-5px h-2px"></span>
                                        </li>
                                        <li className="breadcrumb-item text-dark">Đơn thuốc</li>
                                    </>
                                ) : null}
                            </ul>
                        </div>
                    </div>

                    {/* User menu */}
                    <div className="d-flex align-items-stretch flex-shrink-0">
                        <div
                            className="d-flex align-items-center ms-1 ms-lg-3"
                            id="kt_header_user_menu_toggle"
                            style={{ position: "relative" }}
                        >
                            <div
                                className="cursor-pointer symbol symbol-30px symbol-md-40px d-flex align-items-center gap-2"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowUserMenu((v) => !v)}
                            >
                                <img src="https://cdn.vicas.vn/media/misc/avatar.jpg" alt="user" />
                                <span className="d-none d-lg-block text-dark fw-bold fs-7">tienquanlybn</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="d-none d-lg-block" style={{ color: "#999" }}>
                                    <path d="M7 10l5 5 5-5z"/>
                                </svg>
                            </div>

                            {showUserMenu && (
                                <>
                                    {/* Overlay để đóng menu khi click ngoài */}
                                    <div
                                        style={{ position: "fixed", inset: 0, zIndex: 999 }}
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <div style={{
                                        position: "absolute", top: "calc(100% + 10px)", right: 0,
                                        background: "#fff", borderRadius: "12px",
                                        boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                                        border: "1px solid #f1f1f1",
                                        minWidth: "200px", zIndex: 1000,
                                        overflow: "hidden"
                                    }}>
                                        {/* User info */}
                                        <div style={{
                                            padding: "14px 16px",
                                            borderBottom: "1px solid #f1f5f9",
                                            background: "#f8fafc"
                                        }}>
                                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b" }}>tienquanlybn</div>
                                            <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>Quản trị viên</div>
                                        </div>

                                        {/* Logout button */}
                                        <button
                                            id="logout-btn"
                                            type="button"
                                            onClick={handleLogout}
                                            style={{
                                                display: "flex", alignItems: "center", gap: "10px",
                                                width: "100%", padding: "12px 16px",
                                                background: "none", border: "none",
                                                textAlign: "left", cursor: "pointer",
                                                fontSize: "13px", color: "#ef4444",
                                                fontWeight: 500,
                                                transition: "background 0.15s"
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = "#fff5f5"}
                                            onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                                        >
                                            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17 7l-1.4 1.4 2.6 2.6H7v2h11.2l-2.6 2.6L17 17l5-5-5-5zm-9 11H6V6h2V4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2v-2z"/>
                                            </svg>
                                            Đăng xuất
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Header;
