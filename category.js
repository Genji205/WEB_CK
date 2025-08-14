// Xử lý trang danh mục
document.addEventListener('DOMContentLoaded', function() {
  // Lấy tham số từ URL
  const params = new URLSearchParams(window.location.search);
  const category = params.get('category') || '';
  const subcategory = params.get('subcategory') || '';
  
  // Cập nhật tiêu đề trang
  updateCategoryTitle(category, subcategory);
  
  // Hiển thị bài viết theo danh mục
  renderCategoryPosts(category, subcategory);
  
  // Xử lý tìm kiếm
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const keyword = (searchInput?.value || '').trim();
      if (keyword) {
        window.location.href = `index.html?q=${encodeURIComponent(keyword)}`;
      }
    });
  }
});

// Cập nhật tiêu đề danh mục
function updateCategoryTitle(category, subcategory) {
  const categoryTitle = document.getElementById('categoryTitle');
  const categoryDescription = document.getElementById('categoryDescription');
  
  if (!categoryTitle || !categoryDescription) return;
  
  const categoryNames = {
    'chinhtri': 'Chính trị',
    'thoisu': 'Thời sự',
    'kinhte': 'Kinh tế',
    'congnghe': 'Công nghệ',
    'doisong': 'Đời sống',
    'thethao': 'Thể thao',
    'giaoduc': 'Giáo dục',
    'dulich': 'Du lịch',
    'vanhoa': 'Văn hóa',
    'xe': 'Xe'
  };
  
  const subcategoryNames = {
    // Chính trị
    'su-kien': 'Sự kiện',
    'thoi-luan': 'Thời luận',
    'doi-ngoai': 'Đối ngoại',
    'doi-thoai-chinh-sach': 'Đối thoại chính sách',
    
    // Thời sự
    'phap-luat': 'Pháp luật',
    'lao-dong-viec-lam': 'Lao động - Việc làm',
    'phong-su-dieu-tra': 'Phóng sự / Điều tra',
    'chong-tin-gia': 'Chống tin giả',
    'dan-sinh': 'Dân sinh',
    'quoc-phong': 'Quốc phòng',
    'y-te': 'Y tế',
    'quyen-duoc-biet': 'Quyền được biết',
    
    // Kinh tế
    'kinh-te-xanh': 'Kinh tế xanh',
    'ngan-hang': 'Ngân hàng',
    'doanh-nghiep': 'Doanh nghiệp',
    'lam-giau': 'Làm giàu',
    'chung-khoan': 'Chứng khoán',
    'chinh-sach-phat-trien': 'Chính sách - Phát triển',
    'khat-vong-viet-nam': 'Khát vọng Việt Nam',
    'dia-oc': 'Địa Ốc',
    
    // Công nghệ
    'tin-tuc-cong-nghe': 'Tin tức công nghệ',
    'san-pham': 'Sản phẩm',
    'xu-huong-chuyen-doi-so': 'Xu hướng - chuyển đổi số',
    'blockchain': 'Blockchain',
    'game': 'Game',
    'ai': 'AI',
    
    // Đời sống
    'tet-yeu-thuong': 'Tết yêu thương',
    'gia-dinh': 'Gia Đình',
    'cong-dong': 'Cộng đồng',
    'song-khoe': 'Sống khỏe',
    'nguoi-song-quanh-ta': 'Người sống quanh ta',
    'am-thuc': 'Ẩm thực',
    'mot-nua-the-gioi': 'Một nửa thế giới',
    
    // Thể thao
    'bong-da-thanh-nien-sinh-vien': 'Bóng đá Thanh niên Sinh viên',
    'bong-ro': 'Bóng rổ',
    'cac-mon-khac': 'Các môn khác',
    'the-thao-cong-dong': 'Thể thao & Cộng đồng',
    'the-hinh': 'Thể hình',
    
    // Giáo dục
    'tuyen-sinh': 'Tuyển sinh',
    'du-hoc': 'Du học',
    'phu-huynh': 'Phụ huynh',
    'cam-nang-tuyen-sinh-2025': 'Cẩm nang tuyển sinh 2025',
    'chon-nghe-chon-truong': 'Chọn nghề - Chọn trường',
    'nha-truong': 'Nhà trường',
    'tra-cuu-diem-thi': 'Tra cứu điểm thi',
    'on-thi-tot-nghiep': 'Ôn thi tốt nghiệp',
    
    // Du lịch
    'bat-dong-san': 'Bất động sản',
    'tin-tuc-su-kien': 'Tin tức - Sự kiện',
    'choi-gi-an-dau-di-the-nao': 'Chơi gì, ăn đâu, đi thế nào?',
    'kham-pha': 'Khám phá',
    'cau-chuyen-du-lich': 'Câu chuyện du lịch',
    
    // Văn hóa
    'song-dep': 'Sống đẹp',
    'khao-cuu': 'Khảo cứu',
    'sach-hay': 'Sách hay',
    'nghia-tinh-mien-tay': 'Nghĩa tình miền tây',
    'cau-chuyen-van-hoa': 'Câu chuyện văn hóa',
    'xem-nghe': 'Xem - Nghe',
    'mon-ngon-ha-noi': 'Món ngon Hà Nội',
    'hao-khi-mien-dong': 'Hào khí miền Đông',
    
    // Xe
    'thi-truong': 'Thị trường',
    'danh-gia-xe': 'Đánh giá xe',
    'video': 'Video',
    'xe-doi-song': 'Xe - Đời sống',
    'xe-dien': 'Xe điện',
    'tu-van': 'Tư vấn',
    'xe-giao-thong': 'Xe - Giao thông'
  };
  
  let title = 'Danh mục';
  let description = 'Tất cả bài viết trong danh mục này';
  
  if (category && categoryNames[category]) {
    if (subcategory && subcategoryNames[subcategory]) {
      title = subcategoryNames[subcategory];
      description = '';
    } else {
      title = categoryNames[category];
      description = '';
    }
  }
  
  categoryTitle.textContent = title;
  categoryDescription.textContent = description;
  
  // Cập nhật title của trang
  document.title = `${title} - Trang tin tức`;
}

