document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const w = params.get("w");

  const resultDesc = document.getElementById("result-desc");
  const timeList = document.getElementById("time-list");

  // 모달 요소들
  const modal = document.getElementById("sleep-modal");
  const modalTimeSpan = document.getElementById("modal-time");
  const modalYes = document.getElementById("modal-yes");
  const modalNo = document.getElementById("modal-no");

  let selectedMinutesOfDay = null;
  let sleepTimeoutId = null;

  if (!w) {
    resultDesc.textContent =
      "기상 시간이 전달되지 않았어요. 처음 화면에서 다시 입력해주세요.";
    return;
  }

  const wakeMinutes = Number(w);
  if (!Number.isFinite(wakeMinutes)) {
    resultDesc.textContent =
      "기상 시간 정보가 올바르지 않습니다. 처음 화면에서 다시 시도해주세요.";
    return;
  }

  const bedTimes = calculateBedTimes(wakeMinutes);
  const wakeStr = formatTime(wakeMinutes);

  resultDesc.textContent = `내일 ${wakeStr}에 일어나고 싶다면, 아래 시간대에 잠드는 것을 추천드려요. (수면 주기 기준)`;

  timeList.innerHTML = "";

  bedTimes.forEach((entry, idx) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.className = "time-pill";

    const timeSpan = document.createElement("span");
    timeSpan.className = "time-pill__time";
    const timeLabel = formatTime(entry.minutes);
    timeSpan.textContent = timeLabel;

    const badge = document.createElement("span");
    badge.className = "time-pill__badge";
    badge.textContent = `${entry.cycles}회 수면주기`;

    const icon = document.createElement("span");
    icon.className = "time-pill__icon";
    icon.textContent = idx === 2 || idx === 3 ? "★" : "☆";

    pill.appendChild(timeSpan);
    pill.appendChild(badge);
    pill.appendChild(icon);

    // 🔹 클릭하면 모달 열기
    pill.addEventListener("click", () => {
      selectedMinutesOfDay = entry.minutes;
      modalTimeSpan.textContent = timeLabel;
      openModal();
    });

    timeList.appendChild(pill);
  });

  // ===== 수면 주기 계산 (2~8회 → 7개 추천) =====
  function calculateBedTimes(wakeMinutes) {
    const cycle = 90;
    const fallAsleep = 14;
    const results = [];

    for (let cycles = 2; cycles <= 8; cycles++) {
      let bedtime = wakeMinutes - fallAsleep - cycles * cycle;
      while (bedtime < 0) {
        bedtime += 24 * 60;
      }
      results.push({ minutes: bedtime, cycles });
    }

    results.sort((a, b) => a.minutes - b.minutes);
    return results;
  }

  function formatTime(minutes) {
    const day = 24 * 60;
    minutes = ((minutes % day) + day) % day;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const hh = String(h).padStart(2, "0");
    const mm = String(m).padStart(2, "0");
    return `${hh}:${mm}`;
  }

  // ===== 모달 제어 =====
  function openModal() {
    modal.classList.add("modal--open");
  }

  function closeModal() {
    modal.classList.remove("modal--open");
  }

  modalNo.addEventListener("click", () => {
    // 취소 → 그냥 모달만 닫기
    closeModal();
  });

  modalYes.addEventListener("click", () => {
    // 예 → 타이머 예약
    closeModal();

    if (selectedMinutesOfDay == null) return;

    // 기존 타이머 있으면 제거
    if (sleepTimeoutId != null) {
      clearTimeout(sleepTimeoutId);
    }

    const delay = calcDelayMs(selectedMinutesOfDay);

    const targetLabel = formatTime(selectedMinutesOfDay);
    showToast(`"${targetLabel}"에 맞춰 알림을 예약했어요. (브라우저를 열어두셔야 해요)`);

    sleepTimeoutId = setTimeout(() => {
      alert(`지금은 주무실 시간입니다! (${targetLabel})`);
    }, delay);
  });

  // 지금 시간 기준으로, 해당 시각까지 얼마나 남았는지(ms) 계산
  function calcDelayMs(targetMinutesOfDay) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    let diffMinutes = targetMinutesOfDay - nowMinutes;
    if (diffMinutes <= 0) {
      // 이미 지난 시간이면 내일 같은 시간으로
      diffMinutes += 24 * 60;
    }
    return diffMinutes * 60 * 1000;
  }

  // ===== 토스트(아래쪽 작은 알림) =====
  function showToast(message) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);

      Object.assign(toast.style, {
        position: "fixed",
        left: "50%",
        bottom: "26px",
        transform: "translateX(-50%)",
        background: "rgba(10, 14, 42, 0.95)",
        color: "#f7f7ff",
        padding: "8px 14px",
        borderRadius: "999px",
        fontSize: "0.8rem",
        border: "1px solid rgba(130, 155, 255, 0.6)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.45)",
        opacity: "0",
        pointerEvents: "none",
        transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
        zIndex: "9999",
        whiteSpace: "nowrap"
      });
    }

    toast.textContent = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateX(-50%) translateY(-4px)";

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(-50%) translateY(0)";
    }, 2000);
  }
});
