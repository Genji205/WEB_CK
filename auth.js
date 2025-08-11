// Quản lý xác thực: dùng sessionStorage để tự động đăng xuất khi đóng tab
const AUTH_STORAGE_KEY = 'auth:user';
const AUTH_STORE = window.sessionStorage;

// Di trú dữ liệu cũ từ localStorage -> sessionStorage (một lần)
try {
  const legacyValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (legacyValue && !AUTH_STORE.getItem(AUTH_STORAGE_KEY)) {
    AUTH_STORE.setItem(AUTH_STORAGE_KEY, legacyValue);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  }
} catch {}
const ADMIN_CREDENTIAL = { username: 'admin', password: '123456' };

function getCurrentUser() {
  try {
    return JSON.parse(AUTH_STORE.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function setCurrentUser(user) {
  if (user) AUTH_STORE.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  else AUTH_STORE.removeItem(AUTH_STORAGE_KEY);
}

function isAdmin(user) {
  return !!user && user.role === 'admin';
}

// Khởi tạo navbar theo trạng thái đăng nhập
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  const loginLink = document.getElementById('loginLink');
  const adminLink = document.getElementById('adminLink');
  const logoutBtn = document.getElementById('logoutBtn');

  if (loginLink && adminLink && logoutBtn) {
    if (isAdmin(user)) {
      loginLink.classList.add('d-none');
      adminLink.classList.remove('d-none');
      logoutBtn.classList.remove('d-none');
    } else {
      loginLink.classList.remove('d-none');
      adminLink.classList.add('d-none');
      logoutBtn.classList.add('d-none');
    }

    logoutBtn.addEventListener('click', () => {
      setCurrentUser(null);
      window.location.reload();
    });
  }
});

// Xử lý form đăng nhập (chỉ dùng ở login.html)
function handleLoginSubmit(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const errorEl = document.getElementById('loginError');
  if (username === ADMIN_CREDENTIAL.username && password === ADMIN_CREDENTIAL.password) {
    setCurrentUser({ username, role: 'admin' });
    window.location.href = 'admin.html';
  } else {
    if (errorEl) {
      errorEl.textContent = 'Sai tài khoản hoặc mật khẩu';
      errorEl.classList.remove('d-none');
    } else {
      alert('Sai tài khoản hoặc mật khẩu');
    }
  }
}

// Bảo vệ trang admin
function requireAdmin() {
  const user = getCurrentUser();
  if (!isAdmin(user)) {
    window.location.href = 'login.html';
  }
}

// Export các hàm ra scope global để dùng trong HTML inline
window.Auth = { getCurrentUser, setCurrentUser, isAdmin, handleLoginSubmit, requireAdmin };

