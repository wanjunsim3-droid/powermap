// assets/js/center.js

// URL 파라미터에서 ID 추출
function getCenterId() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// 상세 정보 로드 및 렌더링
async function loadCenterDetail() {
  const centerId = getCenterId();
  const container = document.getElementById('detail-content');
  
  if (!centerId) {
    showError(container, '잘못된 접근입니다. 올바른 지식산업센터를 선택해 주세요.');
    return;
  }
  
  try {
    const response = await fetch('assets/data/centers.json');
    if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
    
    const data = await response.json();
    const center = data.centers.find(c => c.id === centerId);
    
    if (!center) {
      showError(container, '요청하신 지식산업센터 정보를 찾을 수 없습니다.');
      return;
    }
    
    // 브라우저 타이틀 변경
    document.title = `${center.name} 상세 정보 | 마곡산단 공식 분양 대행`;
    
    // HTML 구조화
    renderDetail(container, center);
    
    // 탭 기능 활성화
    initTabs(center);
    
    // 문의 폼 서브밋 제어
    initContactForm(center.name);
    
  } catch (e) {
    console.error(e);
    showError(container, `오류가 발생했습니다: ${e.message}`);
  }
}

// 에러 메시지 렌더링
function showError(container, message) {
  container.style.gridTemplateColumns = '1fr';
  container.innerHTML = `
    <div class="sidebar-box" style="text-align: center; padding: 3rem;">
      <p class="error-msg" style="color: #ef4444; font-weight: 700; margin-bottom: 1.5rem;">${message}</p>
      <a href="index.html" class="btn-submit" style="text-decoration: none; display: inline-block;">메인 화면으로 이동</a>
    </div>
  `;
}

// 상세 페이지 구조 렌더링
function renderDetail(container, center) {
  const statusClass = center.status === '분양중' ? 'status-active' : 'status-pending';
  
  // 스펙 테이블 행 생성
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
  
  // 탭 헤더 구성
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
    // 갤러리가 없을 때 기본 썸네일 노출
    tabHeadersHTML = `<button class="tab-btn active" data-tab="tab-0">사업지 이미지</button>`;
    tabPanesHTML = `
      <div class="tab-pane active" id="tab-0">
        <div class="gallery-container">
          <img src="${center.image}" alt="${center.name}" loading="lazy" />
        </div>
      </div>
    `;
  }
  
  // 프리미엄 특징 태그 구성
  const featuresHTML = center.features
    ? center.features.map(f => `<div class="feature-tag">${f}</div>`).join('')
    : '<p>등록된 특징 정보가 없습니다.</p>';

  container.innerHTML = `
    <!-- 왼쪽 주요 콘텐츠 영역 -->
    <div class="detail-main">
      <div class="detail-title-section">
        <h2>${center.name}</h2>
        <span class="status-badge ${statusClass}">${center.status}</span>
      </div>
      
      <!-- 상세 탭 메뉴 -->
      <div class="tab-header">
        ${tabHeadersHTML}
      </div>
      
      <!-- 탭 콘텐츠 내용 -->
      <div class="tab-content" style="margin-bottom: 3rem;">
        ${tabPanesHTML}
      </div>
      
      <!-- 상세 스펙 테이블 -->
      <div class="spec-table-container">
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 1rem;">세부 사업 개요</h3>
        <table class="spec-table">
          <tbody>
            ${specsRows}
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 오른쪽 사이드바 영역 (특징 및 문의하기) -->
    <div class="detail-sidebar">
      <!-- 프리미엄 강점 박스 -->
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
      
      <!-- 분양 문의 박스 -->
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
  `;
}

// 탭 전환 핸들러
function initTabs(center) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // 모든 버튼 및 패널의 active 해제
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      
      // 클릭한 탭 활성화
      btn.classList.add('active');
      const tabId = btn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
}

// 문의 폼 전송 이벤트
function initContactForm(centerName) {
  const form = document.getElementById('inquiry-form');
  const statusMsg = document.getElementById('form-status');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    const size = document.getElementById('interest-size').value;
    const message = document.getElementById('user-message').value.trim();
    
    // 간단 연락처 검증
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
    
    // 버튼 로딩 상태 표현
    const submitBtn = document.getElementById('submit-inquiry');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '상담 예약을 접수하는 중...';
    
    // 로컬 스토리지에 보관 (데모 기록용)
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
      
      // 폼 초기화
      form.reset();
    }, 1200);
  });
}

// 테마 동기화 및 라이트/다크 제어
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

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  loadCenterDetail();
});
