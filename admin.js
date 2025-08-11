// Quản lý bài báo đơn giản bằng localStorage cho trang admin
const postForm = document.getElementById('postForm');
const postsTableBody = document.querySelector('#postsTable tbody');
const cancelEditBtn = document.getElementById('cancelEditBtn');
const submitPostBtn = document.getElementById('submitPostBtn');
const adminViewAdd = document.getElementById('adminViewAdd');
const adminViewAll = document.getElementById('adminViewAll');

function getPosts() {
  try {
    return JSON.parse(localStorage.getItem('posts') || '[]');
  } catch {
    return [];
  }
}
function savePosts(posts) {
  localStorage.setItem('posts', JSON.stringify(posts));
  localStorage.setItem('posts_version', String(Date.now()));
}

function renderPosts() {
  const posts = getPosts();
  postsTableBody.innerHTML = '';
  posts.forEach((post, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${post.title}</td>
      <td>${post.category}</td>
      <td>${post.author || ''}</td>
      <td>${post.date}</td>
      <td>
        <button class="btn btn-sm btn-warning me-2" data-action="edit" data-idx="${idx}">Sửa</button>
        <button class="btn btn-sm btn-danger" data-action="delete" data-idx="${idx}">Xóa</button>
      </td>
    `;
    postsTableBody.appendChild(tr);
  });
}

function resetFormSubmitHandler() {
  postForm.onsubmit = handleCreateSubmit;
  if (submitPostBtn) submitPostBtn.textContent = 'Lưu bài viết';
  if (cancelEditBtn) cancelEditBtn.classList.add('d-none');
}

function handleCreateSubmit(e) {
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const author = document.getElementById('author').value.trim();
  const image = document.getElementById('image').value.trim();
  const category = document.getElementById('category').value;
  let summary = document.getElementById('summary') ? document.getElementById('summary').value : '';
  const content = document.getElementById('content').value.trim();
  if (!title || !author || !image || !category || !content) return;
  if (!summary.trim()) {
    // Tạo mô tả ngắn từ nội dung nếu không nhập
    const plain = content.replace(/\s+/g, ' ').trim();
    summary = plain;
  }
  const posts = getPosts();
  posts.push({ title, author, image, category, summary, content, date: new Date().toLocaleString() });
  savePosts(posts);
  renderPosts();
  postForm.reset();
}

function handleEditSubmitFactory(idx) {
  return function(e) {
    e.preventDefault();
    const posts = getPosts();
    const post = posts[idx];
    post.title = document.getElementById('title').value.trim();
    post.author = document.getElementById('author').value.trim();
    post.image = document.getElementById('image').value.trim();
    post.category = document.getElementById('category').value;
     if (document.getElementById('summary')) {
      const s = document.getElementById('summary').value;
      post.summary = s && s.length ? s : post.content.replace(/\s+/g, ' ').trim();
    }
    post.content = document.getElementById('content').value.trim();
    post.date = new Date().toLocaleString();
    posts[idx] = post;
    savePosts(posts);
    renderPosts();
    postForm.reset();
    resetFormSubmitHandler();
  };
}

postsTableBody.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const action = btn.getAttribute('data-action');
  const idx = Number(btn.getAttribute('data-idx'));
  const posts = getPosts();
  if (action === 'delete') {
    if (confirm('Bạn có chắc muốn xóa bài này?')) {
      posts.splice(idx, 1);
      savePosts(posts);
      renderPosts();
    }
  } else if (action === 'edit') {
    const post = posts[idx];
    // Điền dữ liệu vào modal
    const mTitle = document.getElementById('editTitle');
    const mAuthor = document.getElementById('editAuthor');
    const mImage = document.getElementById('editImage');
    const mPreview = document.getElementById('editImagePreview');
    const mCategory = document.getElementById('editCategory');
    const mSummary = document.getElementById('editSummary');
    const mContent = document.getElementById('editContent');
    if (!mTitle || !mImage || !mCategory || !mContent) return;
    mTitle.value = post.title || '';
    if (mAuthor) mAuthor.value = post.author || '';
    mImage.value = post.image || '';
    if (mPreview) {
      if (post.image) { mPreview.src = post.image; mPreview.classList.remove('d-none'); }
      else { mPreview.src = ''; mPreview.classList.add('d-none'); }
    }
    mCategory.value = post.category || '';
    if (mSummary) mSummary.value = post.summary || '';
    mContent.value = post.content || '';

    // Lưu chỉ số đang sửa vào dataset của nút lưu
    const saveBtn = document.getElementById('saveEditBtn');
    if (saveBtn) saveBtn.dataset.idx = String(idx);

    // Mở modal
    const modalEl = document.getElementById('editPostModal');
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }
});

function init() {
  if (!postForm || !postsTableBody) return;
  resetFormSubmitHandler();
  renderPosts();
  const imageInput = document.getElementById('image');
  const preview = document.getElementById('imagePreview');
  if (imageInput && preview) {
    imageInput.addEventListener('input', () => {
      const url = imageInput.value.trim();
      if (url) {
        preview.src = url;
        preview.classList.remove('d-none');
      } else {
        preview.src = '';
        preview.classList.add('d-none');
      }
    });
  }
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', () => {
      postForm.reset();
      if (preview) { preview.src = ''; preview.classList.add('d-none'); }
      resetFormSubmitHandler();
    });
  }
  // Preview ảnh trong modal sửa
  (function setupModal() {
    const mImage = document.getElementById('editImage');
    const mPreview = document.getElementById('editImagePreview');
    if (mImage && mPreview) {
      mImage.addEventListener('input', () => {
        const url = mImage.value.trim();
        if (url) { mPreview.src = url; mPreview.classList.remove('d-none'); }
        else { mPreview.src = ''; mPreview.classList.add('d-none'); }
      });
    }
    const saveBtn = document.getElementById('saveEditBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        const idxStr = saveBtn.dataset.idx;
        const idx = Number(idxStr);
        if (!Number.isFinite(idx)) return;
        const posts = getPosts();
        const post = posts[idx];
        if (!post) return;
        const mTitle = document.getElementById('editTitle');
        const mAuthor = document.getElementById('editAuthor');
        const mImage = document.getElementById('editImage');
        const mCategory = document.getElementById('editCategory');
        const mSummary = document.getElementById('editSummary');
        const mContent = document.getElementById('editContent');
        const title = mTitle.value.trim();
        const author = mAuthor.value.trim();
        const image = mImage.value.trim();
        const category = mCategory.value;
        const content = mContent.value.trim();
        if (!title || !author || !image || !category || !content) return;
        post.title = title;
        post.author = author;
        post.image = image;
        post.category = category;
        post.content = content;
        if (mSummary) {
          const s = mSummary.value;
          post.summary = s && s.length ? s : post.content.replace(/\s+/g, ' ').trim();
        }
        post.date = new Date().toLocaleString();
        posts[idx] = post;
        savePosts(posts);
        renderPosts();
        // Đóng modal
        const modalEl = document.getElementById('editPostModal');
        if (modalEl) {
          const instance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
          instance.hide();
        }
      });
    }
  })();
  // Chuyển view admin sidebar
  document.querySelectorAll('.admin-sidebar .admin-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.admin-sidebar .admin-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const view = link.getAttribute('data-view');
      if (view === 'all') {
        adminViewAdd.classList.add('d-none');
        adminViewAll.classList.remove('d-none');
        document.getElementById('adminViewCategories').classList.add('d-none');
        document.getElementById('adminViewSettings').classList.add('d-none');
        document.getElementById('adminViewTrash').classList.add('d-none');
      } else if (view === 'categories') {
        adminViewAdd.classList.add('d-none');
        adminViewAll.classList.add('d-none');
        document.getElementById('adminViewCategories').classList.remove('d-none');
        document.getElementById('adminViewSettings').classList.add('d-none');
        document.getElementById('adminViewTrash').classList.add('d-none');
      } else if (view === 'settings') {
        adminViewAdd.classList.add('d-none');
        adminViewAll.classList.add('d-none');
        document.getElementById('adminViewCategories').classList.add('d-none');
        document.getElementById('adminViewSettings').classList.remove('d-none');
        document.getElementById('adminViewTrash').classList.add('d-none');
      } else if (view === 'trash') {
        adminViewAdd.classList.add('d-none');
        adminViewAll.classList.add('d-none');
        document.getElementById('adminViewCategories').classList.add('d-none');
        document.getElementById('adminViewSettings').classList.add('d-none');
        document.getElementById('adminViewTrash').classList.remove('d-none');
      } else {
        adminViewAdd.classList.remove('d-none');
        adminViewAll.classList.add('d-none');
        document.getElementById('adminViewCategories').classList.add('d-none');
        document.getElementById('adminViewSettings').classList.add('d-none');
        document.getElementById('adminViewTrash').classList.add('d-none');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', init);

