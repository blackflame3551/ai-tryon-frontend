/**
 * AI Fitting Room — embeddable virtual try-on widget
 * ---------------------------------------------------
 * Drop this on any product page:
 *
 *   <div class="ai-tryon-widget"
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
 * data-product-category defaults to "apparel" if omitted. For jewelry,
 * use one of: "jewelry_necklace", "jewelry_bracelet", "jewelry_ring",
 * "jewelry_earrings" — these route to a specialized jewelry model instead
 * of the general apparel one.
 *
 * data-lang is optional — auto-detected from the host page's <html lang="..">
 * if omitted. Falls back to English if the detected language isn't
 * supported. Override explicitly with e.g. data-lang="es" if needed.
 * Supported: en, es, fr, de, pt, it, ro, nl.
 *
 * Multiple widgets (e.g. a collection/listing page) work automatically —
 * every element with class "ai-tryon-widget" on the page gets its own
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
      tryItOn: "✨ Try It On", modalTitle: "See it on you",
      modalSub: "Upload a photo and we'll show you wearing it.",
      tabUpload: "Upload photo", tabUrl: "Paste URL",
      dropzone: "📷 Drop a photo here, or click to choose",
      urlPlaceholder: "https://example.com/your-photo.jpg",
      submit: "Try it on", close: "Close",
      statusUploading: "Uploading your photo…", statusSession: "Opening a session…",
      statusQueue: "Sending it to the fitting room…", statusGenerating: "Generating your look…",
      statusDone: "Done — here's the look.", statusFailedPrefix: "Failed: ",
      statusPrefix: "Status: ", unknownError: "unknown error",
      errChoosePhoto: "Choose a photo first.", errPasteUrl: "Paste a photo URL first.",
      errUploadFailed: "Photo upload failed.", errSession: "Could not start a session.",
      errQueue: "Could not queue the job.",
      statusWords: { initiated: "initiated", queued: "queued", processing: "processing" }
    },
    es: {
      tryItOn: "✨ Pruébatelo", modalTitle: "Míratelo puesto",
      modalSub: "Sube una foto y te mostraremos cómo te queda.",
      tabUpload: "Subir foto", tabUrl: "Pegar URL",
      dropzone: "📷 Arrastra una foto aquí, o haz clic para elegir",
      urlPlaceholder: "https://ejemplo.com/tu-foto.jpg",
      submit: "Probarlo", close: "Cerrar",
      statusUploading: "Subiendo tu foto…", statusSession: "Abriendo sesión…",
      statusQueue: "Enviando al probador…", statusGenerating: "Generando tu look…",
      statusDone: "Listo — aquí está el resultado.", statusFailedPrefix: "Error: ",
      statusPrefix: "Estado: ", unknownError: "error desconocido",
      errChoosePhoto: "Elige una foto primero.", errPasteUrl: "Pega una URL de foto primero.",
      errUploadFailed: "Error al subir la foto.", errSession: "No se pudo iniciar la sesión.",
      errQueue: "No se pudo encolar el trabajo.",
      statusWords: { initiated: "iniciado", queued: "en cola", processing: "procesando" }
    },
    fr: {
      tryItOn: "✨ Essayer", modalTitle: "Voyez-le sur vous",
      modalSub: "Téléchargez une photo et voyez le rendu sur vous.",
      tabUpload: "Télécharger une photo", tabUrl: "Coller une URL",
      dropzone: "📷 Déposez une photo ici, ou cliquez pour choisir",
      urlPlaceholder: "https://exemple.com/votre-photo.jpg",
      submit: "Essayer maintenant", close: "Fermer",
      statusUploading: "Téléchargement de votre photo…", statusSession: "Ouverture de la session…",
      statusQueue: "Envoi à la cabine d'essayage…", statusGenerating: "Génération de votre look…",
      statusDone: "Terminé — voici le résultat.", statusFailedPrefix: "Échec : ",
      statusPrefix: "Statut : ", unknownError: "erreur inconnue",
      errChoosePhoto: "Choisissez d'abord une photo.", errPasteUrl: "Collez d'abord une URL de photo.",
      errUploadFailed: "Échec du téléchargement de la photo.", errSession: "Impossible de démarrer la session.",
      errQueue: "Impossible de mettre en file d'attente.",
      statusWords: { initiated: "initié", queued: "en file d'attente", processing: "en cours" }
    },
    de: {
      tryItOn: "✨ Anprobieren", modalTitle: "Sieh es an dir",
      modalSub: "Lade ein Foto hoch und sieh, wie es an dir aussieht.",
      tabUpload: "Foto hochladen", tabUrl: "URL einfügen",
      dropzone: "📷 Foto hier ablegen oder klicken zum Auswählen",
      urlPlaceholder: "https://beispiel.com/dein-foto.jpg",
      submit: "Jetzt anprobieren", close: "Schließen",
      statusUploading: "Foto wird hochgeladen…", statusSession: "Sitzung wird gestartet…",
      statusQueue: "Wird an die Umkleide gesendet…", statusGenerating: "Dein Look wird erstellt…",
      statusDone: "Fertig — hier ist das Ergebnis.", statusFailedPrefix: "Fehlgeschlagen: ",
      statusPrefix: "Status: ", unknownError: "unbekannter Fehler",
      errChoosePhoto: "Wähle zuerst ein Foto.", errPasteUrl: "Füge zuerst eine Foto-URL ein.",
      errUploadFailed: "Foto-Upload fehlgeschlagen.", errSession: "Sitzung konnte nicht gestartet werden.",
      errQueue: "Auftrag konnte nicht eingereiht werden.",
      statusWords: { initiated: "gestartet", queued: "in Warteschlange", processing: "in Bearbeitung" }
    },
    pt: {
      tryItOn: "✨ Experimentar", modalTitle: "Veja em você",
      modalSub: "Envie uma foto e mostramos como fica em você.",
      tabUpload: "Enviar foto", tabUrl: "Colar URL",
      dropzone: "📷 Solte uma foto aqui, ou clique para escolher",
      urlPlaceholder: "https://exemplo.com/sua-foto.jpg",
      submit: "Experimentar agora", close: "Fechar",
      statusUploading: "Enviando sua foto…", statusSession: "Iniciando sessão…",
      statusQueue: "Enviando ao provador…", statusGenerating: "Gerando seu look…",
      statusDone: "Pronto — aqui está o resultado.", statusFailedPrefix: "Falhou: ",
      statusPrefix: "Status: ", unknownError: "erro desconhecido",
      errChoosePhoto: "Escolha uma foto primeiro.", errPasteUrl: "Cole uma URL de foto primeiro.",
      errUploadFailed: "Falha ao enviar a foto.", errSession: "Não foi possível iniciar a sessão.",
      errQueue: "Não foi possível enfileirar.",
      statusWords: { initiated: "iniciado", queued: "na fila", processing: "processando" }
    },
    it: {
      tryItOn: "✨ Provalo", modalTitle: "Guardalo su di te",
      modalSub: "Carica una foto e ti mostriamo come ti sta.",
      tabUpload: "Carica foto", tabUrl: "Incolla URL",
      dropzone: "📷 Trascina una foto qui, o clicca per scegliere",
      urlPlaceholder: "https://esempio.com/tua-foto.jpg",
      submit: "Prova ora", close: "Chiudi",
      statusUploading: "Caricamento della foto…", statusSession: "Apertura sessione…",
      statusQueue: "Invio al camerino…", statusGenerating: "Generazione del look…",
      statusDone: "Fatto — ecco il risultato.", statusFailedPrefix: "Non riuscito: ",
      statusPrefix: "Stato: ", unknownError: "errore sconosciuto",
      errChoosePhoto: "Scegli prima una foto.", errPasteUrl: "Incolla prima un URL foto.",
      errUploadFailed: "Caricamento foto non riuscito.", errSession: "Impossibile avviare la sessione.",
      errQueue: "Impossibile mettere in coda.",
      statusWords: { initiated: "avviato", queued: "in coda", processing: "in elaborazione" }
    },
    ro: {
      tryItOn: "✨ Probează", modalTitle: "Vezi cum îți stă",
      modalSub: "Încarcă o poză și îți arătăm cum arată pe tine.",
      tabUpload: "Încarcă poză", tabUrl: "Lipește URL",
      dropzone: "📷 Trage o poză aici, sau apasă pentru a alege",
      urlPlaceholder: "https://exemplu.com/poza-ta.jpg",
      submit: "Probează acum", close: "Închide",
      statusUploading: "Se încarcă poza…", statusSession: "Se deschide sesiunea…",
      statusQueue: "Se trimite la cabina de probă…", statusGenerating: "Se generează look-ul…",
      statusDone: "Gata — iată rezultatul.", statusFailedPrefix: "Eșuat: ",
      statusPrefix: "Stare: ", unknownError: "eroare necunoscută",
      errChoosePhoto: "Alege mai întâi o poză.", errPasteUrl: "Lipește mai întâi un URL de poză.",
      errUploadFailed: "Încărcarea pozei a eșuat.", errSession: "Sesiunea nu a putut fi pornită.",
      errQueue: "Comanda nu a putut fi pusă în coadă.",
      statusWords: { initiated: "inițiat", queued: "în așteptare", processing: "se procesează" }
    },
    nl: {
      tryItOn: "✨ Pas het aan", modalTitle: "Bekijk het op jou",
      modalSub: "Upload een foto en we laten zien hoe het je staat.",
      tabUpload: "Foto uploaden", tabUrl: "URL plakken",
      dropzone: "📷 Sleep hier een foto, of klik om te kiezen",
      urlPlaceholder: "https://voorbeeld.com/jouw-foto.jpg",
      submit: "Nu passen", close: "Sluiten",
      statusUploading: "Foto wordt geüpload…", statusSession: "Sessie wordt gestart…",
      statusQueue: "Wordt naar de paskamer gestuurd…", statusGenerating: "Jouw look wordt gemaakt…",
      statusDone: "Klaar — hier is het resultaat.", statusFailedPrefix: "Mislukt: ",
      statusPrefix: "Status: ", unknownError: "onbekende fout",
      errChoosePhoto: "Kies eerst een foto.", errPasteUrl: "Plak eerst een foto-URL.",
      errUploadFailed: "Foto uploaden mislukt.", errSession: "Sessie kon niet worden gestart.",
      errQueue: "Taak kon niet in wachtrij worden gezet.",
      statusWords: { initiated: "gestart", queued: "in wachtrij", processing: "wordt verwerkt" }
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

    .modal h2 {
      font-size: 17px; font-weight: 600; margin: 0 0 4px; padding-right: 24px;
    }
    .modal .sub { color: ${DIM}; font-size: 12.5px; margin: 0 0 16px; }

    .mirror {
      border: 1px solid ${GOLD_DIM}; border-radius: 12px; padding: 8px;
      background: ${PANEL}; margin-bottom: 14px;
    }
    .mirror-frame {
      position: relative; border-radius: 8px; overflow: hidden;
      background: #000; aspect-ratio: 3/4;
    }
    .mirror-frame img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .scan-line {
      position: absolute; left: 0; right: 0; top: 0; height: 2px;
      background: linear-gradient(90deg, transparent, ${GOLD}, transparent);
      opacity: 0; pointer-events: none;
    }
    .mirror-frame.scanning .scan-line { opacity: 1; animation: scan 1.8s linear infinite; }
    @keyframes scan { 0% { top: 0%; } 100% { top: 100%; } }
    @media (prefers-reduced-motion: reduce) {
      .mirror-frame.scanning .scan-line { animation: none; opacity: .5; top: 50%; }
    }

    .product-caption { display: flex; justify-content: space-between; padding: 10px 4px 2px; }
    .product-caption .name { font-size: 13px; font-weight: 500; }
    .product-caption .price { font-size: 12.5px; color: ${GOLD}; }

    .tabs { display: flex; gap: 6px; margin-bottom: 10px; }
    .tab {
      flex: 1; padding: 8px; text-align: center; font-size: 11.5px;
      text-transform: uppercase; letter-spacing: .04em; color: ${DIM};
      border: 1px solid ${BORDER}; border-radius: 8px; cursor: pointer; background: transparent;
    }
    .tab.active { border-color: ${GOLD}; color: ${GOLD}; }
    .pane { display: none; }
    .pane.active { display: block; }

    .dropzone {
      border: 1px dashed ${BORDER}; border-radius: 10px; padding: 16px;
      text-align: center; cursor: pointer; font-size: 12.5px; color: ${DIM};
    }
    .dropzone:hover, .dropzone.drag { border-color: ${GOLD}; color: ${TEXT}; }
    .dropzone input { display: none; }
    .preview-thumb {
      margin-top: 8px; width: 100%; max-height: 120px; object-fit: cover;
      border-radius: 8px; display: none;
    }

    input[type=text] {
      width: 100%; background: ${PANEL}; border: 1px solid ${BORDER}; color: ${TEXT};
      border-radius: 8px; padding: 10px; font-size: 13px; font-family: inherit;
    }
    input[type=text]:focus { outline: 2px solid ${GOLD}; outline-offset: 1px; }

    .submit-btn {
      width: 100%; background: ${GOLD}; color: #161116; border: none;
      padding: 13px; border-radius: 999px; font-weight: 600; font-size: 13.5px;
      cursor: pointer; margin-top: 12px;
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
  `;

  function initWidget(container) {
    const backend = container.dataset.backend;
    const merchantKey = container.dataset.merchantKey;
    const productId = container.dataset.productId || "unknown-product";
    const productName = container.dataset.productName || "This item";
    const productPrice = container.dataset.productPrice || "";
    const productImage = container.dataset.productImage;
    const productCategory = container.dataset.productCategory || "apparel";

    if (!backend || !merchantKey || !productImage) {
      console.error("[ai-tryon-widget] missing required data-backend / data-merchant-key / data-product-image on", container);
      return;
    }

    const lang = resolveLang(container);
    const t = TRANSLATIONS[lang];

    const root = container.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    root.appendChild(style);

    const wrap = document.createElement("div");
    wrap.className = "wrap";
    wrap.innerHTML = `
      <button class="trigger" type="button">${t.tryItOn}</button>
      <div class="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="close-btn" type="button" aria-label="${t.close}">×</button>
          <h2>${t.modalTitle}</h2>
          <p class="sub">${t.modalSub}</p>

          <div class="mirror">
            <div class="mirror-frame">
              <div class="scan-line"></div>
              <img class="result-img" src="${productImage}" alt="${productName}">
            </div>
          </div>
          <div class="product-caption">
            <span class="name">${productName}</span>
            <span class="price">${productPrice}</span>
          </div>

          <div class="tabs">
            <button class="tab active" type="button" data-tab="file">${t.tabUpload}</button>
            <button class="tab" type="button" data-tab="url">${t.tabUrl}</button>
          </div>

          <div class="pane active" data-pane="file">
            <label class="dropzone">
              ${t.dropzone}
              <input type="file" accept="image/png,image/jpeg,image/webp">
            </label>
            <img class="preview-thumb" alt="">
          </div>
          <div class="pane" data-pane="url">
            <input type="text" class="user-photo-url" placeholder="${t.urlPlaceholder}">
          </div>

          <button class="submit-btn" type="button">${t.submit}</button>
          <div class="status"></div>
        </div>
      </div>
    `;
    root.appendChild(wrap);

    // ---- element refs ----
    const trigger = wrap.querySelector(".trigger");
    const overlay = wrap.querySelector(".overlay");
    const closeBtn = wrap.querySelector(".close-btn");
    const resultImg = wrap.querySelector(".result-img");
    const mirrorFrame = wrap.querySelector(".mirror-frame");
    const tabs = wrap.querySelectorAll(".tab");
    const panes = wrap.querySelectorAll(".pane");
    const dropzone = wrap.querySelector(".dropzone");
    const fileInput = wrap.querySelector('input[type=file]');
    const previewThumb = wrap.querySelector(".preview-thumb");
    const urlInput = wrap.querySelector(".user-photo-url");
    const submitBtn = wrap.querySelector(".submit-btn");
    const statusEl = wrap.querySelector(".status");

    trigger.onclick = () => overlay.classList.add("open");
    closeBtn.onclick = () => overlay.classList.remove("open");
    overlay.onclick = (e) => { if (e.target === overlay) overlay.classList.remove("open"); };

    tabs.forEach(tab => {
      tab.onclick = () => {
        tabs.forEach(t => t.classList.remove("active"));
        panes.forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        wrap.querySelector(`[data-pane="${tab.dataset.tab}"]`).classList.add("active");
      };
    });

    ["dragover", "dragenter"].forEach(evt =>
      dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.add("drag"); })
    );
    ["dragleave", "drop"].forEach(evt =>
      dropzone.addEventListener(evt, e => { e.preventDefault(); dropzone.classList.remove("drag"); })
    );
    dropzone.addEventListener("drop", e => {
      if (e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event("change"));
      }
    });
    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        previewThumb.src = URL.createObjectURL(file);
        previewThumb.style.display = "block";
        urlInput.value = "";
      }
    });

    function setStatus(text, kind) {
      statusEl.className = "status show" + (kind ? " " + kind : "");
      statusEl.textContent = text;
    }
    function resetStatus() {
      statusEl.className = "status";
      statusEl.textContent = "";
    }

    async function uploadImage(file) {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${backend}/api/v1/tryon/upload-photo`, {
        method: "POST",
        headers: { "X-Merchant-API-Key": merchantKey },
        body: formData
      });
      if (!res.ok) throw new Error(t.errUploadFailed);
      const data = await res.json();
      return data.imageUrl;
    }

    async function resolveUserPhotoUrl() {
      const activeTab = wrap.querySelector(".tab.active").dataset.tab;
      if (activeTab === "file") {
        if (!fileInput.files[0]) throw new Error(t.errChoosePhoto);
        return await uploadImage(fileInput.files[0]);
      }
      const url = urlInput.value.trim();
      if (!url) throw new Error(t.errPasteUrl);
      return url;
    }

    submitBtn.onclick = async () => {
      submitBtn.disabled = true;
      resetStatus();
      setStatus(t.statusUploading, "pending");

      try {
        const userImageUrl = await resolveUserPhotoUrl();

        setStatus(t.statusSession, "pending");
        const initRes = await fetch(`${backend}/api/v1/tryon/init`, {
          method: "POST",
          headers: { "X-Merchant-API-Key": merchantKey, "Content-Type": "application/json" },
          body: JSON.stringify({ garmentId: productId, category: productCategory })
        });
        if (!initRes.ok) throw new Error(t.errSession);
        const { sessionId } = await initRes.json();

        setStatus(t.statusQueue, "pending");
        const processRes = await fetch(`${backend}/api/v1/tryon/process`, {
          method: "POST",
          headers: { "X-Merchant-API-Key": merchantKey, "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, garmentImageUrl: productImage, userImageUrl })
        });
        if (!processRes.ok) throw new Error(t.errQueue);

        mirrorFrame.classList.add("scanning");
        setStatus(t.statusGenerating, "pending");
        pollStatus(sessionId);

      } catch (err) {
        setStatus(err.message, "err");
        submitBtn.disabled = false;
      }
    };

    function pollStatus(sessionId) {
      const interval = setInterval(async () => {
        try {
          const res = await fetch(`${backend}/api/v1/tryon/status/${sessionId}`, {
            headers: { "X-Merchant-API-Key": merchantKey }
          });
          const data = await res.json();

          if (data.status === "completed") {
            clearInterval(interval);
            mirrorFrame.classList.remove("scanning");
            resultImg.src = data.resultImageUrl;
            setStatus(t.statusDone, "ok");
            submitBtn.disabled = false;
          } else if (data.status === "failed") {
            clearInterval(interval);
            mirrorFrame.classList.remove("scanning");
            setStatus(t.statusFailedPrefix + (data.errorReason || t.unknownError), "err");
            submitBtn.disabled = false;
          } else {
            const word = t.statusWords[data.status] || data.status;
            setStatus(t.statusPrefix + word + "…", "pending");
          }
        } catch (e) {
          // transient network hiccup while polling — keep trying silently
        }
      }, 3000);
    }
  }

  function init() {
    document.querySelectorAll(".ai-tryon-widget").forEach(el => {
      if (el.dataset.tryonInitialized) return;
      el.dataset.tryonInitialized = "true";
      initWidget(el);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // Exposed so pages that swap products dynamically (e.g. a product
  // carousel) can re-scan for newly-added .ai-tryon-widget elements
  // without needing a full page reload.
  window.reinitAiTryonWidgets = init;
})();
