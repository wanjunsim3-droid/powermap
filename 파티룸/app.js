import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getDatabase, ref, set, push, onValue, remove, update } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import { sendReservationAutoSms } from './sms-service.js';

// =========================================================================
// Firebase 프로젝트 환경 설정 정보 (Config)
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyDx_p55uLN3shY5FwKyVqFd0q0bVMAJ3o8",
  authDomain: "spongpart-7dccd.firebaseapp.com",
  databaseURL: "https://spongpart-7dccd-default-rtdb.firebaseio.com/",
  projectId: "spongpart-7dccd",
  storageBucket: "spongpart-7dccd.firebasestorage.app",
  messagingSenderId: "1004167039743",
  appId: "1:1004167039743:web:f6aac03671736cd6fbdaca",
  measurementId: "G-2ZRB0XF50C"
};

let authService = null;
let db = null;
let useFirebase = false;

// Firebase 설정 값 유효성 체크 및 초기화
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_API_KEY" && firebaseConfig.apiKey.trim() !== "") {
  try {
    const app = initializeApp(firebaseConfig);
    authService = getAuth(app);
    db = getDatabase(app);
    useFirebase = true;
    console.log("Firebase Auth 및 Realtime Database가 정상 연동되었습니다.");
  } catch (err) {
    console.error("Firebase 초기화 실패, 로컬 임시 인증 모드로 대체합니다:", err);
  }
} else {
  console.log("Firebase API Key가 예시용 값입니다. 브라우저 내부 가상 로그인 모드로 정상 작동합니다.");
}

// -------------------------------------------------------------------------
// 회원 가입 및 로그인 공통 인터페이스 (하이브리드 모드 지원)
// -------------------------------------------------------------------------
function registerUser(nickname, email, password) {
  if (useFirebase && authService) {
    return createUserWithEmailAndPassword(authService, email, password)
      .then((userCredential) => {
        return updateProfile(userCredential.user, {
          displayName: nickname
        }).then(() => userCredential.user);
      });
  } else {
    return new Promise((resolve, reject) => {
      let users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      if (users.find(u => u.email === email)) {
        reject(new Error("이미 가입된 이메일 주소입니다."));
        return;
      }
      const newUser = { nickname, email, password };
      users.push(newUser);
      localStorage.setItem('mock_users', JSON.stringify(users));
      localStorage.setItem('mock_current_user', JSON.stringify(newUser));
      window.dispatchEvent(new Event('local-auth-change'));
      resolve(newUser);
    });
  }
}

function loginUser(email, password) {
  if (useFirebase && authService) {
    return signInWithEmailAndPassword(authService, email, password)
      .then((userCredential) => userCredential.user);
  } else {
    return new Promise((resolve, reject) => {
      let users = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('mock_current_user', JSON.stringify(user));
        window.dispatchEvent(new Event('local-auth-change'));
        resolve(user);
      } else {
        reject(new Error("이메일 또는 비밀번호가 잘못되었습니다."));
      }
    });
  }
}

function logoutUser() {
  if (useFirebase && authService) {
    return signOut(authService);
  } else {
    return new Promise((resolve) => {
      localStorage.removeItem('mock_current_user');
      window.dispatchEvent(new Event('local-auth-change'));
      resolve();
    });
  }
}

function setupAuthStateListener(callback) {
  if (useFirebase && authService) {
    onAuthStateChanged(authService, (user) => {
      if (user) {
        callback({
          email: user.email,
          displayName: user.displayName || '회원'
        });
      } else {
        callback(null);
      }
    });
  } else {
    const checkLocal = () => {
      const currentUser = JSON.parse(localStorage.getItem('mock_current_user'));
      if (currentUser) {
        callback({
          email: currentUser.email,
          displayName: currentUser.nickname || '회원'
        });
      } else {
        callback(null);
      }
    };
    checkLocal();
    window.addEventListener('local-auth-change', checkLocal);
  }
}

