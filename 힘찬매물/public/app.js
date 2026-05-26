// App State
let currentUser = null;
let currentToken = localStorage.getItem('token');
let properties = [];
let currentPage = 1;
let currentLimit = 12;

// Load App Initial State
document.addEventListener('DOMContentLoaded', () => {
  if (currentToken) {
    checkAuth();
  } else {
    showView('auth');
  }

  // Bind Auth Switch Form Event
  document.getElementById('login-form').addEventListener('submit', handleLogin);
  document.getElementById('register-form').addEventListener('submit', handleRegister);
  
  // Navigation Event listeners
  document.getElementById('logout-btn').addEventListener('click', logout);
  document.getElementById('admin-toggle-btn').addEventListener('click', () => showView('admin'));
  document.getElementById('dashboard-toggle-btn').addEventListener('click', () => showView('dashboard'));
  
  // Property CRUD form listener
  document.getElementById('property-crud-form').addEventListener('submit', handlePropertySubmit);

  // Excel upload listener
  document.getElementById('excel-upload-form').addEventListener('submit', handleExcelUpload);
});

// Toast notification function
function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.innerText = message;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.className = toast.className.replace('show', '');
  }, 3500);
}

// Switch between Login and Register tab
function switchAuthTab(type) {
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  if (type === 'login') {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  } else {
    tabLogin.classList.remove('active');
    tabRegister.classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
  }
}

// Show specific view/page in SPA
function showView(viewId) {
  const views = ['auth-view', 'waiting-view', 'dashboard-view', 'admin-view'];
  views.forEach(v => {
    document.getElementById(v).style.display = v.startsWith(viewId) ? 'block' : 'none';
  });

  const mainNav = document.getElementById('main-nav');
  const adminToggle = document.getElementById('admin-toggle-btn');
  const dashToggle = document.getElementById('dashboard-toggle-btn');

  if (viewId === 'auth') {
    mainNav.style.display = 'none';
  } else {
    mainNav.style.display = 'flex';
    document.getElementById('user-display-name').innerText = currentUser ? currentUser.name : '';
    document.getElementById('user-role-badge').innerText = currentUser && currentUser.role === 'ADMIN' ? '관리자' : '회원';

    // Conditional nav buttons
    if (currentUser && currentUser.role === 'ADMIN') {
      adminToggle.style.display = viewId === 'admin' ? 'none' : 'inline-flex';
      dashToggle.style.display = viewId === 'dashboard' ? 'none' : 'inline-flex';
    } else {
      adminToggle.style.display = 'none';
      dashToggle.style.display = 'none';
    }
  }

  // View specific setups
  if (viewId === 'dashboard') {
    loadRegions();
    loadProperties(1);
  } else if (viewId === 'admin') {
    loadAdminUsers();
  }
}

// Check Authentication Status
async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (res.ok) {
      currentUser = await res.json();
      if (currentUser.role === 'ADMIN') {
        showView('admin');
      } else if (currentUser.status === 'APPROVED') {
        showView('dashboard');
      } else {
        showView('waiting');
      }
    } else {
      logout();
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    logout();
  }
}

// Handle Login Submission
async function handleLogin(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('login-username').value;
  const passwordInput = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameInput, password: passwordInput })
    });

    const data = await res.json();
    if (res.ok) {
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('token', currentToken);

      showToast('성공적으로 로그인되었습니다.', 'success');
      
      if (currentUser.role === 'ADMIN') {
        showView('admin');
      } else if (currentUser.status === 'APPROVED') {
        showView('dashboard');
      } else {
        showView('waiting');
      }
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('로그인 중 서버 연결 오류가 발생했습니다.', 'error');
  }
}

// Handle Register Submission
async function handleRegister(e) {
  e.preventDefault();
  const username = document.getElementById('register-username').value;
  const password = document.getElementById('register-password').value;
  const name = document.getElementById('register-name').value;
  const phone = document.getElementById('register-phone').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, name, phone })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      switchAuthTab('login');
      // Reset register inputs
      document.getElementById('register-form').reset();
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('회원가입 중 서버 연결 오류가 발생했습니다.', 'error');
  }
}

// Logout Action
function logout() {
  localStorage.removeItem('token');
  currentToken = null;
  currentUser = null;
  showView('auth');
}

