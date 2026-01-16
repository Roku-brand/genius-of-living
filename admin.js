const ADMIN_CONFIG = {
  // 注意: 合言葉はハッシュで保持し、平文比較をしない。
  // 下記ハッシュは "g0l-admin" の SHA-256 です。必要に応じて差し替えてください。
  passphraseHash:
    "cbc356bc7161057ec5b710c2a604d725270f59947feb48eec8e33edba650553d",
  sessionKey: "admin-session-active",
  sessionTimestampKey: "admin-session-start",
  attemptsKey: "admin-login-attempts",
  lockUntilKey: "admin-login-lock-until",
  maxAttempts: 5,
  lockMinutes: 10,
  sessionMinutes: 30,
  memoKey: "admin-memo",
  visibilityKey: "admin-visibility",
};

const loginPanel = document.getElementById("login-panel");
const adminPanel = document.getElementById("admin-panel");
const loginForm = document.getElementById("login-form");
const passphraseInput = document.getElementById("passphrase");
const errorMessage = document.getElementById("error-message");
const lockMessage = document.getElementById("lock-message");
const logoutButton = document.getElementById("logout-button");
const visibilityToggle = document.getElementById("visibility-toggle");
const visibilityLabel = document.getElementById("visibility-label");
const adminMemo = document.getElementById("admin-memo");
const memoStatus = document.getElementById("memo-status");
const editButton = document.getElementById("edit-button");
const editStatus = document.getElementById("edit-status");

let logoutTimerId = null;

const toHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const hashText = async (text) => {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(hashBuffer);
};

const getSessionStart = () => {
  const stored = sessionStorage.getItem(ADMIN_CONFIG.sessionTimestampKey);
  return stored ? Number(stored) : null;
};

const isSessionValid = () => {
  const isActive = sessionStorage.getItem(ADMIN_CONFIG.sessionKey) === "true";
  const startTime = getSessionStart();
  if (!isActive || !startTime) {
    return false;
  }
  const elapsedMinutes = (Date.now() - startTime) / (1000 * 60);
  return elapsedMinutes < ADMIN_CONFIG.sessionMinutes;
};

const scheduleAutoLogout = () => {
  if (logoutTimerId) {
    clearTimeout(logoutTimerId);
  }
  const startTime = getSessionStart();
  if (!startTime) {
    return;
  }
  const remainingMs =
    ADMIN_CONFIG.sessionMinutes * 60 * 1000 - (Date.now() - startTime);
  logoutTimerId = window.setTimeout(() => {
    handleLogout("一定時間が経過したためログアウトしました。");
  }, Math.max(remainingMs, 0));
};

const setLoginState = (active) => {
  if (active) {
    sessionStorage.setItem(ADMIN_CONFIG.sessionKey, "true");
    sessionStorage.setItem(
      ADMIN_CONFIG.sessionTimestampKey,
      Date.now().toString()
    );
  } else {
    sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);
    sessionStorage.removeItem(ADMIN_CONFIG.sessionTimestampKey);
  }
};

const updatePanelVisibility = () => {
  const loggedIn = isSessionValid();
  loginPanel.hidden = loggedIn;
  adminPanel.hidden = !loggedIn;
  if (loggedIn) {
    scheduleAutoLogout();
  }
};

const resetAttempts = () => {
  sessionStorage.removeItem(ADMIN_CONFIG.attemptsKey);
};

const getAttempts = () =>
  Number(sessionStorage.getItem(ADMIN_CONFIG.attemptsKey) || 0);

const setAttempts = (count) => {
  sessionStorage.setItem(ADMIN_CONFIG.attemptsKey, count.toString());
};

const lockLogin = () => {
  const lockUntil =
    Date.now() + ADMIN_CONFIG.lockMinutes * 60 * 1000;
  sessionStorage.setItem(
    ADMIN_CONFIG.lockUntilKey,
    lockUntil.toString()
  );
};

const getLockRemaining = () => {
  const lockUntil = Number(
    sessionStorage.getItem(ADMIN_CONFIG.lockUntilKey) || 0
  );
  if (!lockUntil) {
    return 0;
  }
  const remainingMs = lockUntil - Date.now();
  return remainingMs > 0 ? remainingMs : 0;
};

const clearLock = () => {
  sessionStorage.removeItem(ADMIN_CONFIG.lockUntilKey);
};

const renderLockMessage = () => {
  const remainingMs = getLockRemaining();
  if (remainingMs > 0) {
    const minutes = Math.ceil(remainingMs / (1000 * 60));
    lockMessage.hidden = false;
    lockMessage.textContent = `失敗回数が上限を超えたため、${minutes}分間ロック中です。`;
    loginForm.querySelector("button").disabled = true;
  } else {
    lockMessage.hidden = true;
    lockMessage.textContent = "";
    loginForm.querySelector("button").disabled = false;
  }
};

const handleLogout = (message) => {
  setLoginState(false);
  updatePanelVisibility();
  errorMessage.textContent = message || "";
};

const handleLogin = async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";

  if (getLockRemaining() > 0) {
    renderLockMessage();
    return;
  }

  const passphrase = passphraseInput.value.trim();
  const hashed = await hashText(passphrase);

  if (hashed === ADMIN_CONFIG.passphraseHash) {
    setLoginState(true);
    resetAttempts();
    clearLock();
    passphraseInput.value = "";
    updatePanelVisibility();
  } else {
    const attempts = getAttempts() + 1;
    setAttempts(attempts);
    if (attempts >= ADMIN_CONFIG.maxAttempts) {
      lockLogin();
      renderLockMessage();
      errorMessage.textContent = "一定回数以上の失敗があったためロックしました。";
    } else {
      const remaining = ADMIN_CONFIG.maxAttempts - attempts;
      errorMessage.textContent = `合言葉が違います。残り${remaining}回試行できます。`;
    }
  }
};

const loadDashboardState = () => {
  const visibility = localStorage.getItem(ADMIN_CONFIG.visibilityKey);
  const isPublic = visibility ? visibility === "public" : true;
  visibilityToggle.checked = isPublic;
  visibilityLabel.textContent = isPublic ? "公開" : "非公開";

  const memo = localStorage.getItem(ADMIN_CONFIG.memoKey) || "";
  adminMemo.value = memo;
  memoStatus.textContent = memo ? "保存済み" : "未保存";
};

const handleVisibilityChange = () => {
  const isPublic = visibilityToggle.checked;
  localStorage.setItem(
    ADMIN_CONFIG.visibilityKey,
    isPublic ? "public" : "private"
  );
  visibilityLabel.textContent = isPublic ? "公開" : "非公開";
};

const handleMemoInput = () => {
  localStorage.setItem(ADMIN_CONFIG.memoKey, adminMemo.value);
  memoStatus.textContent = "保存済み";
};

const handleEditClick = () => {
  editStatus.textContent = "編集ボタンがクリックされました（ダミー）。";
};

loginForm.addEventListener("submit", handleLogin);
logoutButton.addEventListener("click", () => handleLogout("ログアウトしました。"));
visibilityToggle.addEventListener("change", handleVisibilityChange);
adminMemo.addEventListener("input", handleMemoInput);
editButton.addEventListener("click", handleEditClick);

renderLockMessage();
if (isSessionValid()) {
  updatePanelVisibility();
} else {
  setLoginState(false);
  updatePanelVisibility();
}

loadDashboardState();
window.setInterval(renderLockMessage, 30 * 1000);
window.setInterval(() => {
  if (!isSessionValid() && !adminPanel.hidden) {
    handleLogout("一定時間が経過したためログアウトしました。");
  }
}, 60 * 1000);