// =========================================================================
// 공통 가격 계산 단일 함수 (계산기 & 예약창 일원화)
// =========================================================================
export function calculatePrice(dayType, timeType, hours) {
  const h = parseInt(hours, 10);
  if (isNaN(h)) return null;

  // ① 주중 주간 — 월~목 / 10:00~18:00 (최소 2시간, 시간당 25,000원)
  if (dayType === 'weekday' && timeType === 'day') {
    if (h < 2) return null;
    return h * 25000;
  }

  // ② 주중 야간 — 월~목 / 18:00 이후 (최소 3시간, 시간당 50,000원 / 기본 3시간 150,000원)
  if (dayType === 'weekday' && timeType === 'night') {
    if (h < 3) return null;
    return h * 50000;
  }

  // ③ 주말 주간 — 금~일 / 10:00~18:00 (최소 2시간, 시간당 40,000원 / 기본 2시간 80,000원)
  if (dayType === 'weekend' && timeType === 'day') {
    if (h < 2) return null;
    return h * 40000;
  }

  // ④ 주말 야간 — 금~일 / 18:00 이후 (최소 6시간, 시간당 50,000원 / 기본 6시간 300,000원)
  if (dayType === 'weekend' && timeType === 'night') {
    if (h < 6) return null;
    return h * 50000;
  }

  return null;
}

export function getMinHours(dayType, timeType) {
  if (dayType === 'weekday') {
    return timeType === 'day' ? 2 : 3;
  } else {
    return timeType === 'day' ? 2 : 6;
  }
}

