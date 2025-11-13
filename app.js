/* =====================================================================
   app.js - V15 (Com Trava de Foco no Modal)
   ===================================================================== */

(function() {
  
  document.addEventListener('DOMContentLoaded', function () {
    initCursor();
    initMobileNav();    // Controla o menu principal
    initTimeline();     // Controla a Timeline, Explore, e At a Glance
    initArticleModals(); // Controla os artigos In-Depth e Culture
    initSkipLink();
  });

  /**
   * 1. CURSOR CUSTOMIZADO
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
   * 2. NAVEGAÇÃO MOBILE (V13 - Lógica de Scroll Manual)
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
        // Se NÃO for um link de modal, faz o scroll
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
   * 3. TIMELINE (V14 - Controla Timeline, Explore, e At a Glance)
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
   * 4. FUNÇÃO: IN-DEPTH ARTICLE MODALS
   * (VERSÃO POLIDA COM FOCUS TRAP)
   */
  function initArticleModals() {
    const modalTriggers = document.querySelectorAll('.modal-trigger');
    const body = document.body;

    // Variáveis para guardar o foco
    let lastFocusedElement;
    let currentModal = null;

    // Função para abrir o modal
    const openModal = (modal) => {
      lastFocusedElement = document.activeElement; // Salva o elemento focado
      modal.classList.add('is-visible');
      body.classList.add('modal-open');
      currentModal = modal;
      
      // Foca o botão de fechar assim que o modal abre
      modal.querySelector('.modal-close').focus();
      
      // Adiciona o listener de "trava de foco"
      modal.addEventListener('keydown', trapFocus);
    };

    // Função para fechar o modal
    const closeModal = (modal) => {
      if (!modal) return;
      modal.classList.remove('is-visible');
      body.classList.remove('modal-open');
      currentModal = null;
      
      // Remove o listener
      modal.removeEventListener('keydown', trapFocus);
      
      // Devolve o foco para o elemento original
      if (lastFocusedElement) {
        lastFocusedElement.focus();
      }
    };

    // Função que faz a "trava de foco"
    const trapFocus = (e) => {
      if (e.key !== 'Tab' || !currentModal) return;

      const focusableElements = currentModal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) { // Se for Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus(); // vai para o último
          e.preventDefault();
        }
      } else { // Se for só Tab
        if (document.activeElement === lastElement) {
          firstElement.focus(); // vai para o primeiro
          e.preventDefault();
        }
      }
      
      // Fechar com Escape
      if (e.key === 'Escape') {
        closeModal(currentModal);
      }
    };

    // Abrir com clique
    modalTriggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const targetModal = document.querySelector(trigger.getAttribute('href'));
        if (targetModal) {
          openModal(targetModal);
        }
      });
    });

    // Fechar com o botão "X"
    document.querySelectorAll('.modal-close').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(button.closest('.modal-overlay'));
      });
    });

    // Fechar clicando no fundo escuro
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });
    
    // Fechar com a tecla Escape (listener global de fallback)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentModal) {
            closeModal(currentModal);
        }
    });
  }


  /**
   * 5. SKIP LINK (Acessibilidade)
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

})(); // Fim da IIFE
