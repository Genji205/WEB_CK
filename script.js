// Đồng hồ realtime cho topbar (thứ, ngày/tháng/năm giờ:phút:giây)
function startTopbarClock() {
  const weekdayEl = document.getElementById('topbarWeekday');
  const dateEl = document.getElementById('topbarDate');
  if (!weekdayEl && !dateEl) return; // trang không có topbar
  const weekdays = ['Chủ nhật','Hai','Ba','Tư','Năm','Sáu','Bảy'];
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const d = new Date();
    if (weekdayEl) weekdayEl.textContent = weekdays[d.getDay()];
    if (dateEl) {
      const dateStr = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
      const timeStr = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      dateEl.textContent = `${dateStr} ${timeStr}`;
    }
  }
  tick();
  clearInterval(window.__topbarClockTimer);
  window.__topbarClockTimer = setInterval(tick, 1000);
}

// Hiển thị bài báo do người dùng đăng lên trang chủ
function getPosts() {
  return JSON.parse(localStorage.getItem('posts') || '[]');
}
function renderHomePosts(keyword = '') {
  const posts = getPosts();
  const gridContainer = document.getElementById('dynamicPosts');
  const featuredContainer = document.getElementById('featuredPosts');
  if (!gridContainer && !featuredContainer) return;
  const normalizedKeyword = (keyword || '').trim().toLowerCase();
  const filtered = normalizedKeyword
    ? posts.filter(p => (
        (p.title || '').toLowerCase().includes(normalizedKeyword) ||
        (p.summary || '').toLowerCase().includes(normalizedKeyword) ||
        (p.content || '').toLowerCase().includes(normalizedKeyword) ||
        (p.category || '').toLowerCase().includes(normalizedKeyword)
      ))
    : posts;
  // 1) Featured: lấy 3 bài mới nhất
  if (featuredContainer) {
    // Pagination for featured posts
    const perPage = 3;
    const items = filtered.slice().reverse();
    const totalPages = Math.max(1, Math.ceil(items.length / perPage));
    const pagination = document.getElementById('featuredPagination');

    function renderFeaturedPage(page) {
      const currentPage = Math.min(Math.max(page, 1), totalPages);
      if (featuredContainer.classList) featuredContainer.classList.add('is-fading');
      setTimeout(() => {
        featuredContainer.innerHTML = '';
        const start = (currentPage - 1) * perPage;
        const pageItems = items.slice(start, start + perPage);
        if (pageItems.length === 0) {
          featuredContainer.innerHTML = '<div class="col-12 text-center text-muted">Chưa có bài nổi bật.</div>';
        } else {
          pageItems.forEach(post => {
            const idx = posts.indexOf(post);
            const el = document.createElement('div');
            el.className = 'col-md-4';
            el.innerHTML = `
              <div class="card news-card post-clickable h-100" data-post-id="${idx}">
                <img src="${post.image}" class="card-img-top" alt="${post.category}">
                <div class="card-body">
                  <span class="badge bg-primary mb-2">${post.category}</span>
                  <h5 class="card-title">${post.title}</h5>
                  <p class="card-text">${(post.summary || post.content).replace(/\s+/g,' ').slice(0,140)}${(post.summary || post.content).length>140?'...':''}</p>
                </div>
              </div>`;
            featuredContainer.appendChild(el);
          });
        }
        if (featuredContainer.classList) featuredContainer.classList.remove('is-fading');
      }, 120);

      // Render pagination controls
      if (pagination) {
        pagination.innerHTML = '';
        const prev = document.createElement('li');
        prev.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
        prev.innerHTML = `<a class="page-link" href="#">«</a>`;
        prev.onclick = (e) => { e.preventDefault(); if (currentPage > 1) renderFeaturedPage(currentPage - 1); };
        pagination.appendChild(prev);

        for (let p = 1; p <= totalPages; p++) {
          const li = document.createElement('li');
          li.className = 'page-item' + (p === currentPage ? ' active' : '');
          li.innerHTML = `<a class="page-link" href="#">${p}</a>`;
          li.onclick = (e) => { e.preventDefault(); renderFeaturedPage(p); };
          pagination.appendChild(li);
        }

        const next = document.createElement('li');
        next.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
        next.innerHTML = `<a class="page-link" href="#">»</a>`;
        next.onclick = (e) => { e.preventDefault(); if (currentPage < totalPages) renderFeaturedPage(currentPage + 1); };
        pagination.appendChild(next);
      }

      // Re-bind click handlers for post cards after render
      setTimeout(() => {
        document.querySelectorAll('.post-clickable').forEach(card => {
          card.addEventListener('click', function() {
            const postId = Number(this.getAttribute('data-post-id'));
            localStorage.setItem('viewPostId', String(postId));
            window.location.href = 'article.html';
          });
        });
      }, 0);
    }

    renderFeaturedPage(1);
  }
  // (Đã bỏ Mới nhất và Theo danh mục theo yêu cầu)
  // 4) Grid tổng hợp: toàn bộ bài theo lưới
  if (gridContainer) {
    gridContainer.innerHTML = '';
    if (filtered.length === 0) {
      gridContainer.innerHTML = `<div class="col-12 text-center text-muted">Không có kết quả${normalizedKeyword ? ` cho \"${keyword}\"` : ''}.</div>`;
    } else {
      filtered.slice().reverse().forEach(post => {
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
          </div>`;
        gridContainer.appendChild(col);
      });
    }
  }
  // Bind click mở chi tiết cho tất cả phần (backup lần đầu)
  document.querySelectorAll('.post-clickable').forEach(card => {
    card.addEventListener('click', function() {
      const postId = Number(this.getAttribute('data-post-id'));
      localStorage.setItem('viewPostId', String(postId));
      window.location.href = 'article.html';
    });
  });
}
// Delegation: đảm bảo click luôn hoạt động kể cả sau render/pagination
document.addEventListener('click', function(e) {
  const card = e.target.closest('.post-clickable');
  if (!card) return;
  e.preventDefault();
  const postId = Number(card.getAttribute('data-post-id'));
  if (Number.isFinite(postId)) {
    localStorage.setItem('viewPostId', String(postId));
    window.location.href = 'article.html';
  }
});
document.addEventListener('DOMContentLoaded', function() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  if (q) {
    updateSearchResults(q);
  } else {
    renderHomePosts(q);
  }
});
const menuContent = {
      chinhtri: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Chính trị</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=chinhtri&subcategory=su-kien">Sự kiện</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=chinhtri&subcategory=thoi-luan">Thời luận</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=chinhtri&subcategory=doi-ngoai">Đối ngoại</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=chinhtri&subcategory=doi-thoai-chinh-sach">Đối thoại chính sách</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/528068263637045248/2025/7/28/z6850126981982046e9c84e1b2dbb7a9ba0c0b35f0af86-1753711081926866039639.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Thủ tướng: Đăng cai Năm APEC 2027 là trọng trách quốc tế của Việt Nam</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/base64-17536961400451404077094.jpeg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Thủ tướng: Chính quyền địa phương 2 cấp cơ bản thông suốt sau sắp xếp</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/528068263637045248/2025/7/28/vnapotaltongbithutolamthamcucanninhchinhtrinoibobocongan8175800-17536861867701706975394.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Tổng Bí thư: Cần đổi mới tư duy bảo vệ an ninh chính trị nội bộ</p></div>
        </div>
      </div>
    </div>`,
      thoisu: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Thời sự</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=phap-luat">Pháp luật</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=lao-dong-viec-lam">Lao động - Việc làm</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=phong-su-dieu-tra">Phóng sự / Điều tra</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=chong-tin-gia">Chống tin giả</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=dan-sinh">Dân sinh</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=quoc-phong">Quốc phòng</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=y-te">Y tế</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thoisu&subcategory=quyen-duoc-biet">Quyền được biết</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/1/pho-bi-thu-tphcm-nguyen-thanh-nghi-ngoc-duong-17513533224221454374900.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">TP.HCM lập thêm 2 tổ công tác chỉ đạo đại hội đảng bộ phường, xã</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/anh-1tn-175370424428830758203.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">TP.HCM: Tai nạn nghiêm trọng, 2 xe ben đấu đầu, 2 người thương vong</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/anh-giai-cuu-nguoi-phu-nu-17537041992311719315528.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Được giải cứu sau 6 ngày mắc kẹt trong rừng do lũ</p></div>
        </div>
      </div>
    </div>`,
      kinhte: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Kinh tế</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=kinh-te-xanh">Kinh tế xanh</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=ngan-hang">Ngân hàng</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=doanh-nghiep">Doanh nghiệp</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=lam-giau">Làm giàu</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=chung-khoan">Chứng khoán</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=chinh-sach-phat-trien">Chính sách - Phát triển</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=khat-vong-viet-nam">Khát vọng Việt Nam</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=kinhte&subcategory=dia-oc">Địa Ốc</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/morinaga1-1753698323817483563540.png" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Morinaga - Niềm tin vững chắc từ hành trình 108 năm</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/6/12/anh-ngoc-thang4772-1749691867263388458031.jpeg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Giá USD tăng cao kỷ lục, lãi suất tiếp tục đi lên</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/edit-khach-hang-mua-sam-tai-he-thong-cua-hang-sieu-thi-cua-wincommerce-2-1-1753690584325576886404.jpeg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Masan đạt lợi nhuận gấp đôi cùng kỳ năm trước</p></div>
        </div>
      </div>
    </div>`,
      congnghe: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Công nghệ</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=congnghe&subcategory=tin-tuc-cong-nghe">Tin tức công nghệ</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=congnghe&subcategory=san-pham">Sản phẩm</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=congnghe&subcategory=xu-huong-chuyen-doi-so">Xu hướng - chuyển đổi số</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=congnghe&subcategory=blockchain">Blockchain</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=congnghe&subcategory=game">Game</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=congnghe&subcategory=ai">AI</a></li>

            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/26/asus-17535461914541019825279.png" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Asus Republic of Gamers mở cửa hàng ROG Exclusive Store đầu tiên tại Việt Nam</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/b1-17537052603061150619621.png" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Conviction 2025 thúc đẩy phát triển blockchain và AI tại Việt Nam</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/picture1-17537043666241752923585.png" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">J&T Express đạt mốc 7 năm tăng trưởng tại thị trường Việt Nam</p></div>
        </div>
      </div>
    </div>`,
      doisong: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Đời sống</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=tet-yeu-thuong">Tết yêu thương</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=gia-dinh">Gia Đình</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=cong-dong">Cộng đồng</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=song-khoe">Sống khỏe</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=nguoi-song-quanh-ta">Người sống quanh ta</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=am-thuc">Ẩm thực</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=doisong&subcategory=mot-nua-the-gioi">Một nửa thế giới</a></li>

            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/img8587-1753696194250184576531.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Từ 0 giờ đêm nay, người dân TP.HCM lưu thông qua đường Lê Lợi cần chú ý</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/stat-17536977171811607599442.png" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">EVNHANOI cảnh báo khách hàng tiết kiệm điện trong đợt nắng nóng cuối tháng 7</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/d19bc9836793eecdb782-1753689837699285492045.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Đặng Bảo Trâm: Người tiên phong chuẩn mực ứng xử mới cho ngành dịch vụ cao cấp</p></div>
        </div>
      </div>
    </div>`,
      thethao: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Thể thao</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=thethao&subcategory=bong-da-thanh-nien-sinh-vien">Bóng đá Thanh niên Sinh viên</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thethao&subcategory=bong-ro">Bóng rổ</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thethao&subcategory=cac-mon-khac">Các môn khác</a></li>

            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=thethao&subcategory=the-thao-cong-dong">Thể thao & Cộng đồng</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=thethao&subcategory=the-hinh">Thể hình</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/980/528068263637045248/2025/7/28/1000011139-17537057654191994049274.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Xác định 4 đội mạnh vào bán kết U.11 toàn quốc</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/528068263637045248/2025/7/28/3-17537047307461126300497.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Ngôi sao nhập tịch U.23 Indonesia dán băng chằng chịt trước trận chung kết với Việt Nam</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/z6850330400974224f95748d4224903f831581be80b4df-17537100332691562060838.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">U.23 Thái Lan 1-0 U.23 Philippines, tranh hạng ba Đông Nam Á 2025: Phanthamit mở tỷ số</p></div>
        </div>
      </div>
    </div>`,
      giaoduc: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Giáo dục</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=tuyen-sinh">Tuyển sinh</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=du-hoc">Du học</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=phu-huynh">Phụ huynh</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=cam-nang-tuyen-sinh-2025">Cẩm nang tuyển sinh 2025</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=chon-nghe-chon-truong">Chọn nghề - Chọn trường</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=nha-truong">Nhà trường</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=tra-cuu-diem-thi">Tra cứu điểm thi</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=giaoduc&subcategory=on-thi-tot-nghiep">Ôn thi tốt nghiệp</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/23/hoc-vien-ngan-hang-quy-dinh-diem-chuan-khoi-c-cao-hon-khoi-con-lai-25-diem-1753284520621107238986.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Bình quân mỗi thí sinh 9 nguyện vọng, chi phí xét tuyển khoảng 152 tỉ đồng</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/pham-huu-1753691545578707053333.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Trường ĐH Sài Gòn ban hành thông báo mới về xét điểm thi đánh giá năng lực</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/img5115-17536981883331400211632.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Điểm sàn xét tuyển và điểm chuẩn dưới trung bình có vi phạm quy chế?</p></div>
        </div>
      </div>
    </div>`,
      dulich: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Du lịch</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=dulich&subcategory=bat-dong-san">Bất động sản</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=dulich&subcategory=tin-tuc-su-kien">Tin tức - Sự kiện</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=dulich&subcategory=choi-gi-an-dau-di-the-nao">Chơi gì, ăn đâu, đi thế nào?</a></li>

            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=dulich&subcategory=kham-pha">Khám phá</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=dulich&subcategory=cau-chuyen-du-lich">Câu chuyện du lịch</a></li>

            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/528068263637045248/2025/7/28/edit_photo_zmdywkqtyv-1753683769.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Cơm gà gây tranh cãi ở Singapore: Có gì khiến khách Việt dậy sớm xếp hàng dài?</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/4/8/tphcm-ban-phao-hoa-bo-song-sai-gon-1744121805259727136442.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Vượt Singapore, TP.HCM đứng thứ 2 đô thị 'giữ chân cư dân' tốt nhất thế giới</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/660/528068263637045248/2025/7/28/1000044636-1753677407587496670977.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Nhóm hành khách Trung Quốc đánh nhau hỗn loạn trên máy bay</p></div>
        </div>
      </div>
    </div>`,
      vanhoa: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Văn hóa</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=song-dep">Sống đẹp</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=khao-cuu">Khảo cứu</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=sach-hay">Sách hay</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=nghia-tinh-mien-tay">Nghĩa tình miền tây</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=cau-chuyen-van-hoa">Câu chuyện văn hóa</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=xem-nghe">Xem - Nghe</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=mon-ngon-ha-noi">Món ngon Hà Nội</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=vanhoa&subcategory=hao-khi-mien-dong">Hào khí miền Đông</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/28/1-17536700629452116231139.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Trung tâm cung ứng dịch vụ sự nghiệp công P.Hòa Cường: Nỗ lực phục vụ nhân dân</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/15/1-1752562742429595422388.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">16 năm biến gian nan thành trái ngọt nơi đại ngàn Lai Châu</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/27/18a-17536260186991978537307.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Mái đá Ngườm - nơi sử dụng lửa và chế tác công cụ đá sớm nhất Đông Nam Á</p></div>
        </div>
      </div>
    </div>`,
      xe: `<div class="row">
      <div class="col-md-4 border-end">
        <h6 class="text-dark fw-bold mb-3">Xe</h6>
        <div class="row">
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=thi-truong">Thị trường</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=danh-gia-xe">Đánh giá xe</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=video">Video</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=xe-doi-song">Xe - Đời sống</a></li>
            </ul>
          </div>
          <div class="col-6">
            <ul class="list-unstyled">
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=xe-dien">Xe điện</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=tu-van">Tư vấn</a></li>
              <li><a class="dropdown-item fw-bold" href="category.html?category=xe&subcategory=xe-giao-thong">Xe - Giao thông</a></li>

            </ul>
          </div>
        </div>
      </div>
      <div class="col-md-8">
        <div class="row">
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/15/xe-may-dien-dang-can-nhac-tai-viet-nam-3-thanhnien-1752573416306928169266.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Pin tháo rời: Giải pháp phù hợp với người dùng xe máy điện</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/26/sedan-hang-b-dua-giam-gia-nhieu-mau-chi-hon-300-trieu-dong-1-thanhnien-1753521309972477701558.jpg" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Sedan hạng B đua giảm giá, nhiều mẫu xe khởi điểm hơn 300 triệu đồng</p></div>
          <div class="col-md-4"><img src="https://images2.thanhnien.vn/thumb_w/640/528068263637045248/2025/7/26/cong-nghe-dung-khoi-dong-2-17535701502142107814497.png" class="img-fluid rounded mb-2 equal-img" alt=""><p class="mb-0">Người dùng ô tô phát chán với tính năng giúp xe tiết kiệm nhiên liệu</p></div>
        </div>
      </div>
    </div>`
    };

    let hideTimeout;
    let currentKey = null;

    const menu = document.getElementById('megaMenu');

    function showMegaMenu(key) {
      cancelHide();
      if (currentKey !== key) {
        menu.innerHTML = menuContent[key] || '';
        currentKey = key;
      }
      menu.style.display = 'block';
      menu.style.opacity = '1';
      menu.style.pointerEvents = 'auto';
    }

    function hideMegaMenu() {
      menu.style.opacity = '0';
      menu.style.pointerEvents = 'none';
      menu.style.display = 'none';
      currentKey = null;
    }

    function startHideTimer() {
      hideTimeout = setTimeout(() => {
        hideMegaMenu();
      }, 300);
    }

    function cancelHide() {
      clearTimeout(hideTimeout);
    }

    document.querySelectorAll('.nav-item.dropdown').forEach(item => {
      const key = item.getAttribute('data-key');
      item.addEventListener('mouseenter', () => showMegaMenu(key));
      item.addEventListener('mouseleave', startHideTimer);
    });

    menu.addEventListener('mouseenter', cancelHide);
    menu.addEventListener('mouseleave', startHideTimer);

    // Chức năng tìm kiếm bài viết và tin mới
function filterSidebarNews(keyword) {
  const newsList = document.querySelector('ul.list-group');
  if (!newsList) return;
  const emptyId = 'newsEmptyItem';
  let anyVisible = false;
  newsList.querySelectorAll('li.list-group-item').forEach(item => {
    if (item.id === emptyId) return;
    if (!keyword) {
      item.style.display = '';
      anyVisible = true;
      return;
    }
    const visible = item.textContent.toLowerCase().includes(keyword.toLowerCase());
    item.style.display = visible ? '' : 'none';
    if (visible) anyVisible = true;
  });
  let emptyEl = document.getElementById(emptyId);
  if (!anyVisible && keyword) {
    if (!emptyEl) {
      emptyEl = document.createElement('li');
      emptyEl.id = emptyId;
      emptyEl.className = 'list-group-item text-muted';
      emptyEl.textContent = 'Không có tin phù hợp';
      newsList.appendChild(emptyEl);
    }
  } else if (emptyEl) {
    emptyEl.remove();
  }
}

// Cập nhật hàm tìm kiếm để cũng lọc tin mới nhất
function updateSearchResults(keyword) {
  renderHomePosts(keyword);
  filterSidebarNews(keyword);
}

// Hiển thị tin tức mới nhất từ các bài viết được đăng lên
function renderLatestNews() {
  const posts = getPosts();
  const newsList = document.querySelector('ul.list-group');
  if (!newsList) return;
  
  // Lấy 4 bài viết mới nhất
  const latestPosts = posts.slice(-4).reverse();
  
  // Xóa nội dung cũ
  newsList.innerHTML = '';
  
  if (latestPosts.length === 0) {
    // Nếu chưa có bài viết nào
    const emptyItem = document.createElement('li');
    emptyItem.className = 'list-group-item text-muted';
    emptyItem.textContent = 'Chưa có tin tức mới';
    newsList.appendChild(emptyItem);
    return;
  }
  
  // Tạo danh sách tin mới từ các bài viết
  latestPosts.forEach((post, index) => {
    const listItem = document.createElement('li');
    listItem.className = 'list-group-item latest-news-item';
    listItem.setAttribute('data-post-id', posts.indexOf(post));
    
    // Emoji theo danh mục
    const categoryEmoji = {
      'Chính trị': '🏛️',
      'Thời sự': '📰',
      'Kinh tế': '💰',
      'Công nghệ': '💻',
      'Đời sống': '🏠',
      'Thể thao': '⚽',
      'Giáo dục': '📚',
      'Du lịch': '✈️',
      'Văn hóa': '🎭',
      'Xe': '🚗'
    };
    
    const emoji = categoryEmoji[post.category] || '📄';
    const title = post.title.length > 60 ? post.title.substring(0, 60) + '...' : post.title;
    
    listItem.setAttribute('data-emoji', emoji);
    listItem.textContent = title;
    
    // Click để xem chi tiết bài viết
    listItem.addEventListener('click', function() {
      const postId = Number(this.getAttribute('data-post-id'));
      localStorage.setItem('viewPostId', String(postId));
      window.location.href = 'article.html';
    });
    
    newsList.appendChild(listItem);
  });
}

// Cập nhật tin mới khi có thay đổi
function refreshLatestNews() {
  const currentVersion = localStorage.getItem('posts_version') || '0';
  if (refreshLatestNews.__lastVersion === currentVersion) return;
  refreshLatestNews.__lastVersion = currentVersion;
  renderLatestNews();
}

window.addEventListener('DOMContentLoaded', function() {
  // Khởi tạo tin mới nhất
  renderLatestNews();
  
  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  if (searchForm) {
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const keyword = (searchInput?.value || '').trim();
      const onHome = !!document.getElementById('dynamicPosts');
      if (onHome) {
        updateSearchResults(keyword);
        const url = keyword ? `?q=${encodeURIComponent(keyword)}` : window.location.pathname;
        window.history.replaceState(null, '', url);
      } else {
        window.location.href = `index.html${keyword ? `?q=${encodeURIComponent(keyword)}` : ''}`;
      }
    });
  }

  // Slideshow: lấy dữ liệu từ bài viết mới nhất và tự làm mới khi có thay đổi
  function getPostsForSlideshow() {
    try { return JSON.parse(localStorage.getItem('posts') || '[]'); } catch { return []; }
  }
  function buildSlidesFromPosts() {
    const posts = getPostsForSlideshow();
    const latest = posts.slice(-3).reverse();
    if (latest.length === 0) return [];
    return latest.map((p, index) => ({
      img: p.image,
      title: p.title,
      desc: (p.summary && p.summary.trim()) ? p.summary.trim() : (p.content || '').replace(/\s+/g,' ').trim().slice(0, 140) + (((p.content||'').length>140)?'...':''),
      postId: posts.indexOf(p) // Thêm post ID để có thể chuyển đến bài viết
    }));
  }
  let slides = buildSlidesFromPosts();
  if (slides.length === 0) {
    slides = [{
      img: "",
      title: "Chưa có bài viết",
      desc: "Hãy thêm bài trong mục Quản trị để hiển thị ở đây.",
      postId: -1 // Không có bài viết
    }];
  }
  let slideIndex = 0;
  const slideImg = document.getElementById('slideImg');
  const slideCaption = document.getElementById('slideCaption');
  let slideTimer;
  let lastDirection = 1; // 1: next (phải), -1: prev (trái)

  // Hàm xử lý click vào slideshow để chuyển đến bài viết
  function handleSlideClick() {
    if (slides[slideIndex] && slides[slideIndex].postId >= 0) {
      // Reset timer khi người dùng tương tác
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = setInterval(() => showSlide(slideIndex + 1), 4000);
      }
      localStorage.setItem('viewPostId', String(slides[slideIndex].postId));
      window.location.href = 'article.html';
    }
  }

function showSlide(idx, direction = 1) {
  // Xác định hướng chuyển động đặc biệt cho đầu/cuối
  let newIndex = (idx + slides.length) % slides.length;
  let realDirection = direction;
  if (slideIndex === slides.length - 1 && newIndex === 0) {
    // Từ cuối về đầu: trượt sang phải
    realDirection = 1;
  } else if (slideIndex === 0 && newIndex === slides.length - 1) {
    // Từ đầu về cuối: trượt sang trái
    realDirection = -1;
  }
  slideIndex = newIndex;
  lastDirection = realDirection;
  // Tạo ảnh và caption mới, trượt ngang vào
  const newImg = document.createElement('img');
  newImg.src = slides[slideIndex].img;
  newImg.alt = 'Slide ' + (slideIndex+1);
  newImg.className = slideImg.className;
  newImg.style.position = 'absolute';
  newImg.style.top = '0';
  newImg.style.left = '0';
  newImg.style.width = '100%';
  newImg.style.height = '100%';
  newImg.style.objectFit = 'cover';
  newImg.style.borderRadius = '12px';
  newImg.style.zIndex = '10';
  newImg.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
  newImg.style.transform = realDirection === 1 ? 'translateX(100%)' : 'translateX(-100%)';
  newImg.style.opacity = 1;
  slideImg.parentNode.appendChild(newImg);

  const newCaption = document.createElement('div');
  newCaption.className = slideCaption.className;
  newCaption.style.position = 'absolute';
  newCaption.style.left = slideCaption.style.left;
  newCaption.style.bottom = slideCaption.style.bottom;
  newCaption.style.maxWidth = slideCaption.style.maxWidth;
  newCaption.style.zIndex = '11';
  newCaption.style.opacity = 0;
  newCaption.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
  newCaption.innerHTML = `<h3 class=\"text-white\">${slides[slideIndex].title}</h3><p>${slides[slideIndex].desc}</p>`;
  slideCaption.parentNode.appendChild(newCaption);

  // Cho ảnh/caption mới trượt vào, đồng thời clone ảnh/caption cũ trượt ra ngoài
  const oldImgClone = slideImg.cloneNode(true);
  oldImgClone.style.position = 'absolute';
  oldImgClone.style.top = '0';
  oldImgClone.style.left = '0';
  oldImgClone.style.width = '100%';
  oldImgClone.style.height = '100%';
  oldImgClone.style.objectFit = 'cover';
  oldImgClone.style.borderRadius = '12px';
  oldImgClone.style.zIndex = '9';
  oldImgClone.style.transition = 'transform 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s';
  oldImgClone.style.transform = 'translateX(0)';
  oldImgClone.style.opacity = 1;
  slideImg.parentNode.appendChild(oldImgClone);

  const oldCaptionClone = slideCaption.cloneNode(true);
  oldCaptionClone.style.position = 'absolute';
  oldCaptionClone.style.left = slideCaption.style.left;
  oldCaptionClone.style.bottom = slideCaption.style.bottom;
  oldCaptionClone.style.maxWidth = slideCaption.style.maxWidth;
  oldCaptionClone.style.zIndex = '10';
  oldCaptionClone.style.opacity = 1;
  oldCaptionClone.style.transition = 'opacity 0.5s cubic-bezier(0.4,0,0.2,1), transform 0.5s cubic-bezier(0.4,0,0.2,1)';
  oldCaptionClone.style.transform = 'translateX(0)';
  slideCaption.parentNode.appendChild(oldCaptionClone);

  setTimeout(() => {
    newImg.style.transform = 'translateX(0)';
    newCaption.style.opacity = 1;
    oldImgClone.style.transform = realDirection === 1 ? 'translateX(-100%)' : 'translateX(100%)';
    oldImgClone.style.opacity = 1;
    oldCaptionClone.style.transform = realDirection === 1 ? 'translateX(-100%)' : 'translateX(100%)';
    oldCaptionClone.style.opacity = 0;
    slideImg.style.opacity = 0;
    slideCaption.style.opacity = 0;
  }, 20);

  setTimeout(() => {
    // Cập nhật lại slideImg và slideCaption với nội dung mới
    slideImg.src = slides[slideIndex].img;
    slideImg.alt = 'Slide ' + (slideIndex+1);
    slideImg.style.transition = 'none';
    slideImg.style.transform = 'translateX(0)';
    slideImg.style.opacity = 1;
    slideCaption.innerHTML = `<h3 class=\"text-white\">${slides[slideIndex].title}</h3><p>${slides[slideIndex].desc}</p>`;
    slideCaption.style.opacity = 1;
    
    // Đảm bảo event listeners vẫn hoạt động sau khi cập nhật nội dung
    slideImg.onclick = handleSlideClick;
    slideCaption.onclick = handleSlideClick;
    
    // Xóa ảnh/caption tạm
    newImg.remove();
    newCaption.remove();
    oldImgClone.remove();
    oldCaptionClone.remove();
  }, 520);
}
  function refreshSlidesIfChanged() {
    const currentVersion = localStorage.getItem('posts_version') || '0';
    if (refreshSlidesIfChanged.__lastVersion === currentVersion) return;
    refreshSlidesIfChanged.__lastVersion = currentVersion;
    const newSlides = buildSlidesFromPosts();
    if (newSlides.length === 0) return;
    slides = newSlides;
    slideIndex = 0;
    if (slideImg && slideCaption) {
      showSlide(0, lastDirection);
      // Đảm bảo event listeners được thiết lập lại
      slideImg.onclick = handleSlideClick;
      slideCaption.onclick = handleSlideClick;
    }
  }
  // Lắng nghe thay đổi từ tab khác
  window.addEventListener('storage', (e) => {
    if (e.key === 'posts' || e.key === 'posts_version') {
      refreshSlidesIfChanged();
      refreshLatestNews();
    }
  });
  // Kiểm tra định kỳ trong cùng tab
  setInterval(refreshSlidesIfChanged, 3000);
  setInterval(refreshLatestNews, 3000);

  // Chỉ chạy slideshow tự động nếu có slideImg và slideCaption
  if (slideImg && slideCaption) {
    refreshSlidesIfChanged();
    showSlide(0);
    slideTimer = setInterval(() => showSlide(slideIndex + 1), 4000);
    
    // Thêm event listeners cho click vào slideshow
    slideImg.addEventListener('click', handleSlideClick);
    slideCaption.addEventListener('click', handleSlideClick);
    
    // Thêm event listeners cho nút prev/next
    const slidePrev = document.getElementById('slidePrev');
    const slideNext = document.getElementById('slideNext');
    
    if (slidePrev) {
      slidePrev.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showSlide(slideIndex - 1, -1);
        // Reset timer khi người dùng tương tác
        if (slideTimer) {
          clearInterval(slideTimer);
          slideTimer = setInterval(() => showSlide(slideIndex + 1), 4000);
        }
      });
    }
    
    if (slideNext) {
      slideNext.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        showSlide(slideIndex + 1, 1);
        // Reset timer khi người dùng tương tác
        if (slideTimer) {
          clearInterval(slideTimer);
          slideTimer = setInterval(() => showSlide(slideIndex + 1), 4000);
        }
      });
    }
  }
});