/**
 * AI Personal Shopper — embeddable size & style widget
 * -----------------------------------------------------
 * Drop this on any product page:
 *
 *   <div class="ai-shopper-widget"
 *        data-backend="https://your-backend.up.railway.app"
 *        data-merchant-key="mch_live_xxx"
 *        data-product-id="prod_123"
 *        data-product-name="Premium Streetwear Hoodie"
 *        data-product-price="$79.00"
 *        data-product-image="https://cdn.yourstore.com/hoodie.jpg"
 *        data-product-category="apparel">
 *   </div>
 *   <script src="https://your-cdn.com/widget.js" defer></script>
 *
 * No photo is collected — just height, weight, and a fit preference.
 * data-product-category is informational only (shown in analytics /
 * used later if you split style-matching by category); it no longer
 * routes to a specialized model the way it did for the try-on widget.
 *
 * data-lang is optional — auto-detected from the host page's <html lang="..">
 * if omitted. Falls back to English if the detected language isn't
 * supported. Override explicitly with e.g. data-lang="es" if needed.
 * Supported: en, es, fr, de, pt, it, ro, nl.
 *
 * Multiple widgets (e.g. a collection/listing page) work automatically —
 * every element with class "ai-shopper-widget" on the page gets its own
 * button + modal, each configured from its own data attributes.
 *
 * Styles are isolated in a Shadow DOM so the host store's CSS can't break
 * the widget, and the widget's CSS can't leak out and break the store.
 */
