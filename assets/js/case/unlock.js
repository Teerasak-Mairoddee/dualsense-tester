// Lock screen for case.html. The content is encrypted; unlocking derives a key
// from the password with PBKDF2 and decrypts it. Nothing about the password
// is stored.

import { SEALED } from "./sealed.js";

const $ = (id) => document.getElementById(id);
const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function unlock(password) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt: unb64(SEALED.salt), iterations: SEALED.iterations },
    base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(SEALED.iv) }, key, unb64(SEALED.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

$("lockForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const msg = $("lockMsg"), btn = $("unlockBtn");
  btn.disabled = true;
  msg.textContent = "Checking…";
  try {
    const { html, js } = await unlock($("pw").value);
    $("lock").remove();
    $("app").innerHTML = html;
    const s = document.createElement("script");
    s.textContent = "(() => {\n" + js + "\n})();";
    document.body.appendChild(s);
  } catch {
    msg.innerHTML = '<span class="warnbox">Wrong password.</span>';
    btn.disabled = false;
  }
});

if (!window.crypto || !crypto.subtle) {
  $("lockMsg").innerHTML = '<span class="warnbox">This page needs to be opened over https.</span>';
}