document.addEventListener('DOMContentLoaded', () => {

  // =========================================================================
  // 1. Header Scroll Effect
  // =========================================================================
  const header = document.getElementById('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // =========================================================================
  // 2. Interactive Feature Visual Selector
  // =========================================================================
  const featureItems = document.querySelectorAll('.feature-item');
  const featureImgDisplay = document.getElementById('feature-img-display');
  
  const featureVisuals = {
    'feature-1': {
      glowColor: '#9d4edd',
      bg: 'url("./images/photo_18.png") center/cover no-repeat'
    },
    'feature-2': {
      glowColor: '#e0aaff',
      bg: 'url("./images/photo_20.jpg") center/cover no-repeat'
    },
    'feature-3': {
      glowColor: '#ffb703',
      bg: 'url("./images/photo_17.jpg") center/cover no-repeat'
    }
  };

  featureItems.forEach(item => {
    item.addEventListener('click', () => {
      // Remove active from all
      featureItems.forEach(i => i.classList.remove('active'));
      // Add active to clicked
      item.classList.add('active');
      
      // Update visual display
      const imageKey = item.getAttribute('data-image');
      const visual = featureVisuals[imageKey];
      
      if (visual) {
        featureImgDisplay.style.background = visual.bg;
        featureImgDisplay.innerHTML = `
          <div class="blur-glow-effect" style="background-color: ${visual.glowColor}; opacity: 0.15;"></div>
        `;
      }
    });
  });

  // =========================================================================
  // 3. Realtime Rental Price Calculator & Member 50,000 KRW Discount
  // =========================================================================
  const MEMBER_DISCOUNT = 50000; // 회원 가입 5만원 특별 할인 혜택
  let currentAuthUser = null;

  const dayWeekday = document.getElementById('day-weekday');
  const dayWeekend = document.getElementById('day-weekend');
  const timeDay = document.getElementById('time-day');
  const timeNight = document.getElementById('time-night');
  const hoursRange = document.getElementById('rent-hours-range');
  const hoursLabel = document.getElementById('hours-label');
  const priceDisplay = document.getElementById('calculated-price-amount');
  const calcOriginalPrice = document.getElementById('calc-original-price');
  const rangeHint = document.querySelector('.range-hint');
  const calcLockOverlay = document.getElementById('calc-lock-overlay');
  
  // Estimate labels
  const estDayType = document.getElementById('est-day-type');
  const estTimeType = document.getElementById('est-time-type');
  const estHours = document.getElementById('est-hours');
  const modalSummaryPrice = document.getElementById('modal-summary-price');
  const modalSummaryOption = document.getElementById('modal-summary-option');
  const modalOriginalPrice = document.getElementById('modal-original-price');

  // Rules based pricing calculator updater
  function updateCalculator() {
    const dayType = (dayWeekend && dayWeekend.checked) ? 'weekend' : 'weekday';
    const timeType = (timeNight && timeNight.checked) ? 'night' : 'day';
    
    // Dynamic slider limits validation
    const minHours = getMinHours(dayType, timeType);

    if (hoursRange) {
      hoursRange.min = minHours;
      hoursRange.max = 8;
      if (parseInt(hoursRange.value, 10) < minHours) {
        hoursRange.value = minHours;
      }
    }

    const hours = hoursRange ? parseInt(hoursRange.value, 10) : minHours;
    const originalPrice = calculatePrice(dayType, timeType, hours);

    // 안내 문구 설정
    let hintText = "최소 2시간부터 최대 8시간까지 예약 가능";
    if (dayType === 'weekday') {
      if (timeType === 'day') {
        hintText = "주중 주간은 최소 2시간(시간당 25,000원)부터 예약 가능합니다.";
      } else {
        hintText = "주중 야간은 최소 3시간(기본 150,000원 / 추가 시간당 50,000원)부터 예약 가능합니다.";
      }
    } else {
      if (timeType === 'day') {
        hintText = "주말 주간은 최소 2시간(기본 80,000원 / 추가 시간당 40,000원)부터 예약 가능합니다.";
      } else {
        hintText = "주말 야간은 최소 6시간(기본 300,000원 / 추가 시간당 50,000원)부터 예약 가능합니다.";
      }
    }

    if (rangeHint) {
      rangeHint.textContent = hintText;
    }

    // Formatting & Displaying values
    const dayLabel = dayType === 'weekday' ? '주중 (월~목)' : '주말 (금~일)';
    const timeLabel = timeType === 'day' ? '주간 (10:00 - 18:00)' : '야간 (18:00 이후)';

    if (hoursLabel) {
      hoursLabel.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> 대여 시간: ${hours}시간`;
    }
    if (estDayType) {
      estDayType.textContent = `이용 요일: ${dayLabel}`;
    }
    if (estTimeType) {
      estTimeType.textContent = `이용 시간대: ${timeLabel}`;
    }
    if (estHours) {
      estHours.textContent = `총 이용 시간: ${hours}시간`;
    }
    
    if (originalPrice === null) {
      if (priceDisplay) priceDisplay.textContent = '-';
      if (calcOriginalPrice) calcOriginalPrice.textContent = '-';
      if (modalSummaryPrice) modalSummaryPrice.textContent = '-';
      if (modalOriginalPrice) modalOriginalPrice.textContent = '';
      if (modalSummaryOption) modalSummaryOption.textContent = `해당 시간대의 최소 이용시간은 ${minHours}시간입니다.`;
    } else {
      // 5만원 회원 할인 계산 (0원 미만 차단)
      const finalPrice = Math.max(0, originalPrice - MEMBER_DISCOUNT);
      const formattedOriginalPrice = originalPrice.toLocaleString('ko-KR');
      const formattedFinalPrice = finalPrice.toLocaleString('ko-KR');

      if (calcOriginalPrice) calcOriginalPrice.textContent = `₩${formattedOriginalPrice}`;
      if (priceDisplay) priceDisplay.textContent = formattedFinalPrice;
      if (modalSummaryPrice) modalSummaryPrice.textContent = formattedFinalPrice;
      if (modalOriginalPrice) modalOriginalPrice.textContent = `(정상가 ₩${formattedOriginalPrice})`;
      if (modalSummaryOption) {
        modalSummaryOption.textContent = `${dayLabel} / ${timeLabel.split(' ')[0]} / ${hours}시간`;
      }
    }
  }

  // Bind calculation events
  [dayWeekday, dayWeekend, timeDay, timeNight].forEach(input => {
    if (input) input.addEventListener('change', updateCalculator);
  });
  if (hoursRange) {
    hoursRange.addEventListener('input', updateCalculator);
  }

  // Initialize Calculator on load
  updateCalculator();

  // =========================================================================
  // 4. Booking Modal Toggle & Seamless Submission Flow
  // =========================================================================
  const bookingModal = document.getElementById('booking-modal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const bookingTriggers = document.querySelectorAll('.btn-booking-trigger');
  const bookingForm = document.getElementById('booking-form');
  const bookingSuccessView = document.getElementById('booking-success-view');
  const btnSuccessClose = document.getElementById('btn-success-close');
  const successUserName = document.getElementById('success-user-name');
  const successDate = document.getElementById('success-date');
  const successGuests = document.getElementById('success-guests');
  const successPrice = document.getElementById('success-price');

  // 부드러운 토스트 알림 UI 함수
  function showToast(message, duration = 3500) {
    let toast = document.getElementById('global-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'global-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(20, 20, 30, 0.95);
        color: #fff;
        padding: 14px 24px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.15);
        z-index: 99999;
        transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        display: flex;
        align-items: center;
        gap: 10px;
        pointer-events: none;
        opacity: 0;
      `;
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #ffd166; font-size: 16px;"></i> <span>${message}</span>`;
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(-50%) translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(-50%) translateY(100px)';
      toast.style.opacity = '0';
    }, duration);
  }

  // 오늘 날짜로 기본값 설정 (YYYY-MM-DD 형식) 및 클릭 시 달력 팝업 노출
  const bookingDateInput = document.getElementById('booking-date');
  if (bookingDateInput) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    bookingDateInput.value = `${yyyy}-${mm}-${dd}`;

    // 입력란 클릭 시 달력 선택기 강제 호출
    bookingDateInput.addEventListener('click', () => {
      if (typeof bookingDateInput.showPicker === 'function') {
        try {
          bookingDateInput.showPicker();
        } catch (err) {
          console.error("showPicker failed:", err);
        }
      }
    });
  }

  function openBookingModal() {
    updateCalculator(); // 모달 오픈 시 최신 계산 데이터 동기화
    if (bookingForm) bookingForm.style.display = 'block';
    if (bookingSuccessView) bookingSuccessView.style.display = 'none';
    bookingModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scroll
  }

  function closeModal() {
    bookingModal.classList.remove('active');
    document.body.style.overflow = ''; // Unlock scroll
  }

  bookingTriggers.forEach(btn => {
    btn.addEventListener('click', openBookingModal);
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (btnSuccessClose) {
    btnSuccessClose.addEventListener('click', closeModal);
  }

  // Close modal when clicking on the overlay shadow
  bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
      closeModal();
    }
  });

  // Handle Form Submission (자동 문자 발송 및 성공 모달 연동)
  bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 이용 규정 동의 체크 여부 검증
    const agreeRules = document.getElementById('agree-rules');
    if (agreeRules && !agreeRules.checked) {
      alert("이용 규정에 동의하셔야 예약 신청이 가능합니다.");
      return;
    }

    // 접속한 페이지명에 따라 브랜드명을 동적으로 세팅
    const isDdanddara = window.location.pathname.includes('ddanddara');
    const brandName = isDdanddara ? '딴따라 공간대여' : '스폰지 파티룸';

    // 단일 가격 계산 함수를 통해 금액 및 옵션 동기화
    const dayType = (dayWeekend && dayWeekend.checked) ? 'weekend' : 'weekday';
    const timeType = (timeNight && timeNight.checked) ? 'night' : 'day';
    const hours = hoursRange ? parseInt(hoursRange.value, 10) : 3;
    const originalPrice = calculatePrice(dayType, timeType, hours);
    const minHours = getMinHours(dayType, timeType);

    if (originalPrice === null) {
      alert(`해당 시간대의 최소 이용시간은 ${minHours}시간입니다.`);
      return;
    }

    const finalPrice = Math.max(0, originalPrice - MEMBER_DISCOUNT);
    const dayLabel = dayType === 'weekday' ? '주중(월~목)' : '주말(금~일)';
    const timeLabel = timeType === 'day' ? '주간' : '야간';
    const summaryPrice = finalPrice.toLocaleString('ko-KR');
    const formattedOriginal = originalPrice.toLocaleString('ko-KR');
    const optionSummary = `${dayLabel} / ${timeLabel} / ${hours}시간 / ₩${summaryPrice} (5만원 할인적용)`;

    const name = document.getElementById('user-name').value;
    const phone = document.getElementById('user-phone').value;
    const date = document.getElementById('booking-date').value;
    const guests = document.getElementById('guest-count').value;
    const note = document.getElementById('booking-note').value || '없음';

    const reservationData = {
      name,
      phone,
      date,
      guests,
      note,
      dayType,
      timeType,
      hours,
      optionSummary,
      originalPrice: formattedOriginal,
      discount: MEMBER_DISCOUNT,
      price: summaryPrice,
      brand: brandName,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    // Realtime Database 예약 데이터 안전 업로드
    if (useFirebase && db) {
      try {
        const reservationsRef = ref(db, 'reservations');
        const newResRef = push(reservationsRef);
        set(newResRef, reservationData).catch(err => {
          console.warn("Firebase 저장 권한/네트워크 경고:", err.message);
        });
      } catch (err) {
        console.warn("Realtime DB 저장 예외:", err);
      }
    }

    // 로컬 가상 모드 백업 저장
    try {
      let mockReservations = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
      mockReservations.push(reservationData);
      localStorage.setItem('mock_reservations', JSON.stringify(mockReservations));
      window.dispatchEvent(new Event('local-reservations-change'));
    } catch (e) {
      console.warn("LocalStorage 저장 오류:", e);
    }

    // 1. 사장님 및 고객 휴대폰으로 자동 확인 문자 발송 (비동기 처리)
    sendReservationAutoSms(reservationData).catch(err => {
      console.warn("자동 문자 발송 실패 경고:", err);
    });

    // 2. 완료 뷰 정보 주입 및 화면 전환
    const successOption = document.getElementById('success-option');
    if (successUserName) successUserName.textContent = name;
    if (successDate) successDate.textContent = date;
    if (successOption) successOption.textContent = `${dayLabel} ${timeLabel} ${hours}시간`;
    if (successGuests) successGuests.textContent = `${guests}명`;
    if (successPrice) successPrice.textContent = `₩${summaryPrice}`;

    if (bookingForm) bookingForm.style.display = 'none';
    if (bookingSuccessView) bookingSuccessView.style.display = 'block';

    showToast("🎉 50,000원 회원 할인 혜택이 적용되어 예약 신청 및 확인 문자가 발송되었습니다!");
    bookingForm.reset();
  });

  // =========================================================================
  // 4-2. Auth Modal (Login/Signup) Toggle & Form Handle
  // =========================================================================
  const authModal = document.getElementById('auth-modal');
  const authToggleBtn = document.getElementById('btn-auth-toggle');
  const authCloseBtn = document.getElementById('btn-auth-close');
  const authTabs = document.querySelectorAll('.auth-tab-btn');
  const authContents = document.querySelectorAll('.auth-tab-content');
  
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  
  const userProfileBadge = document.getElementById('user-profile-badge');
  const userNicknameDisplay = document.getElementById('user-nickname-display');
  const userNameInput = document.getElementById('user-name');

  // 모달 열기 함수
  function openAuthModal() {
    if (authModal) {
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // 모달 닫기
  function closeAuthModal() {
    if (authModal) {
      authModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  // 모든 인증 트리거 버튼에 리스너 바인딩
  if (authToggleBtn) {
    authToggleBtn.addEventListener('click', openAuthModal);
  }
  document.querySelectorAll('.btn-auth-trigger').forEach(btn => {
    btn.addEventListener('click', openAuthModal);
  });

  if (authCloseBtn) {
    authCloseBtn.addEventListener('click', closeAuthModal);
  }
  if (authModal) {
    authModal.addEventListener('click', (e) => {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }

  // 로그인/회원가입 탭 토글 전환
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      authTabs.forEach(t => t.classList.remove('active'));
      authContents.forEach(c => c.classList.remove('active'));
      
      tab.classList.add('active');
      const targetContent = document.getElementById(tab.getAttribute('data-tab'));
      if (targetContent) {
        targetContent.classList.add('active');
      }
    });
  });

  // 회원가입 핸들러
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nickname = document.getElementById('signup-nickname').value;
      const email = document.getElementById('signup-email').value;
      const password = document.getElementById('signup-password').value;
      const passwordConfirm = document.getElementById('signup-password-confirm').value;

      if (password !== passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다. 다시 확인해 주세요.");
        return;
      }
      if (password.length < 6) {
        alert("보안을 위해 비밀번호는 6자리 이상으로 입력해 주세요.");
        return;
      }

      registerUser(nickname, email, password)
        .then(() => {
          alert(`🎉 축하합니다! 회원가입 완료로 50,000원 추가 할인 혜택이 적용됩니다!\n${nickname}님, 환영합니다!`);
          signupForm.reset();
          closeAuthModal();
          showToast(`🎁 ${nickname}님, 50,000원 즉시 할인 혜택이 적용되었습니다!`);
        })
        .catch(err => {
          alert(`가입 중 오류 발생: ${err.message}`);
        });
    });
  }

  // 로그인 핸들러
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      loginUser(email, password)
        .then(() => {
          alert("🔓 로그인이 완료되었습니다. 50,000원 회원 할인이 적용됩니다.");
          loginForm.reset();
          closeAuthModal();
          showToast("🎁 50,000원 회원 할인 혜택이 활성화되었습니다!");
        })
        .catch(err => {
          alert(`로그인 실패: ${err.message}`);
        });
    });
  }

  // 프로필 배지 클릭 시 로그아웃
  if (userProfileBadge) {
    userProfileBadge.style.cursor = 'pointer';
    userProfileBadge.addEventListener('click', () => {
      if (confirm("로그아웃 하시겠습니까?")) {
        logoutUser().then(() => {
          alert("로그아웃 되었습니다.");
        });
      }
    });
  }

  // 실시간 인증 세션 감지 및 UI 렌더링 동기화
  setupAuthStateListener((user) => {
    const mobileAuthBtn = document.getElementById('mobile-auth-btn');
    if (user) {
      currentAuthUser = user;
      if (calcLockOverlay) calcLockOverlay.classList.add('hidden');
      if (userProfileBadge) userProfileBadge.style.display = 'flex';
      if (userNicknameDisplay) userNicknameDisplay.textContent = user.displayName;
      if (authToggleBtn) authToggleBtn.style.display = 'none';
      if (mobileAuthBtn) mobileAuthBtn.style.display = 'none';

      // 예약 모달 오픈 시 성함 자동 채우기
      if (userNameInput) {
        userNameInput.value = user.displayName;
        userNameInput.readOnly = true; // 로그인 정보 연동으로 편집 불가 처리
      }
    } else {
      currentAuthUser = null;
      if (calcLockOverlay) calcLockOverlay.classList.remove('hidden');
      if (userProfileBadge) userProfileBadge.style.display = 'none';
      if (authToggleBtn) authToggleBtn.style.display = 'inline-flex';
      if (mobileAuthBtn) mobileAuthBtn.style.display = 'block';
      if (userNameInput) {
        userNameInput.value = '';
        userNameInput.readOnly = false;
      }
    }
    updateCalculator();
  });

  // =========================================================================
  // 5. 메인 비주얼 히어로 이미지 페이드 슬라이더 (3장 이미지 순환)
  // =========================================================================
  const heroSlides = document.querySelectorAll('.visual-image-slider .slide');
  if (heroSlides.length > 0) {
    let currentSlideIndex = 0;
    setInterval(() => {
      heroSlides[currentSlideIndex].classList.remove('active');
      currentSlideIndex = (currentSlideIndex + 1) % heroSlides.length;
      heroSlides[currentSlideIndex].classList.add('active');
    }, 4000); // 4초 간격 페이드
  }

  // =========================================================================
  // 6. 모바일 메뉴 (햄버거 버튼) 토글 및 링크 자동 닫기
  // =========================================================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileNavItems = document.querySelectorAll('.mobile-nav-item');

  if (mobileMenuBtn && mobileNav) {
    mobileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      mobileNav.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (mobileNav.classList.contains('active')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    // 외부 영역 클릭 시 드롭다운 닫기
    document.addEventListener('click', (e) => {
      if (!mobileNav.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        mobileNav.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      }
    });

    // 메뉴 항목 선택 시 자동으로 메뉴 닫기
    mobileNavItems.forEach(item => {
      item.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) icon.className = 'fa-solid fa-bars';
      });
    });
  }

  // =========================================================================
  // 7. 실시간 예약 현황 달력 동적 렌더링 및 모달 연동
  // =========================================================================
  const calendarDaysGrid = document.getElementById('calendar-days-grid');
  const currentMonthYearLabel = document.getElementById('current-month-year');
  const prevMonthBtn = document.getElementById('prev-month-btn');
  const nextMonthBtn = document.getElementById('next-month-btn');

  // 예약 마감(완료) 날짜 목록 설정 (기본 수동 지정 날짜들 제거 - DB로 일원화)
  const defaultBookedDates = [];
  let dynamicBookedDates = []; // DB 또는 LocalStorage에서 로드된 예약 확정 날짜들

  let calendarDate = new Date(); // 달력에서 현재 가리키는 날짜 기준

  // 실시간 예약일 정보 감지 및 연동
  function syncBookedDates() {
    // 최초 1회 즉시 렌더링하여 Firebase 로드 중에도 달력이 비어있지 않도록 조치
    renderCalendar();

    if (useFirebase && db) {
      try {
        const reservationsRef = ref(db, 'reservations');
        onValue(reservationsRef, (snapshot) => {
          dynamicBookedDates = [];
          const data = snapshot.val();
          if (data) {
            Object.values(data).forEach(res => {
              if (res.status === "confirmed" && res.date) {
                dynamicBookedDates.push(res.date);
              }
            });
          }
          renderCalendar();
        }, (err) => {
          console.error("Firebase 데이터 수신 실패 (권한 제한 등):", err);
          // 에러 시에도 기본 달력 렌더링 상태를 유지합니다.
          renderCalendar();
        });
      } catch (err) {
        console.error("실시간 예약 데이터 수신 실패:", err);
        renderCalendar();
      }
    } else {
      // 로컬 가상 예약 데이터 동기화
      const syncLocal = () => {
        dynamicBookedDates = [];
        const localRes = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
        localRes.forEach(res => {
          if (res.status === "confirmed" && res.date) {
            dynamicBookedDates.push(res.date);
          }
        });
        renderCalendar();
      };
      syncLocal();
      window.addEventListener('local-reservations-change', syncLocal);
    }
  }

  function renderCalendar() {
    if (!calendarDaysGrid || !currentMonthYearLabel) return;

    calendarDaysGrid.innerHTML = '';
    const currentYear = calendarDate.getFullYear();
    const currentMonth = calendarDate.getMonth(); // 0 ~ 11

    // 헤더 연/월 표시 업데이트
    currentMonthYearLabel.textContent = `${currentYear}년 ${currentMonth + 1}월`;

    // 이번 달의 첫째 날과 마지막 날 정보
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 요일 인덱스 (0:일 ~ 6:토)
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate(); // 이번 달 마지막 날짜

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 전체 예약 완료 리스트 = 기본 지정 날짜 + 실시간 로드된 날짜
    const totalBookedDates = [...defaultBookedDates, ...dynamicBookedDates];

    // 1. 첫째 날 이전의 빈 셀 채우기
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell empty-cell';
      calendarDaysGrid.appendChild(emptyCell);
    }

    // 2. 일자별 셀 생성 및 예약 연동
    for (let day = 1; day <= lastDate; day++) {
      const dayCell = document.createElement('div');
      dayCell.className = 'calendar-day-cell';
      dayCell.textContent = day;

      const formattedMonth = String(currentMonth + 1).padStart(2, '0');
      const formattedDay = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

      // 오늘 날짜인지 체크
      if (dateStr === todayStr) {
        dayCell.classList.add('today-cell');
      }

      // 오늘 날짜 이전이거나 totalBookedDates 배열에 명시되어 있으면 '예약 완료'로 차단
      const cellDateObj = new Date(currentYear, currentMonth, day);
      const todayDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      if (cellDateObj < todayDateObj || totalBookedDates.includes(dateStr)) {
        dayCell.classList.add('status-booked');
      } else {
        dayCell.classList.add('status-available');
        
        // 예약 가능 날짜 클릭 시 모달창 자동 입력 및 띄우기
        dayCell.addEventListener('click', () => {
          const bookingDateInput = document.getElementById('booking-date');
          const bookingModal = document.getElementById('booking-modal');
          
          if (bookingDateInput) {
            bookingDateInput.value = dateStr;
          }
          if (bookingModal) {
            bookingModal.classList.add('active');
            document.body.style.overflow = 'hidden';
          }
        });
      }

      calendarDaysGrid.appendChild(dayCell);
    }
  }

  // 이전 달/다음 달 버튼 이벤트
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      calendarDate.setMonth(calendarDate.getMonth() - 1);
      renderCalendar();
    });
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      calendarDate.setMonth(calendarDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // 초기 렌더링 동기화 작동
  syncBookedDates();
});
