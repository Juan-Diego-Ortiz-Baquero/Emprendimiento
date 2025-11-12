/*=============== AGROTRACE DASHBOARD JAVASCRIPT ===============*/

// ===== GLOBAL VARIABLES =====
let currentView = 'dashboard';
let dashboardData = {};
let charts = {};

// ===== DOM ELEMENTS =====
const loadingScreen = document.getElementById('loading-screen');
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebar-toggle');
const navLinks = document.querySelectorAll('.nav-link');
const views = document.querySelectorAll('.view');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

async function initializeApp() {
    // Show loading screen
    showLoadingScreen();
    
    // Simulate system initialization
    await simulateSystemInit();
    
    // Load dashboard data
    await loadDashboardData();
    
    // Initialize UI components
    initializeSidebar();
    initializeNavigation();
    initializeCharts();
    
    // Hide loading screen and show dashboard
    hideLoadingScreen();
    showView('dashboard');
    
    // Start real-time updates
    startRealTimeUpdates();
}

// ===== LOADING SCREEN =====
function showLoadingScreen() {
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
}

function hideLoadingScreen() {
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 2000);
    }
}

async function simulateSystemInit() {
    const steps = [
        'Iniciando sistema RFID...',
        'Conectando con base de datos...',
        'Sincronizando dispositivos...',
        'Cargando datos del ganado...'
    ];
    
    const loadingText = document.querySelector('.loading-text p');
    
    for (let i = 0; i < steps.length; i++) {
        if (loadingText) {
            loadingText.textContent = steps[i];
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// ===== SIDEBAR FUNCTIONALITY =====
function initializeSidebar() {
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Handle mobile responsiveness
    handleResponsiveSidebar();
    window.addEventListener('resize', handleResponsiveSidebar);
}

function toggleSidebar() {
    if (sidebar) {
        sidebar.classList.toggle('collapsed');
    }
}

function handleResponsiveSidebar() {
    if (window.innerWidth <= 768) {
        sidebar?.classList.add('mobile');
    } else {
        sidebar?.classList.remove('mobile');
    }
}

// ===== NAVIGATION =====
function initializeNavigation() {
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const viewName = link.getAttribute('data-view');
            if (viewName) {
                showView(viewName);
                setActiveNavLink(link);
            }
        });
    });
}

function showView(viewName) {
    // Hide all views
    views.forEach(view => {
        view.classList.remove('active');
    });
    
    // Show selected view
    const targetView = document.getElementById(`${viewName}-view`);
    if (targetView) {
        targetView.classList.add('active');
        currentView = viewName;
        
        // Update breadcrumb
        updateBreadcrumb(viewName);
        
        // Load view-specific data
        loadViewData(viewName);
    }
}

function setActiveNavLink(activeLink) {
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeLink.classList.add('active');
}

function updateBreadcrumb(viewName) {
    const breadcrumbActive = document.querySelector('.breadcrumb-item.active');
    if (breadcrumbActive) {
        const viewNames = {
            'dashboard': 'Dashboard',
            'animals': 'Gestión de Ganado',
            'health': 'Control Sanitario',
            'traceability': 'Trazabilidad',
            'reports': 'Reportes',
            'settings': 'Configuración'
        };
        breadcrumbActive.textContent = viewNames[viewName] || 'Dashboard';
    }
}

// ===== DATA LOADING =====
async function loadDashboardData() {
    try {
        const response = await fetch('/api/dashboard-stats');
        if (response.ok) {
            dashboardData = await response.json();
            updateDashboardStats(dashboardData.stats);
            updateActivityFeed(dashboardData.activity);
        }
    } catch (error) {
        console.warn('Using simulated data due to API error:', error);
        dashboardData = getSimulatedData();
        updateDashboardStats(dashboardData.stats);
        updateActivityFeed(dashboardData.activity);
    }
}

async function loadViewData(viewName) {
    switch (viewName) {
        case 'animals':
            await loadAnimalsData();
            break;
        case 'health':
            await loadHealthData();
            break;
        case 'traceability':
            await loadTraceabilityData();
            break;
        case 'reports':
            await loadReportsData();
            break;
        default:
            break;
    }
}