// Hiển thị bài viết theo danh mục
function renderCategoryPosts(category, subcategory) {
  const posts = getPosts();
  const container = document.getElementById('categoryPosts');
  const pagination = document.getElementById('categoryPagination');
  
  if (!container) return;
  
  // Lọc bài viết theo danh mục
  let filteredPosts = posts;
  
  if (category) {
    const categoryNames = {
      'chinhtri': 'Chính trị',
      'thoisu': 'Thời sự',
      'kinhte': 'Kinh tế',
      'congnghe': 'Công nghệ',
      'doisong': 'Đời sống',
      'thethao': 'Thể thao',
      'giaoduc': 'Giáo dục',
      'dulich': 'Du lịch',
      'vanhoa': 'Văn hóa',
      'xe': 'Xe'
    };
    
    const targetCategory = categoryNames[category];
    if (targetCategory) {
      filteredPosts = posts.filter(post => post.category === targetCategory);
    }
  }
  
  // Phân trang
  const perPage = 9;
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / perPage));
  const currentPage = 1;
  
  function renderPage(page) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const pagePosts = filteredPosts.slice(start, end).reverse();
    
    container.innerHTML = '';
    
    if (pagePosts.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="category-empty-state">
            <i class="bi bi-inbox"></i>
            <h4 class="text-muted">Chưa có bài viết nào</h4>
            <p class="text-muted">Hãy thêm bài viết trong mục Quản trị để hiển thị ở đây.</p>
          </div>
        </div>
      `;
      return;
    }
    
    pagePosts.forEach(post => {
      const idx = posts.indexOf(post);
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card news-card post-clickable h-100" data-post-id="${idx}">
          <img src="${post.image}" class="card-img-top" alt="${post.category}">
          <div class="card-body">
            <h5 class="card-title">${post.title}</h5>
            <p class="card-text">${(post.summary && post.summary.length ? post.summary : (post.content.replace(/\s+/g,' ').trim())).slice(0,120)}${(post.summary ? post.summary : post.content).length > 120 ? '...' : ''}</p>
            <span class="badge bg-secondary">${post.category}</span>
            <span class="text-muted float-end" style="font-size:0.9em">${post.date}</span>
          </div>
        </div>
      `;
      container.appendChild(col);
    });
    
    // Render pagination
    if (pagination && totalPages > 1) {
      pagination.innerHTML = '';
      
      // Nút Previous
      const prev = document.createElement('li');
      prev.className = 'page-item' + (page === 1 ? ' disabled' : '');
      prev.innerHTML = `<a class="page-link" href="#">«</a>`;
      prev.onclick = (e) => { e.preventDefault(); if (page > 1) renderPage(page - 1); };
      pagination.appendChild(prev);
      
      // Các trang
      for (let p = 1; p <= totalPages; p++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (p === page ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
        li.onclick = (e) => { e.preventDefault(); renderPage(p); };
        pagination.appendChild(li);
      }
      
      // Nút Next
      const next = document.createElement('li');
      next.className = 'page-item' + (page === totalPages ? ' disabled' : '');
      next.innerHTML = `<a class="page-link" href="#">»</a>`;
      next.onclick = (e) => { e.preventDefault(); if (page < totalPages) renderPage(page + 1); };
      pagination.appendChild(next);
    } else if (pagination) {
      pagination.innerHTML = '';
    }
    
    // Bind click handlers
    document.querySelectorAll('.post-clickable').forEach(card => {
      card.addEventListener('click', function() {
        const postId = Number(this.getAttribute('data-post-id'));
        localStorage.setItem('viewPostId', String(postId));
        window.location.href = 'article.html';
      });
    });
  }
  
  renderPage(currentPage);
}

// Lấy danh sách bài viết
function getPosts() {
  return JSON.parse(localStorage.getItem('posts') || '[]');
}