// Load Properties (Dashboard)
async function loadProperties(page = 1) {
  currentPage = page;
  const search = document.getElementById('filter-search').value;
  const region = document.getElementById('filter-region').value;
  const sheet = document.getElementById('filter-sheet').value;
  const minArea = document.getElementById('filter-min-area').value;
  const maxArea = document.getElementById('filter-max-area').value;
  const minDeposit = document.getElementById('filter-min-deposit').value;
  const maxDeposit = document.getElementById('filter-max-deposit').value;
  const minRent = document.getElementById('filter-min-rent').value;
  const maxRent = document.getElementById('filter-max-rent').value;
  const minPremium = document.getElementById('filter-min-premium').value;
  const maxPremium = document.getElementById('filter-max-premium').value;

  let query = `page=${page}&limit=${currentLimit}`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (region) query += `&region=${encodeURIComponent(region)}`;
  if (sheet) query += `&sheet=${encodeURIComponent(sheet)}`;
  if (minArea) query += `&minArea=${minArea}`;
  if (maxArea) query += `&maxArea=${maxArea}`;
  if (minDeposit) query += `&minDeposit=${minDeposit}`;
  if (maxDeposit) query += `&maxDeposit=${maxDeposit}`;
  if (minRent) query += `&minRent=${minRent}`;
  if (maxRent) query += `&maxRent=${maxRent}`;
  if (minPremium) query += `&minPremium=${minPremium}`;
  if (maxPremium) query += `&maxPremium=${maxPremium}`;

  const container = document.getElementById('properties-list');
  // Loading skeleton placeholder
  container.innerHTML = Array(6).fill('<div class="property-card glass-panel skeleton" style="height: 300px;"></div>').join('');

  try {
    const res = await fetch(`/api/properties?${query}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (res.ok) {
      const result = await res.json();
      properties = result.data;
      document.getElementById('total-properties-count').innerText = result.total;
      
      renderPropertyCards(properties);
      renderPagination(result.totalPages, result.page);
    } else {
      const data = await res.json();
      showToast(data.message, 'error');
      if (res.status === 401 || res.status === 403) logout();
    }
  } catch (error) {
    showToast('매물 목록을 가져오는데 실패했습니다.', 'error');
  }
}

// Render property card templates
function renderPropertyCards(data) {
  const container = document.getElementById('properties-list');
  if (data.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: var(--text-secondary);">
      <i class="fa-solid fa-folder-open" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
      <p>검색 결과와 매칭되는 매물이 없습니다.</p>
    </div>`;
    return;
  }

  container.innerHTML = data.map(item => {
    const title = item.shop_name ? item.shop_name : (item.address ? item.address.split(' ').slice(1, 3).join(' ') + ' 매물' : '매물');
    return `
      <div class="property-card glass-panel" onclick="openPropertyModal(${item.id})">
        <div class="property-header">
          <div class="property-shop">${title}</div>
          <span class="property-sheet-badge">${item.sheet_name || '매물'}</span>
        </div>
        <div class="property-address"><i class="fa-solid fa-location-dot" style="margin-right: 5px;"></i> ${item.address}</div>
        
        <div class="property-details">
          <div class="detail-item">
            <span class="detail-label">보증금</span>
            <span class="detail-value price">${item.deposit ? item.deposit.toLocaleString() + '만' : '-'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">임대료</span>
            <span class="detail-value price">${item.rent ? item.rent.toLocaleString() + '만' : '-'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">평수</span>
            <span class="detail-value">${item.area ? item.area.toFixed(1) + '평' : '-'}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">층수</span>
            <span class="detail-value">${item.floor || '-'}</span>
          </div>
        </div>

        <div class="property-note">
          ${item.note ? (item.note.length > 50 ? item.note.substring(0, 50) + '...' : item.note) : '비고 없음'}
        </div>

        <div class="property-footer">
          ${item.map_url ? 
            `<a href="${item.map_url}" target="_blank" class="map-link" onclick="event.stopPropagation()">
              <i class="fa-solid fa-map-location-dot"></i> 지도 바로가기
             </a>` : '<span></span>'
          }
          <i class="fa-solid fa-chevron-right" style="color: var(--text-muted); font-size: 0.85rem;"></i>
        </div>
      </div>
    `;
  }).join('');
}

// Render pagination block
function renderPagination(totalPages, activePage) {
  const container = document.getElementById('properties-pagination');
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }

  let html = '';
  // Prev button
  html += `<button class="btn btn-secondary" ${activePage === 1 ? 'disabled' : ''} onclick="loadProperties(${activePage - 1})">이전</button>`;
  
  // Page number buttons
  const startPage = Math.max(1, activePage - 2);
  const endPage = Math.min(totalPages, activePage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    html += `<button class="btn ${i === activePage ? 'btn-primary' : 'btn-secondary'}" onclick="loadProperties(${i})">${i}</button>`;
  }
  
  // Next button
  html += `<button class="btn btn-secondary" ${activePage === totalPages ? 'disabled' : ''} onclick="loadProperties(${activePage + 1})">다음</button>`;
  
  container.innerHTML = html;
}

