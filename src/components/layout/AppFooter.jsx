function AppFooter() {
    return (
        <footer className="footer d-flex flex-lg-column" id="kt_footer">
            <div className="container-fluid app-footer-wrap d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
                <div className="app-footer-brand order-2 order-md-1">
                    <span className="app-footer-year">2022 - 2026</span>
                    <span className="app-footer-dot">|</span>
                    <span className="app-footer-name">PatientCare Management System</span>
                </div>

                <ul className="app-footer-links order-1 order-md-2">
                    <li>
                        <a href="#">Điều khoản</a>
                    </li>
                    <li>
                        <a href="#">Liên hệ</a>
                    </li>
                </ul>
            </div>
        </footer>
    );
}

export default AppFooter;