// ===== DASHBOARD STATS =====
function updateDashboardStats(stats) {
    if (!stats) return;
    
    // Update stat cards
    updateStatCard('total-animals', stats.total_animals, '+12', 'positive');
    updateStatCard('healthy-animals', stats.healthy_animals, '+5', 'positive');
    updateStatCard('alerts', stats.alerts, '-2', 'positive');
    updateStatCard('locations', stats.locations, '0', 'neutral');
}

function updateStatCard(cardId, value, change, changeType) {
    const card = document.getElementById(cardId);
    if (!card) return;
    
    const valueElement = card.querySelector('.stat-value');
    const changeElement = card.querySelector('.stat-change');
    
    if (valueElement) {
        // Animate number change
        animateNumber(valueElement, parseInt(valueElement.textContent) || 0, value);
    }
    
    if (changeElement) {
        changeElement.innerHTML = `<i class="fas fa-arrow-${changeType === 'positive' ? 'up' : 'down'}"></i> ${change}`;
        changeElement.className = `stat-change ${changeType}`;
    }
}

function animateNumber(element, from, to) {
    const duration = 1000;
    const steps = 20;
    const increment = (to - from) / steps;
    let current = from;
    let step = 0;
    
    const timer = setInterval(() => {
        current += increment;
        element.textContent = Math.round(current);
        step++;
        
        if (step >= steps) {
            element.textContent = to;
            clearInterval(timer);
        }
    }, duration / steps);
}

// ===== ACTIVITY FEED =====
function updateActivityFeed(activities) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList || !activities) return;
    
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityList.appendChild(activityItem);
    });
}

function createActivityItem(activity) {
    const item = document.createElement('li');
    item.className = 'activity-item';
    
    const iconClass = getActivityIconClass(activity.type);
    
    item.innerHTML = `
        <div class="activity-icon ${activity.type}">
            <i class="${iconClass}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">${activity.description}</div>
            <div class="activity-time">${formatTimeAgo(activity.timestamp)}</div>
        </div>
    `;
    
    return item;
}

function getActivityIconClass(type) {
    const iconMap = {
        'scan': 'fas fa-wifi',
        'health': 'fas fa-heart-pulse',
        'movement': 'fas fa-location-dot',
        'alert': 'fas fa-exclamation-triangle'
    };
    return iconMap[type] || 'fas fa-info-circle';
}

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Ahora mismo';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
}

// ===== CHARTS =====
function initializeCharts() {
    initializeActivityChart();
    initializeHealthChart();
}

