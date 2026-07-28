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
 *        data-product-image="https://cdn.yourstore.com/hoodie.jpg">
 *   </div>
 *   <script src="https://your-cdn.com/widget.js" defer></script>
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

  const GOLD = "#C6A664";
  const GOLD_DIM = "#8B7A52";
  const BG = "#0D0C0F";
  const PANEL = "#17151A";
  const BORDER = "#2A272E";
  const TEXT = "#F2EFE9";
  const DIM = "#9A968D";
  const SUCCESS = "#6E9C7D";
  const RUST = "#A85C48";

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
    .trigger:hover { background: #D6B678; }

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
    .submit-btn:hover { background: #D6B678; }
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

    if (!backend || !merchantKey || !productImage) {
      console.error("[ai-tryon-widget] missing required data-backend / data-merchant-key / data-product-image on", container);
      return;
    }

    const root = container.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = STYLE;
    root.appendChild(style);

    const wrap = document.createElement("div");
    wrap.className = "wrap";
    wrap.innerHTML = `
      <button class="trigger" type="button">✨ Try It On</button>
      <div class="overlay">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="close-btn" type="button" aria-label="Close">×</button>
          <h2>See it on you</h2>
          <p class="sub">Upload a photo and we'll show you wearing it.</p>

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
            <button class="tab active" type="button" data-tab="file">Upload photo</button>
            <button class="tab" type="button" data-tab="url">Paste URL</button>
          </div>

          <div class="pane active" data-pane="file">
            <label class="dropzone">
              📷 Drop a photo here, or click to choose
              <input type="file" accept="image/png,image/jpeg,image/webp">
            </label>
            <img class="preview-thumb" alt="">
          </div>
          <div class="pane" data-pane="url">
            <input type="text" class="user-photo-url" placeholder="https://example.com/your-photo.jpg">
          </div>

          <button class="submit-btn" type="button">Try it on</button>
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
      if (!res.ok) throw new Error("Photo upload failed.");
      const data = await res.json();
      return data.imageUrl;
    }

    async function resolveUserPhotoUrl() {
      const activeTab = wrap.querySelector(".tab.active").dataset.tab;
      if (activeTab === "file") {
        if (!fileInput.files[0]) throw new Error("Choose a photo first.");
        return await uploadImage(fileInput.files[0]);
      }
      const url = urlInput.value.trim();
      if (!url) throw new Error("Paste a photo URL first.");
      return url;
    }

    submitBtn.onclick = async () => {
      submitBtn.disabled = true;
      resetStatus();
      setStatus("Uploading your photo…", "pending");

      try {
        const userImageUrl = await resolveUserPhotoUrl();

        setStatus("Opening a session…", "pending");
        const initRes = await fetch(`${backend}/api/v1/tryon/init`, {
          method: "POST",
          headers: { "X-Merchant-API-Key": merchantKey, "Content-Type": "application/json" },
          body: JSON.stringify({ garmentId: productId })
        });
        if (!initRes.ok) throw new Error("Could not start a session.");
        const { sessionId } = await initRes.json();

        setStatus("Sending it to the fitting room…", "pending");
        const processRes = await fetch(`${backend}/api/v1/tryon/process`, {
          method: "POST",
          headers: { "X-Merchant-API-Key": merchantKey, "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, garmentImageUrl: productImage, userImageUrl })
        });
        if (!processRes.ok) throw new Error("Could not queue the job.");

        mirrorFrame.classList.add("scanning");
        setStatus("Generating your look…", "pending");
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
            setStatus("Done — here's the look.", "ok");
            submitBtn.disabled = false;
          } else if (data.status === "failed") {
            clearInterval(interval);
            mirrorFrame.classList.remove("scanning");
            setStatus("Failed: " + (data.errorReason || "unknown error"), "err");
            submitBtn.disabled = false;
          } else {
            setStatus("Status: " + data.status + "…", "pending");
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
})();
