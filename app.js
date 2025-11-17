/* =====================================================================
   app.js - Main Application Logic
   ===================================================================== */

(function() {
  
  document.addEventListener('DOMContentLoaded', function () {
    initCursor();
    initMobileNav();    // Controls main menu
    initTimeline();     // Controls Timeline, Explore, and At a Glance
    initArticleModals(); // Controls In-Depth and Culture articles
    initSkipLink();
  });

  /**
   * 1. Custom Cursor
   */
  function initCursor() {
    if (!window.matchMedia("(pointer: fine)").matches) {
      return;
    }
    document.body.classList.add('desktop-cursor-only');
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    cursorDot.style.display = 'block';
    cursorOutline.style.display = 'block';
    window.addEventListener('mousemove', (e) => {
      const posX = e.clientX;
      const posY = e.clientY;
      cursorDot.style.left = `${posX}px`;
      cursorDot.style.top = `${posY}px`;
      cursorOutline.animate(
        { left: `${posX}px`, top: `${posY}px` },
        { duration: 500, fill: "forwards" }
      );
    });
    const interactives = document.querySelectorAll('a, button, .timeline__toggle, .card');
    interactives.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
  }


  /**
   * 2. Mobile Navigation
   */
  
  let menuOpen = false;
  let navToggle, navMenu, navLinks;

  function toggleMenu(forceClose = false) {
    if (forceClose && !menuOpen) return;
    menuOpen = forceClose ? false : !menuOpen;
    
    navToggle.setAttribute('aria-expanded', menuOpen);
    navMenu.classList.toggle('nav--visible', menuOpen); 

    const overflowValue = menuOpen ? 'hidden' : '';
    document.body.style.overflow = overflowValue;
    document.documentElement.style.overflow = overflowValue;

    if (menuOpen && navLinks.length > 0) {
      navLinks.forEach((link, index) => {
        link.style.setProperty('--i', index);
      });
      navLinks[0].focus();
    }
  }

  function initMobileNav() {
    navToggle = document.querySelector('.header__toggle');
    navMenu = document.querySelector('.nav');
    if (!navToggle || !navMenu) return; 

    navLinks = navMenu.querySelectorAll('.nav__link');

    navToggle.addEventListener('click', () => toggleMenu());

    document.addEventListener('keydown', (e) => {
      if (menuOpen && e.key === 'Escape') {
        toggleMenu(true); 
        navToggle.focus(); 
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        // Scroll if not a modal link
        if (menuOpen && !link.classList.contains('modal-trigger')) {
          e.preventDefault();
          const href = link.getAttribute('href');
          const targetElement = document.querySelector(href);
          
          if (targetElement) {
            targetElement.scrollIntoView();
          }
          toggleMenu(true); 
        }
      });
    });
    
    navMenu.addEventListener('keydown', (e) => {
      if (!menuOpen || e.key !== 'Tab' || navLinks.length === 0) return;
      const firstLink = navLinks[0];
      const lastLink = navLinks[navLinks.length - 1];
      if (e.shiftKey && document.activeElement === firstLink) {
        e.preventDefault(); lastLink.focus();
      } else if (!e.shiftKey && document.activeElement === lastLink) {
        e.preventDefault(); firstLink.focus();
      }
    });
  }

  /**
   * 3. Timeline Logic
   */
  function initTimeline() {
    const allTimelineLists = document.querySelectorAll('.timeline__list');
    if (!allTimelineLists || allTimelineLists.length === 0) return;

    allTimelineLists.forEach(list => {
      
      const allInfoDivs = list.querySelectorAll('.timeline__info');
      allInfoDivs.forEach(div => {
        div.removeAttribute('hidden'); 
      });

      list.addEventListener('click', (e) => {
        const btn = e.target.closest('.timeline__toggle');
        if (!btn) return;

        const info = document.getElementById(btn.getAttribute('aria-controls'));
        if (!info) return;
        
        const expanded = btn.getAttribute('aria-expanded') === 'true'; 

        btn.setAttribute('aria-expanded', !expanded);
        info.classList.toggle('is-open');
      });
    });
  }


  /**
   * 4. Article Modals (With Focus Trap)
   */
  function initArticleModals() {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const body = document.body;

    // Focus variables
    let lastFocusedElement;
    let currentModal = null;

    // Open modal
    const openModal = (modal) => {
      lastFocusedElement = document.activeElement; // Save focused element
      modal.classList.add('is-visible');
      body.classList.add('modal-open');
      currentModal = modal;
      
      // Focus close button on open
      modal.querySelector('.modal-close').focus();
      
      // Add focus trap listener
      modal.addEventListener('keydown', trapFocus);
    };

    // Close modal
    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove('is-visible');
      body.classList.remove('modal-open');
      currentModal = null;
      
      // Remove listener
      modal.removeEventListener('keydown', trapFocus);
      
      // Return focus to original element
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    };

    // Focus trap function
    const trapFocus = (e) => {
      if (e.key !== 'Tab' || !currentModal) return;

      const focusableElements = currentModal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) { // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus(); // Move to last
          e.preventDefault();
        }
      } else { // Tab only
        if (document.activeElement === lastElement) {
          firstElement.focus(); // Move to first
          e.preventDefault();
        }
      }
      
      // Close on Escape
      if (e.key === 'Escape') {
        closeModal(currentModal);
      }
    };

    // Open on click
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const targetModal = document.querySelector(trigger.getAttribute('href'));
        if (targetModal) {
          openModal(targetModal);
        }
      });
    });

    // Close with X button
    document.querySelectorAll('.modal-close').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(button.closest('.modal-overlay'));
      });
    });

    // Close on backdrop click
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentModal) {
            closeModal(currentModal);
        }
    });
  }


  /**
   * 5. Skip Link
   */
  function initSkipLink() {
    const skipLink = document.querySelector('.skip-link');
    const mainContent = document.getElementById('main-content');
    if (!skipLink || !mainContent) return;
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault();
      mainContent.focus();
    });
  }

})();
