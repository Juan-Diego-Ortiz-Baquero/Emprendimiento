/**
 * AgroTrace Dashboard - Sistema Responsive Simplificado
 * Manejo de sidebar, menú hamburguesa y comportamiento responsive
 */

(function() {
  'use strict';

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    setupMobileHeader();
    setupSidebarToggle();
    setupResponsiveBehavior();
    setupTableResponsive();
    console.log('✅ Sistema responsive inicializado correctamente');
  }

  /**
   * Crear header móvil si no existe
   */
  function setupMobileHeader() {
    if (document.querySelector('.mobile-header')) return;

    const mobileHeader = document.createElement('div');
    mobileHeader.className = 'mobile-header';
    mobileHeader.innerHTML = `
      <button class="hamburger-btn" id="hamburgerBtn" aria-label="Toggle menu">
        <div class="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); display: flex; align-items: center; justify-content: center;">
          <i class="fas fa-cow" style="color: white; font-size: 16px;"></i>
        </div>
        <span style="font-weight: 700; font-size: 1.125rem; color: var(--color-text-primary);">AgroTrace</span>
      </div>
      <div style="width: 40px;"></div>
    `;

    document.body.insertBefore(mobileHeader, document.body.firstChild);
  }

  /**
   * Configurar toggle del sidebar
   */
  function setupSidebarToggle() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const sidebar = document.querySelector('.sidebar');
    
    if (!hamburgerBtn || !sidebar) return;

    // Crear overlay si no existe
    let overlay = document.querySelector('.sidebar-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      document.body.appendChild(overlay);
    }

    // Toggle sidebar con hamburger
    hamburgerBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleSidebar();
    });

    // Cerrar con overlay
    overlay.addEventListener('click', function() {
      closeSidebar();
    });

    // Cerrar sidebar al hacer click en enlaces (solo móvil)
    const navLinks = sidebar.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        if (window.innerWidth < 1024) {
          closeSidebar();
        }
      });
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeSidebar();
      }
    });

    function toggleSidebar() {
      const isOpen = sidebar.classList.contains('open');
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    function openSidebar() {
      sidebar.classList.add('open');
      hamburgerBtn.classList.add('active');
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      hamburgerBtn.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Ajustar comportamiento responsive según viewport
   */
  function setupResponsiveBehavior() {
    let resizeTimer;
    
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function() {
        handleResize();
      }, 250);
    });

    handleResize(); // Ejecutar al cargar

    function handleResize() {
      const width = window.innerWidth;
      const sidebar = document.querySelector('.sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      const hamburgerBtn = document.getElementById('hamburgerBtn');

      if (width >= 1024) {
        // Desktop: mostrar sidebar siempre
        if (sidebar) {
          sidebar.classList.remove('open');
        }
        if (overlay) {
          overlay.classList.remove('active');
        }
        if (hamburgerBtn) {
          hamburgerBtn.classList.remove('active');
        }
        document.body.style.overflow = '';
      } else {
        // Móvil/Tablet: ocultar sidebar por defecto
        if (sidebar && !sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
      }
    }
  }

  /**
   * Hacer tablas responsive
   */
  function setupTableResponsive() {
    const tables = document.querySelectorAll('.table');
    
    tables.forEach(table => {
      // Asegurar que la tabla esté dentro de un contenedor responsive
      if (!table.closest('.table-responsive')) {
        const wrapper = document.createElement('div');
        wrapper.className = 'table-responsive';
        table.parentNode.insertBefore(wrapper, table);
        wrapper.appendChild(table);
      }

      // Forzar estilos claros
      table.style.background = '#ffffff';
      table.style.color = '#1f2937';
      
      const thead = table.querySelector('thead');
      if (thead) {
        thead.style.background = '#f3f4f6';
      }

      const tbody = table.querySelector('tbody');
      if (tbody) {
        tbody.style.background = '#ffffff';
        
        const rows = tbody.querySelectorAll('tr');
        rows.forEach(row => {
          row.style.background = '#ffffff';
        });
      }
    });
  }

  /**
   * Utilidades globales
   */
  window.AgroTrace = window.AgroTrace || {};
  window.AgroTrace.responsive = {
    isMobile: function() {
      return window.innerWidth < 768;
    },
    isTablet: function() {
      return window.innerWidth >= 768 && window.innerWidth < 1024;
    },
    isDesktop: function() {
      return window.innerWidth >= 1024;
    },
    getBreakpoint: function() {
      const width = window.innerWidth;
      if (width < 480) return 'xs';
      if (width < 768) return 'sm';
      if (width < 1024) return 'md';
      if (width < 1280) return 'lg';
      return 'xl';
    }
  };

})();

/**
 * Inicializar DataTables con tema claro
 */
document.addEventListener('DOMContentLoaded', function() {
  // Si jQuery y DataTables están cargados
  if (typeof jQuery !== 'undefined' && typeof jQuery.fn.dataTable !== 'undefined') {
    // Configuración global de DataTables con tema claro
    jQuery.extend(jQuery.fn.dataTable.defaults, {
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
      },
      dom: '<"datatable-header"<"row"<"col-sm-6"l><"col-sm-6"f>>>rt<"datatable-footer"<"row"<"col-sm-5"i><"col-sm-7"p>>>',
      pageLength: 15,
      lengthMenu: [[10, 15, 25, 50, -1], [10, 15, 25, 50, "Todos"]],
      responsive: true,
      autoWidth: false,
      drawCallback: function() {
        // Forzar estilos claros después de cada renderizado
        const table = this.api().table().node();
        table.style.background = '#ffffff';
        
        const tbody = table.querySelector('tbody');
        if (tbody) {
          tbody.style.background = '#ffffff';
          tbody.querySelectorAll('tr').forEach(row => {
            row.style.background = '#ffffff';
          });
        }
      }
    });

    // Aplicar estilos claros a tablas existentes
    jQuery('.table').each(function() {
      const $table = jQuery(this);
      $table.css({
        'background': '#ffffff',
        'color': '#1f2937'
      });
      
      if (!$table.hasClass('dataTable')) {
        try {
          $table.DataTable();
        } catch (e) {
          console.log('Tabla ya inicializada o error:', e);
        }
      }
    });
  }

  // Forzar estilos claros en todas las tablas
  const allTables = document.querySelectorAll('.table, table');
  allTables.forEach(table => {
    table.style.setProperty('background', '#ffffff', 'important');
    table.style.setProperty('color', '#1f2937', 'important');
    
    const thead = table.querySelector('thead');
    if (thead) {
      thead.style.setProperty('background', '#f3f4f6', 'important');
    }
    
    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.style.setProperty('background', '#ffffff', 'important');
    }
  });

  console.log('✅ DataTables configurado con tema claro');
});
