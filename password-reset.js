import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const SUPABASE_URL = "https://wqrjdyfiokrvfgosseky.supabase.co";
const SUPABASE_KEY = "sb_publishable_77F7Fv7KzbgWv3AAm-vm9w_4B3BCSbs";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

const style = document.createElement("style");
style.textContent = "#ssuk-reset-trigger{display:block;border:0;background:transparent;color:#527568;padding:8px 0;font-size:12px;text-decoration:underline;cursor:pointer}#ssuk-reset-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px;background:rgba(26,39,34,.5)}#ssuk-reset-modal[hidden]{display:none}#ssuk-reset-panel{position:relative;width:min(440px,100%);padding:30px;border:1px solid #d8dfd7;border-radius:14px;background:#fffdf8;color:#24352e;box-shadow:0 24px 80px rgba(28,51,43,.22);font-family:Pretendard,'Noto Sans KR',Arial,sans-serif}#ssuk-reset-panel h2{margin:0 0 8px;color:#21483f;font-size:23px}#ssuk-reset-panel p{margin:0 0 18px;color:#718078;font-size:13px;line-height:1.6}#ssuk-reset-panel label{display:block;margin:14px 0 6px;color:#40574d;font-size:13px;font-weight:700}#ssuk-reset-panel input{width:100%;min-height:44px;padding:9px 12px;border:1px solid #cfd8d1;border-radius:8px;background:#fff;color:#24352e;font-size:14px}#ssuk-reset-panel button{min-height:42px;padding:0 14px;border:1px solid #b8c6be;border-radius:8px;background:#fff;color:#29483f;font-weight:700;cursor:pointer}#ssuk-reset-panel .ssuk-reset-primary{border-color:#28594f;background:#28594f;color:#fff}#ssuk-reset-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}#ssuk-reset-message{margin-top:14px;padding:10px 12px;border-radius:8px;background:#eaf2ed;color:#28594f;font-size:12px;line-height:1.5}#ssuk-reset-message.error{background:#fff0ee;color:#9c3026}";
document.head.appendChild(style);

let modal;
function createModal() {
  if (modal) return modal;
  modal = document.createElement("div");
  modal.id = "ssuk-reset-modal";
  modal.hidden = true;
  modal.innerHTML = '<div id="ssuk-reset-panel" role="dialog" aria-modal="true" aria-labelledby="ssuk-reset-title"><button type="button" data-reset-close aria-label="닫기" style="position:absolute;right:12px;top:10px;border:0;background:transparent;font-size:24px;color:#607068">×</button><h2 id="ssuk-reset-title">비밀번호 재설정</h2><p data-reset-copy>가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.</p><form data-reset-form><label for="ssuk-reset-email">이메일</label><input id="ssuk-reset-email" type="email" autocomplete="email" required><div id="ssuk-reset-actions"><button type="submit" class="ssuk-reset-primary">재설정 메일 보내기</button></div></form><div id="ssuk-reset-message" hidden></div></div>';
  document.body.appendChild(modal);
  modal.querySelector("[data-reset-close]").addEventListener("click", closeModal);
  modal.addEventListener("click", function (event) { if (event.target === modal) closeModal(); });
  modal.querySelector("[data-reset-form]").addEventListener("submit", sendResetEmail);
  return modal;
}
function closeModal() { if (modal) modal.hidden = true; }
function showMessage(text, error) { const box = modal.querySelector("#ssuk-reset-message"); box.textContent = text; box.hidden = false; box.classList.toggle("error", Boolean(error)); }
function openEmailModal(email) {
  const view = createModal();
  view.querySelector("[data-reset-copy]").textContent = "가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.";
  view.querySelector("[data-reset-form]").innerHTML = '<label for="ssuk-reset-email">이메일</label><input id="ssuk-reset-email" type="email" autocomplete="email" required><div id="ssuk-reset-actions"><button type="submit" class="ssuk-reset-primary">재설정 메일 보내기</button></div>';
  view.querySelector("#ssuk-reset-email").value = email || "";
  view.querySelector("#ssuk-reset-message").hidden = true;
  view.querySelector("[data-reset-form]").addEventListener("submit", sendResetEmail);
  view.hidden = false;
  view.querySelector("#ssuk-reset-email").focus();
}
async function sendResetEmail(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.querySelector("#ssuk-reset-email").value.trim();
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
    if (error) throw error;
    showMessage("재설정 메일을 보냈습니다. 메일의 링크를 눌러 새 비밀번호를 입력하세요.", false);
  } catch (error) {
    showMessage(error.message || "재설정 메일을 보내지 못했습니다.", true);
  } finally { button.disabled = false; }
}
function openUpdateModal() {
  const view = createModal();
  view.querySelector("[data-reset-copy]").textContent = "새 비밀번호를 입력하면 계정에 저장됩니다.";
  view.querySelector("[data-reset-form]").innerHTML = '<label for="ssuk-new-password">새 비밀번호</label><input id="ssuk-new-password" type="password" minlength="6" autocomplete="new-password" required><label for="ssuk-new-password-confirm">새 비밀번호 확인</label><input id="ssuk-new-password-confirm" type="password" minlength="6" autocomplete="new-password" required><div id="ssuk-reset-actions"><button type="submit" class="ssuk-reset-primary">새 비밀번호 저장</button></div>';
  view.querySelector("#ssuk-reset-message").hidden = true;
  view.querySelector("[data-reset-form]").addEventListener("submit", updatePassword);
  view.hidden = false;
  view.querySelector("#ssuk-new-password").focus();
}
async function updatePassword(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const password = form.querySelector("#ssuk-new-password").value;
  const confirmation = form.querySelector("#ssuk-new-password-confirm").value;
  const button = form.querySelector("button[type=submit]");
  if (password !== confirmation) { showMessage("두 비밀번호가 일치하지 않습니다.", true); return; }
  button.disabled = true;
  try {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    showMessage("비밀번호가 저장되었습니다. 이제 새 비밀번호로 로그인하세요.", false);
    setTimeout(closeModal, 1800);
  } catch (error) {
    showMessage(error.message || "비밀번호를 저장하지 못했습니다.", true);
  } finally { button.disabled = false; }
}
function addTrigger() {
  if (document.getElementById("ssuk-reset-trigger")) return true;
  const password = document.getElementById("teacher-password");
  if (!password) return false;
  const trigger = document.createElement("button");
  trigger.id = "ssuk-reset-trigger";
  trigger.type = "button";
  trigger.textContent = "비밀번호 재설정";
  trigger.addEventListener("click", function () { openEmailModal(document.getElementById("teacher-email")?.value || ""); });
  password.insertAdjacentElement("afterend", trigger);
  return true;
}
const observer = new MutationObserver(addTrigger);
observer.observe(document.body, { childList: true, subtree: true });
addTrigger();
supabase.auth.onAuthStateChange(function (event) { if (event === "PASSWORD_RECOVERY") openUpdateModal(); });
if (window.location.hash.includes("type=recovery")) setTimeout(openUpdateModal, 500);