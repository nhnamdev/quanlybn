import { useEffect, useState } from "react";
import Sidebar from "../sidebar/Sidebar";
import Header from "../header/Header";
import AppFooter from "../layout/AppFooter";

function AppLayout({ children }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth > 991) {
                setMobileSidebarOpen(false);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const toggleSidebar = () => {
        if (window.innerWidth <= 991) {
            setMobileSidebarOpen((prev) => !prev);
            return;
        }
        setSidebarCollapsed((prev) => !prev);
    };

    const closeMobileSidebar = () => setMobileSidebarOpen(false);

    return ( <
        div className = "page d-flex flex-row flex-column-fluid" >
        <
        Sidebar collapsed = { sidebarCollapsed }
        mobileOpen = { mobileSidebarOpen }
        onToggle = { toggleSidebar }
        onCloseMobile = { closeMobileSidebar }
        /> <
        div className = { `wrapper d-flex flex-column flex-row-fluid ${sidebarCollapsed ? "expanded" : ""}` }
        id = "kt_wrapper" >
        <
        Header onToggleSidebar = { toggleSidebar }
        /> <
        div className = "content d-flex flex-column flex-column-fluid"
        id = "kt_content" >
        <
        div className = "post d-flex flex-column-fluid"
        id = "kt_post" >
        <
        div id = "kt_content_container"
        className = "container-fluid responsive-content-pad" > { children } <
        /div> <
        /div> <
        /div> <
        AppFooter / >
        <
        /div> <
        /div>
    );
}

export default AppLayout;