// Reset filtering inputs
function resetFilters() {
  document.getElementById('filter-search').value = '';
  document.getElementById('filter-region').value = '';
  document.getElementById('filter-sheet').value = '';
  document.getElementById('filter-min-area').value = '';
  document.getElementById('filter-max-area').value = '';
  document.getElementById('filter-min-deposit').value = '';
  document.getElementById('filter-max-deposit').value = '';
  document.getElementById('filter-min-rent').value = '';
  document.getElementById('filter-max-rent').value = '';
  document.getElementById('filter-min-premium').value = '';
  document.getElementById('filter-max-premium').value = '';
  loadProperties(1);
}

// Modal actions
function openPropertyModal(id) {
  const prop = properties.find(p => p.id === id);
  if (!prop) return;

  document.getElementById('modal-shop-name').innerText = prop.shop_name || '매물 상세 정보';
  document.getElementById('modal-address').innerText = prop.address;
  document.getElementById('modal-floor').innerText = prop.floor || '-';
  document.getElementById('modal-area').innerText = prop.area ? prop.area.toFixed(2) + ' 평' : '-';
  document.getElementById('modal-maintenance').innerText = prop.maintenance ? prop.maintenance.toLocaleString() + ' 만원' : '-';
  document.getElementById('modal-deposit').innerText = prop.deposit ? prop.deposit.toLocaleString() + ' 만원' : '-';
  document.getElementById('modal-rent').innerText = prop.rent ? prop.rent.toLocaleString() + ' 만원' : '-';
  document.getElementById('modal-premium').innerText = prop.premium ? prop.premium.toLocaleString() + ' 만원' : '-';
  document.getElementById('modal-note').innerText = prop.note || '비고 없음';
  document.getElementById('modal-sheet-badge').innerText = prop.sheet_name || '수동';

  const mapBtn = document.getElementById('modal-map-btn');
  if (prop.map_url) {
    mapBtn.href = prop.map_url;
    mapBtn.style.display = 'inline-flex';
  } else {
    mapBtn.style.display = 'none';
  }

  // Admin edit button inside modal
  const editBtn = document.getElementById('modal-edit-btn');
  if (currentUser && currentUser.role === 'ADMIN') {
    editBtn.style.display = 'inline-flex';
    editBtn.onclick = () => {
      closePropertyModal();
      showView('admin');
      populateCrudForm(prop);
    };
  } else {
    editBtn.style.display = 'none';
  }

  document.getElementById('property-modal').classList.add('active');
}

function closePropertyModal() {
  document.getElementById('property-modal').classList.remove('active');
}

// --- ADMIN CONTROL logic ---

// Load member list
async function loadAdminUsers() {
  try {
    const res = await fetch('/api/admin/users', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });

    if (res.ok) {
      const users = await res.json();
      const listContainer = document.getElementById('admin-users-list');
      
      listContainer.innerHTML = users.map(user => {
        // Exclude current user from status modification actions
        const isSelf = user.id === currentUser.id;
        let actionButtons = '';
        
        if (!isSelf) {
          actionButtons = `
            <button class="btn btn-success" style="padding: 5px 10px; font-size: 0.75rem;" onclick="updateUserStatus(${user.id}, 'APPROVED')">승인</button>
            <button class="btn btn-danger" style="padding: 5px 10px; font-size: 0.75rem;" onclick="updateUserStatus(${user.id}, 'REJECTED')">거절</button>
          `;
        }

        let statusClass = 'status-pending';
        if (user.status === 'APPROVED') statusClass = 'status-approved';
        if (user.status === 'REJECTED') statusClass = 'status-rejected';

        return `
          <tr>
            <td><strong>${user.name}</strong> ${user.role === 'ADMIN' ? '<span class="user-badge">관리자</span>' : ''}</td>
            <td>${user.username}</td>
            <td>${user.phone}</td>
            <td>${new Date(user.created_at).toLocaleDateString()}</td>
            <td><span class="status-badge ${statusClass}">${user.status}</span></td>
            <td style="display: flex; gap: 8px;">${actionButtons}</td>
          </tr>
        `;
      }).join('');
    } else {
      const data = await res.json();
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('회원 목록을 가져오는데 실패했습니다.', 'error');
  }
}

