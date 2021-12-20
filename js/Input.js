// SafariっぽいUAのとき、compositionend イベントの直後かどうか判定できるようにする
const isSafari = navigator.userAgent.includes("Safari/") && navigator.userAgent.includes("Version/");
let isCompositionFinished = true;
input.addEventListener("keydown", (e) => {
    //safariだったらisCompositionFinishedがtrueの時の
    if (isSafari && isCompositionFinished) {
        isCompositionFinished = false;
        return;
    }
    if (e.key !== "Enter" || e.isComposing) {
        return;
    }
});

input.addEventListener("compositionstart", () => {
    isCompositionFinished = false;
});

input.addEventListener("compositionend", () => {
    isCompositionFinished = true;
});

