/**
 * The shop pages for "Danmark på kortet": all levels, unlock (after paying),
 * terms. Plain server-rendered HTML in the same style as the games. Every text
 * is written in Danish and English; CSS shows the chosen language, and the
 * choice is shared with the games (localStorage "dk-map-games:lang").
 */
import { escapeHtml } from "@/lib/html";

import { BUNDLE_PRICE, LEVEL_PRICE, LEVELS, PAID_LEVELS, SERIES, formatPrice } from "./catalog";
import { formatCode } from "./code";

/** Danish and English versions of one piece of markup. */
export const t = (da: string, en: string) => `<span lang="da">${da}</span><span lang="en">${en}</span>`;

export function seller() {
  return {
    name: process.env.SELLER_NAME ?? "",
    cvr: process.env.SELLER_CVR ?? "",
    email: process.env.SELLER_EMAIL ?? "",
    address: process.env.SELLER_ADDRESS ?? "",
  };
}

const CSS = `
:root { --bg:#f3f0e8; --card:#fffdf8; --ink:#1a1d21; --muted:#5c6470; --line:#e2ddd0; --accent:#c8102e; --accent-ink:#fff; --ok:#1f7a4d; --soft:#f7f4ec; }
@media (prefers-color-scheme: dark) { :root { --bg:#14171b; --card:#1d2126; --ink:#eef0f2; --muted:#a3abb5; --line:#2e343b; --accent:#ff4d5e; --accent-ink:#14171b; --ok:#4cc38a; --soft:#22272d; } }
* { box-sizing:border-box; }
html[data-lang=da] [lang=en], html[data-lang=en] [lang=da] { display:none !important; }
body { margin:0; background:var(--bg); color:var(--ink); font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
main { max-width:860px; margin:0 auto; padding:28px 16px 48px; }
header.top { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:18px; }
.kicker { margin:0; font-size:12px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); }
h1 { margin:4px 0 6px; font-size:clamp(28px,5vw,40px); line-height:1.1; letter-spacing:-.01em; }
.lead { margin:0; color:var(--muted); max-width:56ch; }
.lang-switch { display:flex; border:1px solid var(--line); border-radius:999px; overflow:hidden; flex:none; }
.lang-switch button { border:0; background:transparent; color:var(--muted); padding:6px 10px; font:inherit; font-size:13px; font-weight:700; cursor:pointer; }
.lang-switch button[aria-pressed=true] { background:var(--ink); color:var(--bg); }
.notice { margin:0 0 16px; padding:12px 14px; border-radius:12px; background:var(--soft); border:1px solid var(--line); }
.notice.err { border-color:var(--accent); }
.levels { list-style:none; margin:0; padding:0; display:grid; gap:10px; }
.level { display:grid; grid-template-columns:44px 1fr auto; gap:12px; align-items:center; padding:12px 14px; background:var(--card); border:1px solid var(--line); border-radius:14px; }
.level.focus { outline:2px solid var(--accent); }
.num { width:44px; height:44px; border-radius:50%; display:grid; place-items:center; font-weight:800; background:var(--soft); }
.level h2 { margin:0; font-size:17px; }
.level p { margin:2px 0 0; color:var(--muted); font-size:14px; }
.btn { display:inline-flex; align-items:center; justify-content:center; gap:6px; min-height:42px; padding:8px 14px; border-radius:10px; border:1px solid var(--line); background:var(--card); color:var(--ink); font:inherit; font-weight:700; text-decoration:none; cursor:pointer; white-space:nowrap; }
.btn.primary { background:var(--accent); border-color:var(--accent); color:var(--accent-ink); }
.btn.owned { border-color:var(--ok); color:var(--ok); }
.btn[disabled] { opacity:.6; cursor:wait; }
.bundle { margin:18px 0; padding:18px; border-radius:16px; background:var(--card); border:2px solid var(--accent); display:flex; flex-wrap:wrap; gap:12px 18px; align-items:center; justify-content:space-between; }
.bundle h2 { margin:0; font-size:20px; }
.bundle p { margin:2px 0 0; color:var(--muted); }
.bundle s { color:var(--muted); }
.consent { display:flex; gap:10px; align-items:flex-start; margin:18px 0 6px; padding:12px 14px; border-radius:12px; background:var(--soft); font-size:14px; }
.consent input { margin-top:3px; width:18px; height:18px; flex:none; }
.panel { margin:22px 0 0; padding:16px; border-radius:14px; background:var(--card); border:1px solid var(--line); }
.panel h2 { margin:0 0 8px; font-size:18px; }
.row { display:flex; gap:8px; flex-wrap:wrap; }
.row input { flex:1 1 180px; min-height:42px; padding:8px 12px; border-radius:10px; border:1px solid var(--line); background:var(--bg); color:var(--ink); font:inherit; font-family:ui-monospace,monospace; letter-spacing:.08em; text-transform:uppercase; }
.msg { min-height:1.5em; margin:8px 0 0; font-size:14px; }
.msg.err { color:var(--accent); } .msg.ok { color:var(--ok); }
.code { display:inline-block; margin:6px 0; padding:10px 16px; border-radius:12px; background:var(--soft); border:1px dashed var(--muted); font:700 clamp(24px,6vw,34px)/1.2 ui-monospace,monospace; letter-spacing:.12em; }
.facts { margin:14px 0 0; padding-left:20px; color:var(--muted); font-size:14px; }
footer { margin-top:28px; font-size:13px; color:var(--muted); }
footer a, main a { color:inherit; }
@media (max-width:560px) { .level { grid-template-columns:36px 1fr; } .num { width:36px; height:36px; } .level .btn { grid-column:1 / -1; } }
`;

