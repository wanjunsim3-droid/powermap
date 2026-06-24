/**
 * ELIF MAGOK GARDEN SQUARE Premium Landing Page JavaScript
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Navigation & Header Control
    // ==========================================
    const header = document.querySelector('.header');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerClose = document.querySelector('.drawer-close');
    const drawerLinks = document.querySelectorAll('.drawer-link, .drawer-btn');

    // Header scroll background change
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile menu toggle
    mobileMenuBtn.addEventListener('click', () => {
        mobileDrawer.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock body scroll
    });

    const closeDrawer = () => {
        mobileDrawer.classList.remove('active');
        document.body.style.overflow = '';
    };

    drawerClose.addEventListener('click', closeDrawer);

    drawerLinks.forEach(link => {
        link.addEventListener('click', closeDrawer);
    });

    // Smooth scroll for all other anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            
            // Skip for empty links, privacy modal, or special navigation-filter links
            if (targetId === '#' || this.classList.contains('privacy-link') || this.id.includes('Link')) {
                return;
            }
            
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navigation Filter Sync
    const navLinkGallery = document.getElementById('navLinkGallery');
    const navLinkFloorplan = document.getElementById('navLinkFloorplan');
    const drawerLinkGallery = document.getElementById('drawerLinkGallery');
    const drawerLinkFloorplan = document.getElementById('drawerLinkFloorplan');

    function triggerGalleryFilter(category, e) {
        if (e) {
            e.preventDefault(); // 기본 해시 이동(깜빡임) 방지
        }
        
        // 스무스 스크롤 이동
        const gallerySection = document.getElementById('gallery');
        if (gallerySection) {
            gallerySection.scrollIntoView({ behavior: 'smooth' });
        }
        
        // 스크롤 시작 시간에 맞춰 약간의 딜레이 후 탭을 강제 클릭
        setTimeout(() => {
            const filterBtn = document.querySelector(`.filter-btn[data-filter="${category}"]`);
            if (filterBtn) {
                filterBtn.click();
            }
        }, 100);
    }

    if (navLinkGallery) navLinkGallery.addEventListener('click', (e) => triggerGalleryFilter('all', e));
    if (navLinkFloorplan) navLinkFloorplan.addEventListener('click', (e) => triggerGalleryFilter('floorplan', e));
    if (drawerLinkGallery) drawerLinkGallery.addEventListener('click', (e) => triggerGalleryFilter('all', e));
    if (drawerLinkFloorplan) drawerLinkFloorplan.addEventListener('click', (e) => triggerGalleryFilter('floorplan', e));


    // ==========================================
    // 2. Gallery Images Data Definition
    // ==========================================
    const imagesData = [
        // 1. 카탈로그 (catalog) - 루트 폴더의 대표 홍보 이미지들
        { file: 'KakaoTalk_20260624_134916011.jpg', category: 'catalog', title: '엘리프 마곡 가든스퀘어 메인 조감도', desc: '자연과 테크가 어우러진 마곡의 랜드마크 프리미엄 오피스 타워' },
        { file: 'KakaoTalk_20260624_134916011_01.jpg', category: 'catalog', title: '고품격 로비 라운지', desc: '입주사의 품격을 극대화해주는 웅장한 로비 공간 설계' },
        { file: 'KakaoTalk_20260624_134916011_02.jpg', category: 'catalog', title: '공중 테라스 정원 (가든스퀘어)', desc: '지상층 입체적인 녹지 테라스로 쾌적한 휴식 공간 선사' },
        { file: 'KakaoTalk_20260624_134916011_03.jpg', category: 'catalog', title: '가든스퀘어 전체 전경', desc: '자연친화적 디자인 테마와 현대적 감각의 어반 오피스' },
        { file: 'KakaoTalk_20260624_134916011_05.jpg', category: 'catalog', title: '비즈니스 특장점 요약', desc: '마곡 최고의 미래가치와 프리미엄 지식산업센터 혜택' },
        { file: 'KakaoTalk_20260624_134916011_06.jpg', category: 'catalog', title: '계룡건설 브랜드 소개', desc: '신뢰의 메이저 브랜드 계룡건설이 짓는 책임 준공 보증' },
        { file: 'KakaoTalk_20260624_134916011_07.jpg', category: 'catalog', title: '최적의 MD 구성 계획', desc: '지상 1층 편의점, 메이저 카페, 약국 및 지하 구내식당 구성' },
        { file: 'KakaoTalk_20260624_134916011_08.jpg', category: 'catalog', title: '층별 쾌적한 동선 설계', desc: '원활한 물류 및 엘리베이터 동선, 친환경 비즈니스 특화' },

        // 2. 입지 및 프리미엄 (premium) - '입지및 프리미엄' 폴더 내 정돈된 파일들
        { file: '입지및 프리미엄/page_2.jpg', category: 'premium', title: '광역 입지 환경 안내', desc: '마곡 18B 블록, 신도심 중심축에 우뚝 서는 최상의 비즈니스 밸리' },
        { file: '입지및 프리미엄/page_3.jpg', category: 'premium', title: '교통망 분석 자료', desc: '9호선 양천향교역 및 5호선 발산역 도보 7분의 완벽한 더블 역세권' },
        { file: '입지및 프리미엄/page_4.jpg', category: 'premium', title: '배후 수요 및 개발 호재', desc: '대기업 R&D 센터 및 연구 단지 연계를 통한 막강한 산업 클러스터 시너지' },
        { file: '입지및 프리미엄/page_5.jpg', category: 'premium', title: '서울식물원 에코 프리미엄', desc: '도보거리 보타닉 파크(서울식물원) 인접으로 쾌적한 친환경 오피스 라이프' },
        { file: '입지및 프리미엄/page_6.jpg', category: 'premium', title: '비즈니스 경쟁력 분석', desc: '비교할 수 없는 교통의 중심이자 성공 투자의 핵심 인프라 확보' },
        { file: '입지및 프리미엄/page_7.jpg', category: 'premium', title: '지식산업센터 특별 세제 혜택', desc: '취득세 및 재산세 감면, 장기 저리 대출 지원 등 정책적 세무 특례' },
        { file: '입지및 프리미엄/page_8.jpg', category: 'premium', title: '금융 및 분양 지원 혜택', desc: '입주 기업의 초기 자금 부담을 대폭 낮춰주는 합리적 공급 조건' },
        { file: '입지및 프리미엄/page_9.jpg', category: 'premium', title: '임대 및 투자 메리트', desc: '마곡지구 최고의 안정적인 임대 수임과 프리미엄 가치 상승 기대' },
        { file: '입지및 프리미엄/page_21.jpg', category: 'premium', title: '종합 비전 가이드', desc: '미래를 향해 뻗어나가는 엘리프 마곡 가든스퀘어의 미래 가치 총괄' },

        // 3. 도면 및 평면도 (floorplan) - '평면도' 폴더 내 정돈된 파일들
        { file: '평면도/page_10.jpg', category: 'floorplan', title: '지하 1층 평면도', desc: '지하 1층 대규모 구내식당(우선배정) 및 운동시설 배치 구성' },
        { file: '평면도/page_11.jpg', category: 'floorplan', title: '지상 1층 평면도', desc: '지상 1층 고품격 근린생활시설(편의점, 대형 카페, 약국 등) 배치' },
        { file: '평면도/page_12.jpg', category: 'floorplan', title: '지상 2층 평면도', desc: '지상 2층 다목적 오피스 및 메디컬, 업무지원시설 최적화 도면' },
        { file: '평면도/page_13.jpg', category: 'floorplan', title: '지상 3층 평면도', desc: '지상 3층 쾌적한 테라스 설계와 호실 연결성이 뛰어난 동선' },
        { file: '평면도/page_14.jpg', category: 'floorplan', title: '지상 4층 평면도', desc: '지상 4층 친환경 섹션오피스 배치도 및 내부 중앙 정원 인접 설계' },
        { file: '평면도/page_15.jpg', category: 'floorplan', title: '지상 5층 평면도', desc: '지상 5층 비즈니스 맞춤형 평면 구성 및 개별 환기 특화 구조' },
        { file: '평면도/page_16.jpg', category: 'floorplan', title: '지상 6층 평면도', desc: '지상 6층 확장형 오피스 구성을 위한 대단위 면적 활용 설계' },
        { file: '평면도/page_17.jpg', category: 'floorplan', title: '지상 7층 평면도', desc: '지상 7층 탁 트인 마곡 뷰 조망권이 확보되기 시작하는 로열층 도면' },
        { file: '평면도/page_18.jpg', category: 'floorplan', title: '지상 8층 평면도', desc: '지상 8층 우수한 조망과 휴식 테라스 정원이 인접해 쾌적함이 뛰어난 층' },
        { file: '평면도/page_19.jpg', category: 'floorplan', title: '지상 9층 평면도', desc: '지상 9층 고층 프리미엄 오피스로 중대형 기업 비즈니스 허브 적합' },
        { file: '평면도/page_20.jpg', category: 'floorplan', title: '지상 10층 평면도', desc: '최상층 스카이라인을 갖춘 펜트하우스형 최고급 프리미엄 오피스 도면' }
    ];

    // Filtered array to manage current displaying images
    let currentFilteredImages = [...imagesData];


    // ==========================================
    // 3. Dynamic Build - Slider and Grid
    // ==========================================
    const sliderContainer = document.getElementById('sliderContainer');
    const sliderPagination = document.getElementById('sliderPagination');
    const galleryGrid = document.getElementById('galleryGrid');

    // Build Slider (using the first 6 key images from catalog)
    const sliderImages = imagesData.filter(img => img.category === 'catalog').slice(0, 6);
    
    sliderImages.forEach((img, idx) => {
        // Create Slide
        const slide = document.createElement('div');
        slide.className = 'slide';
        slide.innerHTML = `
            <img src="${img.file}" alt="${img.title}">
            <div class="slide-info">
                <h3>${img.title}</h3>
                <p>${img.desc}</p>
            </div>
        `;
        // Make slide clickable to open in lightbox
        slide.addEventListener('click', () => openLightbox(imagesData.findIndex(item => item.file === img.file)));
        sliderContainer.appendChild(slide);

        // Create Pagination Dot
        const dot = document.createElement('div');
        dot.className = `pagination-dot ${idx === 0 ? 'active' : ''}`;
        dot.addEventListener('click', () => goToSlide(idx));
        sliderPagination.appendChild(dot);
    });

    // Build Gallery Grid (all images initially)
    function buildGalleryGrid(filter = 'all') {
        galleryGrid.innerHTML = '';
        
        if (filter === 'all') {
            currentFilteredImages = [...imagesData];
        } else {
            currentFilteredImages = imagesData.filter(img => img.category === filter);
        }

        currentFilteredImages.forEach((img) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.innerHTML = `
                <img src="${img.file}" alt="${img.title}" loading="lazy">
                <div class="gallery-item-overlay">
                    <h4>${img.title}</h4>
                    <span>${img.category === 'floorplan' ? '도면 및 평면' : img.category === 'premium' ? '프리미엄' : '카탈로그'}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                // Find index of this image in the current filtered list
                const idx = currentFilteredImages.findIndex(i => i.file === img.file);
                openLightbox(idx, true);
            });
            galleryGrid.appendChild(item);
        });
    }

    buildGalleryGrid(); // Run on init


    // ==========================================
    // 4. Slider Functionality (Carousels)
    // ==========================================
    let activeSlideIndex = 0;
    const slidesCount = sliderImages.length;
    let autoSlideInterval;

    function updateSliderPosition() {
        sliderContainer.style.transform = `translateX(-${activeSlideIndex * 100}%)`;
        
        // Update Dots
        const dots = sliderPagination.querySelectorAll('.pagination-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeSlideIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function goToSlide(index) {
        activeSlideIndex = index;
        updateSliderPosition();
        resetAutoSlide();
    }

    function nextSlide() {
        activeSlideIndex = (activeSlideIndex + 1) % slidesCount;
        updateSliderPosition();
    }

    function prevSlide() {
        activeSlideIndex = (activeSlideIndex - 1 + slidesCount) % slidesCount;
        updateSliderPosition();
    }

    document.getElementById('sliderNext').addEventListener('click', () => {
        nextSlide();
        resetAutoSlide();
    });

    document.getElementById('sliderPrev').addEventListener('click', () => {
        prevSlide();
        resetAutoSlide();
    });

    // Auto Slide Controls
    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000); // 5 sec
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    startAutoSlide(); // Init auto scroll


    // ==========================================
    // 5. Gallery Filtering Tabs
    // ==========================================
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const filterValue = btn.getAttribute('data-filter');
            
            // Toggle slider visibility based on filter (All: show, others: hide to show grid immediately)
            const sliderWrapper = document.querySelector('.slider-wrapper');
            if (sliderWrapper) {
                if (filterValue === 'all') {
                    sliderWrapper.style.display = 'block';
                } else {
                    sliderWrapper.style.display = 'none';
                }
            }
            
            buildGalleryGrid(filterValue);
        });
    });


    // ==========================================
    // 6. Lightbox Modal logic (Zoomed View)
    // ==========================================
    const lightbox = document.getElementById('lightboxModal');
    const lightboxImg = document.getElementById('lightboxImage');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const lightboxClose = document.getElementById('lightboxClose');
    const lightboxPrev = document.getElementById('lightboxPrev');
    const lightboxNext = document.getElementById('lightboxNext');

    let currentLightboxIdx = 0;
    let isFilteredLightbox = false; // Flag to check if we navigate in filtered gallery or overall data

    function openLightbox(index, useFiltered = false) {
        let targetIdx = index;
        let isFiltered = useFiltered;

        // If path is passed as a string (from simulator for example)
        if (typeof index === 'string') {
            const foundIdx = imagesData.findIndex(item => item.file === index);
            if (foundIdx !== -1) {
                targetIdx = foundIdx;
                isFiltered = false; // Open on global dataset
            }
        }

        currentLightboxIdx = targetIdx;
        isFilteredLightbox = isFiltered;
        updateLightboxContent();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function updateLightboxContent() {
        const list = isFilteredLightbox ? currentFilteredImages : imagesData;
        const imgObj = list[currentLightboxIdx];
        
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
            lightboxImg.src = imgObj.file;
            lightboxImg.alt = imgObj.title;
            lightboxCaption.textContent = `${currentLightboxIdx + 1} / ${list.length} - ${imgObj.title} : ${imgObj.desc}`;
            lightboxImg.style.opacity = '1';
        }, 150);
    }

    function nextLightbox() {
        const list = isFilteredLightbox ? currentFilteredImages : imagesData;
        currentLightboxIdx = (currentLightboxIdx + 1) % list.length;
        updateLightboxContent();
    }

    function prevLightbox() {
        const list = isFilteredLightbox ? currentFilteredImages : imagesData;
        currentLightboxIdx = (currentLightboxIdx - 1 + list.length) % list.length;
        updateLightboxContent();
    }

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    });

    lightboxNext.addEventListener('click', nextLightbox);
    lightboxPrev.addEventListener('click', prevLightbox);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'ArrowRight') nextLightbox();
        if (e.key === 'ArrowLeft') prevLightbox();
        if (e.key === 'Escape') {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });


    // ==========================================
    // 7. Interactive Calculator (Simulator)
    // ==========================================
    const simTypeButtons = document.querySelectorAll('.sim-type-btn');
    const selectFloor = document.getElementById('selectFloor');
    const inputArea = document.getElementById('inputArea');
    const contractAreaText = document.getElementById('contractArea');
    const dedicatedAreaText = document.getElementById('dedicatedArea');
    const floorRecom = document.getElementById('floorRecom');
    
    const priceLabel = document.getElementById('priceLabel');
    const calculatedPrice = document.getElementById('calculatedPrice');
    const unitPriceText = document.getElementById('unitPriceText');

    let currentType = 'rent'; // Default

    // Unit Price per Pyeong (평) per Floor configurations
    const floorConfigs = {
        '10': {
            name: '지상 10층 (1001호~1015호)',
            recom: '💡 지상 10층 추천 업종 및 특징',
            recomDesc: 'IT, R&D 연구소, 벤처기업 오피스로 완벽합니다. 보타닉파크 수목원의 탁 트인 조망권과 밝은 채광으로 비즈니스 창의성을 극대화합니다.',
            rentUnitPrice: 5.0, // 5만원 / 평
            buyUnitPrice: 1980 // 1,980만원 / 평
        },
        '9': {
            name: '지상 9층 (901호~913호)',
            recom: '💡 지상 9층 추천 업종 및 특징',
            recomDesc: '엔지니어링, 설계, 전문직 컨설팅 기업에 추천합니다. 고층부 로열 오피스로 임직원의 업무 만족도가 우수합니다.',
            rentUnitPrice: 4.8,
            buyUnitPrice: 1970
        },
        '8': {
            name: '지상 8층 (801호~815호)',
            recom: '💡 지상 8층 추천 업종 및 특징',
            recomDesc: '스타트업, 교육콘텐츠 및 기술 개발 오피스. 중간층 테라스 정원 접근성이 좋으며 가성비가 높은 로열층입니다.',
            rentUnitPrice: 4.6,
            buyUnitPrice: 1960
        },
        '7': {
            name: '지상 7층 (701호~714호)',
            recom: '💡 지상 7층 추천 업종 및 특징',
            recomDesc: '바이오, 헬스케어 및 디자인 에이전시 등 쾌적하고 조용한 업무 환경이 필요한 기업에 추천합니다.',
            rentUnitPrice: 4.5,
            buyUnitPrice: 1950
        },
        '6': {
            name: '지상 6층 (601호~613호)',
            recom: '💡 지상 6층 추천 업종 및 특징',
            recomDesc: '마케팅, 수출입 상사, 미디어 제작 기업. 다양한 층 구성을 통해 필요 시 여러 호실을 확장 연계하기에 유리합니다.',
            rentUnitPrice: 4.4,
            buyUnitPrice: 1940
        },
        '5': {
            name: '지상 5층 (501호~513호)',
            recom: '💡 지상 5층 추천 업종 및 특징',
            recomDesc: '의료기기, 소프트웨어 개발실. 합리적인 임대 가격 포지션으로 초기 기업의 부담을 대폭 경감합니다.',
            rentUnitPrice: 4.3,
            buyUnitPrice: 1930
        },
        '4': {
            name: '지상 4층 (401호~413호)',
            recom: '💡 지상 4층 추천 업종 및 특징',
            recomDesc: '세무, 법무, 노무법인 오피스. 저층부의 신속한 계단식 접근이 가능하며 외래객 방문이 빈번한 사무실에 유리합니다.',
            rentUnitPrice: 4.2,
            buyUnitPrice: 1920
        },
        '2-3': {
            name: '지상 2~3층 (201~237호 / 301~337호)',
            recom: '💡 지상 2~3층 추천 업종 및 특징',
            recomDesc: '대규모 병의원, 학원, 업무지원시설(은행, 세무서 등). 업무 효율과 상가 인프라 혜택을 동시에 누리는 최적의 층입니다.',
            rentUnitPrice: 5.5,
            buyUnitPrice: 2100
        },
        '1': {
            name: '지상 1층 (상가 101호~122호)',
            recom: '💡 지상 1층 추천 업종 및 특징',
            recomDesc: '근린생활시설(편의점, 약국, 프랜차이즈 카페, 은행, 베이커리 등). 스트리트형 특화 설계로 풍부한 도보 유입 인구를 흡수합니다.',
            rentUnitPrice: 15.0, // 15만원 / 평
            buyUnitPrice: 4500 // 4,500만원 / 평
        },
        'B1': {
            name: '지하 1층 (구내식당, 체육시설 등)',
            recom: '💡 지하 1층 추천 업종 및 특징',
            recomDesc: '구내식당(대규모 우선접수), 스크린골프, 피트니스 센터, 스튜디오, 대형 창고시설. 쾌적한 환기 및 층고로 뛰어난 공간 활용을 보장합니다.',
            rentUnitPrice: 3.0,
            buyUnitPrice: 1200
        }
    };

    function formatNumber(num) {
        return num.toLocaleString('ko-KR');
    }

    function calculate() {
        const floor = selectFloor.value;
        const area = parseInt(inputArea.value);
        const config = floorConfigs[floor];
        
        // Update Area texts
        contractAreaText.textContent = area;
        dedicatedAreaText.textContent = Math.round(area * 0.5); // 50% ratio

        // Update Floor recommendation box
        floorRecom.querySelector('h4').textContent = config.recom;
        floorRecom.querySelector('p').textContent = config.recomDesc;

        if (currentType === 'rent') {
            priceLabel.textContent = '예상 보증금 / 월 임대료';
            
            // Rent calculation logic: 
            // Monthly rent = Area * rentUnitPrice
            // Deposit = Monthly rent * 10
            const monthlyRent = Math.round(area * config.rentUnitPrice);
            const deposit = monthlyRent * 10;
            
            unitPriceText.textContent = `임대 평당 약 ${config.rentUnitPrice} 만원`;
            calculatedPrice.innerHTML = `
                <span class="deposit">보증금 <strong>${formatNumber(deposit)}</strong> 만원</span>
                <span class="divider">/</span>
                <span class="monthly">월세 <strong>${formatNumber(monthlyRent)}</strong> 만원</span>
            `;
        } else {
            priceLabel.textContent = '예상 분양가 (총액)';
            
            // Sale calculation logic:
            // Total Price = Area * buyUnitPrice
            const totalBuyPrice = Math.round(area * config.buyUnitPrice);
            const displayEok = Math.floor(totalBuyPrice / 10000);
            const displayMan = totalBuyPrice % 10000;
            
            let priceText = '';
            if (displayEok > 0) {
                priceText = `<strong>${displayEok}</strong>억 ${displayMan > 0 ? `<strong>${formatNumber(displayMan)}</strong>` : ''} 만원`;
            } else {
                priceText = `<strong>${formatNumber(totalBuyPrice)}</strong> 만원`;
            }

            unitPriceText.textContent = `분양 평당 약 ${formatNumber(Math.round(config.buyUnitPrice))} 만원`;
            calculatedPrice.innerHTML = `<span class="buy-total">${priceText}</span>`;
        }
    }

    // Event listeners for calculator
    simTypeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            simTypeButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentType = btn.getAttribute('data-type');
            calculate();
        });
    });

    selectFloor.addEventListener('change', calculate);
    inputArea.addEventListener('input', calculate);

    calculate(); // Initial trigger

    // View Floorplan link inside Simulator Result Card
    const btnViewFloorplan = document.getElementById('btnViewFloorplan');
    if (btnViewFloorplan) {
        btnViewFloorplan.addEventListener('click', (e) => {
            e.preventDefault();
            const floor = selectFloor.value;
            
            // Map selected floor key to the new floorplan file path
            let targetImgPath = '평면도/page_20.jpg'; // Default to 10F
            
            if (floor === 'B1') targetImgPath = '평면도/page_10.jpg';
            else if (floor === '1') targetImgPath = '평면도/page_11.jpg';
            else if (floor === '2-3') targetImgPath = '평면도/page_12.jpg';
            else if (floor === '4') targetImgPath = '평면도/page_14.jpg';
            else if (floor === '5') targetImgPath = '평면도/page_15.jpg';
            else if (floor === '6') targetImgPath = '평면도/page_16.jpg';
            else if (floor === '7') targetImgPath = '평면도/page_17.jpg';
            else if (floor === '8') targetImgPath = '평면도/page_18.jpg';
            else if (floor === '9') targetImgPath = '평면도/page_19.jpg';
            else if (floor === '10') targetImgPath = '평면도/page_20.jpg';
            
            // Open the lightbox using the path string
            openLightbox(targetImgPath, false);
        });
    }


    // ==========================================
    // 8. Contact Form (LOI) Submission
    // ==========================================
    const loiForm = document.getElementById('loiForm');
    
    loiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('userName').value;
        const phone = document.getElementById('userPhone').value;
        const interest = document.getElementById('interestType').value;
        const area = document.getElementById('interestArea').value;
        const message = document.getElementById('userMessage').value;
        const agree = document.getElementById('userAgree').checked;

        if (!agree) {
            alert('개인정보 수집 및 이용에 동의하셔야 접수가 가능합니다.');
            return;
        }

        // Save locally for prototype verification
        const applicantData = {
            name,
            phone,
            interest,
            area,
            message,
            timestamp: new Date().toISOString()
        };

        // Simulated submission
        localStorage.setItem('gardenSquare_loi_' + Date.now(), JSON.stringify(applicantData));

        // Sweet modal feedback (custom alert for high-end feel)
        alert(`🎉 VIP 관심고객 등록 완료!\n\n${name}님, 성공적으로 입주의향 접수가 신청되었습니다.\n빠른 시일 내에 전문 상담사(1666-5984)가 입력하신 번호(${phone})로 배정 및 분양가 특별 할인 상세 정보를 개별 연락드리겠습니다.`);
        
        // Reset form
        loiForm.reset();
    });

});
