// Toggle Sidebar
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const wrapper = document.querySelector('.wrapper');
    const isMobile = window.innerWidth <= 991;

    if (sidebar) {
        if (isMobile) {
            sidebar.classList.toggle('show');
            sidebar.classList.remove('collapsed');
        } else {
            sidebar.classList.toggle('collapsed');
            sidebar.classList.remove('show');
        }
    }
    if (mainContent) {
        mainContent.classList.toggle('expanded');
    }
    if (wrapper) {
        wrapper.classList.toggle('expanded');
    }
}

function syncSidebarState() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.querySelector('.main-content');
    const wrapper = document.querySelector('.wrapper');
    if (!sidebar) return;

    if (window.innerWidth > 991) {
        sidebar.classList.remove('show', 'active', 'collapsed');
        mainContent ? .classList.remove('expanded');
        wrapper ? .classList.remove('expanded');
    } else {
        sidebar.classList.remove('collapsed');
    }
}

document.getElementById('toggleSidebar') ? .addEventListener('click', toggleSidebar);

// Toggle Sidebar Button (Minimize)
document.getElementById('toggleSidebarBtn') ? .addEventListener('click', function(e) {
    e.preventDefault();
    toggleSidebar();
});

// Mobile Toggle
document.getElementById('kt_aside_mobile_toggle') ? .addEventListener('click', toggleSidebar);

window.addEventListener('resize', syncSidebarState);
document.addEventListener('DOMContentLoaded', syncSidebarState);

// Menu Accordion Toggle
document.querySelectorAll('[data-toggle]').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-toggle');
        const menuItem = this.closest('.menu-accordion');
        const targetMenu = document.getElementById(targetId);

        if (menuItem && targetMenu) {
            const isActive = menuItem.classList.contains('active');

            // Close all other accordions
            document.querySelectorAll('.menu-accordion.active').forEach(item => {
                if (item !== menuItem) {
                    item.classList.remove('active');
                }
            });

            // Toggle current accordion
            menuItem.classList.toggle('active');
        }
    });
});

// Close menu accordion when clicking menu links
document.querySelectorAll('.menu-sub .menu-link').forEach(link => {
    link.addEventListener('click', function() {
        // Optionally close the accordion when a submenu item is clicked
        // Uncomment lines below if you want to close on navigation
        // const accordion = this.closest('.menu-accordion');
        // accordion?.classList.remove('active');
    });
});

// Chart.js - Patient Statistics Bar Chart
const barCtx = document.getElementById('barChart');
if (barCtx) {
    new Chart(barCtx, {
        type: 'bar',
        data: {
            labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
            datasets: [{
                label: 'Lượt khám',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#22c55e',
                borderColor: '#16a34a',
                borderWidth: 1,
                borderRadius: 6
            }, {
                label: 'Bệnh nhân',
                data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: '#3b82f6',
                borderColor: '#2563eb',
                borderWidth: 1,
                borderRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Chart.js - ICD Statistics
const icdCtx = document.getElementById('icdChart');
if (icdCtx) {
    new Chart(icdCtx, {
        type: 'doughnut',
        data: {
            labels: [],
            datasets: [{
                data: [],
                backgroundColor: [
                    '#ef4444',
                    '#f97316',
                    '#eab308',
                    '#22c55e',
                    '#3b82f6',
                    '#8b5cf6'
                ],
                borderColor: 'white',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom'
                }
            }
        }
    });
}

// Responsive sidebar for mobile
if (window.innerWidth <= 991) {
    document.getElementById('sidebar') ? .classList.remove('collapsed');
}