// Approve or Reject User Status
async function updateUserStatus(userId, status) {
  try {
    const res = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify({ status })
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      loadAdminUsers();
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('회원 상태 변경 오류.', 'error');
  }
}

// Bulk Excel Upload
async function handleExcelUpload(e) {
  e.preventDefault();
  const fileInput = document.getElementById('excel-file-input');
  const clearDb = document.getElementById('excel-clear-db').checked;
  const file = fileInput.files[0];

  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    showToast('엑셀 파일을 업로드 중입니다...', 'success');
    const res = await fetch(`/api/admin/upload-excel?clear=${clearDb}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${currentToken}` },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      document.getElementById('excel-upload-form').reset();
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('엑셀 업로드 중 서버 통신 오류가 발생했습니다.', 'error');
  }
}

// Populate Property CRUD Form for Editing
function populateCrudForm(prop) {
  document.getElementById('crud-property-id').value = prop.id;
  document.getElementById('crud-address').value = prop.address || '';
  document.getElementById('crud-shop-name').value = prop.shop_name || '';
  document.getElementById('crud-map-url').value = prop.map_url || '';
  document.getElementById('crud-floor').value = prop.floor || '';
  document.getElementById('crud-area').value = prop.area || '';
  document.getElementById('crud-deposit').value = prop.deposit || '';
  document.getElementById('crud-rent').value = prop.rent || '';
  document.getElementById('crud-premium').value = prop.premium || '';
  document.getElementById('crud-maintenance').value = prop.maintenance || '';
  document.getElementById('crud-note').value = prop.note || '';
  
  document.getElementById('crud-submit-btn').innerText = '매물 수정';
  document.getElementById('crud-submit-btn').className = 'btn btn-primary';
}

// Clear Property CRUD Form
function clearCrudForm() {
  document.getElementById('property-crud-form').reset();
  document.getElementById('crud-property-id').value = '';
  document.getElementById('crud-submit-btn').innerText = '매물 등록';
  document.getElementById('crud-submit-btn').className = 'btn btn-success';
}

// Handle property adding and updating
async function handlePropertySubmit(e) {
  e.preventDefault();
  const id = document.getElementById('crud-property-id').value;
  const payload = {
    address: document.getElementById('crud-address').value,
    shop_name: document.getElementById('crud-shop-name').value,
    map_url: document.getElementById('crud-map-url').value,
    floor: document.getElementById('crud-floor').value,
    area: parseFloat(document.getElementById('crud-area').value) || 0,
    deposit: parseInt(document.getElementById('crud-deposit').value) || 0,
    rent: parseInt(document.getElementById('crud-rent').value) || 0,
    premium: parseInt(document.getElementById('crud-premium').value) || 0,
    maintenance: parseInt(document.getElementById('crud-maintenance').value) || 0,
    note: document.getElementById('crud-note').value
  };

  const isEdit = !!id;
  const url = isEdit ? `/api/properties/${id}` : '/api/properties';
  const method = isEdit ? 'PUT' : 'POST';

  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentToken}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (res.ok) {
      showToast(data.message, 'success');
      clearCrudForm();
    } else {
      showToast(data.message, 'error');
    }
  } catch (error) {
    showToast('매물 처리 중 서버 오류가 발생했습니다.', 'error');
  }
}

// Load unique regions for dropdown filter
async function loadRegions() {
  try {
    const res = await fetch('/api/properties/regions', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    if (res.ok) {
      const regions = await res.json();
      const select = document.getElementById('filter-region');
      const currentValue = select.value;
      
      select.innerHTML = '<option value="">전체 지역</option>';
      regions.forEach(reg => {
        select.innerHTML += `<option value="${reg}">${reg}</option>`;
      });
      select.value = currentValue;
    }
  } catch (error) {
    console.error('Failed to load regions:', error);
  }
}
