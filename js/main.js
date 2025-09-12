// Fungsi untuk memuat data
async function loadData() {
    try {
        // Log untuk debugging
        console.log('Mencoba memuat data...');
        
        const response = await fetch('./data/data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        console.log('Data berhasil dimuat:', data);

        // Display name in title
        const titleElement = document.getElementById('about-title');
        if (titleElement) {
            titleElement.textContent = data.about.name;
        }
        
        // Display sections
        displayAbout(data.about);
        displaySocialMedia(data.socialMedia);
        displayPortfolio(data.portfolio);
        displayAchievements(data.achievements);
    } catch (error) {
        console.error('Error loading data:', error);
        document.body.innerHTML += `
            <div style="background-color: rgba(255,0,0,0.1); color: red; padding: 20px; margin: 20px; border-radius: 10px;">
                Error loading data: ${error.message}<br>
                Pastikan file data.json ada di folder yang benar dan server berjalan dengan baik.
            </div>
        `;
    }
}

// Display About section
function displayAbout(about) {
    try {
        const aboutContent = document.getElementById('about-content');
        if (aboutContent) {
            aboutContent.innerHTML = `<p class="text-lg leading-relaxed">${about.description}</p>`;
        }
    } catch (error) {
        console.error('Error displaying about section:', error);
    }
}

// Display Social Media links
function displaySocialMedia(socialMedia) {
    try {
        const socialMediaDiv = document.getElementById('social-media');
        if (socialMediaDiv) {
            socialMediaDiv.innerHTML = socialMedia.map(item => `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" 
                   class="social-icon group transition-all duration-300">
                    <i class="fab fa-${item.platform} text-2xl group-hover:text-blue-400"></i>
                </a>
            `).join('');
        }
    } catch (error) {
        console.error('Error displaying social media:', error);
    }
}

// Display Portfolio items
function displayPortfolio(portfolio) {
    try {
        const portfolioItems = document.getElementById('portfolio-items');
        if (portfolioItems) {
            portfolioItems.innerHTML = portfolio.map((item, index) => `
                <div class="glass-card-light overflow-hidden group transform transition-all duration-500 hover:scale-[1.02] h-full flex flex-col" 
                     data-aos="fade-up" 
                     data-aos-delay="${index * 100}"
                     data-aos-duration="1000">
                    <div class="aspect-video overflow-hidden rounded-t-[24px]">
                        <img src="${item.imageUrl}" 
                             alt="${item.title}" 
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                             loading="lazy"
                             onerror="this.onerror=null; this.src='https://via.placeholder.com/600x400?text=Project+Image';">
                    </div>
                    <div class="p-8 flex flex-col flex-grow backdrop-blur-sm">
                        <h3 class="text-xl font-semibold mb-3 text-neutral-800">${item.title}</h3>
                        <p class="text-neutral-600 mb-6 leading-relaxed flex-grow">${item.description}</p>
                        ${item.projectUrl ? `
                            <a href="${item.projectUrl}" 
                               target="_blank" 
                               rel="noopener noreferrer"
                               class="inline-flex items-center px-6 py-3 rounded-full bg-primary-500 hover:bg-primary-600 
                                      transition-all duration-300 text-white text-sm font-medium shadow-lg 
                                      hover:shadow-xl hover:scale-105 self-start mt-auto group">
                                <span class="mr-2">Lihat Project</span>
                                <svg class="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" 
                                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                          d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                                </svg>
                            </a>
                        ` : ''}
                    </div>
                </div>
            `).join('');

            // Refresh AOS untuk animasi yang baru ditambahkan
            if (typeof AOS !== 'undefined') {
                AOS.refresh();
            }
        }
    } catch (error) {
        console.error('Error displaying portfolio:', error);
    }
}

// Display Achievements
function displayAchievements(achievements) {
    try {
        const achievementsItems = document.getElementById('achievements-items');
        if (!achievementsItems) return;

        // Build consistent card markup
        const html = achievements.map((item, i) => {
            const dateHtml = item.date ? `
                <div class="meta mt-6 pt-4 border-t border-neutral-200/40">
                    <svg class="w-5 h-5 text-primary-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-sm text-neutral-500 whitespace-nowrap">${new Date(item.date).toLocaleDateString('id-ID',{ year:'numeric', month:'long', day:'numeric'})}</span>
                </div>` : '';

            return `
                <article class="achievement-card glass-card-light p-6" data-aos="fade-up" data-aos-delay="${i * 120}">
                    <div class="card-content">
                        <h3 class="text-2xl font-semibold text-neutral-800 mb-2">${item.title}</h3>
                        <p class="text-neutral-600 leading-relaxed">${item.description}</p>
                        ${dateHtml}
                    </div>
                </article>
            `;
        }).join('');

        achievementsItems.innerHTML = html;
    } catch (error) {
        console.error('Error displaying achievements:', error);
    }
}

// Cursor Follower Effect
function initCursorFollower() {
    const cursor = document.querySelector('.cursor-follower');
    const cursorSection = document.querySelector('.cursor-section');

    if (!cursor || !cursorSection) return;

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;

    // Add smooth animation using requestAnimationFrame
    function animate() {
        const deltaX = mouseX - cursorX;
        const deltaY = mouseY - cursorY;
        
        cursorX += deltaX * 0.2;
        cursorY += deltaY * 0.2;
        
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        
        requestAnimationFrame(animate);
    }

    // Check if mouse is within the about section
    function isInAboutSection(e) {
        const rect = cursorSection.getBoundingClientRect();
        return (
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom &&
            e.clientX >= rect.left &&
            e.clientX <= rect.right
        );
    }

    // Update cursor position and visibility
    document.addEventListener('mousemove', (e) => {
        if (isInAboutSection(e)) {
            const rect = cursorSection.getBoundingClientRect();
            mouseX = e.clientX - rect.left - cursor.offsetWidth / 2;
            mouseY = e.clientY - rect.top - cursor.offsetHeight / 2;
            cursor.classList.add('visible');
        } else {
            cursor.classList.remove('visible');
        }
    });

    // Handle cursor state on interactive elements
    const interactiveElements = cursorSection.querySelectorAll('a, button, .glass-card-light');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });

    // Start animation
    animate();
}

// Mobile Navigation Toggle
function initMobileNav() {
    const mobileMenuBtn = document.querySelector('nav button');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu hidden fixed top-16 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-lg';
    mobileMenu.innerHTML = `
        <div class="py-4 px-6 space-y-4">
            <a href="#about" class="block text-neutral-700 hover:text-primary-500 font-medium transition-all duration-300">Tentang Saya</a>
            <a href="#portfolio" class="block text-neutral-700 hover:text-primary-500 font-medium transition-all duration-300">Portfolio</a>
            <a href="#achievements" class="block text-neutral-700 hover:text-primary-500 font-medium transition-all duration-300">Pencapaian</a>
        </div>
    `;
    document.body.appendChild(mobileMenu);

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // Close menu when clicking links
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}

// Event listener untuk memuat data saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    console.log('Halaman dimuat, memulai loading data...');
    loadData();
    initCursorFollower();
    initMobileNav();
});