const LANG_HEAD = `<script>(function(){var l;try{l=localStorage.getItem("dk-map-games:lang")}catch(e){}if(l!=="da"&&l!=="en")l=/^da(-|$)/i.test(navigator.language||"")||!navigator.language?"da":"en";document.documentElement.dataset.lang=l})();</script>`;

const LANG_SWITCH = `<div class="lang-switch" role="group" aria-label="Sprog / Language"><button type="button" data-lang="da">DA</button><button type="button" data-lang="en">EN</button></div>`;

const LANG_JS = `
(function(){
  function set(l){document.documentElement.dataset.lang=l;try{localStorage.setItem("dk-map-games:lang",l)}catch(e){}
    document.querySelectorAll(".lang-switch button").forEach(function(b){b.setAttribute("aria-pressed",String(b.dataset.lang===l))});
    document.title=document.documentElement.dataset["title"+(l==="da"?"Da":"En")]||document.title;}
  document.querySelectorAll(".lang-switch button").forEach(function(b){b.addEventListener("click",function(){set(b.dataset.lang)})});
  set(document.documentElement.dataset.lang||"da");
})();`;

function page(opts: { titleDa: string; titleEn: string; body: string; script?: string; noindex?: boolean }): string {
  const s = seller();
  const sellerLine = s.name ? `${escapeHtml(s.name)}${s.cvr ? ` · CVR ${escapeHtml(s.cvr)}` : ""}${s.email ? ` · <a href="mailto:${escapeHtml(s.email)}">${escapeHtml(s.email)}</a>` : ""}` : "";
  return `<!DOCTYPE html>
<html lang="da" data-lang="da" data-title-da="${escapeHtml(opts.titleDa)}" data-title-en="${escapeHtml(opts.titleEn)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(opts.titleDa)}</title>
${opts.noindex ? '<meta name="robots" content="noindex">' : `<meta name="description" content="${escapeHtml(SERIES)}: find Danmarks byer og stationer på kortet. 8 niveauer fra let til svær. Niveau 1 er gratis.">`}
${LANG_HEAD}
<style>${CSS}</style>
</head>
<body>
<main>
${opts.body}
<footer>
  <p>${sellerLine ? `${sellerLine} · ` : ""}<a href="/games/terms">${t("Handelsbetingelser og privatliv", "Terms and privacy")}</a></p>
</footer>
</main>
<script>${LANG_JS}</script>
${opts.script ? `<script>${opts.script}</script>` : ""}
</body>
</html>`;
}

