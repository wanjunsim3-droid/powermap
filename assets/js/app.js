// assets/js/app.js

let globalCenters = [];
let activeCenterId = '';

// 메인 앱 시작점
async function initApp() {
  try {
    const response = await fetch('assets/data/centers.json');
    if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
    
    const data = await response.json();
    globalCenters = data.centers;
    
    // URL에서 ?id=<센터ID> 읽기
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get('id');
    
    // 카드 그리드 렌더링
    renderSelectorGrid();
    
    const selectedCenter = globalCenters.find(c => c.id === urlId);
    const viewer = document.getElementById('detail-viewer');
    
    if (selectedCenter) {
      activeCenterId = selectedCenter.id;
      // 카드 그리드 내 선택 표시 활성화
      updateActiveCard(activeCenterId);
      // 상세 뷰어 데이터 렌더링 및 노출
      renderDetailViewer(selectedCenter);
      viewer.classList.remove('hidden');
    } else {
      activeCenterId = '';
      viewer.classList.add('hidden');
    }

    // 상단 헤드라인 D18-B 링크 클릭 시 이벤트 바인딩
    const headlineD18B = document.getElementById('headline-d18b');
    if (headlineD18B) {
      headlineD18B.addEventListener('click', (e) => {
        e.preventDefault();
        selectCenter('d18b');
      });
    }
    
  } catch (e) {
    console.error(e);
    const container = document.getElementById('centers');
    container.innerHTML = `<p class="error-msg">초기화 중 오류가 발생했습니다: ${e.message}</p>`;
  }
}

// 하단 지식산업센터 선택 카드 목록 렌더링
function renderSelectorGrid() {
  const container = document.getElementById('centers');
  container.innerHTML = '';
  
  globalCenters.slice(0, 3).forEach(center => {
    const card = document.createElement('div');
    // 현재 선택된 센터 카드에 active 클래스 부여
    card.className = `card ${center.id === activeCenterId ? 'active' : ''}`;
    card.setAttribute('data-id', center.id);
    
    // 평당가 대신 유선 문의 안내 문구 적용 (방안 B 선택 반영)
    const statusClass = center.status === '분양중' ? 'status-active' : 'status-pending';
    
    const featuresHTML = center.features
      ? `<ul class="card-features">
          ${center.features.slice(0, 2).map(f => `<li>${f}</li>`).join('')}
         </ul>`
      : '';
 
    card.innerHTML = `
      <div class="card-image-container">
        <img src="${center.image}" alt="${center.name}" loading="lazy" />
        <span class="status-badge ${statusClass}">${center.status}</span>
      </div>
      <div class="card-body">
        <h3>${center.name}</h3>
        ${featuresHTML}
        <div class="card-info">
          <div class="info-row">
            <span class="info-label">잔여 호실</span>
            <span class="info-value highlight">${center.available}개 호실</span>
          </div>
          <div class="info-row">
            <span class="info-label">분양가</span>
            <span class="info-value" style="color: #f97316; font-weight: 700;">상세 문의 (유선 안내)</span>
          </div>
        </div>
        <button class="btn-detail">선택 및 상세보기</button>
      </div>
    `;
    
    // 카드 클릭 시 선택 동작
    card.addEventListener('click', (e) => {
      e.preventDefault();
      selectCenter(center.id);
    });
    
    container.appendChild(card);
  });
}

