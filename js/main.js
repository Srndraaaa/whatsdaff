// Fungsi untuk memuat data dari Google Spreadsheet
async function loadData() {
    try {
        console.log('Mencoba memuat data dari spreadsheet...');
        
        const SHEET_ID = '1AO4aaHn5s4ADGDv6V3fIXOcGZcu7W6LKTOXMrVAGC5U';
        const BASE_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&headers=1&sheet=`;

        console.log('Fetching data from sheets...');
        
        const sheetNames = ['About', 'SocialMedia', 'Portfolio', 'Achievements'];
        const fetchedData = {};

        // Mengambil data dari setiap sheet secara paralel
        const fetchPromises = sheetNames.map(sheet => 
            fetch(BASE_URL + sheet)
                .then(r => r.text())
                .then(text => fetchedData[sheet] = text)
                .catch(e => {
                    console.error(`Error loading sheet '${sheet}':`, e);
                    fetchedData[sheet] = null;
                })
        );
        await Promise.all(fetchPromises);

        // Memproses data yang telah diambil
        const data = {
            about: parseSheetData(fetchedData.About, 'about'),
            socialMedia: parseSheetData(fetchedData.SocialMedia, 'socialMedia'),
            portfolio: parseSheetData(fetchedData.Portfolio, 'portfolio'),
            achievements: parseSheetData(fetchedData.Achievements, 'achievements')
        };

        console.log('Data berhasil dimuat:', data);

        // Menampilkan data ke halaman web
        displayAbout(data.about);
        displaySocialMedia(data.socialMedia);
        displayPortfolio(data.portfolio);
        displayAchievements(data.achievements);
    } catch (error) {
        console.error('Fatal Error:', error);
        document.body.innerHTML += `
            <div style="background-color: rgba(255,0,0,0.1); color: red; padding: 20px; margin: 20px; border-radius: 10px;">
                Fatal Error: ${error.message}<br>
                Pastikan spreadsheet dapat diakses dan dipublikasikan dengan benar.
            </div>
        `;
    }
}

// Fungsi untuk memparsing data JSON dari respons Google Sheet
function parseSheetData(jsonText, type) {
    if (!jsonText) {
        console.error(`No data received for ${type}`);
        return type === 'about' ? {} : [];
    }

    try {
        // Menghapus bungkus respons dan mengekstrak JSON string
        const jsonString = jsonText.substring(jsonText.indexOf('{'), jsonText.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString).table;
        
        if (!data || !data.rows || data.rows.length === 0) {
            console.error(`No valid rows found in data for ${type}`);
            return type === 'about' ? {} : [];
        }

        const headers = data.cols.map(col => col.label);
        const dataRows = data.rows.map(row => row.c.map(cell => cell ? cell.v : null));
        
        switch (type) {
            case 'about':
                const aboutRow = dataRows[0];
                return {
                    name: aboutRow[headers.indexOf('name')] || '',
                    description: aboutRow[headers.indexOf('description')] || ''
                };
            case 'socialMedia':
                return dataRows.map(row => ({
                    platform: row[headers.indexOf('platform')] || '',
                    url: row[headers.indexOf('url')] || ''
                })).filter(item => item.platform && item.url);
            case 'portfolio':
                return dataRows.map(row => ({
                    title: row[headers.indexOf('title')] || 'Untitled Project',
                    description: row[headers.indexOf('description')] || '',
                    imageUrl: row[headers.indexOf('imageUrl')] || 'https://placehold.co/600x400?text=No+Image',
                    projectUrl: row[headers.indexOf('projectUrl')] || ''
                })).filter(item => item.title && item.description);
            case 'achievements':
                return dataRows.map(row => {
                    const dateValue = row[headers.indexOf('date')];
                    let date;
                    if (typeof dateValue === 'string' && dateValue.includes('Date(')) {
                        const dateParams = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
                        date = new Date(Date.UTC(dateParams[1], dateParams[2], dateParams[3]));
                    } else {
                        date = new Date(dateValue);
                    }
                    return {
                        title: row[headers.indexOf('title')] || 'Untitled Achievement',
                        description: row[headers.indexOf('description')] || '',
                        date: date.toISOString().split('T')[0]
                    };
                }).filter(item => item.title && item.description);
            default:
                console.error(`Unknown data type: ${type}`);
                return [];
        }
    } catch (error) {
        console.error(`Error parsing ${type} data:`, error);
        return type === 'about' ? {} : [];
    }
}

// Display About section
function displayAbout(about) {
    try {
        const titleElement = document.getElementById('about-title');
        const contentElement = document.getElementById('about-content');
        if (titleElement && about && about.name) {
            titleElement.textContent = about.name;
        }
        if (contentElement && about && about.description) {
            contentElement.innerHTML = `<p class="text-lg leading-relaxed">${about.description}</p>`;
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
        if (!portfolioItems) {
            console.error('Portfolio container not found');
            return;
        }
        if (!Array.isArray(portfolio) || portfolio.length === 0) {
            portfolioItems.innerHTML = `<div class="col-span-full text-center py-8"><p class="text-neutral-600">No portfolio items available.</p></div>`;
            return;
        }
        portfolioItems.innerHTML = portfolio.map((item, index) => `
            <div class="glass-card-light overflow-hidden group transform transition-all duration-500 hover:scale-[1.02] h-full flex flex-col" 
                 data-aos="fade-up" 
                 data-aos-delay="${index * 100}"
                 data-aos-duration="1000">
                <div class="aspect-video overflow-hidden rounded-t-[24px] relative">
                    <img src="${item.imageUrl}" 
                         alt="${item.title}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                         loading="lazy"
                         onerror="this.onerror=null; this.src='https://placehold.co/600x400?text=No+Image';">
                    <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
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
        if (typeof AOS !== 'undefined') { AOS.refresh(); }
    } catch (error) {
        console.error('Error displaying portfolio:', error);
        portfolioItems.innerHTML = `<div class="col-span-full text-center py-8"><p class="text-red-600">Error displaying portfolio items. Please try again later.</p></div>`;
    }
}