(function () {
  "use strict";

  const GOLD = "#9C7A3D";
  const GOLD_DIM = "#C9AD78";
  const BG = "#FFFFFF";
  const PANEL = "#F7F5F0";
  const BORDER = "#E2DDD0";
  const TEXT = "#1A1816";
  const DIM = "#6B665C";
  const SUCCESS = "#3F7A50";
  const RUST = "#B14A34";

  const TRANSLATIONS = {
    en: {
      trigger: "🧍 Find Your Size & Style", modalTitle: "Find your fit",
      modalSub: "Answer two quick questions — no photo needed.",
      heightLabel: "Height (cm)", weightLabel: "Weight (kg)", fitLabel: "Fit preference",
      fitTight: "Tight", fitRegular: "Regular", fitLoose: "Loose",
      submit: "Get my recommendation", close: "Close",
      statusChecking: "Finding your size…",
      sizePrefixHigh: "Your perfect size: ", sizePrefixLow: "Closest match: Size ",
      sizeLowSuffix: " (approximate)", noChart: "This store hasn't set up sizing for this item yet.",
      styleHeading: "Complete the look", errMissing: "Please enter both height and weight.",
      errRequest: "Couldn't get a recommendation right now."
    },
    es: {
      trigger: "🧍 Encuentra tu talla y estilo", modalTitle: "Encuentra tu talla",
      modalSub: "Responde dos preguntas rápidas — sin necesidad de foto.",
      heightLabel: "Altura (cm)", weightLabel: "Peso (kg)", fitLabel: "Preferencia de ajuste",
      fitTight: "Ajustado", fitRegular: "Regular", fitLoose: "Holgado",
      submit: "Obtener mi recomendación", close: "Cerrar",
      statusChecking: "Calculando tu talla…",
      sizePrefixHigh: "Tu talla perfecta: ", sizePrefixLow: "La más cercana: Talla ",
      sizeLowSuffix: " (aproximado)", noChart: "Esta tienda aún no configuró tallas para este artículo.",
      styleHeading: "Completa el look", errMissing: "Ingresa tu altura y peso.",
      errRequest: "No se pudo obtener una recomendación ahora."
    },
    fr: {
      trigger: "🧍 Trouvez votre taille et style", modalTitle: "Trouvez votre taille",
      modalSub: "Répondez à deux questions rapides — aucune photo requise.",
      heightLabel: "Taille (cm)", weightLabel: "Poids (kg)", fitLabel: "Préférence de coupe",
      fitTight: "Ajusté", fitRegular: "Normal", fitLoose: "Ample",
      submit: "Obtenir ma recommandation", close: "Fermer",
      statusChecking: "Calcul de votre taille…",
      sizePrefixHigh: "Votre taille parfaite : ", sizePrefixLow: "Le plus proche : Taille ",
      sizeLowSuffix: " (approximatif)", noChart: "Ce magasin n'a pas encore configuré les tailles pour cet article.",
      styleHeading: "Complétez la tenue", errMissing: "Veuillez indiquer votre taille et votre poids.",
      errRequest: "Impossible d'obtenir une recommandation pour le moment."
    },
    de: {
      trigger: "🧍 Größe & Stil finden", modalTitle: "Finde deine Größe",
      modalSub: "Beantworte zwei kurze Fragen — kein Foto nötig.",
      heightLabel: "Größe (cm)", weightLabel: "Gewicht (kg)", fitLabel: "Passform",
      fitTight: "Eng", fitRegular: "Normal", fitLoose: "Locker",
      submit: "Empfehlung erhalten", close: "Schließen",
      statusChecking: "Deine Größe wird berechnet…",
      sizePrefixHigh: "Deine perfekte Größe: ", sizePrefixLow: "Nächste Übereinstimmung: Größe ",
      sizeLowSuffix: " (ungefähr)", noChart: "Dieser Shop hat für diesen Artikel noch keine Größentabelle hinterlegt.",
      styleHeading: "Passend dazu", errMissing: "Bitte Größe und Gewicht angeben.",
      errRequest: "Gerade keine Empfehlung möglich."
    },
    pt: {
      trigger: "🧍 Encontre seu tamanho e estilo", modalTitle: "Encontre seu tamanho",
      modalSub: "Responda duas perguntas rápidas — sem necessidade de foto.",
      heightLabel: "Altura (cm)", weightLabel: "Peso (kg)", fitLabel: "Preferência de caimento",
      fitTight: "Justo", fitRegular: "Regular", fitLoose: "Solto",
      submit: "Obter minha recomendação", close: "Fechar",
      statusChecking: "Calculando seu tamanho…",
      sizePrefixHigh: "Seu tamanho perfeito: ", sizePrefixLow: "Mais próximo: Tamanho ",
      sizeLowSuffix: " (aproximado)", noChart: "Esta loja ainda não configurou tamanhos para este item.",
      styleHeading: "Complete o look", errMissing: "Informe altura e peso.",
      errRequest: "Não foi possível obter uma recomendação agora."
    },
    it: {
      trigger: "🧍 Trova taglia e stile", modalTitle: "Trova la tua taglia",
      modalSub: "Rispondi a due semplici domande — nessuna foto necessaria.",
      heightLabel: "Altezza (cm)", weightLabel: "Peso (kg)", fitLabel: "Preferenza di vestibilità",
      fitTight: "Aderente", fitRegular: "Regolare", fitLoose: "Comoda",
      submit: "Ottieni il mio consiglio", close: "Chiudi",
      statusChecking: "Calcolo della taglia…",
      sizePrefixHigh: "La tua taglia perfetta: ", sizePrefixLow: "Più vicina: Taglia ",
      sizeLowSuffix: " (approssimativo)", noChart: "Questo negozio non ha ancora impostato le taglie per questo articolo.",
      styleHeading: "Completa il look", errMissing: "Inserisci altezza e peso.",
      errRequest: "Impossibile ottenere un consiglio al momento."
    },
    ro: {
      trigger: "🧍 Găsește-ți mărimea și stilul", modalTitle: "Găsește-ți mărimea",
      modalSub: "Răspunde la două întrebări rapide — fără poză.",
      heightLabel: "Înălțime (cm)", weightLabel: "Greutate (kg)", fitLabel: "Preferință de fit",
      fitTight: "Strâns", fitRegular: "Regular", fitLoose: "Larg",
      submit: "Primește recomandarea", close: "Închide",
      statusChecking: "Se calculează mărimea…",
      sizePrefixHigh: "Mărimea ta perfectă: ", sizePrefixLow: "Cea mai apropiată: Mărimea ",
      sizeLowSuffix: " (aproximativ)", noChart: "Acest magazin nu a configurat încă mărimile pentru acest articol.",
      styleHeading: "Completează ținuta", errMissing: "Introdu înălțimea și greutatea.",
      errRequest: "Nu s-a putut obține o recomandare acum."
    },
    nl: {
      trigger: "🧍 Vind je maat & stijl", modalTitle: "Vind je maat",
      modalSub: "Beantwoord twee korte vragen — geen foto nodig.",
      heightLabel: "Lengte (cm)", weightLabel: "Gewicht (kg)", fitLabel: "Pasvoorkeur",
      fitTight: "Strak", fitRegular: "Normaal", fitLoose: "Los",
      submit: "Krijg mijn aanbeveling", close: "Sluiten",
      statusChecking: "Je maat wordt berekend…",
      sizePrefixHigh: "Jouw perfecte maat: ", sizePrefixLow: "Dichtstbijzijnde match: Maat ",
      sizeLowSuffix: " (bij benadering)", noChart: "Deze winkel heeft nog geen maattabel ingesteld voor dit item.",
      styleHeading: "Maak de look compleet", errMissing: "Vul lengte en gewicht in.",
      errRequest: "Kan nu geen aanbeveling ophalen."
    }
  };

  function resolveLang(container) {
    const explicit = (container.dataset.lang || "").toLowerCase().slice(0, 2);
    if (explicit && TRANSLATIONS[explicit]) return explicit;
    const pageLang = (document.documentElement.lang || "").toLowerCase().slice(0, 2);
    if (pageLang && TRANSLATIONS[pageLang]) return pageLang;
    return "en";
  }

  const STYLE = `
    * { box-sizing: border-box; }
    :host { all: initial; }
    .wrap { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, sans-serif; }

    .trigger {
      display: inline-flex; align-items: center; gap: 8px;
      background: ${GOLD}; color: #161116; border: none;
      padding: 12px 22px; border-radius: 999px; font-weight: 600;
      font-size: 14px; cursor: pointer; transition: background .15s ease;
    }
    .trigger:hover { background: #B08F4F; }

    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.72);
      display: none; align-items: center; justify-content: center;
      z-index: 999999; padding: 20px;
    }
    .overlay.open { display: flex; }

    .modal {
      background: ${BG}; color: ${TEXT}; width: 100%; max-width: 380px;
      border-radius: 16px; border: 1px solid ${BORDER};
      padding: 22px; position: relative; max-height: 92vh; overflow-y: auto;
    }
    .close-btn {
      position: absolute; top: 14px; right: 14px; background: transparent;
      border: none; color: ${DIM}; font-size: 20px; cursor: pointer; line-height: 1;
      width: 28px; height: 28px; border-radius: 50%;
    }
    .close-btn:hover { background: ${PANEL}; color: ${TEXT}; }

    .modal h2 { font-size: 17px; font-weight: 600; margin: 0 0 4px; padding-right: 24px; }
    .modal .sub { color: ${DIM}; font-size: 12.5px; margin: 0 0 16px; }

    .product-strip { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
    .product-strip img {
      width: 48px; height: 48px; object-fit: cover; border-radius: 8px;
      border: 1px solid ${BORDER}; flex-shrink: 0;
    }
    .product-strip .name { font-size: 13px; font-weight: 500; }
    .product-strip .price { font-size: 12.5px; color: ${GOLD}; }

    label { display: block; font-size: 12px; color: ${DIM}; margin: 12px 0 4px; }
    label:first-of-type { margin-top: 0; }
    input[type=number], select {
      width: 100%; background: ${PANEL}; border: 1px solid ${BORDER}; color: ${TEXT};
      border-radius: 8px; padding: 10px; font-size: 13px; font-family: inherit;
    }
    input[type=number]:focus, select:focus { outline: 2px solid ${GOLD}; outline-offset: 1px; }

    .submit-btn {
      width: 100%; background: ${GOLD}; color: #161116; border: none;
      padding: 13px; border-radius: 999px; font-weight: 600; font-size: 13.5px;
      cursor: pointer; margin-top: 16px;
    }
    .submit-btn:hover { background: #B08F4F; }
    .submit-btn:disabled { opacity: .5; cursor: not-allowed; }

    .status {
      font-size: 12px; padding: 9px 10px; border-radius: 8px; border: 1px solid ${BORDER};
      display: none; text-align: center; margin-top: 10px;
    }
    .status.show { display: block; }
    .status.ok { border-color: ${SUCCESS}; color: ${SUCCESS}; }
    .status.err { border-color: ${RUST}; color: ${RUST}; }
    .status.pending { border-color: ${GOLD_DIM}; color: ${GOLD}; }

    .result { display: none; margin-top: 14px; }
    .result.show { display: block; }
    .result .size-line {
      padding: 12px; border-radius: 8px; font-size: 13.5px; font-weight: 600;
      border: 1px solid ${SUCCESS}; color: ${SUCCESS}; text-align: center;
    }
    .result .size-line.low { border-color: ${GOLD_DIM}; color: ${GOLD}; }
    .style-heading {
      font-size: 11px; text-transform: uppercase; letter-spacing: .06em;
      color: ${DIM}; margin: 16px 0 8px;
    }
    .style-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .style-item { border: 1px solid ${BORDER}; border-radius: 8px; overflow: hidden; }
    .style-item img { width: 100%; height: 90px; object-fit: cover; display: block; }
    .style-item p { font-size: 11px; margin: 6px; color: ${TEXT}; }
    .style-item .price { color: ${GOLD}; }
  `;

  function initWidget(container) {
    const backend = container.dataset.backend;
    const merchantKey = container.dataset.merchantKey;
    const productId = container.dataset.productId || "unknown-product";
    const productName = container.dataset.productName || "This item";
    const productPrice = container.dataset.productPrice || "";
    const productImage = container.dataset.productImage;

    if (!backend || !merchantKey || !productId) {
      console.error("[ai-shopper-widget] missing required data-backend / data-merchant-key / data-product-id on", container);
      return;
    }

    const lang = resolveLang(container);
    const t = TRANSLATIONS[lang];

    // ---- Trigger button: stays wherever the container was placed in the page ----
    const triggerRoot = container.attachShadow({ mode: "open" });
    const triggerStyle = document.createElement("style");
    triggerStyle.textContent = STYLE;
    triggerRoot.appendChild(triggerStyle);

    const trigger = document.createElement("button");
    trigger.className = "trigger";
    trigger.type = "button";
    trigger.textContent = t.trigger;
    triggerRoot.appendChild(trigger);

    // ---- Modal: appended directly to <body>, not nested in the page's own
    // layout, so an ancestor's CSS transform can't trap `position: fixed`
    // and shrink/misplace the modal (same reasoning as the old widget). ----
    const modalHost = document.createElement("div");
    modalHost.className = "ai-shopper-modal-host";
    modalHost.style.display = "block"; // :host{all:initial} resets this to inline by default, collapsing the box to 0x0
    document.body.appendChild(modalHost);
    const modalRoot = modalHost.attachShadow({ mode: "open" });
    const modalStyle = document.createElement("style");
    modalStyle.textContent = STYLE;
    modalRoot.appendChild(modalStyle);

    const wrap = document.createElement("div");
    wrap.className = "wrap";
    wrap.innerHTML = `
      <div class="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="close-btn" type="button" aria-label="${t.close}">×</button>
          <h2>${t.modalTitle}</h2>
          <p class="sub">${t.modalSub}</p>

          <div class="product-strip">
            ${productImage ? `<img src="${productImage}" alt="${productName}">` : ""}
            <div>
              <div class="name">${productName}</div>
              <div class="price">${productPrice}</div>
            </div>
          </div>

          <label>${t.heightLabel}</label>
          <input type="number" class="height-input" min="0" placeholder="170">

          <label>${t.weightLabel}</label>
          <input type="number" class="weight-input" min="0" placeholder="65">

          <label>${t.fitLabel}</label>
          <select class="fit-input">
            <option value="tight">${t.fitTight}</option>
            <option value="regular" selected>${t.fitRegular}</option>
            <option value="loose">${t.fitLoose}</option>
          </select>

          <button class="submit-btn" type="button">${t.submit}</button>
          <div class="status"></div>

          <div class="result">
            <div class="size-line"></div>
            <div class="style-section" style="display:none;">
              <div class="style-heading">${t.styleHeading}</div>
              <div class="style-grid"></div>
            </div>
          </div>
        </div>
      </div>
    `;
    modalRoot.appendChild(wrap);

    // ---- element refs ----
    const overlay = wrap.querySelector(".overlay");
    const closeBtn = wrap.querySelector(".close-btn");
    const heightInput = wrap.querySelector(".height-input");
    const weightInput = wrap.querySelector(".weight-input");
    const fitInput = wrap.querySelector(".fit-input");
    const submitBtn = wrap.querySelector(".submit-btn");
    const statusEl = wrap.querySelector(".status");
    const resultEl = wrap.querySelector(".result");
    const sizeLineEl = wrap.querySelector(".size-line");
    const styleSectionEl = wrap.querySelector(".style-section");
    const styleGridEl = wrap.querySelector(".style-grid");

    function closeModal() {
      overlay.classList.remove("open");
    }

    trigger.onclick = () => overlay.classList.add("open");
    closeBtn.onclick = closeModal;
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    function setStatus(text, kind) {
      statusEl.className = "status show" + (kind ? " " + kind : "");
      statusEl.textContent = text;
    }
    function resetStatus() {
      statusEl.className = "status";
      statusEl.textContent = "";
    }

    submitBtn.onclick = async () => {
      const height_cm = parseFloat(heightInput.value);
      const weight_kg = parseFloat(weightInput.value);
      const fit_preference = fitInput.value;

      resultEl.classList.remove("show");
      resetStatus();

      if (!height_cm || !weight_kg) {
        setStatus(t.errMissing, "err");
        return;
      }

      submitBtn.disabled = true;
      setStatus(t.statusChecking, "pending");

      try {
        const res = await fetch(`${backend}/api/v1/personal-shopper`, {
          method: "POST",
          headers: { "X-Merchant-API-Key": merchantKey, "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: productId, height_cm, weight_kg, fit_preference })
        });
        if (!res.ok) throw new Error(t.errRequest);
        const data = await res.json();

        resetStatus();

        if (data.recommended_size) {
          sizeLineEl.className = "size-line" + (data.size_confidence === "low" ? " low" : "");
          sizeLineEl.textContent = data.size_confidence === "low"
            ? t.sizePrefixLow + data.recommended_size + t.sizeLowSuffix
            : t.sizePrefixHigh + data.recommended_size;
        } else {
          sizeLineEl.className = "size-line low";
          sizeLineEl.textContent = t.noChart;
        }

        if (data.style_matches && data.style_matches.length) {
          styleGridEl.innerHTML = data.style_matches.map(m => `
            <div class="style-item">
              <img src="${m.image}" alt="${m.name}">
              <p>${m.name}<br><span class="price">${m.price || ""}</span></p>
            </div>
          `).join("");
          styleSectionEl.style.display = "block";
        } else {
          styleSectionEl.style.display = "none";
        }

        resultEl.classList.add("show");
      } catch (err) {
        setStatus(err.message, "err");
      } finally {
        submitBtn.disabled = false;
      }
    };
  }

  function init() {
    document.querySelectorAll(".ai-shopper-widget").forEach(el => {
      if (el.dataset.shopperInitialized) return;
      el.dataset.shopperInitialized = "true";
      initWidget(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Exposed so pages that swap products dynamically (e.g. a product
  // carousel) can re-scan for newly-added .ai-shopper-widget elements
  // without needing a full page reload.
  window.reinitAiShopperWidgets = init;
})();
