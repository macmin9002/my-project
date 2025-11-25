document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("wake-form");
  const wakeInput = document.getElementById("wake-time");
  const errorMessage = document.getElementById("error-message");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const rawValue = wakeInput.value.trim();

    const wakeMinutes = parseTimeToMinutes(rawValue);
    if (wakeMinutes == null) {
      showError("시간 형식을 다시 확인해주세요. 예: 6시 30분 / 06:30 / 630");
      wakeInput.classList.add("field__input--error");
      wakeInput.focus();
      return;
    }

    wakeInput.classList.remove("field__input--error");
    clearError();

    // 입력 성공 시 로딩 페이지로 이동 (분 단위 기상 시간 전달)
    const url = `loading.html?w=${wakeMinutes}`;
    location.href = url;
  });

  function showError(msg) {
    errorMessage.textContent = msg;
  }

  function clearError() {
    errorMessage.textContent = "";
  }

  // "6시30분", "6:30", "06:30", "630" 등 지원
  function parseTimeToMinutes(input) {
    if (!input) return null;

    let str = input
      .replace(/\s+/g, "")
      .replace("시", ":")
      .replace("분", "");

    // 숫자만 있는 경우 3자리/4자리 처리
    if (!str.includes(":") && /^\d{3,4}$/.test(str)) {
      if (str.length === 3) {
        str = str[0] + ":" + str.slice(1);
      } else {
        str = str.slice(0, 2) + ":" + str.slice(2);
      }
    }

    const parts = str.split(":");
    if (parts.length !== 2) return null;

    const h = Number(parts[0]);
    const m = Number(parts[1]);

    if (!Number.isInteger(h) || !Number.isInteger(m)) return null;
    if (h < 0 || h > 23) return null;
    if (m < 0 || m > 59) return null;

    return h * 60 + m;
  }
});