// Display Achievements
function displayAchievements(achievements) {
    try {
        const achievementsItems = document.getElementById('achievements-items');
        if (!achievementsItems) {
            console.error('Achievements container not found');
            return;
        }
        if (!Array.isArray(achievements) || achievements.length === 0) {
            achievementsItems.innerHTML = `<div class="col-span-full text-center py-8"><p class="text-neutral-600">No achievements available.</p></div>`;
            return;
        }
        const html = achievements.map((item, i) => {
            let formattedDate = '';
            try {
                formattedDate = new Date(item.date).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Error formatting date:', error);
                formattedDate = item.date || 'Date not available';
            }
            const dateHtml = `<div class="meta mt-6 pt-4 border-t border-neutral-200/40 flex items-center">
                    <svg class="w-5 h-5 text-primary-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                    </svg>
                    <span class="text-sm text-neutral-500 whitespace-nowrap">${formattedDate}</span>
                </div>`;
            return `<article class="achievement-card glass-card-light p-6 transform transition-all duration-500 hover:scale-[1.02]" 
                         data-aos="fade-up" 
                         data-aos-delay="${i * 120}">
                    <div class="card-content">
                        <h3 class="text-2xl font-semibold text-neutral-800 mb-2">${item.title}</h3>
                        <p class="text-neutral-600 leading-relaxed">${item.description}</p>
                        ${dateHtml}
                    </div>
                </article>`;
        }).join('');
        achievementsItems.innerHTML = html;
        if (typeof AOS !== 'undefined') { AOS.refresh(); }
    } catch (error) {
        console.error('Error displaying achievements:', error);
        achievementsItems.innerHTML = `<div class="col-span-full text-center py-8"><p class="text-red-600">Error displaying achievements. Please try again later.</p></div>`;
    }
}

// Inisialisasi efek UI
function initCursorFollower() {
    const cursor = document.querySelector('.cursor-follower');
    const cursorSection = document.querySelector('.cursor-section');
    if (!cursor || !cursorSection) return;
    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    function animate() {
        const deltaX = mouseX - cursorX;
        const deltaY = mouseY - cursorY;
        cursorX += deltaX * 0.2;
        cursorY += deltaY * 0.2;
        cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
        requestAnimationFrame(animate);
    }
    function isInAboutSection(e) {
        const rect = cursorSection.getBoundingClientRect();
        return (
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom &&
            e.clientX >= rect.left &&
            e.clientX <= rect.right
        );
    }
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
    const interactiveElements = cursorSection.querySelectorAll('a, button, .glass-card-light');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('active'));
    });
    animate();
}

function initMobileNav() {
    const mobileMenuBtn = document.querySelector('nav button');
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu hidden fixed top-16 left-0 right-0 bg-white/90 backdrop-blur-lg shadow-lg';
    mobileMenu.innerHTML = `<div class="py-4 px-6 space-y-4">
            <a href="#about" class="block text-neutral-700 hover:text-primary-500 font-medium transition-all duration-300">Tentang Saya</a>
            <a href="#portfolio" class="block text-neutral-700 hover:text-primary-500 font-medium transition-all duration-300">Portfolio</a>
            <a href="#achievements" class="block text-neutral-700 hover:text-primary-500 font-medium transition-all duration-300">Pencapaian</a>
        </div>`;
    document.body.appendChild(mobileMenu);
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
        });
    });
}
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initCursorFollower();
    initMobileNav();
});