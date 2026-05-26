/* ==========================================================================
   INTERACTIVE LOGIC FOR ALIMAM ANSARI'S EDITORIAL PORTFOLIO
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Sticky Header + Scroll Progress + Back-to-Top --- */
    const header      = document.getElementById('header');
    const progressBar = document.getElementById('scrollProgressBar');
    const backToTop   = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY   = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;

        // Sticky header
        header.classList.toggle('scrolled', scrollY > 30);

        // Scroll progress bar width
        const pct = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
        progressBar.style.width = pct + '%';

        // Back-to-top visibility
        backToTop.classList.toggle('visible', scrollY > 400);
    });

    // Back-to-top click
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    /* --- 2. Animated Stats Counter (triggers once on scroll into view) --- */
    const statNumbers = document.querySelectorAll('.stat-number');
    let countersStarted = false;

    function animateCounter(el) {
        const target  = parseFloat(el.getAttribute('data-target'));
        const suffix  = el.getAttribute('data-suffix') || '';
        const duration = 1800;
        const steps    = 60;
        const increment = target / steps;
        let current = 0;
        let step = 0;
        const timer = setInterval(() => {
            step++;
            current = Math.min(increment * step, target);
            // For decimal target like 4 with suffix ".9" show integer only
            el.textContent = Math.floor(current) + (step >= steps ? suffix : '');
            if (step >= steps) clearInterval(timer);
        }, duration / steps);
    }

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !countersStarted) {
                countersStarted = true;
                statNumbers.forEach(el => animateCounter(el));
                statsObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    const statsRow = document.querySelector('.stats-counter-row');
    if (statsRow) statsObserver.observe(statsRow);

    /* --- 3. Section Fade-In on Scroll --- */
    const fadeElements = document.querySelectorAll(
        '.section-title, .section-subtitle, .glass-card, .edit-timeline-item, ' +
        '.stat-counter-box, .skills-column, .social-card, .feature-item'
    );

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.classList.add('fade-in-section');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    fadeElements.forEach(el => {
        el.classList.add('fade-in-section');
        fadeObserver.observe(el);
    });

    /* --- 4. Skill Progress Bars Animation --- */
    let skillsAnimated = false;
    const skillBars = document.querySelectorAll('.skill-progress');

    const skillObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsAnimated) {
                skillsAnimated = true;
                skillBars.forEach(bar => {
                    const targetWidth = bar.getAttribute('data-width') || '0%';
                    setTimeout(() => { bar.style.width = targetWidth; }, 200);
                });
                skillObserver.disconnect();
            }
        });
    }, { threshold: 0.2 });

    const skillsSection = document.getElementById('skills');
    if (skillsSection) skillObserver.observe(skillsSection);

    /* --- 2. Mobile Menu Slide-Out Drawer --- */
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navMenu.classList.toggle('open');
    });

    // Close side-drawer menu when any link is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navMenu.classList.remove('open');
        });
    });

    /* --- 3. Dynamic Typewriter Effect --- */
    const typewriterElement = document.getElementById('typewriter');
    const words = [
        "M. Pharm Pharmacology Scholar",
        "Data Analytics Specialist",
        "Pharma-Tech Innovator",
        "Medical Research Writer"
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function type() {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            typewriterElement.textContent = currentWord.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 35; // Deleting speed
        } else {
            typewriterElement.textContent = currentWord.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 80; // Natural typing speed
        }

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 2200; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 400; // Pause before typing next word
        }

        setTimeout(type, typingSpeed);
    }

    if (typewriterElement) {
        setTimeout(type, 1000);
    }

    /* --- 4. Collapsible Abstract Drawer --- */
    const abstractToggle = document.getElementById('abstract-toggle');
    const abstractContent = document.getElementById('abstract-drawer-content');

    if (abstractToggle && abstractContent) {
        abstractToggle.addEventListener('click', () => {
            abstractToggle.classList.toggle('active');
            abstractContent.classList.toggle('open');
            
            const icon = abstractToggle.querySelector('i');
            if (abstractContent.classList.contains('open')) {
                icon.className = 'fa-solid fa-chevron-up';
                abstractToggle.innerHTML = '<i class="fa-solid fa-chevron-up"></i> Hide Paper Abstract';
            } else {
                icon.className = 'fa-solid fa-chevron-down';
                abstractToggle.innerHTML = '<i class="fa-solid fa-chevron-down"></i> View Full Paper Abstract';
            }
        });
    }

    /* --- 5. Theme Switcher (Light Default / Dark Option) --- */
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    const htmlElement = document.documentElement;

    // Check for saved theme preference, default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    htmlElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'dark') {
            themeIcon.className = 'fa-solid fa-sun'; // Show sun to toggle to light
        } else {
            themeIcon.className = 'fa-solid fa-moon'; // Show moon to toggle to dark
        }
    }

    /* --- 6. Active Nav Link on Scroll --- */
    const sections = document.querySelectorAll('section');
    
    window.addEventListener('scroll', () => {
        let currentSectionId = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= (sectionTop - 180)) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    /* --- 7. Skills Gauge Scroll Animation --- */
    const skillSection = document.getElementById('skills');
    const skillProgressBars = document.querySelectorAll('.skill-progress');
    let animated = false;

    function checkScrollForSkills() {
        if (!skillSection) return;
        
        const rect = skillSection.getBoundingClientRect();
        const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
        
        if (!animated && rect.top <= viewHeight * 0.82 && rect.bottom >= 0) {
            skillProgressBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth;
            });
            animated = true;
        }
    }

    window.addEventListener('scroll', checkScrollForSkills);
    checkScrollForSkills();

    /* --- 8. Credentials Lightbox Modal --- */
    const certCards = document.querySelectorAll('.cert-card');
    const modal = document.getElementById('cert-modal');
    const modalClose = document.getElementById('modal-close');
    const modalActionBtn = document.getElementById('modal-action-btn');
    
    const modalIcon = document.getElementById('modal-icon');
    const modalTitle = document.getElementById('modal-title');
    const modalIssuer = document.getElementById('modal-issuer');
    const modalDate = document.getElementById('modal-date');
    const modalCred = document.getElementById('modal-cred');
    const modalScope = document.getElementById('modal-scope');

    const certDetails = {
        "1": {
            title: "Pharma Data Science Bootcamp",
            issuer: "Dr. PK Classes",
            date: "January 10, 2026",
            cred: "PK/DSB25/A0013 (8-Weeks Intensive Training)",
            scope: "A comprehensive industrial specialization covering Python programming structures, pharmacological data analytics, introductory classification algorithms, and practical clinical visualization toolsets. Concluded with a capstone drug discovery dashboard study.",
            icon: '<i class="fa-solid fa-laptop-code"></i>'
        },
        "2": {
            title: "Data Analytics Internship",
            issuer: "Pantech Prolabs India Pvt Ltd",
            date: "January 28, 2026",
            cred: "CIN NO: 702687 (30 Days Professional)",
            scope: "Completed 30 days of intensive data science internship. Acquired advanced expertise in preprocessing laboratory records, analyzing metabolic datasets, and generating dynamic reporting dashboards for drug efficacy profiling.",
            icon: '<i class="fa-solid fa-chart-pie"></i>'
        },
        "3": {
            title: "Master Data Analysis with Python",
            issuer: "Udemy (Learnify IT)",
            date: "November 18, 2025",
            cred: "UC-aee8d304-d2f2-45dc-a745-d93f0f590db9",
            scope: "Extensive professional training focused on Python's analytical library ecosystem. Engineered and polished data loading, cleansing, processing, and high-quality scientific plotting configurations using NumPy, Pandas, Matplotlib, and Seaborn.",
            icon: '<i class="fa-brands fa-python"></i>'
        },
        "4": {
            title: "Pharmacology Diploma (UK)",
            issuer: "Udemy (London HeartbeatsZ Academy)",
            date: "February 19, 2026",
            cred: "UC-4f64573a-cd5e-45b9-9145-d01f6c75d00e",
            scope: "Advanced UK certification mapping key pharmacological modules. Deeply researched standard prescription procedures, biochemical mechanisms of drug action, drug classification criteria, metabolic pathways, and toxicology outlines.",
            icon: '<i class="fa-solid fa-pills"></i>'
        },
        "5": {
            title: "WordPress Website Development",
            issuer: "Udemy (Anton Voroniuk)",
            date: "February 21, 2026",
            cred: "UC-506d9bae-691f-4e7e-a263-a3d7e84d05aa",
            scope: "Practical course mapping fully responsive web page engineering. Built hands-on custom content management layouts utilizing Hostinger server interfaces, database bindings, performance tuning, and adaptive UI layouts.",
            icon: '<i class="fa-brands fa-wordpress-simple"></i>'
        },
        "6": {
            title: "Advanced Excel Bootcamp: Pharma Consulting",
            issuer: "Dr. PK Classes (Instructed by Aditya Jindal)",
            date: "May 14, 2025",
            cred: "PK/ExB25/A042",
            scope: "Successfully completed the 10-week intensive training program. Gained practical experience in pharmaceutical industry case studies, dashboarding techniques, VLOOKUP/XLOOKUP formulas, data tables, pivot models, and software tools, equipping the participant with advanced Excel skills tailored for professional pharmaceutical consulting.",
            icon: '<i class="fa-solid fa-file-excel"></i>'
        },
        "7": {
            title: "Good Clinical Practice (GCP)",
            issuer: "NIDA Clinical Trials Network",
            date: "September 16, 2023",
            cred: "Course Completion (Expiration: Sept 16, 2026)",
            scope: "Successfully completed the six-hour required course on Good Clinical Practice (GCP) guidelines. Mastery demonstrated across key modules including Institutional Review Boards (IRBs), Informed Consent, Participant Safety & Adverse Events, Quality Assurance, Research Protocols, Documentation & Record-Keeping, Research Misconduct, Roles & Responsibilities, and Investigational New Drugs.",
            icon: '<i class="fa-solid fa-clipboard-check"></i>'
        },
        "8": {
            title: "Introduction to Pharmacovigilance",
            issuer: "PharmUni (Zamann Pharma Support)",
            date: "April 23, 2025",
            cred: "662499476585 (ISO 9001:2015 Compliant Program)",
            scope: "Successfully completed professional qualification training in the field of Pharmacy, Medical Technology, and Quality Assurance. Covered principles of drug safety surveillance, adverse event identification, classification, international reporting standards, and pharmacovigilance operations under ISO 9001:2015 specifications.",
            icon: '<i class="fa-solid fa-shield-halved"></i>'
        },
        "9": {
            title: "Basics of Intellectual Property Rights & Innovation",
            issuer: "Central University of Punjab",
            date: "August 18, 2025",
            cred: "Ref No: CUPB/IPMCC/2025/SEM02/15",
            scope: "Participated in the academic seminar on 'Basics of Intellectual Property Rights and its Importance for Innovators and Entrepreneurs'. Jointly organized by the Intellectual Property Management and Commercialization Cell (IPMCC), Institution's Innovation Council (IIC), and the Industry Relation Cell (IRC) at Central University of Punjab.",
            icon: '<i class="fa-solid fa-lightbulb"></i>'
        },
        "10": {
            title: "Third Prize: Poster Presentation Award",
            issuer: "Central University of Punjab",
            date: "September 25, 2024",
            cred: "Honors: World Pharmacists Day 2024",
            scope: "Secured Third Prize in the competitive poster presentation organized on World Pharmacists Day 2024 under the theme 'Pharmacists: Meeting Global Health Needs'. Highlighted the critical role of pharmacists in global healthcare, rational medicine use, disease prevention, and patient care through evidence-based practice and therapeutic innovation.",
            icon: '<i class="fa-solid fa-award"></i>'
        },
        "11": {
            title: "GPAT Academic Excellence Trophy",
            issuer: "GPAT Discussion Center (GDC)",
            date: "Academic Years 2023 - 2024",
            cred: "Honors: \"Hard work pays off and you have proved it\"",
            scope: "Awarded this trophy of academic dedication from the GPAT Discussion Center (GDC) in recognition of persistent focus and outstanding performance in qualifying the Graduate Pharmacy Aptitude Test (GPAT) in both 2023 and 2024. Symbolizes outstanding dedication and thorough command of core pharmaceutical subjects.",
            icon: '<i class="fa-solid fa-trophy"></i>'
        }
    };


    certCards.forEach(card => {
        card.addEventListener('click', () => {
            const index = card.getAttribute('data-cert-index');
            const data = certDetails[index];
            
            if (data) {
                modalIcon.innerHTML = data.icon;
                modalTitle.textContent = data.title;
                modalIssuer.textContent = data.issuer;
                modalDate.textContent = data.date;
                modalCred.textContent = data.cred;
                modalScope.textContent = data.scope;
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalActionBtn) modalActionBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    /* --- Web3Forms Contact Form Submission --- */
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitIcon = document.getElementById('submit-icon');
    const submitText = document.getElementById('submit-text');
    const formAlert = document.getElementById('form-alert');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Loading state
            submitBtn.disabled = true;
            submitIcon.className = 'fa-solid fa-spinner fa-spin';
            submitText.textContent = 'Sending...';
            formAlert.style.display = 'none';

            const formData = new FormData(contactForm);
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            try {
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: json
                });

                const result = await response.json();

                if (result.success) {
                    // Success state
                    formAlert.className = 'form-alert form-alert-success';
                    formAlert.innerHTML = '<i class="fa-solid fa-circle-check"></i> Message sent successfully! I\'ll get back to you soon.';
                    formAlert.style.display = 'flex';
                    contactForm.reset();
                    submitIcon.className = 'fa-solid fa-circle-check';
                    submitText.textContent = 'Message Sent!';
                    setTimeout(() => {
                        submitIcon.className = 'fa-solid fa-paper-plane';
                        submitText.textContent = 'Send Message';
                        submitBtn.disabled = false;
                    }, 4000);
                } else {
                    throw new Error(result.message || 'Submission failed');
                }
            } catch (error) {
                // Error state
                formAlert.className = 'form-alert form-alert-error';
                formAlert.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> Something went wrong. Please try again or email me directly.';
                formAlert.style.display = 'flex';
                submitIcon.className = 'fa-solid fa-paper-plane';
                submitText.textContent = 'Send Message';
                submitBtn.disabled = false;
            }
        });
    }

    /* --- Legal Modals (Disclaimer / Privacy / Terms) --- */
    const legalBtnMap = {
        'btn-disclaimer': 'modal-disclaimer',
        'btn-privacy':    'modal-privacy',
        'btn-terms':      'modal-terms'
    };

    Object.entries(legalBtnMap).forEach(([btnId, modalId]) => {
        const btn = document.getElementById(btnId);
        const modal = document.getElementById(modalId);
        if (btn && modal) {
            btn.addEventListener('click', () => {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }
    });

    // Close on close button
    document.querySelectorAll('.legal-modal-close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modalId = closeBtn.getAttribute('data-close');
            document.getElementById(modalId)?.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close on overlay background click
    document.querySelectorAll('.legal-modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.legal-modal-overlay.active').forEach(m => {
                m.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });

    /* --- Custom Cursor Glow & Mouse Trail --- */
    if (window.matchMedia('(pointer: fine)').matches) {
        // Create custom cursor elements dynamically
        const glow = document.createElement('div');
        glow.className = 'custom-cursor-glow';
        const dot = document.createElement('div');
        dot.className = 'custom-cursor-dot';
        document.body.appendChild(glow);
        document.body.appendChild(dot);

        document.body.classList.add('custom-cursor-active');
        
        let mouseX = 0, mouseY = 0;
        let glowX = 0, glowY = 0;
        let isMouseActive = false;
        
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            if (!isMouseActive) {
                isMouseActive = true;
                glow.classList.add('active');
                dot.classList.add('active');
            }
            
            // Move dot instantly for standard crisp responsiveness
            dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        });
        
        // Smooth trailing glow using LERP (Linear Interpolation) with high performance requestAnimationFrame
        function updateGlow() {
            if (isMouseActive) {
                // Lerp formula: current = current + (target - current) * factor
                glowX += (mouseX - glowX) * 0.12;
                glowY += (mouseY - glowY) * 0.12;
                
                glow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
            }
            requestAnimationFrame(updateGlow);
        }
        requestAnimationFrame(updateGlow);
        
        // Hide when mouse leaves window, show when it returns
        document.addEventListener('mouseleave', () => {
            glow.classList.remove('active');
            dot.classList.remove('active');
            isMouseActive = false;
        });
        
        document.addEventListener('mouseenter', () => {
            glow.classList.add('active');
            dot.classList.add('active');
            isMouseActive = true;
        });
        
        // Click visual impact
        document.addEventListener('mousedown', () => {
            glow.classList.add('clicked');
            dot.classList.add('clicked');
        });
        
        document.addEventListener('mouseup', () => {
            glow.classList.remove('clicked');
            dot.classList.remove('clicked');
        });
    }

});
