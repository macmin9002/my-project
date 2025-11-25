document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(location.search);
  const w = params.get("w");

  // w(분 단위 기상 시간)가 없으면 index로 돌려보냄
  if (!w) {
    setTimeout(() => {
      location.href = "index.html";
    }, 1500);
    return;
  }

  // 약 3.5초 정도 로딩 페이지 보여주고 결과 페이지로 이동
  const delayMs = 3500;

  setTimeout(() => {
    location.href = `result.html?w=${encodeURIComponent(w)}`;
  }, delayMs);
});
