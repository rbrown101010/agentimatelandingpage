class AnimationController {
    constructor() {
        this.inputField = document.querySelector('.input-field');
        this.cursor = document.querySelector('.cursor');
        this.animationStage = document.querySelector('.animation-stage');
        this.currentText = '';
        this.isTyping = false;
        this.currentAnimation = null;
        this.isRotating = false;
        this.isVertical = false;
        this.setupEventListeners();
        this.initializeComponent();
    }

    setupEventListeners() {
        this.inputField.addEventListener('focus', () => this.cursor.classList.add('active'));
        this.inputField.addEventListener('blur', () => this.cursor.classList.remove('active'));
        this.inputField.addEventListener('input', (e) => this.handleInput(e));
    }

    handleInput(e) {
        const text = e.target.value;
        this.updateCursorPosition();
        this.triggerAnimation(text);
    }

    updateCursorPosition() {
        const textWidth = this.getTextWidth(this.inputField.value);
        this.cursor.style.left = `${textWidth + 24}px`;
    }

    getTextWidth(text) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = getComputedStyle(this.inputField).font;
        return context.measureText(text).width;
    }

    async typeText(text, delay = 50) {
        if (this.isTyping) return;
        this.isTyping = true;
        this.inputField.value = '';
        this.currentText = '';

        for (let char of text) {
            this.currentText += char;
            this.inputField.value = this.currentText;
            this.updateCursorPosition();
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        this.isTyping = false;
        this.triggerAnimation(text);
    }

    initializeComponent() {
        const component = document.createElement('div');
        component.classList.add('component');
        
        const header = document.createElement('div');
        header.classList.add('component-header');
        header.innerHTML = '<div class="component-title">My Life\'s Work</div>';
        
        const content = document.createElement('div');
        content.classList.add('component-content');
        content.innerHTML = `
            <div class="content-line"></div>
            <div class="content-line"></div>
            <div class="content-line"></div>
            <button class="cta-btn">View Project →</button>
        `;

        const glow = document.createElement('div');
        glow.classList.add('glow');
        
        component.appendChild(header);
        component.appendChild(content);
        component.appendChild(glow);
        this.animationStage.appendChild(component);

        // Remove default hover effect - only add when requested
        component.addEventListener('mousemove', (e) => {
            if (!this.hoverEnabled) return;
            
            const rect = component.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            glow.style.setProperty('--x', `${x}%`);
            glow.style.setProperty('--y', `${y}%`);
            glow.style.opacity = '0.15';
        });

        component.addEventListener('mouseleave', () => {
            if (!this.hoverEnabled) return;
            glow.style.opacity = '0';
        });
    }

    clearCurrentAnimation() {
        if (this.currentAnimation) {
            anime.remove(this.currentAnimation.targets);
            if (this.currentAnimation.cleanup) {
                this.currentAnimation.cleanup();
            }
        }
    }

    triggerAnimation(text) {
        const normalizedText = text.toLowerCase().trim();
        const component = document.querySelector('.component');
        
        this.clearCurrentAnimation();
        
        if (normalizedText.includes('vertical')) {
            this.hoverEnabled = false;
            this.isVertical = true;
            this.currentAnimation = this.changeAspectRatio(component, 'vertical');
        } else if (normalizedText.includes('horizontal')) {
            this.hoverEnabled = false;
            this.isVertical = false;
            this.currentAnimation = this.changeAspectRatio(component, 'horizontal');
        }
        
        // Apply additional animations while maintaining aspect ratio
        if (normalizedText.includes('rotate')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.rotateComponent(component);
        } else if (normalizedText.includes('stop') && normalizedText.includes('rotat')) {
            this.hoverEnabled = false;
            this.isRotating = false;
            this.currentAnimation = this.stopRotation(component);
        } else if (normalizedText.includes('hover')) {
            this.hoverEnabled = true;
            this.currentAnimation = this.animateHover(component);
        } else if (normalizedText.includes('float')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.animateFloat(component);
        } else if (normalizedText.includes('bigger') && normalizedText.includes('glow')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.makeBiggerAndGlow(component);
        } else if (normalizedText.includes('shake')) {
            this.hoverEnabled = false;
            this.currentAnimation = this.shakeComponent(component);
        }
    }

    rotateComponent(component) {
        // Maintain vertical state during rotation
        if (this.isVertical) {
            component.classList.add('vertical');
        }
        
        this.isRotating = true;
        const animation = anime({
            targets: component,
            rotate: '360deg',
            duration: 2000,
            loop: true,
            easing: 'linear'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                this.isRotating = false;
                component.style.transform = 'rotate(0deg)';
                // Maintain vertical state after cleanup
                if (this.isVertical) {
                    component.classList.add('vertical');
                }
            }
        };
    }

    stopRotation(component) {
        const currentRotation = getComputedStyle(component).transform;
        const animation = anime({
            targets: component,
            scale: 1.2,
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = 'scale(1.2)';
            }
        };
    }

    shakeComponent(component) {
        const animation = anime({
            targets: component,
            translateX: [
                { value: -10, duration: 100, delay: 0 },
                { value: 10, duration: 100, delay: 0 },
                { value: -10, duration: 100, delay: 0 },
                { value: 10, duration: 100, delay: 0 },
                { value: 0, duration: 100, delay: 0 }
            ],
            loop: true,
            easing: 'easeInOutSine'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = 'translateX(0)';
            }
        };
    }

    animateHover(component) {
        // Maintain vertical state during hover
        if (this.isVertical) {
            component.classList.add('vertical');
        }
        
        const animation = anime({
            targets: component,
            translateY: -30,
            rotate: [{ value: -2, duration: 1000 }, { value: 2, duration: 1000 }],
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = '';
                this.hoverEnabled = false;
                // Maintain vertical state after cleanup
                if (this.isVertical) {
                    component.classList.add('vertical');
                }
            }
        };
    }

    animateFloat(component) {
        const animation = anime({
            targets: component,
            translateY: [0, -15],
            duration: 1500,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutQuad'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = 'translateY(0)';
            }
        };
    }

    changeAspectRatio(component, orientation) {
        const isChangingToVertical = orientation === 'vertical';
        
        if (isChangingToVertical) {
            component.classList.add('vertical');
            component.style.width = '280px';
            component.style.height = '400px';
        } else {
            component.classList.remove('vertical');
            component.style.width = '400px';
            component.style.height = '280px';
        }

        const animation = anime({
            targets: component,
            scale: [0.9, 1],
            opacity: [0.5, 1],
            duration: 800,
            easing: 'easeOutExpo'
        });
        
        return {
            targets: component,
            animation,
            cleanup: () => {
                // Maintain the aspect ratio after animation
                if (isChangingToVertical) {
                    component.classList.add('vertical');
                    component.style.width = '280px';
                    component.style.height = '400px';
                }
            }
        };
    }

    changeGradient(component) {
        component.style.background = 'linear-gradient(45deg, rgba(0, 0, 0, 0.3), rgba(0, 100, 255, 0.2))';
        
        anime({
            targets: component,
            scale: [0.95, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });
    }

    makeBiggerAndGlow(component) {
        const glow = component.querySelector('.glow');
        glow.style.background = 'radial-gradient(circle at var(--x, 50%) var(--y, 50%), rgba(255, 255, 255, 0.3) 0%, transparent 70%)';
        glow.style.filter = 'blur(20px)';

        const animation = anime({
            targets: component,
            scale: [1, 1.2],
            rotate: [{ value: -5, duration: 400 }, { value: 5, duration: 400 }],
            direction: 'alternate',
            loop: true,
            duration: 800,
            easing: 'easeOutElastic(1, .5)'
        });

        anime({
            targets: glow,
            opacity: [0, 1],
            duration: 600,
            easing: 'easeOutExpo'
        });

        return {
            targets: component,
            animation,
            cleanup: () => {
                component.style.transform = '';
                glow.style.opacity = '0';
            }
        };
    }

    static async runDemoSequence(controller) {
        const demos = [
            {
                text: '',
                wait: 2500,
                setup: (component) => {
                    component.style.background = 'linear-gradient(45deg, rgba(255, 27, 107, 0.1), rgba(69, 202, 255, 0.1))';
                    component.classList.remove('vertical');
                    component.style.transform = '';
                    component.style.width = '400px';
                    component.style.height = '280px';
                    controller.isVertical = false;
                }
            },
            {
                text: 'Make it vertical and hover...',
                wait: 2500,
                setup: (component) => {
                    const glow = component.querySelector('.glow');
                    glow.style.opacity = '0';
                    controller.isVertical = true;
                }
            },
            {
                text: 'Now rotate it...',
                wait: 2500,
                setup: (component) => {
                    component.style.transform = '';
                    // Maintain vertical state
                    if (controller.isVertical) {
                        component.classList.add('vertical');
                    }
                }
            },
            {
                text: 'Stop rotating and make it big...',
                wait: 2500,
                setup: (component) => {
                    // Maintain vertical state
                    if (controller.isVertical) {
                        component.classList.add('vertical');
                    }
                }
            },
            {
                text: 'Shake it up!',
                wait: 2500,
                setup: (component) => {
                    component.style.transform = '';
                    // Maintain vertical state
                    if (controller.isVertical) {
                        component.classList.add('vertical');
                    }
                }
            }
        ];

        let currentIndex = 0;

        while (true) {
            const demo = demos[currentIndex];
            const component = document.querySelector('.component');
            
            demo.setup(component);
            
            await controller.typeText(demo.text);
            await new Promise(resolve => setTimeout(resolve, demo.wait));
            
            await anime({
                targets: controller.inputField,
                opacity: [1, 0],
                duration: 200,
                easing: 'easeOutQuad'
            }).finished;
            
            controller.inputField.value = '';
            
            await anime({
                targets: controller.inputField,
                opacity: [0, 1],
                duration: 200,
                easing: 'easeInQuad'
            }).finished;

            currentIndex = (currentIndex + 1) % demos.length;
        }
    }
}

// Initialize animations when the page loads
window.addEventListener('DOMContentLoaded', () => {
    const controller = new AnimationController();
    AnimationController.runDemoSequence(controller);
});

// Testimonials animations
const testimonialsTitle = document.querySelector('.testimonials-title');
const testimonialCards = document.querySelectorAll('.testimonial-card');

// Create intersection observer for testimonials
const testimonialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Animate title when it comes into view
            anime({
                targets: testimonialsTitle,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 1000,
                easing: 'easeOutExpo'
            });

            // Animate cards with stagger
            anime({
                targets: testimonialCards,
                opacity: [0, 1],
                translateY: [20, 0],
                duration: 800,
                delay: anime.stagger(150),
                easing: 'easeOutExpo'
            });

            testimonialObserver.disconnect();
        }
    });
}, {
    threshold: 0.2
});