function topHeader(kickerDa: string, kickerEn: string, h1Da: string, h1En: string, leadDa: string, leadEn: string): string {
  return `<header class="top"><div>
  <p class="kicker">${t(kickerDa, kickerEn)}</p>
  <h1>${t(h1Da, h1En)}</h1>
  <p class="lead">${t(leadDa, leadEn)}</p>
</div>${LANG_SWITCH}</header>`;
}

export interface LevelsPageInput {
  owned: number[];
  focus: number | null;
  canBuy: boolean;
}

export function levelsPage({ owned, focus, canBuy }: LevelsPageInput): string {
  const ownsAll = PAID_LEVELS.every((n) => owned.includes(n));
  const lp = { da: formatPrice(LEVEL_PRICE, "da"), en: formatPrice(LEVEL_PRICE, "en") };
  const bp = { da: formatPrice(BUNDLE_PRICE, "da"), en: formatPrice(BUNDLE_PRICE, "en") };
  const full = { da: formatPrice(LEVEL_PRICE * PAID_LEVELS.length, "da"), en: formatPrice(LEVEL_PRICE * PAID_LEVELS.length, "en") };

  const items = LEVELS.map((l) => {
    let action: string;
    if (l.n === 1) action = `<a class="btn primary" href="/games/level/1">${t("Spil gratis", "Play free")}</a>`;
    else if (owned.includes(l.n)) action = `<a class="btn owned" href="/games/level/${l.n}">✓ ${t("Spil", "Play")}</a>`;
    else action = `<button type="button" class="btn" data-buy="${l.n}">${t(`Køb · ${lp.da}`, `Buy · ${lp.en}`)}</button>`;
    return `<li class="level${focus === l.n ? " focus" : ""}" id="level-${l.n}">
  <span class="num">${l.n}</span>
  <div><h2>${t(escapeHtml(l.name.da), escapeHtml(l.name.en))}</h2><p>${t(escapeHtml(l.holds.da), escapeHtml(l.holds.en))}</p></div>
  ${action}
</li>`;
  }).join("\n");

  const lockedNotice = focus && focus !== 1 && !owned.includes(focus)
    ? `<p class="notice">${t(`Niveau ${focus} er låst. Køb det herunder, eller lås op med din kode.`, `Level ${focus} is locked. Buy it below, or unlock it with your code.`)}</p>`
    : "";
  const closedNotice = canBuy ? "" : `<p class="notice">${t("Køb åbner snart. Niveau 1 kan spilles gratis nu.", "Buying opens soon. Level 1 is free to play now.")}</p>`;

  const bundle = ownsAll ? "" : `<section class="bundle" id="bundle">
  <div><h2>${t("Alle niveauer", "All levels")}</h2><p>${t(`Niveau 2 til 8: 785 steder at finde. <b>${bp.da}</b> i stedet for <s>${full.da}</s>`, `Levels 2 to 8: 785 places to find. <b>${bp.en}</b> instead of <s>${full.en}</s>`)}</p></div>
  <button type="button" class="btn primary" data-buy="bundle">${t(`Køb alle · ${bp.da}`, `Buy all · ${bp.en}`)}</button>
</section>`;

  const body = `${topHeader(SERIES, SERIES, "Find Danmark på kortet", "Find Denmark on the map",
      "Otte niveauer fra let til svær: byer, kendte steder og alle tog-, S-togs- og metrostationer. Niveau 1 er gratis.",
      "Eight levels from easy to hard: towns, famous places and every train, S-tog and Metro stop. Level 1 is free.")}
${lockedNotice}${closedNotice}
<ul class="levels">
${items}
</ul>
${bundle}
<label class="consent"><input type="checkbox" id="consent">
  <span>${t("Jeg accepterer, at niveauet åbnes, så snart jeg har betalt, og at min fortrydelsesret dermed bortfalder. Jeg har læst <a href=\"/games/terms\">handelsbetingelserne</a>.",
             "I agree that the level opens as soon as I have paid, and that I therefore lose my right of withdrawal. I have read the <a href=\"/games/terms\">terms</a>.")}</span></label>
<p class="msg err" id="buy-msg" role="alert"></p>
<ul class="facts">
  <li>${t("Betal med MobilePay eller kort.", "Pay with MobilePay or card.")}</li>
  <li>${t("Intet login. Du får en kode, som virker på op til 3 af dine enheder. Koden står også på din kvittering.", "No login. You get a code that works on up to 3 of your devices. It is on your receipt too.")}</li>
  <li>${t("Spillet spilles online, på telefon, tablet eller computer.", "The game is played online, on a phone, tablet or computer.")}</li>
</ul>

<section class="panel" id="redeem">
  <h2>${t("Har du allerede en kode?", "Already have a code?")}</h2>
  <form class="row" id="redeem-form" autocomplete="off">
    <input id="code" name="code" inputmode="text" maxlength="12" placeholder="ABCD-EFGH" aria-label="Kode / Code" required>
    <button class="btn primary" type="submit">${t("Lås op", "Unlock")}</button>
  </form>
  <p class="msg" id="redeem-msg" role="status"></p>
</section>`;

  const script = `
(function(){
  var lang=function(){return document.documentElement.dataset.lang==="en"?"en":"da"};
  var MSG={
    consent:{da:"Sæt kryds i feltet om fortrydelsesret for at købe.",en:"Tick the box about the right of withdrawal to buy."},
    closed:{da:"Køb er ikke åbent endnu. Prøv igen senere.",en:"Buying is not open yet. Please try again later."},
    failed:{da:"Betalingen kunne ikke startes. Prøv igen om lidt.",en:"The payment could not be started. Please try again shortly."},
    unknown:{da:"Den kode kender vi ikke. Tjek, at den er skrevet rigtigt.",en:"We don't know that code. Check that it's typed correctly."},
    pending:{da:"Betalingen for den kode er ikke gennemført endnu.",en:"The payment for that code hasn't gone through yet."},
    revoked:{da:"Den kode er spærret, fordi betalingen er refunderet. Skriv til os, hvis det er en fejl.",en:"That code is blocked because the payment was refunded. Write to us if this is a mistake."},
    device_limit:{da:"Koden bruges allerede på 3 enheder. Skriv til os, hvis du har fået en ny enhed.",en:"The code is already in use on 3 devices. Write to us if you have a new device."},
    busy:{da:"For mange forsøg. Vent lidt, og prøv igen.",en:"Too many tries. Wait a little and try again."},
    ok:{da:"Låst op! Siden genindlæses …",en:"Unlocked! Reloading …"}
  };
  var say=function(el,key,cls){el.textContent=MSG[key][lang()];el.className="msg "+(cls||"err")};
  var buyMsg=document.getElementById("buy-msg");
  document.querySelectorAll("[data-buy]").forEach(function(b){
    b.addEventListener("click",function(){
      if(!document.getElementById("consent").checked){say(buyMsg,"consent");document.getElementById("consent").focus();return;}
      b.disabled=true;buyMsg.textContent="";
      fetch("/api/games/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({product:b.dataset.buy,lang:lang(),consent:true})})
        .then(function(r){return r.json().then(function(j){return{status:r.status,j:j}})})
        .then(function(x){if(x.j.url){location.href=x.j.url;return;}say(buyMsg,x.status===503?"closed":"failed");b.disabled=false;})
        .catch(function(){say(buyMsg,"failed");b.disabled=false;});
    });
  });
  var form=document.getElementById("redeem-form"),rmsg=document.getElementById("redeem-msg");
  form.addEventListener("submit",function(e){
    e.preventDefault();var btn=form.querySelector("button");btn.disabled=true;
    fetch("/api/games/redeem",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:document.getElementById("code").value})})
      .then(function(r){return r.json().then(function(j){return{status:r.status,j:j}})})
      .then(function(x){
        if(x.j.ok){say(rmsg,"ok","ok");setTimeout(function(){location.reload()},700);return;}
        say(rmsg,x.status===429?"busy":(MSG[x.j.reason]?x.j.reason:"unknown"));btn.disabled=false;})
      .catch(function(){say(rmsg,"failed");btn.disabled=false;});
  });
  var f=document.querySelector(".level.focus");if(f)f.scrollIntoView({block:"center"});
})();`;

  return page({ titleDa: `${SERIES}: alle niveauer`, titleEn: `${SERIES}: all levels`, body, script });
}