function initializeActivityChart() {
    const canvas = document.getElementById('activity-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    charts.activity = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Lecturas RFID',
                data: [120, 150, 180, 140, 200, 160, 190],
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initializeHealthChart() {
    const canvas = document.getElementById('health-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    charts.health = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Saludable', 'Observación', 'Tratamiento'],
            datasets: [{
                data: [85, 10, 5],
                backgroundColor: [
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// ===== ANIMALS DATA =====
async function loadAnimalsData() {
    try {
        const response = await fetch('/api/animals');
        if (response.ok) {
            const data = await response.json();
            updateAnimalsTable(data.animals);
        }
    } catch (error) {
        console.warn('Using simulated animals data:', error);
        updateAnimalsTable(getSimulatedAnimals());
    }
}

function updateAnimalsTable(animals) {
    const tableBody = document.querySelector('#animals-table tbody');
    if (!tableBody || !animals) return;
    
    tableBody.innerHTML = '';
    
    animals.slice(0, 10).forEach(animal => {
        const row = createAnimalRow(animal);
        tableBody.appendChild(row);
    });
}

function createAnimalRow(animal) {
    const row = document.createElement('tr');
    
    const statusClass = animal.health_status.toLowerCase().replace(' ', '-');
    const statusText = animal.health_status;
    
    row.innerHTML = `
        <td>
            <div style="font-family: var(--font-mono); font-weight: 500;">
                ${animal.rfid_id}
            </div>
        </td>
        <td>${animal.breed}</td>
        <td>${animal.location}</td>
        <td>
            <span class="status-badge ${statusClass}">
                ${statusText}
            </span>
        </td>
        <td>${formatDate(animal.last_scan)}</td>
        <td>
            <button class="action-btn" onclick="viewAnimalDetails('${animal.rfid_id}')">
                <i class="fas fa-eye"></i>
            </button>
        </td>
    `;
    
    return row;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// ===== SEARCH FUNCTIONALITY =====
function initializeSearch() {
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    // Implement search functionality based on current view
    console.log('Searching for:', query);
}

// ===== REAL-TIME UPDATES =====
function startRealTimeUpdates() {
    // Update dashboard every 30 seconds
    setInterval(async () => {
        if (currentView === 'dashboard') {
            await loadDashboardData();
        }
    }, 30000);
    
    // Simulate random activity updates
    setInterval(() => {
        addRandomActivity();
    }, 10000);
}

function addRandomActivity() {
    const activities = [
        { type: 'scan', description: 'Animal RF001234 escaneado en Corral A', timestamp: new Date() },
        { type: 'movement', description: 'Movimiento detectado en Sector Norte', timestamp: new Date() },
        { type: 'health', description: 'Chequeo veterinario programado', timestamp: new Date() }
    ];
    
    const randomActivity = activities[Math.floor(Math.random() * activities.length)];
    
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        const newItem = createActivityItem(randomActivity);
        activityList.insertBefore(newItem, activityList.firstChild);
        
        // Remove oldest item if too many
        if (activityList.children.length > 10) {
            activityList.removeChild(activityList.lastChild);
        }
    }
}

// ===== UTILITY FUNCTIONS =====
function getSimulatedData() {
    return {
        stats: {
            total_animals: 156,
            healthy_animals: 142,
            alerts: 3,
            locations: 8
        },
        activity: [
            {
                type: 'scan',
                description: 'Animal RF001234 escaneado en Corral A',
                timestamp: new Date(Date.now() - 5 * 60000)
            },
            {
                type: 'health',
                description: 'Vacunación completada para lote 15',
                timestamp: new Date(Date.now() - 15 * 60000)
            },
            {
                type: 'movement',
                description: 'Traslado a Sector Norte completado',
                timestamp: new Date(Date.now() - 30 * 60000)
            }
        ]
    };
}

function getSimulatedAnimals() {
    return [
        {
            rfid_id: 'RF001234',
            breed: 'Holstein',
            location: 'Corral A',
            health_status: 'Saludable',
            last_scan: new Date(Date.now() - 60000)
        },
        {
            rfid_id: 'RF001235',
            breed: 'Angus',
            location: 'Sector Norte',
            health_status: 'Observación',
            last_scan: new Date(Date.now() - 120000)
        }
    ];
}

// ===== ACTION HANDLERS =====
function viewAnimalDetails(rfidId) {
    console.log('Viewing details for animal:', rfidId);
    // Implement animal details modal or navigation
}

function handleQuickAction(action) {
    console.log('Quick action:', action);
    // Implement quick actions
}

// ===== RESPONSIVE HANDLERS =====
window.addEventListener('resize', () => {
    // Resize charts
    Object.values(charts).forEach(chart => {
        if (chart) {
            chart.resize();
        }
    });
});

// ===== NOTIFICATIONS =====
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
};

// ===== RFID NETWORK ANIMATION =====
const animateRFIDNetwork = () => {
    const nodes = document.querySelectorAll('.rfid-node');
    const lines = document.querySelectorAll('.connection-line');
    
    // Animar nodos con retraso
    nodes.forEach((node, index) => {
        const delay = node.getAttribute('data-delay') || index * 200;
        setTimeout(() => {
            node.style.animation = `float 3s ease-in-out infinite`;
            node.style.animationDelay = `${delay}ms`;
        }, delay);
    });
    
    // Animar líneas de conexión
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.style.animation = `pulse-line 2s ease-in-out infinite`;
            line.style.animationDelay = `${index * 500}ms`;
        }, 1000);
    });
};

// ===== COUNTER ANIMATION =====
const animateCounters = () => {
    const counters = document.querySelectorAll('.stat__number, .metric__number');
    
    counters.forEach(counter => {
        const target = counter.textContent;
        const isPercentage = target.includes('%');
        const isPlus = target.includes('+');
        const numericValue = parseInt(target.replace(/[^\d]/g, ''));
        
        if (!isNaN(numericValue)) {
            let current = 0;
            const increment = numericValue / 100;
            const timer = setInterval(() => {
                current += increment;
                if (current >= numericValue) {
                    current = numericValue;
                    clearInterval(timer);
                }
                
                let displayValue = Math.floor(current);
                if (isPlus) displayValue = '+' + displayValue;
                if (isPercentage) displayValue += '%';
                
                counter.textContent = displayValue;
            }, 20);
        }
    });
};

// ===== FORM VALIDATION AND SUBMISSION =====
if (demoForm) {
    demoForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Obtener datos del formulario
        const formData = new FormData(demoForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            company: formData.get('company'),
            message: formData.get('message')
        };
        
        // Validación básica
        if (!data.name || !data.email) {
            showModal('Por favor completa todos los campos requeridos.', 'error');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showModal('Por favor ingresa un email válido.', 'error');
            return;
        }
        
        // Simular envío
        const submitButton = demoForm.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitButton.disabled = true;
        
        try {
            // Simular llamada a API
            const response = await fetch('/demo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showModal(result.message || `¡Gracias ${data.name}! Hemos recibido tu solicitud. Te contactaremos pronto.`, 'success');
                demoForm.reset();
            } else {
                showModal('Hubo un error al enviar tu solicitud. Por favor intenta nuevamente.', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showModal(`¡Gracias ${data.name}! Tu solicitud ha sido registrada. Nos pondremos en contacto contigo pronto.`, 'success');
            demoForm.reset();
        }
        
        // Restaurar botón
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;
    });
}

// ===== MODAL FUNCTIONS =====
const showModal = (message, type = 'success') => {
    const modalIcon = modal.querySelector('.modal__icon');
    const modalTitle = modal.querySelector('.modal__title');
    
    modalMessage.textContent = message;
    
    if (type === 'success') {
        modalIcon.className = 'fas fa-check-circle modal__icon';
        modalIcon.style.color = 'var(--primary-color)';
        modalTitle.textContent = '¡Solicitud enviada!';
    } else {
        modalIcon.className = 'fas fa-exclamation-circle modal__icon';
        modalIcon.style.color = '#ff6b6b';
        modalTitle.textContent = 'Error';
    }
    
    modal.classList.add('show');
};

const closeModal = () => {
    modal.classList.remove('show');
};

// Cerrar modal al hacer clic fuera
modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// ===== PARALLAX EFFECT =====
const parallaxElements = document.querySelectorAll('.hero__bg');

const handleParallax = () => {
    const scrolled = window.pageYOffset;
    const rate = scrolled * -0.5;
    
    parallaxElements.forEach(element => {
        element.style.transform = `translateY(${rate}px)`;
    });
};

// ===== TYPING ANIMATION =====
const typeWriter = (element, text, speed = 50) => {
    if (!element) return;
    
    element.textContent = '';
    let i = 0;
    
    const type = () => {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    };
    
    type();
};

// ===== DASHBOARD ANIMATION =====
const animateDashboard = () => {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animar elementos del dashboard
                const stats = dashboard.querySelectorAll('.stat');
                stats.forEach((stat, index) => {
                    setTimeout(() => {
                        stat.style.animation = 'fadeInUp 0.6s ease forwards';
                    }, index * 200);
                });
                
                // Animar contadores
                setTimeout(() => {
                    animateCounters();
                }, 500);
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    observer.observe(dashboard);
};

// ===== CARD HOVER EFFECTS =====
const initCardEffects = () => {
    const cards = document.querySelectorAll('.problema__card, .beneficio__card, .step');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
};

// ===== PROGRESSIVE LOADING =====
const progressiveLoad = () => {
    const elements = document.querySelectorAll('[data-aos]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                const delay = element.getAttribute('data-aos-delay') || 0;
                
                setTimeout(() => {
                    element.classList.add('fade-in', 'visible');
                }, delay);
                
                observer.unobserve(element);
            }
        });
    }, { threshold: 0.1 });
    
    elements.forEach(element => {
        element.classList.add('fade-in');
        observer.observe(element);
    });
};

