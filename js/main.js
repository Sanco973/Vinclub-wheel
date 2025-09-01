(() => {
  const $ = document.querySelector.bind(document);

  let timeRotate = 5000; // Thời gian quay
  let currentRotate = 0;
  let isRotating = false;
  let spinHistory = [];
  const wheel = $(".wheel");
  const btnWheel = $(".btn--wheel");
  var ArrPhanQua = [];
  var ArrPhanQuaMacDinh = [];
  var audio = document.getElementById("myAudio");
  var audioChucMung = document.getElementById("ChucMungAudio");
  var audioBuon = document.getElementById("BuonAudio");
  //var inputText = prompt("Nhập lệnh:");
  const pointer = document.querySelector("span");

  // =====< Danh sách phần thưởng >=====
  listGift.forEach((item, index) => {
    for (let i = 0; i < item.soluong; i++) {
      ArrPhanQuaMacDinh.push({ ...item, index });
    }
    shuffleArray(ArrPhanQuaMacDinh);
  });

  function resetdata() {
    ArrPhanQua = [...ArrPhanQuaMacDinh]; // Sao chép từ ArrPhanQuaMacDinh
    localStorage.setItem("ArrPhanQua", JSON.stringify(ArrPhanQua));
    spinHistory = [];
    localStorage.setItem("spinHistory", JSON.stringify(spinHistory));
    ArrPhanQua = JSON.parse(localStorage.getItem("ArrPhanQua"));
  }
  function checkstorage() {
    var storage = JSON.parse(localStorage.getItem("ArrPhanQua"));
    spinHistory = JSON.parse(localStorage.getItem("spinHistory"));
    if (storage === null) {
      resetdata;
    } else {
      ArrPhanQua = storage;
    }
  }
  checkstorage();

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  const size = 14; // Tổng số phần quà
  const rotate = 360 / size; // Góc cho mỗi phần quà
  const skewY = 90 - rotate; // Góc nghiêng cần thiết để tạo hiệu ứng chia đều

  // Chia phần quà trên vòng quay
  listGift.map((item, index) => {
    const elm = document.createElement("li");
    elm.style.transform = `rotate(${rotate * index}deg) skewY(-${skewY}deg)`; // Xoay và nghiêng
    elm.innerHTML = `
        <p style="transform: skewY(${skewY}deg) rotate(${
      rotate / 2
    }deg);" class="text">
            <b>${item.text}</b>
        </p>`;
    wheel.appendChild(elm); // Thêm phần quà vào vòng quay
  });

  const start = () => {
    const popup = document.getElementById("popupSmall");
    const gift = getGift();
    if (!gift) return;
    currentRotate += 360 * 4; // Tăng số vòng quay
    // Kiểm tra nếu popup đang mở
    if (popup.style.display === "flex") {
      return;
    }
    pointer.classList.add("bouncing");
    btnWheel.classList.add("no-animation");

    audio.currentTime = 0; // Đặt lại âm thanh về 0
    audio.play();
    isRotating = true;

    rotateWheel(currentRotate, gift.index);
    showGift(gift);
  };

  const rotateWheel = (currentRotate, index) => {
    const rotationDegree = currentRotate - index * rotate - rotate / 2;

    // Xoay vòng quay
    wheel.style.transform = `rotate(${rotationDegree}deg)`;

    // Xoay hình ảnh
    const image = document.getElementById("myImage");
    image.style.transform = `rotate(${rotationDegree}deg)`;
  };

  const getGift = () => {
    ArrPhanQua = JSON.parse(localStorage.getItem("ArrPhanQua"));
    shuffleArray(ArrPhanQua);
    const index = Math.floor(Math.random() * ArrPhanQua.length);
    const result = ArrPhanQua[index];
    ArrPhanQua.splice(index, 1);
    return result;
  };

  const showGift = (gift) => {
    setTimeout(() => {
      isRotating = false;

      const popup = document.getElementById("popupSmall");
      const message = document.getElementById("popupGiftMessage");
      const giftImageContainer = document.getElementById("giftimg");

      if (gift.text === "Chúc bạn may mắn") {
        audioBuon.play();
        message.innerHTML = "Chúc bạn may mắn lần sau!";
      } else {
        updateLocalStorageAfterSpin(gift);
        audioChucMung.play();
        message.innerHTML = `<p>Chúc mừng bạn đã nhận được:</p><b>${gift.text}</b>`;
        giftImageContainer.style.backgroundImage = `url(${gift.image})`;
      }
      setTimeout(() => {
        popup.style.display = "flex";
      }, 500);

      // Gọi hàm cập nhật localStorage
    }, timeRotate);
  };

  btnWheel.addEventListener("click", () => {
    if (!isRotating) start();
  });

  window.closeSmallPopup = () => {
    const popup = document.getElementById("popupSmall");
    popup.style.display = "none";
    pointer.classList.remove("bouncing");
    btnWheel.classList.remove("no-animation");
  };

  const updateLocalStorageAfterSpin = (gift) => {
    // Cập nhật danh sách quà còn lại
    localStorage.setItem("ArrPhanQua", JSON.stringify(ArrPhanQua));

    // Lưu lịch sử quay
    const spinHistory = JSON.parse(localStorage.getItem("spinHistory")) || [];
    spinHistory.push({ time: new Date().toLocaleString(), gift: gift.text });
    localStorage.setItem("spinHistory", JSON.stringify(spinHistory));
  };

  document.addEventListener("keydown", (event) => {
    if (event.key === "r" || event.key === "R") {
      const confirmReset = confirm(
        "Bạn có chắc chắn muốn reset dữ liệu về mặc định không?"
      );
      if (confirmReset) {
        resetdata();
        location.reload();
      }
    }
  });

  const waitingScreen = document.getElementById("waitingScreen");

  let idleTimeout;

  const showWaitingScreen = () => {
    const video = document.getElementById("promoVideo");
    video.muted = false;
    video.currentTime = 0;
    video.play();
    waitingScreen.classList.add("active");
  };

  const hideWaitingScreen = () => {
    const video = document.getElementById("promoVideo");
    video.muted = true;
    video.pause();
    waitingScreen.classList.remove("active");
  };

  const resetIdleTimer = () => {
    hideWaitingScreen();
    clearTimeout(idleTimeout);
    idleTimeout = setTimeout(showWaitingScreen, 60000); // 60 giây không hoạt động
  };

  // Đặt sự kiện để reset bộ đếm thời gian khi có tương tác
  document.addEventListener("mousemove", resetIdleTimer);
  document.addEventListener("keypress", resetIdleTimer);

  // Khởi động lại bộ đếm khi tải trang
  resetIdleTimer();

  const video = document.getElementById("promoVideo");
  const overlay = document.getElementById("overlay");

  const enableAudioAndFullscreen = () => {
    // 1. Bật âm thanh video
    if (video) {
      video.muted = false;
      video.play().catch((err) => console.warn("Không phát được video:", err));
    }

    // 2. Mở fullscreen cho toàn trang
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }

    // 3. Ẩn overlay
    if (overlay) {
      overlay.classList.remove("active");
      overlay.style.display = "none";
    }

    // 4. Gỡ sự kiện click (chỉ dùng 1 lần)
    document.removeEventListener("click", enableAudioAndFullscreen);
  };

  // 5. Gắn lại sự kiện nếu người dùng thoát fullscreen
  document.addEventListener("fullscreenchange", () => {
    const isFullScreen = !!document.fullscreenElement;
    if (!isFullScreen) {
      // Hiện overlay + gắn lại sự kiện click
      overlay.classList.add("active");
      overlay.style.display = "flex";
      document.addEventListener("click", enableAudioAndFullscreen);
    }
  });

  // Nếu ban đầu đang mute hoặc cần fullscreen → hiển thị overlay
  if (video?.muted) {
    overlay.classList.add("active");
    overlay.style.display = "flex";
    document.addEventListener("click", enableAudioAndFullscreen);
  }
})();
