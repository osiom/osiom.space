/**
 * Main application logic for the decision tree
 */

class DecisionTree {
  constructor(categoryManager) {
    this.categoryManager = categoryManager;
    this.currentPath = [];
    this.currentQuestionIndex = 0;
    this.flow = null;
    this.solutions = null;
  }

  async init() {
    const categoryId = this.categoryManager.getCategoryFromURL();
    
    if (!categoryId) {
      window.location.href = 'index.html';
      return;
    }

    const config = await this.categoryManager.loadCategory(categoryId);
    
    if (!config) {
      alert('Category not found');
      window.location.href = 'index.html';
      return;
    }

    this.flow = config.flow;
    this.solutions = config.solutions;
    
    this.categoryManager.updateCategoryDisplay();
    this.buildDecisionTree();
    this.setupEventListeners();
    this.showQuestion(0);
  }

  buildDecisionTree() {
    const container = document.getElementById('decision-tree');
    container.innerHTML = '';

    this.flow.questions.forEach((question, index) => {
      const questionDiv = document.createElement('div');
      questionDiv.id = question.id;
      questionDiv.className = 'question';
      questionDiv.hidden = true;

      const questionText = document.createElement('h2');
      questionText.className = 'question-text';
      questionText.textContent = question.text;
      
      // Add interactive category tooltips if available
      if (question.options && question.options.length > 0) {
        // Process question text to make category options interactive
        let processedText = question.text;
        
        question.options.forEach((option, optionIndex) => {
          if (option.tooltip) {
            // Replace option text with interactive span
            const regex = new RegExp(`\\b${option.text}\\b`, 'gi');
            processedText = processedText.replace(regex, `<span class="interactive-category" data-option-index="${optionIndex}">${option.text}</span>`);
          }
        });
        
        questionText.innerHTML = processedText;
        
        // Add event listeners to interactive categories
        const interactiveCategories = questionText.querySelectorAll('.interactive-category');
        interactiveCategories.forEach((categorySpan) => {
          const optionIndex = parseInt(categorySpan.dataset.optionIndex);
          const option = question.options[optionIndex];
          
          if (option.tooltip) {
            // Create tooltip for this category
            const categoryTooltip = document.createElement('div');
            categoryTooltip.className = 'category-tooltip';
            categoryTooltip.innerHTML = `<strong>${option.tooltip.title}</strong><br>${option.tooltip.description}`;
            categorySpan.appendChild(categoryTooltip);
            
            // Create mobile info popup
            const categoryInfoDiv = document.createElement('div');
            categoryInfoDiv.className = 'category-info';
            categoryInfoDiv.innerHTML = `<strong>${option.tooltip.title}</strong><br>${option.tooltip.description}`;
            categorySpan.appendChild(categoryInfoDiv);
            
            // Desktop hover events
            categorySpan.addEventListener('mouseenter', () => {
              if (window.innerWidth > 900) {
                categoryTooltip.classList.add('visible');
              }
            });
            categorySpan.addEventListener('mouseleave', () => {
              if (window.innerWidth > 900) {
                categoryTooltip.classList.remove('visible');
              }
            });
            
            // Mobile click events - improved detection
            const mobileClickHandler = (e) => {
              // Only on mobile devices
              if (window.innerWidth <= 900 || ('ontouchstart' in window)) {
                e.preventDefault();
                e.stopPropagation();
                
                // Hide all other open info
                document.querySelectorAll('.category-info.visible').forEach(info => {
                  if (info !== categoryInfoDiv) {
                    info.classList.remove('visible');
                  }
                });
                
                // Toggle this info
                categoryInfoDiv.classList.toggle('visible');
                
                // Auto-hide after 8 seconds on mobile
                if (categoryInfoDiv.classList.contains('visible')) {
                  setTimeout(() => {
                    categoryInfoDiv.classList.remove('visible');
                  }, 8000);
                }
              }
            };
            
            // Add both click and touchend for better mobile support
            categorySpan.addEventListener('click', mobileClickHandler);
            categorySpan.addEventListener('touchend', mobileClickHandler);
            
            // Desktop keyboard accessibility
            categorySpan.setAttribute('tabindex', '0');
            categorySpan.setAttribute('aria-label', `Hover for ${option.text} information`);
            categorySpan.addEventListener('focus', () => {
              if (window.innerWidth > 900) {
                categoryTooltip.classList.add('visible');
              }
            });
            categorySpan.addEventListener('blur', () => {
              if (window.innerWidth > 900) {
                categoryTooltip.classList.remove('visible');
              }
            });
          }
        });
      }

      // Add global click handler to close mobile popups when clicking outside
      if (question.options && question.options.some(opt => opt.tooltip)) {
        document.addEventListener('click', (e) => {
          if (window.innerWidth <= 900) {
            const openPopups = document.querySelectorAll('.category-info.visible');
            let clickedInsidePopup = false;
            
            openPopups.forEach(popup => {
              if (popup.contains(e.target) || popup.parentElement.contains(e.target)) {
                clickedInsidePopup = true;
              }
            });
            
            if (!clickedInsidePopup) {
              openPopups.forEach(popup => {
                popup.classList.remove('visible');
              });
            }
          }
        });
      }

      questionDiv.appendChild(questionText);

      // Add close button for questions after the first one
      if (index > 0) {
      const closeBtn = document.createElement('button');
      closeBtn.className = 'question-close';
      closeBtn.innerHTML = '×';
      closeBtn.setAttribute('aria-label', 'Go back one step');
      closeBtn.onclick = () => this.goBackOneStep(index);
      questionDiv.appendChild(closeBtn);
      }

      const optionsDiv = document.createElement('div');
      optionsDiv.className = 'options';
      optionsDiv.setAttribute('role', 'group');
      optionsDiv.setAttribute('aria-label', `${question.text} options`);

      question.options.forEach(option => {
        const buttonWrapper = document.createElement('div');
        buttonWrapper.style.position = 'relative';

        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option.text;
        button.dataset.answer = option.value;
        button.dataset.next = option.next;
        button.dataset.questionIndex = index;
        
        if (option.solutionKey) {
          button.dataset.solutionKey = option.solutionKey;
        }

        // Simple option buttons - no tooltips, just click to select
        button.addEventListener('click', (event) => this.handleOptionClick(event));

        buttonWrapper.appendChild(button);
        optionsDiv.appendChild(buttonWrapper);
      });

      questionDiv.appendChild(questionText);
      questionDiv.appendChild(optionsDiv);
      container.appendChild(questionDiv);
    });
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('option')) {
        this.handleOptionClick(e);
      }
    });

    const categoryTitle = document.getElementById('category-title');
    const infoModal = document.getElementById('category-info-modal');
    const closeModal = document.querySelector('.close-modal');

    if (categoryTitle && infoModal) {
      categoryTitle.addEventListener('click', () => {
        const infoContent = document.getElementById('category-info-content');
        infoContent.innerHTML = this.categoryManager.getCategoryInfo();
        infoModal.hidden = false;
        closeModal.focus();
      });

      closeModal.addEventListener('click', () => {
        infoModal.hidden = true;
        categoryTitle.focus();
      });
      
      infoModal.addEventListener('click', (e) => {
        if (e.target === infoModal) {
          infoModal.hidden = true;
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !infoModal.hidden) {
          infoModal.hidden = true;
          categoryTitle.focus();
        }
      });
    }
  }

  handleOptionClick(event) {
    const button = event.target;
    const questionIndex = parseInt(button.dataset.questionIndex);
    const answer = button.dataset.answer;
    const nextStep = button.dataset.next;
    const solutionKey = button.dataset.solutionKey;

    // Clear solutions when starting a new path
    this.hideSolutions();
    
    // Hide all questions after the current one
    for (let i = questionIndex + 1; i < this.flow.questions.length; i++) {
      this.hideQuestion(i);
    }
    
    // Clear selections in future questions
    this.flow.questions.forEach((q, i) => {
      if (i > questionIndex) {
        const questionEl = document.getElementById(q.id);
        if (questionEl) {
          questionEl.querySelectorAll('.option').forEach(btn => {
            btn.classList.remove('selected');
          });
        }
      }
    });

    this.selectOption(button);
    this.currentPath[questionIndex] = answer;
    
    // Truncate path to current question
    this.currentPath = this.currentPath.slice(0, questionIndex + 1);

    // Update particle system based on selection
    this.updateParticleSystem();

    if (nextStep === 'solutions') {
      if (solutionKey) {
        this.showSolutionsByKey(solutionKey);
      } else {
        this.showSolutions();
      }
    } else {
      // Find the next question by ID, not by index
      const nextQuestionId = nextStep;
      const nextQuestion = this.flow.questions.find(q => q.id === nextQuestionId);
      if (nextQuestion) {
        const nextQuestionIndex = this.flow.questions.indexOf(nextQuestion);
        this.showQuestion(nextQuestionIndex);
      }
    }
  }

  updateParticleSystem() {
    // Check if proprietary software was selected in the first question
    const proprietarySelected = this.currentPath[0] === 'proprietary';
    
    // Update particle system state
    if (window.ParticleState) {
      window.ParticleState.setProprietaryMode(proprietarySelected);
    }
    
    // Toggle red text styling on body element
    if (proprietarySelected) {
      document.body.classList.add('proprietary-mode');
    } else {
      document.body.classList.remove('proprietary-mode');
    }
  }

  selectOption(selectedButton) {
    const siblings = selectedButton.parentElement.parentElement.querySelectorAll('.option');
    siblings.forEach(btn => btn.classList.remove('selected'));
    selectedButton.classList.add('selected');
  }

  showQuestion(questionIndex) {
    const question = this.flow.questions[questionIndex];
    if (!question) return;

    const questionElement = document.getElementById(question.id);
    if (questionElement) {
      questionElement.hidden = false;
      this.currentQuestionIndex = questionIndex;

      setTimeout(() => {
        questionElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }

  hideQuestion(questionIndex) {
    const question = this.flow.questions[questionIndex];
    if (!question) return;

    const questionElement = document.getElementById(question.id);
    if (questionElement) {
      questionElement.hidden = true;
    }
  }

  getSolutionKey() {
    return this.flow.pathResolver(this.currentPath);
  }

  showSolutions() {
    const solutionKey = this.getSolutionKey();
    this.showSolutionsByKey(solutionKey);
  }

  showSolutionsByKey(solutionKey) {
    if (!solutionKey || !this.solutions[solutionKey]) {
      console.error('No solutions found for key:', solutionKey);
      return;
    }

    const solutionData = this.solutions[solutionKey];
    const solutionsList = document.getElementById('solutions-list');
    const solutionsSection = document.getElementById('solutions');

    solutionsList.innerHTML = '';

    solutionData.items.forEach(item => {
      const solutionItem = this.createSolutionElement(item);
      solutionsList.appendChild(solutionItem);
    });

    solutionsSection.hidden = false;

    // Enhanced smooth scrolling with better timing and options
    setTimeout(() => {
      // Ensure the element is visible first
      solutionsSection.style.opacity = '1';
      
      // Smooth scroll with better behavior for mobile
      solutionsSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',  // Scroll to start of element
        inline: 'nearest' 
      });
      
      // Alternative fallback for better mobile support
      if (window.innerWidth <= 768) {
        const rect = solutionsSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop - 20; // 20px offset from top
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    }, 150); // Slightly longer delay for better animation
  }

  hideSolutions() {
    const solutionsSection = document.getElementById('solutions');
    if (solutionsSection) {
      solutionsSection.hidden = true;
    }
  }

  createSolutionElement(item) {
    const div = document.createElement('div');
    div.className = 'solution-item';
    
    const name = document.createElement('div');
    name.className = 'solution-name';
    name.textContent = item.name;
    
    const description = document.createElement('div');
    description.className = 'solution-description';
    description.textContent = item.description;
    
    const link = document.createElement('a');
    link.href = item.url;
    link.className = 'solution-link';
    link.textContent = item.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    div.appendChild(name);
    div.appendChild(description);
    div.appendChild(link);
    
    return div;
  }

  goBackOneStep(currentIndex) {
  // Hide current question
  this.hideQuestion(currentIndex);
  
  // Hide all questions after current
  for (let i = currentIndex + 1; i < this.flow.questions.length; i++) {
    this.hideQuestion(i);
  }
  
  // Hide solutions
  this.hideSolutions();
  
  // Clear path from current question onwards
  this.currentPath = this.currentPath.slice(0, currentIndex);
  
  // Update particle system after path change
  this.updateParticleSystem();
  
  // Deselect options in current and future questions
  this.flow.questions.forEach((q, i) => {
    if (i >= currentIndex) {
      const questionEl = document.getElementById(q.id);
      if (questionEl) {
        questionEl.querySelectorAll('.option').forEach(btn => {
          btn.classList.remove('selected');
        });
      }
    }
  });
  
  // Show previous question
  const prevIndex = currentIndex - 1;
  if (prevIndex >= 0) {
    const prevQuestion = document.getElementById(this.flow.questions[prevIndex].id);
    if (prevQuestion) {
      prevQuestion.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
 }

  reset() {
    this.currentPath = [];
    this.currentQuestionIndex = 0;

    this.flow.questions.forEach((question, index) => {
      if (index > 0) {
        this.hideQuestion(index);
      }
    });

    document.querySelectorAll('.option').forEach(btn => {
      btn.classList.remove('selected');
    });

    this.hideSolutions();

    // Reset particle system
    this.updateParticleSystem();

    this.showQuestion(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function resetDecisionTree() {
  if (window.decisionTreeInstance) {
    window.decisionTreeInstance.reset();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  const categoryManager = new CategoryManager();
  window.decisionTreeInstance = new DecisionTree(categoryManager);
  await window.decisionTreeInstance.init();
  
  // Global click handler to close info popups when clicking outside
  document.addEventListener('click', (e) => {
    // Only close if clicking outside any option wrapper or info button
    if (!e.target.closest('.option-wrapper') && !e.target.closest('.option-info-btn')) {
      document.querySelectorAll('.option-info.visible').forEach(info => {
        info.classList.remove('visible');
      });
    }
  });
});