export type UnlockState =
  | { kind: "ok"; code: string; levels: number[] }
  | { kind: "pending" }
  | { kind: "device_limit"; code: string }
  | { kind: "error" };

export function unlockPage(state: UnlockState): string {
  let body: string;
  if (state.kind === "ok") {
    const first = state.levels[0];
    const names = state.levels.length === PAID_LEVELS.length
      ? t("alle niveauer", "all levels")
      : t(`niveau ${state.levels.join(", ")}`, `level ${state.levels.join(", ")}`);
    body = `${topHeader("Tak for købet", "Thank you", "Så er der låst op", "You're unlocked",
        "Du kan spille med det samme. Gem koden herunder: den står også på kvitteringen, vi har sendt til din e-mail.",
        "You can play right away. Keep the code below: it is also on the receipt we emailed you.")}
<section class="panel">
  <p>${t("Din kode til", "Your code for")} ${names}:</p>
  <p class="code">${escapeHtml(formatCode(state.code))}</p>
  <p class="lead">${t("Koden virker på op til 3 af dine enheder: skriv den under »Har du allerede en kode?« på niveausiden.", "The code works on up to 3 of your devices: enter it under “Already have a code?” on the levels page.")}</p>
  <p class="row" style="margin-top:14px">${first ? `<a class="btn primary" href="/games/level/${first}">${t(`Spil niveau ${first}`, `Play level ${first}`)}</a>` : ""}<a class="btn" href="/games/levels">${t("Alle niveauer", "All levels")}</a></p>
</section>`;
  } else if (state.kind === "pending") {
    body = `${topHeader(SERIES, SERIES, "Vi venter på betalingen", "Waiting for the payment",
        "Betalingen er ikke bekræftet endnu. Det tager som regel kun et øjeblik.",
        "The payment isn't confirmed yet. It usually takes only a moment.")}
<p class="row"><a class="btn primary" href="">${t("Prøv igen", "Try again")}</a><a class="btn" href="/games/levels">${t("Alle niveauer", "All levels")}</a></p>`;
  } else if (state.kind === "device_limit") {
    body = `${topHeader(SERIES, SERIES, "Koden er i brug på 3 enheder", "The code is in use on 3 devices",
        "Betalingen er gået igennem, men koden er allerede i brug på 3 enheder. Skriv til os, så hjælper vi.",
        "The payment went through, but the code is already in use on 3 devices. Write to us and we'll help.")}
<p class="code">${escapeHtml(formatCode(state.code))}</p>`;
  } else {
    body = `${topHeader(SERIES, SERIES, "Noget gik galt", "Something went wrong",
        "Vi kunne ikke tjekke betalingen. Har du betalt, står din kode på kvitteringen: skriv den på niveausiden.",
        "We couldn't check the payment. If you have paid, your code is on the receipt: enter it on the levels page.")}
<p class="row"><a class="btn primary" href="/games/levels#redeem">${t("Til niveausiden", "To the levels page")}</a></p>`;
  }
  return page({ titleDa: SERIES, titleEn: SERIES, body, noindex: true });
}

