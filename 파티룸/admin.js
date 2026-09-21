import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getDatabase, ref, onValue, remove, update, set, push } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js';
import { getSmsConfig, saveSmsConfig, sendTestSms, getSmsLogs } from './sms-service.js';

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

let app, auth, db;
let useFirebase = false;

// 관리자 보안 로그인 권한 허용 이메일 목록
const adminEmails = [
  'edusim71@gmail.com',
  'admin@email.com',
  'admin@sponge.com'
];

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getDatabase(app);
  useFirebase = true;
} catch (err) {
  console.error("Firebase 초기화 에러:", err);
  alert("Firebase 연결 중 문제가 발생했습니다.");
}

document.addEventListener('DOMContentLoaded', () => {
  const loginOverlay = document.getElementById('admin-login-overlay');
  const loginForm = document.getElementById('admin-login-form');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const refreshBtn = document.getElementById('btn-refresh-list');
  const reservationsBody = document.getElementById('reservations-list-body');
  const emptyState = document.getElementById('table-empty-state');

  // Stats Elements
  const statTotal = document.getElementById('stat-total');
  const statPending = document.getElementById('stat-pending');
  const statConfirmed = document.getElementById('stat-confirmed');
  const statSales = document.getElementById('stat-sales');

  // Admin Calendar Elements
  const adminPrevMonthBtn = document.getElementById('admin-prev-month-btn');
  const adminNextMonthBtn = document.getElementById('admin-next-month-btn');
  const adminCurrentMonthYear = document.getElementById('admin-current-month-year');
  const adminCalendarDaysGrid = document.getElementById('admin-calendar-days-grid');

  let adminCalendarDate = new Date();
  let latestReservationsData = null; // 실시간 캘린더용 캐시 데이터

  let activeReservationsListener = null;

  // 1. 관리자 보안 로그인 처리
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('admin-email').value.trim();
      const password = document.getElementById('admin-password').value;

      // 관리자 권한 이메일 여부 1차 필터링
      if (!adminEmails.includes(email)) {
        alert("🚨 관리자 권한이 부여되지 않은 계정입니다. 진입이 거부되었습니다.");
        return;
      }

      if (useFirebase && auth) {
        signInWithEmailAndPassword(auth, email, password)
          .then(() => {
            alert("🔓 관리자 대시보드 로그인 성공!");
            loginForm.reset();
          })
          .catch((err) => {
            alert(`로그인 실패: 비밀번호 또는 계정 정보를 다시 확인하세요. (${err.message})`);
          });
      } else {
        // 로컬 목업 가상 관리자 로그인 (한글 'ㅁㄴ913689' 및 영타 'as913689' 호환 처리)
        if (password === "ㅁㄴ913689" || password === "as913689") {
          alert("🔓 가상 관리자 대시보드로 진입합니다 (가상 로컬 모드)");
          localStorage.setItem('admin_logged_in', 'true');
          loginOverlay.style.display = 'none';
          loadReservations();
        } else {
          alert("패스워드가 잘못되었습니다. (가상 모드 비밀번호: ㅁㄴ913689)");
        }
      }
    });
  }

  // 2. 로그아웃 처리
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm("대시보드에서 로그아웃 하시겠습니까?")) {
        if (useFirebase && auth) {
          signOut(auth).then(() => {
            alert("로그아웃 되었습니다.");
          });
        } else {
          localStorage.removeItem('admin_logged_in');
          loginOverlay.style.display = 'flex';
          alert("로그아웃 되었습니다.");
        }
      }
    });
  }

  // 3. 새로고침 수동 갱신
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadReservations();
    });
  }

  // 4. 실시간 예약 목록 및 통계 계산 로드
  function loadReservations() {
    if (useFirebase && db) {
      try {
        const reservationsRef = ref(db, 'reservations');
        // 기존 리스너가 있으면 누적 방지용 클린업
        if (activeReservationsListener) {
          activeReservationsListener();
        }
        
        activeReservationsListener = onValue(reservationsRef, (snapshot) => {
          const data = snapshot.val();
          renderReservations(data);
        });
      } catch (err) {
        console.error("데이터 수신 오류:", err);
      }
    } else {
      // 로컬 가상 예약 데이터 로드
      const localData = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
      // 리스트 렌더링에 적합한 가상 Object 구조로 변환
      const dataObj = {};
      localData.forEach((res, index) => {
        dataObj[`mock_key_${index}`] = res;
      });
      renderReservations(dataObj);
    }
  }

  function renderReservations(data) {
    if (!reservationsBody) return;
    reservationsBody.innerHTML = '';

    // 실시간 달력 렌더링용 최신 데이터 캐싱 및 달력 호출
    latestReservationsData = data;
    renderAdminCalendar();

    if (!data || Object.keys(data).length === 0) {
      emptyState.style.display = 'block';
      updateStats(0, 0, 0, 0);
      return;
    }

    emptyState.style.display = 'none';

    let totalCount = 0;
    let pendingCount = 0;
    let confirmedCount = 0;
    let totalSales = 0;

    // 데이터를 최근 신청일순(역순)으로 정렬하기 위해 배열로 변환
    const sortedList = Object.entries(data).map(([key, value]) => ({
      key,
      ...value
    })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedList.forEach((res) => {
      totalCount++;
      if (res.status === 'confirmed') {
        confirmedCount++;
        // 매출액 산출 (문자열에서 쉼표나 기호를 떼고 계산)
        const numericPrice = parseInt(res.price.replace(/,/g, ''), 10) || 0;
        totalSales += numericPrice;
      } else {
        pendingCount++;
      }

      // 테이블 행 생성
      const tr = document.createElement('tr');
      
      // 예약 희망일자
      const tdDate = document.createElement('td');
      tdDate.innerHTML = `<strong style="color: var(--accent-gold); font-size:15px;">${res.date}</strong>`;
      tr.appendChild(tdDate);

      // 신청자 (이름 및 연락처용)
      const tdUser = document.createElement('td');
      tdUser.innerHTML = `<div><strong>${res.name}</strong></div>`;
      tr.appendChild(tdUser);

      // 연락처
      const tdPhone = document.createElement('td');
      tdPhone.textContent = res.phone;
      tr.appendChild(tdPhone);

      // 인원수
      const tdGuests = document.createElement('td');
      tdGuests.textContent = `${res.guests}명`;
      tr.appendChild(tdGuests);

      // 금액
      const tdPrice = document.createElement('td');
      tdPrice.innerHTML = `<span style="color: var(--accent-magenta); font-weight:700;">₩${res.price}</span>`;
      tr.appendChild(tdPrice);

      // 요청사항
      const tdNote = document.createElement('td');
      tdNote.style.maxWidth = '200px';
      tdNote.style.whiteSpace = 'normal';
      tdNote.style.wordBreak = 'break-all';
      tdNote.textContent = res.note;
      tr.appendChild(tdNote);

      // 접수일시 포맷팅
      const tdCreated = document.createElement('td');
      const createDate = new Date(res.createdAt);
      tdCreated.textContent = `${createDate.getFullYear()}-${String(createDate.getMonth()+1).padStart(2,'0')}-${String(createDate.getDate()).padStart(2,'0')} ${String(createDate.getHours()).padStart(2,'0')}:${String(createDate.getMinutes()).padStart(2,'0')}`;
      tr.appendChild(tdCreated);

      // 예약 상태 뱃지
      const tdStatus = document.createElement('td');
      const badge = document.createElement('span');
      badge.className = `status-badge ${res.status}`;
      badge.textContent = res.status === 'confirmed' ? '예약 확정' : '대기 중';
      tdStatus.appendChild(badge);
      tr.appendChild(tdStatus);

      // 제어용 버튼그룹
      const tdActions = document.createElement('td');
      const actionGroup = document.createElement('div');
      actionGroup.className = 'action-btn-group';

      // 승인 확정 버튼
      if (res.status !== 'confirmed') {
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'action-btn confirm';
        confirmBtn.innerHTML = '<i class="fa-solid fa-calendar-check"></i> 확정';
        confirmBtn.addEventListener('click', () => {
          confirmReservation(res.key, res.date);
        });
        actionGroup.appendChild(confirmBtn);
      } else {
        // 확정 취소 버튼 (대기로 되돌림)
        const pendingBtn = document.createElement('button');
        pendingBtn.className = 'action-btn';
        pendingBtn.style.background = 'rgba(255, 183, 3, 0.1)';
        pendingBtn.style.color = 'var(--accent-gold)';
        pendingBtn.style.border = '1px solid rgba(255, 183, 3, 0.2)';
        pendingBtn.innerHTML = '<i class="fa-solid fa-clock-rotate-left"></i> 보류';
        pendingBtn.addEventListener('click', () => {
          pendingReservation(res.key);
        });
        actionGroup.appendChild(pendingBtn);
      }

      // 삭제 버튼
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'action-btn delete';
      deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> 삭제';
      deleteBtn.addEventListener('click', () => {
        deleteReservation(res.key, res.date);
      });
      actionGroup.appendChild(deleteBtn);

      tdActions.appendChild(actionGroup);
      tr.appendChild(tdActions);

      reservationsBody.appendChild(tr);
    });

    updateStats(totalCount, pendingCount, confirmedCount, totalSales);
  }

  // 통계 수치 갱신 함수
  function updateStats(total, pending, confirmed, sales) {
    if (statTotal) statTotal.textContent = total;
    if (statPending) statPending.textContent = pending;
    if (statConfirmed) statConfirmed.textContent = confirmed;
    if (statSales) statSales.textContent = sales.toLocaleString('ko-KR');
  }

  // 5. 예약 확정(status -> confirmed) 변경 트랜잭션
  function confirmReservation(key, date) {
    if (confirm(`${date} 예약을 '확정'하시겠습니까?\n확정 시 메인 캘린더에 예약 완료 마감 표시됩니다.`)) {
      if (useFirebase && db) {
        try {
          const targetRef = ref(db, `reservations/${key}`);
          update(targetRef, { status: "confirmed" })
            .then(() => {
              alert("✅ 해당 예약이 최종 확정되었습니다.");
            })
            .catch(err => alert("확정 실패: " + err.message));
        } catch (err) {
          alert("DB 처리 오류: " + err.message);
        }
      } else {
        // 로컬 모드 상태 변경
        let localRes = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
        const index = parseInt(key.replace('mock_key_', ''), 10);
        if (localRes[index]) {
          localRes[index].status = "confirmed";
          localStorage.setItem('mock_reservations', JSON.stringify(localRes));
          window.dispatchEvent(new Event('local-reservations-change'));
          alert("✅ 해당 예약이 최종 확정되었습니다 (가상 모드).");
          loadReservations();
        }
      }
    }
  }

  // 6. 예약 보류/대기(status -> pending) 변경 트랜잭션
  function pendingReservation(key) {
    if (confirm("해당 예약을 다시 '대기 상태(보류)'로 돌려놓으시겠습니까?")) {
      if (useFirebase && db) {
        try {
          const targetRef = ref(db, `reservations/${key}`);
          update(targetRef, { status: "pending" })
            .then(() => {
              alert("⏰ 예약이 대기 상태로 변경되었습니다.");
            })
            .catch(err => alert("변경 실패: " + err.message));
        } catch (err) {
          alert("DB 처리 오류: " + err.message);
        }
      } else {
        // 로컬 모드 상태 변경
        let localRes = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
        const index = parseInt(key.replace('mock_key_', ''), 10);
        if (localRes[index]) {
          localRes[index].status = "pending";
          localStorage.setItem('mock_reservations', JSON.stringify(localRes));
          window.dispatchEvent(new Event('local-reservations-change'));
          alert("⏰ 예약이 대기 상태로 변경되었습니다 (가상 모드).");
          loadReservations();
        }
      }
    }
  }

  // 7. 예약 취소(데이터 삭제) 트랜잭션
  function deleteReservation(key, date) {
    if (confirm(`⚠️ 경고: [${date}] 예약 내역을 영구 삭제하시겠습니까?\n삭제된 내역은 복구되지 않습니다.`)) {
      if (useFirebase && db) {
        try {
          const targetRef = ref(db, `reservations/${key}`);
          remove(targetRef)
            .then(() => {
              alert("🗑️ 예약 내역이 성공적으로 삭제되었습니다.");
            })
            .catch(err => alert("삭제 실패: " + err.message));
        } catch (err) {
          alert("DB 처리 오류: " + err.message);
        }
      } else {
        // 로컬 모드 삭제 처리
        let localRes = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
        const index = parseInt(key.replace('mock_key_', ''), 10);
        if (index >= 0 && index < localRes.length) {
          localRes.splice(index, 1);
          localStorage.setItem('mock_reservations', JSON.stringify(localRes));
          window.dispatchEvent(new Event('local-reservations-change'));
          alert("🗑️ 예약 내역이 성공적으로 삭제되었습니다 (가상 모드).");
          loadReservations();
        }
      }
    }
  }

  // 8. 파이어베이스 인증 세션 옵저빙 (로그인 시 대시보드 노출 제어)
  if (useFirebase && auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // 로그인 완료 상태일 때, 관리자 계정 이메일 인증 체크
        if (adminEmails.includes(user.email)) {
          loginOverlay.style.display = 'none';
          loadReservations();
        } else {
          // 관리자가 아닌 일반 유저가 로그인했을 때 로그아웃 유도
          alert("🚨 관리자 이메일로 등록되지 않은 계정입니다. 관리자 전용 대시보드 접근이 제한됩니다.");
          signOut(auth);
        }
      } else {
        // 로그아웃 상태일 때 로그인창 노출
        loginOverlay.style.display = 'flex';
        if (activeReservationsListener) {
          activeReservationsListener();
          activeReservationsListener = null;
        }
      }
    });
  } else {
    // 가상 모드 로그인 세션 영속성 체크
    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    if (adminLoggedIn === 'true') {
      loginOverlay.style.display = 'none';
      loadReservations();
    } else {
      loginOverlay.style.display = 'flex';
    }
  }

  // =========================================================================
  // 관리자 예약 통제 달력 구현부
  // =========================================================================

  // 이전 달/다음 달 이동 이벤트 리스너
  if (adminPrevMonthBtn) {
    adminPrevMonthBtn.addEventListener('click', () => {
      adminCalendarDate.setMonth(adminCalendarDate.getMonth() - 1);
      renderAdminCalendar();
    });
  }
  if (adminNextMonthBtn) {
    adminNextMonthBtn.addEventListener('click', () => {
      adminCalendarDate.setMonth(adminCalendarDate.getMonth() + 1);
      renderAdminCalendar();
    });
  }

  // 관리자 달력 렌더링 함수
  function renderAdminCalendar() {
    if (!adminCalendarDaysGrid || !adminCurrentMonthYear) return;

    adminCalendarDaysGrid.innerHTML = '';
    const currentYear = adminCalendarDate.getFullYear();
    const currentMonth = adminCalendarDate.getMonth();

    adminCurrentMonthYear.textContent = `${currentYear}년 ${currentMonth + 1}월`;

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 1. 첫째 날 이전의 빈 셀 채우기
    for (let i = 0; i < firstDayIndex; i++) {
      const emptyCell = document.createElement('div');
      emptyCell.className = 'calendar-day-cell empty-cell';
      adminCalendarDaysGrid.appendChild(emptyCell);
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

      // 해당 날짜 예약 상태 파악
      let foundBooking = null;
      if (latestReservationsData) {
        Object.entries(latestReservationsData).forEach(([key, val]) => {
          if (val.date === dateStr && val.status === 'confirmed') {
            foundBooking = { key, ...val };
          }
        });
      }

      // 오늘 날짜 이전 체크 (과거 날짜는 차단 불가)
      const cellDateObj = new Date(currentYear, currentMonth, day);
      const todayDateObj = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const isPast = cellDateObj < todayDateObj;

      if (foundBooking) {
        if (foundBooking.name === '[수동 마감]') {
          dayCell.classList.add('status-manual-booked');
        } else {
          dayCell.classList.add('status-confirmed');
        }
      } else {
        dayCell.classList.add('status-available');
      }

      // 클릭 리스너 설정
      dayCell.addEventListener('click', () => {
        handleAdminCalendarClick(dateStr, foundBooking, isPast);
      });

      adminCalendarDaysGrid.appendChild(dayCell);
    }
  }

  // 관리자 달력 클릭 핸들러
  function handleAdminCalendarClick(dateStr, booking, isPast) {
    if (isPast) {
      alert("⚠️ 지난 날짜는 수동 예약을 마감하거나 해제하실 수 없습니다.");
      return;
    }

    if (booking) {
      if (booking.name === '[수동 마감]') {
        if (confirm(`🔓 [${dateStr}] 날짜의 수동 예약을 해제하시겠습니까?\n해제하시면 다시 일반 고객이 예약할 수 있는 상태로 복원됩니다.`)) {
          deleteReservationWithoutConfirm(booking.key);
        }
      } else {
        alert(`🚨 [${dateStr}] 날짜는 이미 일반 고객(${booking.name}님) 예약이 최종 확정되어 마감되었습니다.\n\n해제를 원하시는 경우 하단 예약 목록에서 직접 [보류] 또는 [삭제]로 조치해 주세요.`);
      }
    } else {
      if (confirm(`🔒 [${dateStr}] 날짜를 수동으로 예약 마감(차단)하시겠습니까?\n마감 시 메인 홈페이지 달력에서도 '예약 완료'로 블로킹되어 일반 고객 신청이 차단됩니다.`)) {
        createManualBlockReservation(dateStr);
      }
    }
  }

  // 수동 마감용 예약 데이터 생성
  function createManualBlockReservation(dateStr) {
    const manualData = {
      name: "[수동 마감]",
      phone: "-",
      date: dateStr,
      guests: "0",
      note: "관리자 페이지 달력에서 수동으로 예약 불가능(마감) 처리한 날짜입니다.",
      price: "0",
      status: "confirmed",
      createdAt: new Date().toISOString()
    };

    if (useFirebase && db) {
      try {
        const reservationsRef = ref(db, 'reservations');
        const newResRef = push(reservationsRef);
        set(newResRef, manualData)
          .then(() => {
            alert("🔒 해당 날짜가 수동으로 예약 마감되었습니다.");
          })
          .catch(err => alert("마감 설정 실패: " + err.message));
      } catch (err) {
        alert("DB 처리 오류: " + err.message);
      }
    } else {
      // 로컬 목업 모드 가상 마감 처리
      let localRes = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
      localRes.push(manualData);
      localStorage.setItem('mock_reservations', JSON.stringify(localRes));
      window.dispatchEvent(new Event('local-reservations-change'));
      alert("🔒 해당 날짜가 수동으로 예약 마감되었습니다 (가상 모드).");
      loadReservations();
    }
  }

  // 알림창 확인 없이 수동 예약 삭제(해제) 처리
  function deleteReservationWithoutConfirm(key) {
    if (useFirebase && db) {
      try {
        const targetRef = ref(db, `reservations/${key}`);
        remove(targetRef)
          .then(() => {
            alert("✅ 해당 날짜의 수동 예약 마감이 해제되었습니다.");
          })
          .catch(err => alert("해제 실패: " + err.message));
      } catch (err) {
        alert("DB 처리 오류: " + err.message);
      }
    } else {
      // 로컬 목업 모드 해제 처리
      let localRes = JSON.parse(localStorage.getItem('mock_reservations') || '[]');
      const index = parseInt(key.replace('mock_key_', ''), 10);
      if (index >= 0 && index < localRes.length) {
        localRes.splice(index, 1);
        localStorage.setItem('mock_reservations', JSON.stringify(localRes));
        window.dispatchEvent(new Event('local-reservations-change'));
        alert("✅ 해당 날짜의 수동 예약 마감이 해제되었습니다 (가상 모드).");
        loadReservations();
      }
    }
  }

  // =========================================================================
  // SMS / 알림톡 자동 발송 관리자 설정 로직
  // =========================================================================
  const smsEnableToggle = document.getElementById('sms-enable-toggle');
  const smsProviderSelect = document.getElementById('sms-provider-select');
  const smsAdminPhone = document.getElementById('sms-admin-phone');
  const smsSenderPhone = document.getElementById('sms-sender-phone');
  const smsApiKey = document.getElementById('sms-api-key');
  const smsApiSecret = document.getElementById('sms-api-secret');
  const smsWebhookUrl = document.getElementById('sms-webhook-url');
  const groupApiKey = document.getElementById('group-api-key');
  const groupApiSecret = document.getElementById('group-api-secret');
  const groupWebhookUrl = document.getElementById('group-webhook-url');
  const labelApiKey = document.getElementById('label-api-key');
  const labelApiSecret = document.getElementById('label-api-secret');
  const smsConfigForm = document.getElementById('sms-config-form');
  const btnTestSms = document.getElementById('btn-test-sms');
  const smsStatusMsg = document.getElementById('sms-status-message');
  const smsLogsContainer = document.getElementById('sms-logs-container');

  // 제공업체별 UI 필드 전환
  function updateSmsProviderUI(provider) {
    if (provider === 'simulation') {
      if (groupApiKey) groupApiKey.style.display = 'none';
      if (groupApiSecret) groupApiSecret.style.display = 'none';
      if (groupWebhookUrl) groupWebhookUrl.style.display = 'none';
    } else if (provider === 'aligo') {
      if (groupApiKey) groupApiKey.style.display = 'flex';
      if (groupApiSecret) groupApiSecret.style.display = 'flex';
      if (groupWebhookUrl) groupWebhookUrl.style.display = 'none';
      if (labelApiKey) labelApiKey.textContent = '알리고 API Key';
      if (labelApiSecret) labelApiSecret.textContent = '알리고 User ID (계정 아이디)';
    } else if (provider === 'solapi') {
      if (groupApiKey) groupApiKey.style.display = 'flex';
      if (groupApiSecret) groupApiSecret.style.display = 'none';
      if (groupWebhookUrl) groupWebhookUrl.style.display = 'none';
      if (labelApiKey) labelApiKey.textContent = '솔라피 API Key (Bearer Token)';
    } else if (provider === 'webhook') {
      if (groupApiKey) groupApiKey.style.display = 'none';
      if (groupApiSecret) groupApiSecret.style.display = 'none';
      if (groupWebhookUrl) groupWebhookUrl.style.display = 'flex';
    }
  }

  // SMS 설정 폼 초기화 로드
  function loadSmsSettings() {
    const config = getSmsConfig();
    if (smsEnableToggle) smsEnableToggle.checked = config.enabled;
    if (smsProviderSelect) smsProviderSelect.value = config.provider || 'simulation';
    if (smsAdminPhone) smsAdminPhone.value = config.adminPhone || '010-8280-8245';
    if (smsSenderPhone) smsSenderPhone.value = config.senderPhone || '010-8280-8245';
    if (smsApiKey) smsApiKey.value = config.apiKey || '';
    if (smsApiSecret) smsApiSecret.value = config.apiSecret || '';
    if (smsWebhookUrl) smsWebhookUrl.value = config.webhookUrl || '';

    updateSmsProviderUI(config.provider || 'simulation');
    renderSmsLogs();
  }

  if (smsProviderSelect) {
    smsProviderSelect.addEventListener('change', (e) => {
      updateSmsProviderUI(e.target.value);
    });
  }

  // 설정 저장 핸들러
  if (smsConfigForm) {
    smsConfigForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const currentConfig = getSmsConfig();
      const updatedConfig = {
        ...currentConfig,
        enabled: smsEnableToggle ? smsEnableToggle.checked : true,
        provider: smsProviderSelect ? smsProviderSelect.value : 'simulation',
        adminPhone: smsAdminPhone ? smsAdminPhone.value.trim() : '010-8280-8245',
        senderPhone: smsSenderPhone ? smsSenderPhone.value.trim() : '010-8280-8245',
        apiKey: smsApiKey ? smsApiKey.value.trim() : '',
        apiSecret: smsApiSecret ? smsApiSecret.value.trim() : '',
        webhookUrl: smsWebhookUrl ? smsWebhookUrl.value.trim() : ''
      };

      const success = saveSmsConfig(updatedConfig);
      if (success) {
        if (smsStatusMsg) {
          smsStatusMsg.textContent = "✅ SMS 설정이 성공적으로 저장되었습니다!";
          setTimeout(() => { smsStatusMsg.textContent = ""; }, 3500);
        }
        alert("✅ 문자/알림 발송 설정이 안전하게 저장되었습니다.");
      } else {
        alert("설정 저장 중 오류가 발생했습니다.");
      }
    });
  }

  // 테스트 문자 발송 핸들러
  if (btnTestSms) {
    btnTestSms.addEventListener('click', async () => {
      const targetPhone = smsAdminPhone ? smsAdminPhone.value.trim() : '010-8280-8245';
      if (!targetPhone) {
        alert("사장님(관리자) 수신 번호를 먼저 입력해주세요.");
        return;
      }

      btnTestSms.disabled = true;
      btnTestSms.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 발송 중...';

      try {
        const customConfig = {
          enabled: smsEnableToggle ? smsEnableToggle.checked : true,
          provider: smsProviderSelect ? smsProviderSelect.value : 'simulation',
          adminPhone: targetPhone,
          senderPhone: smsSenderPhone ? smsSenderPhone.value.trim() : targetPhone,
          apiKey: smsApiKey ? smsApiKey.value.trim() : '',
          apiSecret: smsApiSecret ? smsApiSecret.value.trim() : '',
          webhookUrl: smsWebhookUrl ? smsWebhookUrl.value.trim() : ''
        };

        const result = await sendTestSms(targetPhone, customConfig);
        if (result.simulated) {
          alert(`🔔 [시뮬레이션 모드] 테스트 발송 성공!\n수신 번호: ${targetPhone}\n실제 문자를 발송하려면 알리고 또는 솔라피 API Key를 등록하세요.`);
        } else {
          alert(`🎉 [${customConfig.provider.toUpperCase()}] 테스트 문자가 ${targetPhone} 번호로 성공적으로 발송되었습니다!`);
        }
        renderSmsLogs();
      } catch (err) {
        alert(`🚨 테스트 발송 실패: ${err.message}`);
        renderSmsLogs();
      } finally {
        btnTestSms.disabled = false;
        btnTestSms.innerHTML = '<i class="fa-solid fa-paper-plane"></i> 사장님 폰으로 테스트 문자 발송';
      }
    });
  }

  // 발송 내역(로그) 렌더링
  function renderSmsLogs() {
    if (!smsLogsContainer) return;
    const logs = getSmsLogs();
    if (!logs || logs.length === 0) {
      smsLogsContainer.innerHTML = '<div style="color: var(--text-secondary);">기록된 발송 로그가 없습니다.</div>';
      return;
    }

    smsLogsContainer.innerHTML = logs.map(log => {
      const isSuccess = log.status.includes('success');
      const badgeColor = isSuccess ? '#06d6a0' : '#ef476f';
      const timeStr = new Date(log.timestamp).toLocaleString('ko-KR');
      return `
        <div style="padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
          <div>
            <span style="color: ${badgeColor}; font-weight: 700;">[${log.status.toUpperCase()}]</span>
            <span style="color: #ffd166;">${log.receiver}</span>
            <span style="color: var(--text-secondary); font-size: 11px;">(${log.provider})</span>
            <div style="color: rgba(255,255,255,0.8); margin-top: 2px; white-space: pre-wrap; font-size: 11px;">${log.content.replace(/\n/g, ' ')}</div>
          </div>
          <span style="color: var(--text-secondary); font-size: 10px; white-space: nowrap;">${timeStr}</span>
        </div>
      `;
    }).join('');
  }

  // 초기 로드 실행
  loadSmsSettings();
  window.addEventListener('sponge-sms-logs-updated', renderSmsLogs);
});
