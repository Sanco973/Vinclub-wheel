document.addEventListener("DOMContentLoaded", () => {
  renderGiftList();
  renderSpinHistory();
});
var ArrPhanQuaMacDinh = [];
listGift.forEach((item, index) => {
  for (let i = 0; i < item.soluong; i++) {
    ArrPhanQuaMacDinh.push({ ...item, index });
  }
});
// Hàm hiển thị số lượng quà còn lại với nút chỉnh sửa
const renderGiftList = () => {
  const giftListElement = document.getElementById("giftList");
  const giftData = JSON.parse(localStorage.getItem("ArrPhanQua")) || [];

  // Nhóm quà theo tên để đếm số lượng mỗi loại
  const groupedGifts = giftData.reduce((acc, item) => {
    acc[item.text] = (acc[item.text] || 0) + 1;
    return acc;
  }, {});

  // Tính tổng số quà
  const totalGifts = Object.values(groupedGifts).reduce(
    (sum, qty) => sum + qty,
    0
  );

  // Xóa nội dung cũ
  giftListElement.innerHTML = "";

  // Tạo Map để loại bỏ các quà trùng tên
  const uniqueGifts = new Map();
  listGift.forEach((gift) => {
    if (!uniqueGifts.has(gift.text)) {
      uniqueGifts.set(gift.text, gift);
    }
  });

  // Hiển thị từng quà không trùng tên
  uniqueGifts.forEach((gift) => {
    const quantity = groupedGifts[gift.text] || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>
        <img src="${gift.image}" alt="${gift.text}" style="width: 50px; height: auto;" />
      </td>
      <td>${gift.text}</td>
      <td>
        <input 
          type="number" 
          class="edit-input" 
          value="${quantity}" 
          min="0" 
          data-gift="${gift.text}" 
          disabled
        />
      </td>
      <td>
        <button class="edit-button" data-gift="${gift.text}">Sửa số lượng</button>
      </td>
    `;
    giftListElement.appendChild(row);
  });

  // Thêm dòng tổng số quà
  const totalRow = document.createElement("tr");
  totalRow.innerHTML = `
    <td colspan="2" style="font-weight: bold; text-align: right;">Tổng số quà:</td>
    <td colspan="2" style="font-weight: bold; text-align: center;">${totalGifts}</td>
  `;
  giftListElement.appendChild(totalRow);

  // Xử lý sự kiện cho nút "Sửa số lượng" và "Cập nhật"
  document.querySelectorAll(".edit-button").forEach((button) => {
    button.addEventListener("click", (e) => {
      const giftName = e.target.getAttribute("data-gift");
      const input = document.querySelector(`input[data-gift="${giftName}"]`);

      if (button.textContent === "Sửa số lượng") {
        button.textContent = "Cập nhật";
        input.disabled = false;
        input.focus();
      } else {
        const newQuantity = parseInt(input.value, 10);
        if (isNaN(newQuantity) || newQuantity < 0) {
          alert("Vui lòng nhập số hợp lệ!");
          return;
        }

        updateGiftQuantity(giftName, newQuantity);
        button.textContent = "Sửa số lượng";
        input.disabled = true;
      }
    });
  });
};

const updateGiftQuantity = (giftName, newQuantity) => {
  let giftData = JSON.parse(localStorage.getItem("ArrPhanQua")) || [];

  // Xoá toàn bộ quà đang có tên này
  giftData = giftData.filter((gift) => gift.text !== giftName);

  // Lấy các bản mẫu có cùng tên (trùng text nhưng khác index)
  const giftVariants = listGift
    .map((gift, index) => ({ ...gift, index }))
    .filter((gift) => gift.text === giftName);

  if (giftVariants.length === 0) {
    alert("Không tìm thấy quà mẫu trong listGift!");
    return;
  }

  // Chia đều newQuantity theo các bản index
  const perIndex = Math.floor(newQuantity / giftVariants.length);
  let extra = newQuantity % giftVariants.length;

  const updatedGifts = [];

  giftVariants.forEach((variant, idx) => {
    let count = perIndex + (extra > 0 ? 1 : 0);
    if (extra > 0) extra--;

    for (let i = 0; i < count; i++) {
      updatedGifts.push({ ...variant }); // giữ nguyên index + image riêng biệt
    }
  });

  // Lưu và cập nhật UI
  localStorage.setItem(
    "ArrPhanQua",
    JSON.stringify([...giftData, ...updatedGifts])
  );
  renderGiftList();
};

// Hàm hiển thị danh sách quà đã trúng thưởng
const renderSpinHistory = () => {
  const spinHistory = JSON.parse(localStorage.getItem("spinHistory")) || [];
  const spinHistoryTable = document.getElementById("spinHistory");
  const sortedHistory = spinHistory.reverse(); // Đảo ngược danh sách để hiển thị gần nhất trước

  spinHistoryTable.innerHTML = ""; // Xóa nội dung cũ

  sortedHistory.forEach((entry, index) => {
    const totalRows = sortedHistory.length; // Tổng số dòng
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${totalRows - index}</td> <!-- Hiển thị số thứ tự giảm dần -->
        <td>${entry.time}</td>
        <td>${entry.gift}</td>
      `;
    spinHistoryTable.appendChild(row);
  });
};

// Lắng nghe sự kiện thay đổi localStorage
window.addEventListener("storage", () => {
  renderGiftList();
  renderSpinHistory();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "r" || event.key === "R") {
    Reset();
  }
});
document.getElementById("clearHistoryBtn").addEventListener("click", () => {
  const confirmClear = confirm(
    "Bạn có chắc chắn muốn xóa toàn bộ lịch sử quay không?"
  );
  if (!confirmClear) return;

  // Xóa lịch sử quay
  localStorage.removeItem("spinHistory");

  // Gọi lại giao diện
  renderGiftList();
  renderSpinHistory();
});
let indexWindow = null;

function openIndex() {
  // Nếu cửa sổ chưa mở hoặc đã bị đóng
  if (!indexWindow || indexWindow.closed) {
    indexWindow = window.open(
      "js/index.html",
      "_blank",
      "width=1600,height=900"
    );
  } else {
    // Nếu đã mở → đưa nó ra trước
    indexWindow.focus();
  }
}

function closeIndex() {
  if (indexWindow && !indexWindow.closed) {
    const confirmClose = confirm("Bạn có chắc chắn muốn đóng trang Quay quà?");
    if (confirmClose) {
      indexWindow.close();
      indexWindow = null;
    }
  } else {
    alert("Trang Index hiện tại chưa mở hoặc đã được đóng.");
  }
}
function Reset() {
  const confirmReset = confirm(
    "Bạn có chắc chắn muốn reset dữ liệu về mặc định không?"
  );
  if (confirmReset) {
    localStorage.setItem("ArrPhanQua", JSON.stringify(ArrPhanQuaMacDinh));
  }
  renderGiftList();
  renderSpinHistory();
}