testimonialObserver.observe(document.querySelector('.testimonials-section'));

// Create and animate shapes for testimonials section
const testimonialsShapes = document.querySelector('.testimonials-shapes');
const shapeTypes = [
    // Small shapes
    {
        svg: '<circle cx="50%" cy="50%" r="45%"/>',
        class: 'small'
    },
    {
        svg: '<rect width="90%" height="90%" x="5%" y="5%"/>',
        class: 'small'
    },
    {
        svg: '<polygon points="50,5 95,90 5,90"/>',
        class: 'small'
    },
    // Medium shapes
    {
        svg: '<circle cx="50%" cy="50%" r="45%"/>',
        class: 'medium outline'
    },
    {
        svg: '<rect width="90%" height="90%" x="5%" y="5%"/>',
        class: 'medium'
    },
    // Large shapes
    {
        svg: '<polygon points="50,5 95,90 5,90"/>',
        class: 'large outline'
    }
];

// Add more shapes to testimonials section
for (let i = 0; i < 40; i++) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
    
    svg.classList.add('testimonial-shape');
    svg.classList.add(shapeType.class);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.style.left = Math.random() * 100 + '%';
    svg.style.top = Math.random() * 100 + '%';
    svg.innerHTML = shapeType.svg;
    testimonialsShapes.appendChild(svg);
}

// Animate testimonial shapes with more varied movements
anime({
    targets: '.testimonial-shape',
    translateX: function() { 
        return anime.random(-50, 50) + 'px';
    },
    translateY: function() { 
        return anime.random(-50, 50) + 'px';
    },
    rotate: function() {
        return anime.random(-180, 180);
    },
    scale: function(el) {
        return el.classList.contains('small') ? 
            anime.random(0.5, 1) :
            el.classList.contains('medium') ?
                anime.random(0.8, 1.2) :
                anime.random(1, 1.5);
    },
    opacity: function(el) {
        return el.classList.contains('outline') ?
            anime.random(0.05, 0.1) :
            anime.random(0.03, 0.08);
    },
    duration: function() {
        return anime.random(3000, 6000);
    },
    delay: function() {
        return anime.random(0, 1000);
    },
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
});

// Add floating effect to section separator dot
anime({
    targets: '.section-separator::before',
    scale: [1, 1.2],
    opacity: [0.8, 1],
    duration: 1500,
    direction: 'alternate',
    loop: true,
    easing: 'easeInOutQuad'
}); 