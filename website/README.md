# Website - Sustainable Technology Discovery

> **Interactive decision-tree platform for discovering sustainable technology alternatives**

## 🎯 **Purpose**

Help users discover sustainable, open-source, and privacy-focused alternatives to proprietary software through an interactive decision-tree interface.

## ✨ **Features**

### 🎨 **Visual Experience**
- **3D Cube Animation**: Interactive Three.js cube with particle system
- **Particle Metaphor**: Particles represent people being drawn to sustainable technology
- **Color-coded States**: 
  - Black particles: People in current state
  - White particles: Transformed when entering the "portal" (black window)
  - Red particles: When proprietary software is selected

### 📱 **Responsive Design**
- **Mobile-first approach** with adaptive layouts
- **Touch-friendly interactions** with minimum 44px touch targets
- **Fluid typography** using `clamp()` for optimal readability
- **Responsive cube sizing** based on screen dimensions

### 🌳 **Decision Tree System**
- **Dynamic question flow** based on user selections
- **Context-aware suggestions** for different use cases
- **Tooltip system** for desktop (hover) and mobile (tap info buttons)
- **Smart navigation** with back/forward functionality

### 🎛️ **Interactive Elements**
- **Menu toggle system** with slide-out navigation
- **Particle interaction** - mouse repels particles
- **Cube spinning** on click/tap
- **Smooth animations** and transitions

## 🏗️ **Architecture**

### **Frontend Stack**
- **HTML5**: Semantic structure
- **CSS3**: Modern styling with custom properties
- **Vanilla JavaScript**: No framework dependencies
- **Three.js**: 3D graphics and animations

### **File Structure**
```
website/
├── index.html              # Landing page with 3D cube
├── discovery.html          # Category selection
├── decision-tree.html      # Interactive decision flow
├── menu.html              # Shared menu component
├── css/
│   ├── main.css           # Global styles and variables
│   ├── index.css          # Landing page specific styles
│   ├── decision-tree.css  # Decision tree interface
│   └── particles.css      # Particle system styles
├── js/
│   ├── index.js           # 3D cube and main page logic
│   ├── particles.js       # Particle system implementation
│   ├── decision-tree.js   # Decision tree logic and navigation
│   ├── menu-loader.js     # Dynamic menu system
│   └── category-manager.js # Category data management
├── data/
│   └── data-storage.js    # Decision tree configuration
└── .utils                 # Deployment utilities
```

## 🎨 **Design Philosophy**

### **Metaphorical Elements**
- **Cube as Portal**: Represents gateway to sustainable technology
- **Particle Flow**: People being attracted to better alternatives
- **Color Transformation**: Visual feedback for user choices
- **Responsive Sizing**: Adapts to user's viewing context

### **User Experience**
- **Progressive Disclosure**: Information revealed as needed
- **Contextual Help**: Tooltips and info buttons for guidance
- **Clear Visual Hierarchy**: Consistent typography and spacing
- **Accessibility First**: ARIA labels, keyboard navigation, reduced motion support

## 🔧 **Technical Implementation**

### **Particle System**
```javascript
// Particle attraction to cube center
const attractionStrength = 0.0012;
const forceX = (dxToCube / distance) * attractionStrength;

// Mouse repulsion for interaction
const repulsionForce = 4;
if (distance < mouseRadius) {
  // Push particles away from cursor
}
```

### **Decision Tree Logic**
```javascript
// Dynamic question navigation
handleOptionClick(event) {
  const nextStep = button.dataset.next;
  if (nextStep === 'solutions') {
    this.showSolutions();
  } else {
    this.showQuestion(nextStep);
  }
}
```

### **Responsive Cube Sizing**
```javascript
function getCubeSize() {
  if (width <= 480) return 0.5;      // Mobile portrait
  if (width <= 600) return 0.6;      // Mobile landscape
  if (width <= 900) return 0.7;      // Tablet
  return 0.8;                        // Desktop
}
```

## 📱 **Mobile Optimizations**

### **Touch Interface**
- **Info buttons (?)** replace hover tooltips
- **Larger touch targets** (minimum 44px)
- **Tap-to-show information** with auto-hide
- **Gesture-friendly navigation**

### **Performance**
- **Reduced particle count** on mobile
- **Optimized animations** for touch devices
- **Efficient DOM updates** to maintain 60fps

## 🎯 **Content Management**

### **Decision Tree Configuration**
Located in `data/data-storage.js`:
```javascript
export const dataStorageConfig = {
  category: "data-storage",
  title: "Data Storage Solutions",
  flow: {
    questions: [
      {
        id: "question-1",
        text: "What type of software do you prefer?",
        options: [
          {
            text: "Proprietary",
            value: "proprietary",
            next: "solutions",
            solutionKey: "proprietary"
          }
          // ... more options
        ]
      }
    ]
  },
  solutions: {
    // Solution categories with descriptions
  }
};
```

## 🚀 **Deployment**

### **Quick Deploy**
```bash
# Copy all files to server
scp -r ./website/* user@your-server.local:/home/user/mos-erver/

# Restart service (usually not needed for static files)
ssh user@your-server.local "sudo systemctl restart mos-erver.service"
```

### **Development Workflow**
1. Make changes locally
2. Test across devices/browsers
3. Deploy using `.utils` commands
4. Monitor for issues

## 🎨 **Customization**

### **CSS Variables**
```css
:root {
  --color-primary: #ffffff;
  --color-text: #000000;
  --color-border: #cccccc;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
}
```

### **Particle Configuration**
```javascript
// In particles.js
const numberOfParticles = isMobile ? 50 : 100;
const attractionStrength = 0.0012;
const mouseRepulsion = 4;
```

## 🐛 **Troubleshooting**

### **Common Issues**
- **Particles not visible**: Check z-index in CSS
- **Tooltips not working**: Verify touch device detection
- **Cube not responsive**: Check resize event handlers
- **Menu not loading**: Verify menu-loader.js path

### **Debug Tools**
- Browser Developer Tools
- Console logs for particle system
- Network tab for resource loading
- Responsive design mode for mobile testing

## 📊 **Performance Metrics**

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Time to Interactive**: < 3s

## 🔮 **Future Enhancements**

- [ ] Additional decision tree categories
- [ ] User preference persistence
- [ ] Social sharing features
- [ ] Analytics integration
- [ ] Multi-language support
- [ ] Advanced particle effects

---

**Tech Stack**: HTML5, CSS3, JavaScript, Three.js  
**Responsive**: Mobile-first design  
**Accessibility**: WCAG 2.1 AA compliant  
**Performance**: Optimized for 60fps animations
