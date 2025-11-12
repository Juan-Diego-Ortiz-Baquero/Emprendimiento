/**
 * AgroTrace Responsive Navigation Handler
 * Manages mobile menu, sidebar toggle, and responsive behaviors
 */

class ResponsiveNavigation {
  constructor() {
    this.sidebar = null;
    this.sidebarOverlay = null;
    this.hamburgerBtn = null;
    this.mainContent = null;
    this.isMobile = false;
    this.isTablet = false;
    
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.createMobileElements();
    this.cacheDOMElements();
    this.bindEvents();
    this.checkViewport();
  }

  createMobileElements() {
    // Create mobile header if it doesn't exist
    if (!document.querySelector('.mobile-header')) {
      const mobileHeader = document.createElement('div');
      mobileHeader.className = 'mobile-header';
      mobileHeader.innerHTML = `
        <div class="mobile-header-left">
          <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle menu">
            <div class="hamburger-icon">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </button>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
              <i class="fas fa-cow" style="color: white; font-size: 16px;"></i>
            </div>
            <span style="font-weight: 700; font-size: 1.125rem; color: var(--text-primary);">AgroTrace</span>
          </div>
        </div>
        <div class="mobile-header-right">
          <button class="btn-icon" id="mobileSearchBtn" aria-label="Search">
            <i class="fas fa-search"></i>
          </button>
          <button class="btn-icon" id="mobileNotificationsBtn" aria-label="Notifications">
            <i class="fas fa-bell"></i>
            <span class="notification-badge">3</span>
          </button>
        </div>
      `;
      document.body.insertBefore(mobileHeader, document.body.firstChild);
    }

    // Create sidebar overlay if it doesn't exist
    if (!document.querySelector('.sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.id = 'sidebarOverlay';
      document.body.appendChild(overlay);
    }
  }

  cacheDOMElements() {
    this.sidebar = document.querySelector('.sidebar');
    this.sidebarOverlay = document.getElementById('sidebarOverlay');
    this.hamburgerBtn = document.getElementById('hamburgerBtn');
    this.mainContent = document.querySelector('.main-content');
  }

  bindEvents() {
    // Hamburger button click
    if (this.hamburgerBtn) {
      this.hamburgerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleSidebar();
      });
    }

    // Overlay click to close sidebar
    if (this.sidebarOverlay) {
      this.sidebarOverlay.addEventListener('click', () => {
        this.closeSidebar();
      });
    }

    // Close sidebar when clicking on a navigation link (mobile)
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.isMobile || this.isTablet) {
          this.closeSidebar();
        }
      });
    });

    // Escape key to close sidebar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.sidebar?.classList.contains('open')) {
        this.closeSidebar();
      }
    });

    // Window resize handler
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.checkViewport();
      }, 250);
    });

    // Touch swipe to close sidebar
    this.setupSwipeGestures();
  }

  toggleSidebar() {
    if (!this.sidebar) return;

    const isOpen = this.sidebar.classList.contains('open');
    
    if (isOpen) {
      this.closeSidebar();
    } else {
      this.openSidebar();
    }
  }

  openSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.add('open');
    this.hamburgerBtn?.classList.add('active');
    this.sidebarOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Announce to screen readers
    this.sidebar.setAttribute('aria-hidden', 'false');
  }

  closeSidebar() {
    if (!this.sidebar) return;

    this.sidebar.classList.remove('open');
    this.hamburgerBtn?.classList.remove('active');
    this.sidebarOverlay?.classList.remove('active');
    document.body.style.overflow = '';

    // Announce to screen readers
    this.sidebar.setAttribute('aria-hidden', 'true');
  }

  checkViewport() {
    const width = window.innerWidth;
    
    this.isMobile = width < 768;
    this.isTablet = width >= 768 && width < 1024;

    if (width >= 1024) {
      // Desktop: Always show sidebar
      this.sidebar?.classList.remove('open');
      this.sidebarOverlay?.classList.remove('active');
      this.hamburgerBtn?.classList.remove('active');
      document.body.style.overflow = '';
      this.sidebar?.setAttribute('aria-hidden', 'false');
    } else {
      // Mobile/Tablet: Hide sidebar by default
      this.sidebar?.classList.remove('open');
      this.sidebar?.setAttribute('aria-hidden', 'true');
    }

    // Update body class for CSS hooks
    document.body.classList.toggle('mobile-view', this.isMobile);
    document.body.classList.toggle('tablet-view', this.isTablet);
    document.body.classList.toggle('desktop-view', !this.isMobile && !this.isTablet);
  }

  setupSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    }, { passive: true });

    const handleSwipe = () => {
      const swipeThreshold = 50;
      const swipeDistance = touchEndX - touchStartX;

      // Swipe right to open (from left edge)
      if (touchStartX < 20 && swipeDistance > swipeThreshold) {
        this.openSidebar();
      }

      // Swipe left to close
      if (this.sidebar?.classList.contains('open') && swipeDistance < -swipeThreshold) {
        this.closeSidebar();
      }
    };

    this.handleSwipe = handleSwipe;
  }
}

