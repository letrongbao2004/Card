/**
 * ==========================================================================
 * HỘI NGHỊ KHÁCH HÀNG 3M & PHƯỚC KHANG (SCRIPT.JS)
 * - Cá nhân hóa tên khách mời qua URL
 * - Xử lý Google Apps Script & Chuyển sang thankyou.html
 * ==========================================================================
 */

/**
 * 🔗 CẤU HÌNH GOOGLE APPS SCRIPT URL:
 * Dán Web App URL bạn nhận được sau khi Deploy Google Apps Script vào đây.
 * Ví dụ: 'https://script.google.com/macros/s/AKfycbx.../exec'
 */
const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyh1R8EPqFurVK3H7xoOl27kPsBX6UYH_jCO75OHbxdqeDrhNtevhGbi9DDYnF0us4XJQ/exec';

// ----------------------------------------------------
// 1. KHỞI TẠO KHI TẢI TRANG XONG
// ----------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // 1. Đọc tham số URL (?to=Tên_Khách hoặc ?name=Tên_Khách) để cá nhân hóa
  initGuestPersonalization();

  // 2. Thiết lập xử lý form và chuyển hướng sang thankyou.html
  setupFormHandler();
});

// ----------------------------------------------------
// 2. CÁ NHÂN HÓA TÊN KHÁCH MỜI QUA URL
// ----------------------------------------------------
function initGuestPersonalization() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestParam = urlParams.get('to') || urlParams.get('name') || urlParams.get('u');

  if (guestParam) {
    const decodedName = decodeURIComponent(guestParam);
    const displayElem = document.getElementById('displayGuestName');
    const nameInput = document.getElementById('guestName');

    if (displayElem) displayElem.textContent = decodedName;
    if (nameInput) nameInput.value = decodedName;
  }
}

// ----------------------------------------------------
// 3. XỬ LÝ FORM XÁC NHẬN & CHUYỂN HƯỚNG SANG THANKYOU.HTML
// ----------------------------------------------------
function setupFormHandler() {
  const form = document.getElementById('rsvpForm');
  if (!form) return;

  const nameInput = document.getElementById('guestName');
  const companyInput = document.getElementById('guestCompany');
  const phoneInput = document.getElementById('guestPhone');
  const wishesInput = document.getElementById('guestWishes');

  const submitBtn = document.getElementById('submitBtn');
  const nameError = document.getElementById('nameError');
  const statusError = document.getElementById('statusError');
  const generalError = document.getElementById('generalError');
  const generalErrorText = document.getElementById('generalErrorText');

  // Xóa báo lỗi khi người dùng bắt đầu nhập tên
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      if (nameError) nameError.classList.remove('visible');
      if (generalError) generalError.classList.remove('visible');
    });
  }

  // Xóa báo lỗi khi chọn lựa chọn tham gia
  document.querySelectorAll('input[name="attendanceStatus"]').forEach(radio => {
    radio.addEventListener('change', () => {
      if (statusError) statusError.classList.remove('visible');
      if (generalError) generalError.classList.remove('visible');
    });
  });

  // Sự kiện gửi Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Kiểm tra tính hợp lệ của dữ liệu (Validation)
    const nameVal = nameInput ? nameInput.value.trim() : '';
    const selectedRadio = document.querySelector('input[name="attendanceStatus"]:checked');
    const companyVal = companyInput ? companyInput.value.trim() : '';
    const phoneVal = phoneInput ? phoneInput.value.trim() : '';
    const wishesVal = wishesInput ? wishesInput.value.trim() : '';

    let hasError = false;

    if (!nameVal) {
      if (nameError) nameError.classList.add('visible');
      if (nameInput) nameInput.focus();
      hasError = true;
    } else {
      if (nameError) nameError.classList.remove('visible');
    }

    if (!selectedRadio) {
      if (statusError) statusError.classList.add('visible');
      hasError = true;
    } else {
      if (statusError) statusError.classList.remove('visible');
    }

    if (hasError) return;

    const statusVal = selectedRadio.value; // "Tôi sẽ tham dự" hoặc "Rất tiếc..."

    // 2. Kích hoạt trạng thái Loading
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    if (generalError) generalError.classList.remove('visible');

    const payload = {
      name: nameVal,
      company: companyVal || '',
      phone: phoneVal || '',
      status: statusVal,
      wishes: wishesVal || '',
      timestamp: new Date().toISOString()
    };

    try {
      // 3. Gửi dữ liệu tới Google Apps Script Web App
      if (SHEET_URL.includes('PASTE_YOUR_APPS_SCRIPT_URL_HERE')) {
        console.warn('Đang chạy ở chế độ DEMO vì chưa có URL Google Apps Script thật.');
        await new Promise(resolve => setTimeout(resolve, 600)); // Giả lập độ trễ mạng
      } else {
        await fetch(SHEET_URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(payload)
        });
      }

      // 4. CHUYỂN HƯỚNG SANG TRANG THANKYOU.HTML VỚI ĐẦY ĐỦ THÔNG TIN
      const redirectUrl = new URL('thankyou.html', window.location.href);
      redirectUrl.searchParams.set('name', nameVal);
      redirectUrl.searchParams.set('status', statusVal);
      if (companyVal) redirectUrl.searchParams.set('company', companyVal);
      if (wishesVal) redirectUrl.searchParams.set('wishes', wishesVal);

      // Chuyển trang mượt mà
      window.location.href = redirectUrl.toString();

    } catch (error) {
      console.error('Lỗi khi gửi xác nhận:', error);
      if (generalErrorText) {
        generalErrorText.textContent = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại!';
      }
      if (generalError) generalError.classList.add('visible');
      submitBtn.disabled = false;
      submitBtn.classList.remove('loading');
    }
  });
}
