/**
 * Centralized menu loader
 * Loads the shared menu HTML and handles menu functionality
 */

async function loadMenu() {
  try {
    const response = await fetch('menu.html');
    const menuHTML = await response.text();
    
    // Insert menu at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', menuHTML);
    
    // Handle index category based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const menuCategories = document.querySelectorAll('.menu-category');
    
    menuCategories.forEach(category => {
      if (category.textContent.includes('index')) {
        const nextElement = category.nextElementSibling;
        
        if (currentPage === 'index.html' || currentPage === '') {
          // On index page: hide the subcategory (keep header as visual indicator)
          if (nextElement && nextElement.classList.contains('menu-list')) {
            nextElement.style.display = 'none';
          }
        } else {
          // On other pages: make the category header clickable and hide subcategory
          if (nextElement && nextElement.classList.contains('menu-list')) {
            nextElement.style.display = 'none';
          }
          
          // Make the index category header clickable
          category.style.cursor = 'pointer';
          category.addEventListener('click', () => {
            window.location.href = 'index.html';
          });
          
          // Add hover effect
          category.addEventListener('mouseenter', () => {
            category.style.opacity = '0.6';
          });
          category.addEventListener('mouseleave', () => {
            category.style.opacity = '1';
          });
        }
      }
    });
    
    // Initialize menu functionality
    initializeMenu();
  } catch (error) {
    console.error('Error loading menu:', error);
  }
}

function initializeMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const sideMenu = document.getElementById('side-menu');

  if (!menuToggle || !sideMenu) {
    return;
  }

  menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = sideMenu.hasAttribute('hidden');
    if (isHidden) {
      sideMenu.removeAttribute('hidden');
      menuToggle.classList.add('active');
      menuToggle.setAttribute('aria-expanded', 'true');
      // Prevent body scrolling when menu is open on mobile
      if (window.innerWidth <= 600) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      sideMenu.setAttribute('hidden', '');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  document.addEventListener('click', (e) => {
    if (
      !sideMenu.hasAttribute('hidden') &&
      !sideMenu.contains(e.target) &&
      !menuToggle.contains(e.target)
    ) {
      sideMenu.setAttribute('hidden', '');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    // Spin cube if available (for index page)
    if (typeof spinCube === 'function' && !menuToggle.contains(e.target) && !sideMenu.contains(e.target)) {
      spinCube();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !sideMenu.hasAttribute('hidden')) {
      sideMenu.setAttribute('hidden', '');
      menuToggle.classList.remove('active');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.focus();
      document.body.style.overflow = '';
    }
  });
}

// Load menu when DOM is ready
document.addEventListener('DOMContentLoaded', loadMenu);