/**
 * Responsive Table Handler
 * Converts tables to card layout on mobile
 */
class ResponsiveTable {
  constructor(tableSelector) {
    this.tables = document.querySelectorAll(tableSelector);
    this.init();
  }

  init() {
    if (this.tables.length === 0) return;

    this.tables.forEach(table => {
      this.convertTableToCards(table);
    });

    // Re-convert on resize
    window.addEventListener('resize', this.debounce(() => {
      this.tables.forEach(table => {
        this.updateTableView(table);
      });
    }, 250));
  }

  convertTableToCards(table) {
    const wrapper = table.closest('.table-responsive');
    if (!wrapper) return;

    // Create card container
    const cardContainer = document.createElement('div');
    cardContainer.className = 'table-card';
    
    const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      const card = this.createCard(headers, cells, row);
      cardContainer.appendChild(card);
    });

    // Insert after table
    wrapper.appendChild(cardContainer);

    // Initial view check
    this.updateTableView(table);
  }

  createCard(headers, cells, originalRow) {
    const card = document.createElement('div');
    card.className = 'table-card-item';

    let cardHTML = '<div class="table-card-body">';

    cells.forEach((cell, index) => {
      if (index < headers.length) {
        cardHTML += `
          <div class="table-card-row">
            <span class="table-card-label">${headers[index]}</span>
            <span class="table-card-value">${cell.innerHTML}</span>
          </div>
        `;
      }
    });

    cardHTML += '</div>';

    // Copy action buttons if they exist
    const actionCell = Array.from(cells).find(cell => 
      cell.querySelector('.btn') || cell.classList.contains('actions')
    );

    if (actionCell) {
      cardHTML += `<div class="table-card-actions">${actionCell.innerHTML}</div>`;
    }

    card.innerHTML = cardHTML;

    // Copy data attributes
    Array.from(originalRow.attributes).forEach(attr => {
      if (attr.name.startsWith('data-')) {
        card.setAttribute(attr.name, attr.value);
      }
    });

    return card;
  }

  updateTableView(table) {
    const wrapper = table.closest('.table-responsive');
    const cardContainer = wrapper?.querySelector('.table-card');
    
    if (!wrapper || !cardContainer) return;

    const isMobile = window.innerWidth < 768;

    if (isMobile) {
      wrapper.style.display = 'none';
      cardContainer.style.display = 'block';
    } else {
      wrapper.style.display = 'block';
      cardContainer.style.display = 'none';
    }
  }

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
  }
}

/**
 * Responsive Utilities
 */
class ResponsiveUtils {
  static getBreakpoint() {
    const width = window.innerWidth;
    
    if (width < 640) return 'xs';
    if (width < 768) return 'sm';
    if (width < 1024) return 'md';
    if (width < 1280) return 'lg';
    if (width < 1536) return 'xl';
    return '2xl';
  }

  static isMobile() {
    return window.innerWidth < 768;
  }

  static isTablet() {
    return window.innerWidth >= 768 && window.innerWidth < 1024;
  }

  static isDesktop() {
    return window.innerWidth >= 1024;
  }

  static isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // Smooth scroll to element
  static scrollToElement(element, offset = 0) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    if (!element) return;

    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }

  // Lock body scroll (for modals, etc.)
  static lockScroll() {
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${this.getScrollbarWidth()}px`;
  }

  // Unlock body scroll
  static unlockScroll() {
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }

  // Get scrollbar width
  static getScrollbarWidth() {
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll';
    document.body.appendChild(outer);

    const inner = document.createElement('div');
    outer.appendChild(inner);

    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;
    outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  // Debounce function
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Throttle function
  static throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initResponsive);
} else {
  initResponsive();
}

function initResponsive() {
  // Initialize responsive navigation
  window.responsiveNav = new ResponsiveNavigation();

  // Initialize responsive tables
  window.responsiveTables = new ResponsiveTable('.table');

  // Add responsive utilities to global scope
  window.ResponsiveUtils = ResponsiveUtils;

  // Add viewport class to body
  updateViewportClass();
  window.addEventListener('resize', ResponsiveUtils.debounce(updateViewportClass, 250));
}

function updateViewportClass() {
  const breakpoint = ResponsiveUtils.getBreakpoint();
  document.body.className = document.body.className
    .replace(/breakpoint-\w+/g, '')
    .trim();
  document.body.classList.add(`breakpoint-${breakpoint}`);
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ResponsiveNavigation,
    ResponsiveTable,
    ResponsiveUtils
  };
}
