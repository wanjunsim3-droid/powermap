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
    // 28 images in the local workspace directory
    const imagesData = [
        { file: 'KakaoTalk_20260624_134916011.jpg', category: 'catalog', title: '엘리프 마곡 가든스퀘어 메인 조감도', desc: '자연과 테크가 어우러진 마곡 18B 블록 프리미엄 오피스 타워' },
        { file: 'KakaoTalk_20260624_134916011_01.jpg', category: 'catalog', title: '고품격 로비 라운지', desc: '입주사의 품격을 높여주는 최고급 마감재의 인테리어 디자인' },
        { file: 'KakaoTalk_20260624_134916011_02.jpg', category: 'catalog', title: '공중 정원 (가든스퀘어)', desc: '도심 속 휴식을 제공하는 입체적인 녹지 테라스 정원 구성' },
        { file: 'KakaoTalk_20260624_134916011_03.jpg', category: 'catalog', title: '가든스퀘어 조감도 B', desc: '자연친화적인 디자인이 적용된 빌딩 전경' },
        { file: 'KakaoTalk_20260624_134916011_04.jpg', category: 'catalog', title: '입지 환경 상세 설명', desc: '강서 마곡 R&D 산업단지의 새로운 심장부' },
        { file: 'KakaoTalk_20260624_134916011_05.jpg', category: 'catalog', title: '특장점 개요', desc: '마곡에 들어서는 압도적 스케일의 지식산업센터 안내' },
        { file: 'KakaoTalk_20260624_134916011_06.jpg', category: 'catalog', title: '계룡건설 브랜드 소개', desc: '신뢰의 계룡건설이 짓는 고품격 오피스 브랜드 엘리프' },
        { file: 'KakaoTalk_20260624_134916011_07.jpg', category: 'catalog', title: 'MD 구성 방향', desc: '상가 및 편의시설, 업무지원시설의 완벽한 밸런스' },
        { file: 'KakaoTalk_20260624_134916011_08.jpg', category: 'catalog', title: '층별 혜택 소개', desc: '층별 쾌적한 테라스 설계와 맞춤형 동선' },
        { file: 'KakaoTalk_20260624_134916011_09.jpg', category: 'catalog', title: '세부 스펙 가이드', desc: '안전하고 친환경적인 최첨단 빌딩 관리 시스템' },
        { file: 'KakaoTalk_20260624_134916011_10.jpg', category: 'catalog', title: '주차 및 교통 인프라', desc: '여유로운 주차 공간과 쾌속 물류 하역 시스템' },
        { file: 'KakaoTalk_20260624_134916011_11.jpg', category: 'premium', title: '마곡 핵심 클러스터 연계', desc: '대기업 연구소(LG, 코오롱 등)와 인접한 비즈니스 시너지 효과' },
        { file: 'KakaoTalk_20260624_134916011_12.jpg', category: 'premium', title: '서울 수목원(보타닉공원) 프리미엄', desc: '여의도 2배 규모 서울식물원 조망 및 힐링 라이프' },
        { file: 'KakaoTalk_20260624_134916011_13.jpg', category: 'premium', title: '교통 허브 네트워크', desc: '김포공항 5분, 올림픽대로 및 강변북로 직결' },
        { file: 'KakaoTalk_20260624_134916011_14.jpg', category: 'premium', title: '양천향교역 및 발산역 교통 인프라', desc: '9호선 양천향교역 및 5호선 발산역으로 연결되는 더블 역세권' },
        { file: 'KakaoTalk_20260624_134916011_15.jpg', category: 'premium', title: '강서 첨단 R&D 배후수요', desc: '풍부한 배후 인구와 고임금 연구 인프라 집중 구역' },
        { file: 'KakaoTalk_20260624_134916011_16.jpg', category: 'premium', title: '지식산업센터 세제 혜택 가이드', desc: '취득세, 재산세 감면 및 장기 저리 정책금융 지원 안내' },
        { file: 'KakaoTalk_20260624_134916011_17.jpg', category: 'premium', title: '비즈니스 지원 혜택', desc: '기업 경쟁력을 극대화할 수 있는 합리적 세제 혜택' },
        { file: 'KakaoTalk_20260624_134916011_18.jpg', category: 'premium', title: '섹션오피스 활용 구조', desc: '필요한 면적만큼 분할 가능한 맞춤형 섹션오피스 설계' },
        { file: 'KakaoTalk_20260624_134916011_19.jpg', category: 'premium', title: '사무실 인테리어 제안', desc: '업무 집중도와 효율을 높여주는 스마트 오피스 시안' },
        { file: 'KakaoTalk_20260624_134916011_20.jpg', category: 'floorplan', title: '지하 1층 평면도', desc: '구내식당, 주차장 및 지원시설 입지 안내' },
        { file: 'KakaoTalk_20260624_134916011_21.jpg', category: 'floorplan', title: '지상 1층 평면도', desc: '스트리트형 상가 구성 및 접근성 최상 레이아웃' },
        { file: 'KakaoTalk_20260624_134916011_22.jpg', category: 'floorplan', title: '지상 2층 ~ 3층 평면도', desc: '테라스형 업무 및 지원시설 층 평면 설계' },
        { file: 'KakaoTalk_20260624_134916011_23.jpg', category: 'floorplan', title: '지상 4층 ~ 6층 평면도', desc: '쾌적한 오피스 구성 및 층간 연결성 확보' },
        { file: 'KakaoTalk_20260624_134916011_24.jpg', category: 'floorplan', title: '지상 7층 ~ 9층 평면도', desc: '마곡 보타닉파크 탁 트인 조망의 로열층 섹션오피스' },
        { file: 'KakaoTalk_20260624_134916011_25.jpg', category: 'floorplan', title: '지상 10층 평면도 (스카이 라인)', desc: '최상층 프리미엄 펜트하우스형 오피스 평면' },
        { file: 'KakaoTalk_20260624_134916011_26.jpg', category: 'floorplan', title: '동선 및 입체 단면도', desc: '빌딩 전체 입체감과 주 동선을 한눈에 파악' },
        { file: 'KakaoTalk_20260624_134916011_27.jpg', category: 'floorplan', title: '엘리프 가든스퀘어 전체 배치도', desc: '대지 경계 및 빌딩 진출입로, 외부 공개공지 배치' }
    ];

    // Filtered array to manage current displaying images
    let currentFilteredImages = [...imagesData];


    // ==========================================
    // 3. Dynamic Build - Slider and Grid
    // ==========================================
    const sliderContainer = document.getElementById('sliderContainer');
    const sliderPagination = document.getElementById('sliderPagination');
    const galleryGrid = document.getElementById('galleryGrid');

    // Build Slider (using the first 6 key images)
    const sliderImages = imagesData.filter((img, idx) => [0, 1, 2, 4, 11, 25].includes(idx));
    
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
        currentLightboxIdx = index;
        isFilteredLightbox = useFiltered;
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
            
            // Map selected floor key to the original imagesData index:
            // B1: 20, 1: 21, 2-3: 22, 4~6: 23, 7~9: 24, 10: 25
            let targetImgIdx = 25; // Default to 10F
            
            if (floor === 'B1') targetImgIdx = 20;
            else if (floor === '1') targetImgIdx = 21;
            else if (floor === '2-3') targetImgIdx = 22;
            else if (['4', '5', '6'].includes(floor)) targetImgIdx = 23;
            else if (['7', '8', '9'].includes(floor)) targetImgIdx = 24;
            else if (floor === '10') targetImgIdx = 25;
            
            // Open the lightbox using the global imagesData index (isFiltered = false)
            openLightbox(targetImgIdx, false);
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