// ===== PRELOADER PARA IMÁGENES =====
const preloadImages = () => {
    const images = document.querySelectorAll('img');
    let loadedImages = 0;
    
    if (images.length === 0) return;
    
    images.forEach(img => {
        if (img.complete) {
            loadedImages++;
        } else {
            img.addEventListener('load', () => {
                loadedImages++;
                if (loadedImages === images.length) {
                    document.body.classList.add('images-loaded');
                }
            });
        }
    });
    
    if (loadedImages === images.length) {
        document.body.classList.add('images-loaded');
    }
};

// ===== PERFORMANCE OPTIMIZATION =====
let ticking = false;

const optimizedScroll = () => {
    if (!ticking) {
        requestAnimationFrame(() => {
            scrollActive();
            scrollHeader();
            scrollReveal();
            handleParallax();
            ticking = false;
        });
        ticking = true;
    }
};

// ===== INITIALIZATION =====
const initAnimations = () => {
    // Inicializar AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease-in-out',
            once: true,
            offset: 100
        });
    }
    
    // Inicializar todas las animaciones
    progressiveLoad();
    animateRFIDNetwork();
    animateDashboard();
    initCardEffects();
    preloadImages();
    
    // Animación inicial del hero
    setTimeout(() => {
        const heroContent = document.querySelector('.hero__content');
        if (heroContent) {
            heroContent.style.animation = 'fadeInUp 1s ease forwards';
        }
    }, 500);
    
    // Efectos de partículas en el hero (opcional)
    createParticles();
};

