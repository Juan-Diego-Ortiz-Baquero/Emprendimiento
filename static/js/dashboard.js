/**
 * ═══════════════════════════════════════════════════════════════
 * AGROTRACE DASHBOARD v3.0.0 - JavaScript Utilities
 * ═══════════════════════════════════════════════════════════════
 * Professional Administrative Dashboard for Livestock Management
 * Built with: Vanilla JavaScript, Chart.js, DataTables.js, Alpine.js
 * Framework: Tailwind CSS, Flowbite
 * 
 * @author AgroTrace Development Team
 * @version 3.0.0
 * @date November 2024
 * ═══════════════════════════════════════════════════════════════
 * 
 * NOTE: This file provides utility functions alongside Alpine.js
 * The main dashboard logic is handled by Alpine.js in index.html
 * This file extends with helpers, formatters, and legacy compatibility
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION & CONSTANTS
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
    API_BASE_URL: '/api',
    REFRESH_INTERVAL: 30000, // 30 seconds
    CHART_COLORS: {
        primary: 'rgb(34, 197, 94)',      // Green
        warning: 'rgb(234, 179, 8)',      // Yellow
        danger: 'rgb(239, 68, 68)',       // Red
        info: 'rgb(59, 130, 246)',        // Blue
        gray: 'rgb(156, 163, 175)'        // Gray
    },
    BREEDS: [
        'Holstein', 'Brahman', 'Angus', 'Hereford', 'Simmental',
        'Charolais', 'Jersey', 'Limousin', 'Gyr', 'Nelore'
    ],
    LOCATIONS: [
        'Potrero A', 'Potrero B', 'Potrero C', 'Corral 1',
        'Corral 2', 'Área de cuarentena', 'Establo principal', 'Zona de ordeño'
    ]
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL STATE (Minimal - Alpine.js handles most state)
// ═══════════════════════════════════════════════════════════════
const AppState = {
    initialized: false,
    lastUpdate: null
};

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════
const Utils = {
    /**
     * Format date to locale string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Format time to locale string
     */
    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    },

    /**
     * Format date and time together
     */
    formatDateTime(dateString) {
        return `${this.formatDate(dateString)} ${this.formatTime(dateString)}`;
    },

    /**
     * Calculate time ago from timestamp
     */
    timeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        const intervals = {
            año: 31536000,
            mes: 2592000,
            semana: 604800,
            día: 86400,
            hora: 3600,
            minuto: 60
        };

        for (const [name, value] of Object.entries(intervals)) {
            const interval = Math.floor(seconds / value);
            if (interval >= 1) {
                return `hace ${interval} ${name}${interval > 1 ? 's' : ''}`;
            }
        }

        return 'justo ahora';
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format number with thousands separator
     */
    formatNumber(number) {
        return new Intl.NumberFormat('es-ES').format(number);
    },

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    /**
     * Validate RFID tag format
     */
    isValidRFID(rfid) {
        return /^RFID_[A-Z0-9]{8}$/.test(rfid);
    },

    /**
     * Generate random RFID tag
     */
    generateRFID() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let rfid = 'RFID_';
        for (let i = 0; i < 8; i++) {
            rfid += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return rfid;
    }
};

// ═══════════════════════════════════════════════════════════════
// NOTIFICATION SYSTEM
// ═══════════════════════════════════════════════════════════════
const Notifications = {
    /**
     * Show notification toast
     */
    show(message, type = 'info', duration = 4000) {
        const toast = document.getElementById('notification-toast');
        
        if (!toast) {
            // Create inline notification if toast doesn't exist
            this.createInlineNotification(message, type, duration);
            return;
        }
        
        const toastTitle = toast.querySelector('.toast-title');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon i');
        
        // Update content
        if (toastTitle) {
            const titles = {
                success: '✓ Éxito',
                error: '✗ Error',
                warning: '⚠ Advertencia',
                info: 'ℹ Información'
            };
            toastTitle.textContent = titles[type] || titles.info;
        }
        
        if (toastMessage) toastMessage.textContent = message;
        
        if (toastIcon) {
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-times-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            toastIcon.className = icons[type] || icons.info;
        }
        
        // Show toast
        toast.classList.add('show');
        
        // Auto-hide
        setTimeout(() => toast.classList.remove('show'), duration);
    },

    /**
     * Create inline notification when toast element doesn't exist
     */
    createInlineNotification(message, type, duration) {
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type] || colors.info};
            color: white;
            padding: 14px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-size: 14px;
            max-width: 350px;
            font-weight: 500;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, duration);
    },

    success(message, duration) {
        this.show(message, 'success', duration);
    },

    error(message, duration) {
        this.show(message, 'error', duration);
    },

    warning(message, duration) {
        this.show(message, 'warning', duration);
    },

    info(message, duration) {
        this.show(message, 'info', duration);
    }
};

