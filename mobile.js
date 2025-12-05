// mobile.js - Funcionalidades mobile para La Hamburguesa

// ======= MENU MOBILE TOGGLE =======
function initMobileMenu() {
  const navMenuToggle = document.querySelector('.nav-menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  
  // Verificar se já foi inicializado (ex: index.html tem código inline)
  if (navMenuToggle && navMenuToggle.dataset.mobileInitialized === 'true') {
    return;
  }
  
  if (navMenuToggle && navLinks) {
    // Marcar como inicializado
    navMenuToggle.dataset.mobileInitialized = 'true';
    
    navMenuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navMenuToggle.classList.toggle('active');
      navLinks.classList.toggle('mobile-active');
      
      // Prevenir scroll do body quando menu está aberto
      if (navLinks.classList.contains('mobile-active')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Fechar menu ao clicar em um link
    navLinks.querySelectorAll('a').forEach(link => {
      // Remover listeners anteriores se existirem
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);
      
      newLink.addEventListener('click', function() {
        navMenuToggle.classList.remove('active');
        navLinks.classList.remove('mobile-active');
        document.body.style.overflow = '';
      });
    });
    
    // Fechar menu ao clicar fora (apenas se não houver outro listener)
    let clickOutsideHandler = function(event) {
      const isClickInsideNav = navLinks.contains(event.target) || navMenuToggle.contains(event.target);
      if (!isClickInsideNav && navLinks.classList.contains('mobile-active')) {
        navMenuToggle.classList.remove('active');
        navLinks.classList.remove('mobile-active');
        document.body.style.overflow = '';
      }
    };
    
    // Usar capture para garantir que seja executado primeiro
    document.addEventListener('click', clickOutsideHandler, true);
    
    // Fechar menu com ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navLinks.classList.contains('mobile-active')) {
        navMenuToggle.classList.remove('active');
        navLinks.classList.remove('mobile-active');
        document.body.style.overflow = '';
      }
    });
  }
}

// ======= PREVENIR ZOOM DUPLO TOQUE =======
function preventDoubleTapZoom() {
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(event) {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
}

// ======= MELHORAR ÁREAS DE TOQUE =======
function enhanceTouchTargets() {
  // Garantir que botões tenham área de toque mínima de 44x44px
  const buttons = document.querySelectorAll('button, .btn, a.btn, input[type="submit"], input[type="button"]');
  buttons.forEach(btn => {
    const rect = btn.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      btn.style.minWidth = '44px';
      btn.style.minHeight = '44px';
      btn.style.padding = '12px 16px';
    }
  });
}

// ======= SWIPE GESTURES PARA CARRINHO =======
function initSwipeGestures() {
  const cartFloat = document.getElementById('cartFloat');
  if (!cartFloat) return;
  
  let touchStartX = 0;
  let touchEndX = 0;
  
  cartFloat.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });
  
  cartFloat.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });
  
  function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    // Swipe para direita fecha o carrinho (apenas em mobile)
    if (diff < -swipeThreshold && window.innerWidth <= 768) {
      if (cartFloat.classList.contains('show') && typeof toggleCart === 'function') {
        toggleCart();
      }
    }
  }
}

// ======= OTIMIZAR INPUTS PARA MOBILE =======
function optimizeMobileInputs() {
  // Adicionar inputmode apropriado
  const phoneInputs = document.querySelectorAll('input[type="tel"], input[id*="telefone"], input[id*="phone"]');
  phoneInputs.forEach(input => {
    input.setAttribute('inputmode', 'tel');
    input.setAttribute('pattern', '[0-9]*');
  });
  
  const emailInputs = document.querySelectorAll('input[type="email"]');
  emailInputs.forEach(input => {
    input.setAttribute('inputmode', 'email');
    input.setAttribute('autocomplete', 'email');
  });
  
  const numberInputs = document.querySelectorAll('input[type="number"]');
  numberInputs.forEach(input => {
    input.setAttribute('inputmode', 'numeric');
  });
  
  // Adicionar autocomplete para campos comuns
  const nameInputs = document.querySelectorAll('input[id*="nome"], input[name*="nome"], input[id*="name"]');
  nameInputs.forEach(input => {
    input.setAttribute('autocomplete', 'name');
  });
  
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  passwordInputs.forEach(input => {
    input.setAttribute('autocomplete', 'current-password');
  });
}

// ======= DETECTAR ORIENTAÇÃO E AJUSTAR =======
function handleOrientationChange() {
  window.addEventListener('orientationchange', function() {
    // Fechar menu mobile ao mudar orientação
    const navLinks = document.querySelector('.nav-links');
    const navMenuToggle = document.querySelector('.nav-menu-toggle');
    if (navLinks && navLinks.classList.contains('mobile-active')) {
      navLinks.classList.remove('mobile-active');
      if (navMenuToggle) navMenuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }
    
    // Recalcular layouts após mudança de orientação
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 100);
  });
}

// ======= PREVENIR SCROLL HORIZONTAL ACIDENTAL =======
function preventHorizontalScroll() {
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', function(e) {
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    const diffX = Math.abs(touchX - touchStartX);
    const diffY = Math.abs(touchY - touchStartY);
    
    // Se o movimento horizontal for maior que o vertical, pode ser um swipe intencional
    // Mas se estiver em um elemento que não deve fazer scroll horizontal, prevenir
    const target = e.target;
    const isScrollableElement = target.closest('.menu-chip-bar, .cart-float, [style*="overflow-x"]');
    
    if (!isScrollableElement && diffX > diffY && diffX > 10) {
      // Permitir apenas em elementos específicos que devem ter scroll horizontal
      const allowHorizontalScroll = target.closest('.menu-chip-bar');
      if (!allowHorizontalScroll) {
        e.preventDefault();
      }
    }
  }, { passive: false });
}

// ======= MELHORAR PERFORMANCE EM MOBILE =======
function optimizeMobilePerformance() {
  // Lazy load de imagens se não estiverem já configuradas
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
  
  // Reduzir animações em dispositivos com preferência de movimento reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
  }
}

// ======= INICIALIZAÇÃO =======
document.addEventListener('DOMContentLoaded', function() {
  initMobileMenu();
  preventDoubleTapZoom();
  enhanceTouchTargets();
  initSwipeGestures();
  optimizeMobileInputs();
  handleOrientationChange();
  preventHorizontalScroll();
  optimizeMobilePerformance();
  
  // Adicionar classe mobile ao body para CSS específico
  if (window.innerWidth <= 768) {
    document.body.classList.add('is-mobile');
  }
  
  window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
      document.body.classList.add('is-mobile');
    } else {
      document.body.classList.remove('is-mobile');
    }
  });
});

// Exportar funções para uso global se necessário
window.initMobileMenu = initMobileMenu;
window.preventDoubleTapZoom = preventDoubleTapZoom;
window.enhanceTouchTargets = enhanceTouchTargets;