// 카드 그리드 활성화 스타일 갱신 헬퍼 함수
function updateActiveCard(centerId) {
  // 기존 3개 카드 갱신
  document.querySelectorAll('#centers .card').forEach(card => {
    if (card.getAttribute('data-id') === centerId) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // 헤드라인 배너 활성화 스타일 갱신
  const headlineBar = document.querySelector('.headline-bar');
  if (headlineBar) {
    if (centerId === 'd18b') {
      headlineBar.classList.add('active');
    } else {
      headlineBar.classList.remove('active');
    }
  }
}

// 특정 지식산업센터 선택 핸들링 (데이터 교체 + 노출 + 스크롤)
function selectCenter(centerId) {
  const viewer = document.getElementById('detail-viewer');
  
  if (activeCenterId === centerId) {
    // 이미 선택된 상태이며 뷰어가 보인다면 스크롤만 진행
    if (!viewer.classList.contains('hidden')) {
      scrollToViewer();
      return;
    }
  }
  
  const center = globalCenters.find(c => c.id === centerId);
  if (!center) return;
  
  activeCenterId = centerId;
  
  // URL 주소 업데이트 (페이지 새로고침 없이 쿼리 매개변수 적용)
  const newUrl = `${window.location.pathname}?id=${centerId}`;
  window.history.pushState({ id: centerId }, '', newUrl);
  
  // 카드 그리드 활성화 스타일 갱신
  updateActiveCard(centerId);
  
  if (viewer.classList.contains('hidden')) {
    // 뷰어가 숨겨져 있던 경우: 렌더링하고 활성화 클래스 부여 후 화면 스크롤
    renderDetailViewer(center);
    viewer.classList.remove('hidden');
    viewer.classList.add('revealed');
    
    // 렌더링 시점이 잡히도록 부드러운 스크롤 이동 실행
    setTimeout(() => {
      scrollToViewer();
    }, 50);
    
    // 애니메이션 완료 후 클래스 제거
    setTimeout(() => {
      viewer.classList.remove('revealed');
    }, 600);
  } else {
    // 이미 뷰어가 열려있는 경우: 페이드아웃 애니메이션 처리 후 내용 전환
    viewer.classList.add('fade-out');
    scrollToViewer();
    
    setTimeout(() => {
      renderDetailViewer(center);
      viewer.classList.remove('fade-out');
    }, 250);
  }
}

// 뷰어 영역으로 부드럽게 스크롤
function scrollToViewer() {
  const viewer = document.getElementById('detail-viewer');
  viewer.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 상단 상세 뷰어 정보 렌더링
function renderDetailViewer(center) {
  const viewer = document.getElementById('detail-viewer');
  const statusClass = center.status === '분양중' ? 'status-active' : 'status-pending';
  
  // 상세 스펙 테이블 행 빌드
  let specsRows = '';
  if (center.specs) {
    for (const [key, value] of Object.entries(center.specs)) {
      specsRows += `
        <tr>
          <th>${key}</th>
          <td>${value}</td>
        </tr>
      `;
    }
  }
  
  // 탭 헤더 및 이미지 패널 구성
  let tabHeadersHTML = '';
  let tabPanesHTML = '';
  
  if (center.gallery && center.gallery.length > 0) {
    center.gallery.forEach((item, idx) => {
      const activeClass = idx === 0 ? 'active' : '';
      tabHeadersHTML += `
        <button class="tab-btn ${activeClass}" data-tab="tab-${idx}">
          ${item.tab}
        </button>
      `;
      
      tabPanesHTML += `
        <div class="tab-pane ${activeClass}" id="tab-${idx}">
          <div class="gallery-container">
            <img src="${item.image}" alt="${center.name} - ${item.tab}" loading="lazy" />
          </div>
        </div>
      `;
    });
  } else {
    tabHeadersHTML = `<button class="tab-btn active" data-tab="tab-0">사업지 이미지</button>`;
    tabPanesHTML = `
      <div class="tab-pane active" id="tab-0">
        <div class="gallery-container">
          <img src="${center.image}" alt="${center.name}" loading="lazy" />
        </div>
      </div>
    `;
  }
  
  // 프리미엄 특징 목록
  const featuresHTML = center.features
    ? center.features.map(f => `<div class="feature-tag">${f}</div>`).join('')
    : '<p>등록된 강점 정보가 없습니다.</p>';

  // HTML 적용
  viewer.innerHTML = `
    <div class="detail-layout">
      <!-- 왼쪽 콘텐츠 영역 -->
      <div class="detail-main">
        <div class="detail-title-section">
          <h2>${center.name}</h2>
          <span class="status-badge ${statusClass}">${center.status}</span>
        </div>
        
        <!-- 갤러리 탭 구성 -->
        <div class="tab-header">
          ${tabHeadersHTML}
        </div>
        
        <!-- 갤러리 콘텐츠 -->
        <div class="tab-content" style="margin-bottom: 3rem;">
          ${tabPanesHTML}
        </div>
        
        <!-- 스펙 테이블 -->
        <div class="spec-table-container">
          <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1.25rem;">세부 사업 개요</h3>
          <table class="spec-table">
            <tbody>
              ${specsRows}
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- 오른쪽 사이드바 영역 -->
      <div class="detail-sidebar">
        <!-- 프리미엄 요약 -->
        <div class="sidebar-box">
          <h4>프리미엄 입지 & 강점</h4>
          <div class="feature-tag-list">
            ${featuresHTML}
          </div>
        </div>
        
        <!-- 대표번호 직통전화 배너 -->
        <div class="sidebar-box phone-inquiry-box">
          <h4>신속한 전화 문의</h4>
          <p class="phone-desc">아래 직통 번호로 연락하시면 전문 상담사의 즉시 상세 분양 안내(도면, 분양가, 잔여호실)를 받으실 수 있습니다.</p>
          <a href="tel:1666-5984" class="btn-phone-call">
            <span class="btn-phone-icon">📞</span>
            <span class="btn-phone-num">1666-5984</span>
          </a>
          <a href="https://open.kakao.com/o/sPlaceholder" target="_blank" class="btn-kakao-chat">
            <span>💬</span>
            <span>카카오톡 1:1 빠른 상담</span>
          </a>
        </div>
        
        <!-- 분양 문의 폼 -->
        <div class="sidebar-box">
          <h4>전문가 분양 상담 및 문의</h4>
          <form class="contact-form" id="inquiry-form">
            <div class="form-group">
              <label for="user-name">성함 *</label>
              <input type="text" id="user-name" required placeholder="성함을 입력해주세요." />
            </div>
            <div class="form-group">
              <label for="user-phone">연락처 *</label>
              <input type="tel" id="user-phone" required placeholder="010-0000-0000" />
            </div>
            <div class="form-group">
              <label for="interest-size">희망 평형대</label>
              <select id="interest-size">
                <option value="default">선택해 주세요</option>
                <option value="small">10평 이하 (소형 오피스)</option>
                <option value="medium">10평 ~ 30평 (중형 사무실)</option>
                <option value="large">30평 ~ 50평 (대형 연구소/공장)</option>
                <option value="huge">50평 이상 (사옥급 일괄 임차/분양)</option>
              </select>
            </div>
            <div class="form-group">
              <label for="user-message">상담 문의 내용</label>
              <textarea id="user-message" rows="4" placeholder="상담받으실 내용이나 희망 조건을 남겨주시면 더욱 빠른 안내가 가능합니다."></textarea>
            </div>
            <button type="submit" class="btn-submit" id="submit-inquiry">상담 예약 신청하기</button>
            <div class="form-status-msg" id="form-status"></div>
          </form>
        </div>
      </div>
    </div>
  `;
  
  // 탭 제어 이벤트 리스너 바인딩
  initTabs();
  
  // 문의하기 폼 이벤트 리스너 바인딩
  initContactForm(center.name);
}

// 탭 기능 제어
function initTabs() {
  const tabButtons = document.querySelectorAll('#detail-viewer .tab-btn');
  const tabPanes = document.querySelectorAll('#detail-viewer .tab-pane');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// 문의하기 접수 및 시뮬레이션
function initContactForm(centerName) {
  const form = document.getElementById('inquiry-form');
  const statusMsg = document.getElementById('form-status');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const size = document.getElementById('interest-size').value;
    const message = document.getElementById('user-message').value.trim();
    
    // 연락처 번호 정규식 유효성 테스트
    const phoneRegex = /^[0-9-]{9,14}$/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) {
      statusMsg.className = 'form-status-msg error';
      statusMsg.textContent = '올바른 연락처 형식을 입력해주세요. (예: 010-1234-5678)';
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#ef4444';
      statusMsg.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
      statusMsg.style.border = '1px solid rgba(239, 68, 68, 0.2)';
      return;
    }
    
    const submitBtn = document.getElementById('submit-inquiry');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '상담 예약을 접수하는 중...';
    
    // 로컬 스토리지 데모 기록 저장
    const inquiry = {
      center: centerName,
      name,
      phone,
      size,
      message,
      timestamp: new Date().toISOString()
    };
    
    const existingInquiries = JSON.parse(localStorage.getItem('inquiries') || '[]');
    existingInquiries.push(inquiry);
    localStorage.setItem('inquiries', JSON.stringify(existingInquiries));
    
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
      
      statusMsg.className = 'form-status-msg success';
      statusMsg.innerHTML = `
        🎉 상담 예약이 정상적으로 접수되었습니다!<br>
        <strong>${centerName}</strong> 전문 상담사가 영업일 기준 24시간 이내에 연락드리겠습니다.
        <div style="border-top: 1px dashed rgba(16, 185, 129, 0.3); padding-top: 1rem; margin-top: 1rem;">
          <p style="font-size: 0.8rem; margin-bottom: 0.5rem; color: #047857; line-height: 1.4;">
            문의 내용을 카카오톡으로도 전송하시면 훨씬 더 신속한 1:1 안내를 받으실 수 있습니다.
          </p>
          <button type="button" class="btn-kakao-send" id="kakao-send-btn">
            💬 카카오톡으로 문의내용 전송하기
          </button>
        </div>
      `;
      statusMsg.style.display = 'block';
      statusMsg.style.color = '#059669';
      statusMsg.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
      statusMsg.style.border = '1px solid rgba(16, 185, 129, 0.2)';
      
      const kakaoSendBtn = document.getElementById('kakao-send-btn');
      if (kakaoSendBtn) {
        kakaoSendBtn.addEventListener('click', () => {
          const sizeText = size === 'default' ? '상담 후 결정' : 
                           size === 'small' ? '10평 이하 (소형 오피스)' :
                           size === 'medium' ? '10평 ~ 30평 (중형 사무실)' :
                           size === 'large' ? '30평 ~ 50평 (대형 연구소/공장)' : '50평 이상 (사옥급)';
                           
          const copyText = `[마곡 지식산업센터 분양상담 문의]\n- 신청센터: ${centerName}\n- 성함: ${name}\n- 연락처: ${phone}\n- 희망평형: ${sizeText}\n- 문의내용: ${message || '없음'}`;
          
          navigator.clipboard.writeText(copyText).then(() => {
            alert('문의 내용이 클립보드에 복사되었습니다!\n카카오톡 1:1 대화방이 열리면 채팅창에 붙여넣기(Ctrl+V)해서 전송해 주세요.');
            window.open('https://open.kakao.com/o/sPlaceholder', '_blank');
          }).catch(err => {
            window.open('https://open.kakao.com/o/sPlaceholder', '_blank');
          });
        });
      }
      
      form.reset();
    }, 1200);
  });
}

// 다크 / 라이트 테마 제어
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const current = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', current);
  updateThemeIcon(toggle, current);
  
  toggle.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(toggle, newTheme);
  });
}

function updateThemeIcon(button, theme) {
  if (theme === 'dark') {
    button.innerHTML = '☀️ <span class="toggle-text">라이트 모드로</span>';
    button.setAttribute('aria-label', '라이트 모드로 전환');
  } else {
    button.innerHTML = '🌙 <span class="toggle-text">다크 모드로</span>';
    button.setAttribute('aria-label', '다크 모드로 전환');
  }
}

// 히스토리 팝업 제어 (뒤로가기/앞으로가기 시 주소 동기화)
window.addEventListener('popstate', () => {
  const params = new URLSearchParams(window.location.search);
  const urlId = params.get('id');
  const targetCenter = globalCenters.find(c => c.id === urlId);
  const viewer = document.getElementById('detail-viewer');
  
  if (targetCenter) {
    activeCenterId = targetCenter.id;
    updateActiveCard(activeCenterId);
    renderDetailViewer(targetCenter);
    viewer.classList.remove('hidden');
  } else {
    activeCenterId = '';
    updateActiveCard('');
    viewer.classList.add('hidden');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initApp();
});
