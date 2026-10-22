// Contact form (About page). Prepared but off: it renders only when SITE.contact.enabled is true
// AND SITE.contact.endpoint is set. The form posts to that endpoint (a server-side script or a
// form service), which holds the recipient address; no address is ever in the page.

import { esc } from "./ui.js";

export const contactIsOn = (cfg) => Boolean(cfg?.enabled && cfg?.endpoint);

const LIMITS = { name: 100, email: 200, message: 2000 };

export function contactForm(cfg, copy) {
  if (!contactIsOn(cfg)) return "";
  return `
    <form class="contact-form" id="contact-form" action="${esc(cfg.endpoint)}" method="post" novalidate>
      <p class="prose">${esc(copy.intro)}</p>
      <div class="field">
        <label for="cf-name">Name <span class="field__opt">(optional)</span></label>
        <input id="cf-name" name="name" type="text" autocomplete="name" maxlength="${LIMITS.name}">
      </div>
      <div class="field">
        <label for="cf-email">Your email</label>
        <input id="cf-email" name="email" type="email" autocomplete="email" required maxlength="${LIMITS.email}" aria-describedby="cf-email-err">
        <p class="field__err" id="cf-email-err" hidden>Please enter a valid email address.</p>
      </div>
      <div class="field">
        <label for="cf-message">Message</label>
        <textarea id="cf-message" name="message" rows="5" required maxlength="${LIMITS.message}" aria-describedby="cf-message-err"></textarea>
        <p class="field__err" id="cf-message-err" hidden>Please write a message.</p>
      </div>
      <!-- Spam trap: hidden from people, left empty by them; most bots fill it in. -->
      <div class="field field--trap" aria-hidden="true">
        <label for="cf-website">Website</label>
        <input id="cf-website" name="website" type="text" tabindex="-1" autocomplete="off">
      </div>
      <button class="btn btn--primary" type="submit">Send message</button>
      <p class="contact-form__status" role="status" aria-live="polite"></p>
    </form>`;
}

export function mountContactForm(root, cfg) {
  const form = root.querySelector("#contact-form");
  if (!form || !contactIsOn(cfg)) return;
  const status = form.querySelector(".contact-form__status");
  const show = (id, bad) => { form.querySelector(`#${id}-err`).hidden = !bad; form.querySelector(`#${id}`).setAttribute("aria-invalid", String(bad)); };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = form.elements.email, message = form.elements.message;
    const badEmail = !email.value.trim() || !email.checkValidity();
    const badMessage = !message.value.trim();
    show("cf-email", badEmail);
    show("cf-message", badMessage);
    if (badEmail || badMessage) { (badEmail ? email : message).focus(); return; }
    if (form.elements.website.value) return; // spam trap filled: drop silently

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    status.textContent = "Sending…";
    try {
      const res = await fetch(cfg.endpoint, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
      if (!res.ok) throw new Error(String(res.status));
      form.reset();
      status.textContent = "Thanks, your message was sent.";
    } catch {
      status.textContent = "Sorry, your message could not be sent. Please try again later.";
    } finally {
      button.disabled = false;
    }
  });
}