// ===== PARTICLE SYSTEM =====
const createParticles = () => {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particles';
    particleContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
    `;
    
    hero.appendChild(particleContainer);
    
    // Crear partículas
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 255, 136, 0.5);
            border-radius: 50%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        
        particleContainer.appendChild(particle);
    }
};

// ===== ACCESSIBILITY =====
const initAccessibility = () => {
    // Navegación con teclado
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navMenu.classList.remove('show-menu');
            closeModal();
        }
    });
    
    // Focus trap en modal
    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            
            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    });
};

// ===== EVENT LISTENERS =====
window.addEventListener('scroll', optimizedScroll);
window.addEventListener('resize', () => {
    // Recalcular animaciones en resize
    setTimeout(() => {
        animateRFIDNetwork();
    }, 100);
});

// ===== CSS ANIMATIONS (añadir al final del archivo) =====
const addCustomStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideInLeft {
            from {
                opacity: 0;
                transform: translateX(-50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(50px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        .particle {
            animation: particleFloat 6s ease-in-out infinite !important;
        }
        
        @keyframes particleFloat {
            0%, 100% {
                transform: translateY(0px) rotate(0deg);
                opacity: 0.5;
            }
            50% {
                transform: translateY(-20px) rotate(180deg);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
};

// ===== INICIALIZACIÓN FINAL =====
document.addEventListener('DOMContentLoaded', () => {
    addCustomStyles();
    initAccessibility();
});

// Exponer función closeModal globalmente para el HTML
window.closeModal = closeModal;

// ===== CONSOLE EASTER EGG =====
console.log(`
%c🚀 AgroTrace System %c
%c💚 Desarrollado con amor por Santiago Valenzuela & Juan Ortiz
%c🎯 Facultad de Ciencias de Sistemas
%c📱 ¿Interesado en el código? ¡Contáctanos!
`, 
'color: #00FF88; font-size: 20px; font-weight: bold;',
'',
'color: #00FF88; font-size: 14px;',
'color: #FFA733; font-size: 12px;',
'color: #666; font-size: 12px;'
);