// ═══════════════════════════════════════════════════════════════
// GLOBAL ACTION HANDLERS (for onclick attributes)
// ═══════════════════════════════════════════════════════════════

/**
 * View animal details
 */
function viewAnimalDetails(rfidTag) {
    console.log('👁 View animal:', rfidTag);
    Notifications.info(`Ver detalles: ${rfidTag}`);
    
    // TODO: Implement modal or detail view
    // For now, show alert
    alert(`📋 Detalles del Animal\n\nID RFID: ${rfidTag}\n\n✨ Funcionalidad completa disponible en desarrollo`);
}

/**
 * Edit animal
 */
function editAnimal(rfidTag) {
    console.log('✏ Edit animal:', rfidTag);
    Notifications.info(`Editar: ${rfidTag}`);
    
    // TODO: Implement edit form
    alert(`✏ Editar Animal\n\nID RFID: ${rfidTag}\n\n✨ Formulario de edición en desarrollo`);
}

/**
 * Delete animal
 */
function deleteAnimal(rfidTag) {
    console.log('🗑 Delete animal:', rfidTag);
    
    const confirmed = confirm(`¿Está seguro que desea eliminar el animal ${rfidTag}?\n\nEsta acción no se puede deshacer.`);
    
    if (confirmed) {
        Notifications.success(`Animal ${rfidTag} eliminado correctamente`);
        // TODO: Implement actual deletion
    }
}

/**
 * Quick action handler
 */
function handleQuickAction(action) {
    console.log('⚡ Quick action:', action);
    
    const actions = {
        'nuevo-animal': '➕ Registrar nuevo animal',
        'escanear-rfid': '📡 Iniciar escaneo RFID',
        'registro-salud': '💉 Registro sanitario',
        'generar-reporte': '📊 Generar reporte'
    };
    
    const actionName = actions[action] || action;
    Notifications.info(actionName);
}

// ═══════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════

// Close toast on button click
document.addEventListener('click', (e) => {
    if (e.target.closest('.toast-close')) {
        const toast = document.getElementById('notification-toast');
        if (toast) toast.classList.remove('show');
    }
});

// Handle Escape key to close modals/toasts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const toast = document.getElementById('notification-toast');
        if (toast && toast.classList.contains('show')) {
            toast.classList.remove('show');
        }
    }
});

// ═══════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', function() {
    // ASCII Art Banner
    console.log('%c╔══════════════════════════════════════════════════╗', 'color: #22c55e');
    console.log('%c║  🐄 AgroTrace Dashboard v3.0.0                 ║', 'color: #22c55e; font-weight: bold');
    console.log('%c║  Professional Livestock Management System      ║', 'color: #22c55e');
    console.log('%c╚══════════════════════════════════════════════════╝', 'color: #22c55e');
    console.log('');
    console.log('✓ Dashboard utilities loaded');
    console.log('✓ Alpine.js handles primary functionality');
    console.log('✓ Utility functions available via window.AgroTrace');
    console.log('');
    
    // Mark as initialized
    AppState.initialized = true;
    AppState.lastUpdate = new Date();
    
    // Add CSS animations if not already present
    if (!document.querySelector('#agrotrace-animations')) {
        const style = document.createElement('style');
        style.id = 'agrotrace-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
});

// ═══════════════════════════════════════════════════════════════
// EXPORT FOR GLOBAL ACCESS
// ═══════════════════════════════════════════════════════════════
window.AgroTrace = window.AgroTrace || {};
window.AgroTrace.Utils = Utils;
window.AgroTrace.CONFIG = CONFIG;
window.AgroTrace.AppState = AppState;
window.AgroTrace.Notifications = Notifications;

// Export individual action handlers
window.viewAnimalDetails = viewAnimalDetails;
window.editAnimal = editAnimal;
window.deleteAnimal = deleteAnimal;
window.handleQuickAction = handleQuickAction;

console.log('✓ AgroTrace utilities exported to window');
console.log('✓ Ready for use');