export function termsPage(): string {
  const s = seller();
  const who = s.name
    ? `${escapeHtml(s.name)}${s.address ? `, ${escapeHtml(s.address)}` : ""}${s.cvr ? `, CVR ${escapeHtml(s.cvr)}` : ""}${s.email ? `, <a href="mailto:${escapeHtml(s.email)}">${escapeHtml(s.email)}</a>` : ""}`
    : t("[Sælgers navn, adresse, CVR og e-mail mangler]", "[Seller name, address, CVR and email missing]");
  const body = `${topHeader(SERIES, SERIES, "Handelsbetingelser og privatliv", "Terms and privacy", "", "")}
<section class="panel">
  <h2>${t("Sælger", "Seller")}</h2>
  <p>${who}</p>
  <h2>${t("Hvad du køber", "What you buy")}</h2>
  <p>${t(`Adgang til at spille et eller flere niveauer af ${SERIES} online på denne hjemmeside. Et niveau koster ${formatPrice(LEVEL_PRICE, "da")}, alle niveauer 2–8 koster ${formatPrice(BUNDLE_PRICE, "da")}. Priserne er i danske kroner. Adgangen gælder, så længe spillet findes på hjemmesiden, på op til 3 af dine enheder, og er til privat brug.`,
        `Access to play one or more levels of ${SERIES} online on this website. One level costs ${formatPrice(LEVEL_PRICE, "en")}; all levels 2–8 cost ${formatPrice(BUNDLE_PRICE, "en")}. Prices are in Danish kroner. Access lasts as long as the game is on the website, on up to 3 of your devices, for private use.`)}</p>
  <h2>${t("Betaling", "Payment")}</h2>
  <p>${t("Du betaler med MobilePay eller kort via Stripe. Vi ser og gemmer ikke dine kortoplysninger.", "You pay with MobilePay or card through Stripe. We never see or store your card details.")}</p>
  <h2>${t("Fortrydelsesret", "Right of withdrawal")}</h2>
  <p>${t("Niveauet er digitalt indhold, som leveres med det samme. Før du betaler, giver du samtykke til, at levering begynder straks, og bekræfter, at din fortrydelsesret dermed bortfalder (forbrugeraftalelovens § 18, stk. 2, nr. 13). Virker spillet ikke, så skriv til os: så retter vi fejlen eller giver pengene tilbage.",
        "A level is digital content delivered at once. Before paying, you agree that delivery starts straight away and confirm that you therefore lose your right of withdrawal (Danish Consumer Contracts Act, section 18(2)(13)). If the game doesn't work, write to us: we will fix it or refund you.")}</p>
  <h2>${t("Kode og deling", "Code and sharing")}</h2>
  <p>${t("Din kode er personlig. Den virker på op til 3 enheder. En kode, der deles videre, kan blive spærret. Refunderes en betaling, spærres koden.", "Your code is personal. It works on up to 3 devices. A code that is passed on may be blocked. If a payment is refunded, the code is blocked.")}</p>
  <h2>${t("Klager", "Complaints")}</h2>
  <p>${t("Skriv til os først. Du kan også klage til Nævnenes Hus (naevneneshus.dk) eller via EU's klageportal (ec.europa.eu/odr).", "Write to us first. You can also complain to Nævnenes Hus (naevneneshus.dk) or through the EU complaints portal (ec.europa.eu/odr).")}</p>
</section>
<section class="panel">
  <h2>${t("Privatliv", "Privacy")}</h2>
  <p>${t("Spillet kræver intet login, og dit spillernavn bliver kun på din enhed. Når du køber, gemmer vi din kode, din e-mail (fra betalingen, så vi kan hjælpe dig, hvis du mister koden), betalingens id, og hvilke enheder koden bruges på (et tilfældigt id i en cookie). Det bruger vi kun til at give dig adgang og til bogføring, som loven kræver (5 år). Data opbevares i EU hos Supabase, og betalinger håndteres af Stripe. Skriv til os for at få indsigt i eller slettet dine oplysninger.",
        "The game needs no login, and your player name stays on your device. When you buy, we store your code, your email (from the payment, so we can help if you lose the code), the payment id, and which devices use the code (a random id in a cookie). We use these only to give you access and for bookkeeping the law requires (5 years). Data is stored in the EU with Supabase; payments are handled by Stripe. Write to us to see or delete your data.")}</p>
  <p>${t("Cookies: vi bruger kun to nødvendige cookies (enheds-id og dine koder) for at kunne give dig adgang. Ingen statistik- eller reklamecookies.", "Cookies: we only use two necessary cookies (device id and your codes) to give you access. No analytics or advertising cookies.")}</p>
</section>
<p><a class="btn" href="/games/levels">${t("Tilbage til niveauerne", "Back to the levels")}</a></p>`;
  return page({ titleDa: `${SERIES}: handelsbetingelser`, titleEn: `${SERIES}: terms`, body });
}
