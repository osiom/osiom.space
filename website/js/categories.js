/**
 * Category Management System
 * Loads and manages different technology categories
 */

const CATEGORY_REGISTRY = {
  'data-storage': './data/data-storage.js',
  'messaging': './data/messaging.js',
  'email': './data/email.js',
  'computation': './data/computation.js'
};

class CategoryManager {
  constructor() {
    this.currentCategory = null;
    this.config = null;
  }

  getCategoryFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('category');
  }

  async loadCategory(categoryId) {
    if (!CATEGORY_REGISTRY[categoryId]) {
      console.error('Category not found:', categoryId);
      return null;
    }

    try {
      await this.loadScript(CATEGORY_REGISTRY[categoryId]);
      // Wait a tick for script to execute
      await new Promise(resolve => setTimeout(resolve, 50));
      const configName = this.getConfigName(categoryId);
      this.config = window[configName];
      this.currentCategory = categoryId;
      this.config = window[configName];
      this.currentCategory = categoryId;
      return this.config;
    } catch (error) {
      console.error('Error loading category:', error);
      return null;
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  getConfigName(categoryId) {
    return categoryId
      .split('-')
      .map(word => word.toUpperCase())
      .join('_') + '_CONFIG';
  }

  updateCategoryDisplay() {
    if (!this.config || !this.config.metadata) return;

    const metadata = this.config.metadata;
    const categoryNameEl = document.getElementById('category-name');
    if (categoryNameEl) {
      categoryNameEl.textContent = metadata.name;
    }

    document.title = `${metadata.title} - Mutual Aid & Support Technologies`;
  }

  getCategoryInfo() {
    if (!this.config || !this.config.metadata) return '';

    const metadata = this.config.metadata;
    let html = `
      <h3>${metadata.title}</h3>
      <p>${metadata.description}</p>
      <p>${metadata.longDescription}</p>
    `;

    if (metadata.topics && metadata.topics.length > 0) {
      html += '<h4>Understanding Your Choices:</h4><ul>';
      metadata.topics.forEach(topic => {
        html += `<li><strong>${topic.term}:</strong> ${topic.description}</li>`;
      });
      html += '</ul>';
    }

    return html;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CategoryManager;
}