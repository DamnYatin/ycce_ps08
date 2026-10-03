/**
 * File: seller.js
 * Purpose: Logic for Seller Marketplace Dashboard (/marketplace/seller).
 * Features:
 *   - Multilingual support (English, Hindi, Marathi)
 *   - Populates crop dropdown from GET /api/crops
 *   - Comprehensive client-side validation mirroring server rules
 *   - Double-submit prevention during in-flight requests
 *   - Deal creation via POST /api/deals
 *   - Loads seller's listings via GET /api/deals/farmer?phone=...
 *   - Instant in-place Mark Sold via PATCH /api/deals/:id/sold
 *   - Accessible Delete confirmation flow via DELETE /api/deals/:id
 *   - Responsive UI states: Loading skeletons, Empty CTA, Inline error banners & Toasts
 */

// ==========================================
// 1. Multilingual Localization Dictionary
// ==========================================
const sellerTranslations = {
  en: {
    appTitle: "KrishiMitra",
    sellerHeaderSubtitle: "Seller Direct Marketplace",
    switchRoleLink: "🔄 Switch Role",
    switchRoleText: "Switch Role",
    buyerMarketBtn: "🛒 Buyer Market",
    marketplaceNav: "Marketplace",
    listDealTitle: "📢 List Your Deal — Sell Directly to Buyers",
    spamProtected: "🛡️ Spam-Protected",
    listDealDesc: "Prefer selling directly to verified traders without mandi intermediaries? List your harvest here. Your phone number stays hidden until genuine buyers express interest.",
    labelFarmerName: "👤 Your Name",
    placeholderFarmerName: "e.g. Ramesh Patil",
    labelFarmerPhone: "📞 Phone Number",
    placeholderFarmerPhone: "10-digit mobile number",
    labelCrop: "🌱 Crop",
    selectCropPrompt: "Select crop to sell...",
    labelQuantity: "⚖️ Quantity (Quintals)",
    placeholderQuantity: "e.g. 25",
    labelPrice: "💰 Asking Price (₹ / quintal)",
    placeholderPrice: "e.g. 7200",
    labelLocation: "📍 Your Location",
    placeholderLocation: "e.g. Nagpur / Wardha Road",
    postDealBtn: "🚀 Post Deal to Buyer Marketplace",
    postingDeal: "⏳ Posting Deal Live...",
    activeListingsTitle: "📋 My Active Deal Listings",
    openBuyerMarketBtn: "🛒 Open Buyer Market",
    backToEstimator: "⬅️ Check Another Crop",
    switchRoleBottom: "🔄 Switch Role (Seller / Buyer)",
    viewBuyerMarketBottom: "🛒 View Buyer Marketplace",
    confirmDeleteTitle: "🗑️ Confirm Listing Removal",
    confirmDeletePrompt: "Are you sure you want to remove this deal listing? Genuine buyers will no longer be able to submit inquiries for this lot.",
    cancelBtn: "Cancel",
    deleteListingBtn: "Delete Listing",
    markSoldBtn: "✅ Mark Sold",
    deleteBtn: "🗑️ Delete",
    inquiriesReceived: "Buyer Inquiries Received",
    noDealsTitle: "No Active Direct-Sale Listings",
    noDealsDesc: "You have not listed any crops yet. Complete the form above to post your harvest directly to registered buyers!",
    loadingListings: "Fetching your active listings...",
    loadError: "Failed to load listings. Please check your connection.",
    retryBtn: "Retry",
    errNameRequired: "Please enter your name.",
    errPhoneInvalid: "Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).",
    errCropRequired: "Please select a crop.",
    errQuantityInvalid: "Quantity must be greater than 0 quintals.",
    errPriceInvalid: "Asking price must be greater than ₹0 per quintal.",
    errLocationRequired: "Please enter your village or mandi location.",
    dealPostedSuccess: "🎉 Deal listed live on Buyer Marketplace!",
    dealSoldSuccess: "✅ Deal marked as sold successfully!",
    dealDeletedSuccess: "🗑️ Deal listing removed successfully.",
    networkError: "⚠️ Network error. Please try again."
  },
  hi: {
    appTitle: "कृषिमित्र",
    sellerHeaderSubtitle: "किसान सीधा-बिक्री बाजार",
    switchRoleLink: "🔄 भूमिका बदलें",
    switchRoleText: "भूमिका बदलें",
    buyerMarketBtn: "🛒 खरीदार बाजार",
    marketplaceNav: "मार्केटप्लेस",
    listDealTitle: "📢 अपना सौदा सूचीबद्ध करें — खरीदारों को सीधे बेचें",
    spamProtected: "🛡️ स्पैम-सुरक्षित",
    listDealDesc: "मंडी बिचौलियों के बिना सीधे सत्यापित व्यापारियों को बेचना चाहते हैं? अपनी फसल यहाँ सूचीबद्ध करें। आपका फोन नंबर केवल वास्तविक खरीदारों को ही दिखेगा।",
    labelFarmerName: "👤 आपका नाम",
    placeholderFarmerName: "उदा. रमेश पाटिल",
    labelFarmerPhone: "📞 मोबाइल नंबर",
    placeholderFarmerPhone: "10 अंकों का मोबाइल नंबर",
    labelCrop: "🌱 फसल",
    selectCropPrompt: "बिक्री के लिए फसल चुनें...",
    labelQuantity: "⚖️ मात्रा (क्विंटल)",
    placeholderQuantity: "उदा. 25",
    labelPrice: "💰 अपेक्षित भाव (₹ / क्विंटल)",
    placeholderPrice: "उदा. 7200",
    labelLocation: "📍 आपका स्थान / गाँव",
    placeholderLocation: "उदा. नागपुर / वर्धा रोड",
    postDealBtn: "🚀 खरीदार बाजार में सौदा पोस्ट करें",
    postingDeal: "⏳ सौदा पोस्ट हो रहा है...",
    activeListingsTitle: "📋 मेरी सक्रिय फसल सूचियाँ",
    openBuyerMarketBtn: "🛒 खरीदार बाजार खोलें",
    backToEstimator: "⬅️ दूसरी फसल जांचें",
    switchRoleBottom: "🔄 भूमिका बदलें (विक्रेता / खरीदार)",
    viewBuyerMarketBottom: "🛒 खरीदार बाजार देखें",
    confirmDeleteTitle: "🗑️ सूची हटाने की पुष्टि करें",
    confirmDeletePrompt: "क्या आप वाकई इस फसल सौदे को हटाना चाहते हैं? खरीदार इसके लिए आगे पूछताछ नहीं कर सकेंगे।",
    cancelBtn: "रद्द करें",
    deleteListingBtn: "सूची हटाएं",
    markSoldBtn: "✅ बिका हुआ दर्ज करें",
    deleteBtn: "🗑️ हटाएं",
    inquiriesReceived: "खरीदार पूछताछ प्राप्त हुई",
    noDealsTitle: "कोई सक्रिय सौदा सूची नहीं",
    noDealsDesc: "आपने अभी तक कोई फसल सूचीबद्ध नहीं की है। खरीदारों तक सीधे पहुँचने के लिए ऊपर दिया गया फ़ॉर्म भरें!",
    loadingListings: "आपकी सूचियाँ लोड की जा रही हैं...",
    loadError: "सूचियाँ लोड करने में विफल। कृपया पुनः प्रयास करें।",
    retryBtn: "पुनः प्रयास करें",
    errNameRequired: "कृपया अपना नाम दर्ज करें।",
    errPhoneInvalid: "कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें (6, 7, 8 या 9 से शुरू)।",
    errCropRequired: "कृपया फसल का चयन करें।",
    errQuantityInvalid: "मात्रा 0 क्विंटल से अधिक होनी चाहिए।",
    errPriceInvalid: "अपेक्षित भाव ₹0 से अधिक होना चाहिए।",
    errLocationRequired: "कृपया अपना गाँव या स्थान दर्ज करें।",
    dealPostedSuccess: "🎉 सौदा खरीदार बाजार में लाइव सूचीबद्ध हो गया!",
    dealSoldSuccess: "✅ सौदा सफलतापूर्वक बिका हुआ दर्ज किया गया!",
    dealDeletedSuccess: "🗑️ फसल सौदा सूची सफलतापूर्वक हटा दी गई।",
    networkError: "⚠️ नेटवर्क त्रुटि। कृपया पुनः प्रयास करें।"
  },
  mr: {
    appTitle: "कृषि मित्र",
    sellerHeaderSubtitle: "शेतकरी थेट विक्री बाजारपेठ",
    switchRoleLink: "🔄 भूमिका बदला",
    switchRoleText: "भूमिका बदला",
    buyerMarketBtn: "🛒 खरेदीदार बाजार",
    marketplaceNav: "मार्केटप्लेस",
    listDealTitle: "📢 आपला माल नोंदवा — खरेदीदारांना थेट विका",
    spamProtected: "🛡️ स्पॅम-संरक्षित",
    listDealDesc: "मध्यस्थांशिवाय थेट पडताळणी केलेल्या व्यापाऱ्यांना माल विकू इच्छिता? आपला शेतमाल येथे नोंदवा. आपला फोन नंबर फक्त इच्छुक खरेदीदारांनाच दिसेल.",
    labelFarmerName: "👤 आपले नाव",
    placeholderFarmerName: "उदा. रमेश पाटील",
    labelFarmerPhone: "📞 मोबाईल नंबर",
    placeholderFarmerPhone: "१० अंकी मोबाईल नंबर",
    labelCrop: "🌱 पीक",
    selectCropPrompt: "विक्रीसाठी पीक निवडा...",
    labelQuantity: "⚖️ प्रमाण (क्विंटल)",
    placeholderQuantity: "उदा. २५",
    labelPrice: "💰 अपेक्षित दर (₹ / क्विंटल)",
    placeholderPrice: "उदा. ७२००",
    labelLocation: "📍 आपले ठिकाण / गाव",
    placeholderLocation: "उदा. नागपूर / वर्धा रोड",
    postDealBtn: "🚀 खरेदीदार बाजारात माल नोंदवा",
    postingDeal: "⏳ माल नोंदवला जात आहे...",
    activeListingsTitle: "📋 माझी चालू शेतमाल यादी",
    openBuyerMarketBtn: "🛒 खरेदीदार बाजार पहा",
    backToEstimator: "⬅️ इतर पीक तपासा",
    switchRoleBottom: "🔄 भूमिका बदला (विक्रेता / खरेदीदार)",
    viewBuyerMarketBottom: "🛒 खरेदीदार बाजार पहा",
    confirmDeleteTitle: "🗑️ शेतमाल काढण्याची खात्री करा",
    confirmDeletePrompt: "आपण नक्की ही शेतमाल नोंद काढू इच्छिता का? खरेदीदार या लॉटसाठी नवीन चौकशी करू शकणार नाहीत.",
    cancelBtn: "रद्द करा",
    deleteListingBtn: "नोंद काढा",
    markSoldBtn: "✅ विकले गेले",
    deleteBtn: "🗑️ काढा",
    inquiriesReceived: "खरेदीदार चौकशी प्राप्त",
    noDealsTitle: "चालू शेतमाल यादी उपलब्ध नाही",
    noDealsDesc: "आपण अजून कोणताही शेतमाल नोंदवला नाही. खरेदीदारांना थेट विकण्यासाठी वरील अर्ज भरा!",
    loadingListings: "आपली शेतमाल यादी लोड होत आहे...",
    loadError: "यादी लोड करण्यात अडचण आली. कृपया पुन्हा प्रयत्न करा.",
    retryBtn: "पुन्हा प्रयत्न करा",
    errNameRequired: "कृपया आपले नाव प्रविष्ट करा.",
    errPhoneInvalid: "कृपया १० अंकी वैध मोबाईल नंबर टाका (६, ७, ८ किंवा ९ ने सुरू होणारा).",
    errCropRequired: "कृपया पीक निवडा.",
    errQuantityInvalid: "प्रमाण ० क्विंटलपेक्षा जास्त असावे.",
    errPriceInvalid: "अपेक्षित दर ₹० पेक्षा जास्त असावा.",
    errLocationRequired: "कृपया आपले गाव किंवा ठिकाण प्रविष्ट करा.",
    dealPostedSuccess: "🎉 माल खरेदीदार बाजारात यशस्वीरित्या नोंदवला गेला!",
    dealSoldSuccess: "✅ माल विकला गेल्याची नोंद झाली!",
    dealDeletedSuccess: "🗑️ शेतमाल नोंद यशस्वीरित्या काढण्यात आली.",
    networkError: "⚠️ नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा."
  }
};

let currentLang = localStorage.getItem("krishimitra_lang") || "en";
let pendingDeleteDealId = null;
let isSubmitting = false;

// ==========================================
// 2. Localization Helpers
// ==========================================
function t(key) {
  const dict = sellerTranslations[currentLang] || sellerTranslations.en;
  return dict[key] || sellerTranslations.en[key] || key;
}

function setLanguage(lang) {
  if (!sellerTranslations[lang]) lang = "en";
  currentLang = lang;
  localStorage.setItem("krishimitra_lang", lang);

  const dict = sellerTranslations[lang];

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (dict[key]) el.textContent = dict[key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (dict[key]) el.placeholder = dict[key];
  });

  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
}

// ==========================================
// 3. UI Notifications & Skeletons
// ==========================================
function showToast(message, isError = false) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  if (isError) {
    toast.style.background = "#991b1b";
    toast.style.border = "1px solid #f87171";
  }
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showBanner(message, type = "success") {
  const banner = document.getElementById("sellerFeedbackBanner");
  const msgEl = document.getElementById("sellerFeedbackMessage");
  if (!banner || !msgEl) return;

  banner.className = `seller-feedback-banner ${type}`;
  msgEl.textContent = message;
  banner.style.display = "flex";

  if (type === "success") {
    setTimeout(() => {
      banner.style.display = "none";
    }, 5000);
  }
}

function clearBanner() {
  const banner = document.getElementById("sellerFeedbackBanner");
  if (banner) banner.style.display = "none";
}

// ==========================================
// 4. Crop Dropdown Loader
// ==========================================
async function loadCrops() {
  const select = document.getElementById("dealCropSelect");
  if (!select) return;

  try {
    const res = await fetch("/api/crops");
    const data = await res.json();
    if (data.status === "success" && Array.isArray(data.crops)) {
      // Keep placeholder
      select.innerHTML = `<option value="" disabled selected>${t("selectCropPrompt")}</option>`;
      data.crops.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = `${c.name} (${c.marathi_name || c.hindi_name || ""})`;
        select.appendChild(opt);
      });
    }
  } catch (err) {
    console.error("Failed to load crops:", err);
  }
}

// ==========================================
// 5. Validation Rules
// ==========================================
function validateField(fieldId, errorId, validatorFn, errorKey) {
  const field = document.getElementById(fieldId);
  const errorEl = document.getElementById(errorId);
  if (!field || !errorEl) return true;

  const isValid = validatorFn(field.value.trim());
  if (!isValid) {
    errorEl.textContent = t(errorKey);
    errorEl.style.display = "block";
    field.setAttribute("aria-invalid", "true");
    field.style.borderColor = "#dc2626";
    return false;
  } else {
    errorEl.style.display = "none";
    field.removeAttribute("aria-invalid");
    field.style.borderColor = "";
    return true;
  }
}

function validatePostDealForm() {
  let valid = true;

  // Name
  if (!validateField("dealFarmerName", "farmerNameError", v => v.length >= 2, "errNameRequired")) valid = false;

  // Phone (10-digit Indian number)
  if (!validateField("dealFarmerPhone", "farmerPhoneError", v => /^[6-9]\d{9}$/.test(v), "errPhoneInvalid")) valid = false;

  // Crop
  if (!validateField("dealCropSelect", "cropError", v => v !== "", "errCropRequired")) valid = false;

  // Quantity
  if (!validateField("dealQuantity", "quantityError", v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "errQuantityInvalid")) valid = false;

  // Asking price
  if (!validateField("dealAskingPrice", "priceError", v => !isNaN(parseFloat(v)) && parseFloat(v) > 0, "errPriceInvalid")) valid = false;

  // Location
  if (!validateField("dealLocation", "locationError", v => v.length >= 2, "errLocationRequired")) valid = false;

  return valid;
}

// Clear individual errors on input
["dealFarmerName", "dealFarmerPhone", "dealCropSelect", "dealQuantity", "dealAskingPrice", "dealLocation"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("input", () => {
      const errEl = document.getElementById(id.replace("deal", "").toLowerCase() + "Error") ||
                    document.getElementById(id.replace("deal", "").charAt(0).toLowerCase() + id.slice(5) + "Error");
      if (errEl) errEl.style.display = "none";
      el.style.borderColor = "";
    });
  }
});

// ==========================================
// 6. Post Deal Handler
// ==========================================
async function handlePostDeal(e) {
  e.preventDefault();
  if (isSubmitting) return;

  clearBanner();
  if (!validatePostDealForm()) {
    showToast(t("errNameRequired") + " " + t("errPhoneInvalid"), true);
    return;
  }

  const farmerName = document.getElementById("dealFarmerName").value.trim();
  const farmerPhone = document.getElementById("dealFarmerPhone").value.trim();
  const cropId = document.getElementById("dealCropSelect").value;
  const quantity = parseFloat(document.getElementById("dealQuantity").value);
  const askingPrice = parseFloat(document.getElementById("dealAskingPrice").value);
  const location = document.getElementById("dealLocation").value.trim();
  const mandiId = document.getElementById("dealMandiId")?.value || null;

  const submitBtn = document.getElementById("sellerPostSubmitBtn");
  const submitText = document.getElementById("sellerSubmitBtnText");

  isSubmitting = true;
  if (submitBtn) submitBtn.disabled = true;
  if (submitText) submitText.textContent = t("postingDeal");

  try {
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        farmer_name: farmerName,
        farmer_phone: farmerPhone,
        crop_id: cropId,
        quantity_quintal: quantity,
        price_per_quintal: askingPrice,
        location_name: location,
        mandi_id: mandiId ? parseInt(mandiId) : null
      })
    });

    const data = await res.json();
    if (data.status === "success") {
      showToast(t("dealPostedSuccess"));
      showBanner(t("dealPostedSuccess"), "success");
      // Retain phone & name in localStorage for future convenience
      localStorage.setItem("krishimitra_farmer_phone", farmerPhone);
      localStorage.setItem("krishimitra_farmer_name", farmerName);

      // Reset transaction-specific inputs
      document.getElementById("dealQuantity").value = "";
      document.getElementById("dealAskingPrice").value = "";

      // Refresh listings
      loadFarmerDeals(farmerPhone);
    } else {
      const errMsg = "⚠️ " + (data.message || "Failed to post deal.");
      showToast(errMsg, true);
      showBanner(errMsg, "error");
    }
  } catch (err) {
    console.error("Deal post error:", err);
    showToast(t("networkError"), true);
    showBanner(t("networkError") + " <button onclick='handlePostDeal(event)' class='btn btn-outline' style='min-height:28px; padding:2px 8px; font-size:0.75rem; margin-left:8px; border-color:#dc2626; color:#991b1b;'>" + t("retryBtn") + "</button>", "error");
  } finally {
    isSubmitting = false;
    if (submitBtn) submitBtn.disabled = false;
    if (submitText) submitText.textContent = t("postDealBtn");
  }
}

// ==========================================
// 7. Load Active Listings
// ==========================================
async function loadFarmerDeals(overridePhone) {
  const container = document.getElementById("sellerDealsContainer");
  if (!container) return;

  const phoneInput = document.getElementById("dealFarmerPhone");
  const phone = overridePhone || (phoneInput ? phoneInput.value.trim() : "") || localStorage.getItem("krishimitra_farmer_phone") || "";

  // Render Skeleton while loading
  container.innerHTML = `
    <div class="deal-skeleton"></div>
    <div class="deal-skeleton"></div>
  `;

  const url = phone ? `/api/deals/farmer?phone=${encodeURIComponent(phone)}` : "/api/deals/farmer";

  try {
    const res = await fetch(url);
    const result = await res.json();

    if (result.status === "success" && Array.isArray(result.deals) && result.deals.length > 0) {
      container.innerHTML = "";
      result.deals.forEach(deal => {
        const isSold = deal.status === "sold";
        const card = document.createElement("article");
        card.id = `dealCard-${deal.id}`;
        card.style.cssText = `
          background: ${isSold ? "#f8fafc" : "#ffffff"};
          border: 1.5px solid ${isSold ? "#cbd5e1" : "rgba(22, 101, 52, 0.2)"};
          border-radius: var(--radius-md);
          padding: 1rem 1.15rem;
          margin-bottom: 0.85rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
          transition: all 0.2s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        `;

        const postedDate = deal.posted_at ? deal.posted_at.split(" ")[0] : "Recently";

        card.innerHTML = `
          <div style="flex: 1; min-width: 240px;">
            <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
              <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-main);">
                ${deal.crop_name} — <strong>₹${deal.price_per_quintal.toLocaleString()} / qtl</strong>
              </span>
              <span style="font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-full); background: ${isSold ? '#e2e8f0' : '#dcfce7'}; color: ${isSold ? '#475569' : '#166534'};">
                ${deal.status.toUpperCase()}
              </span>
            </div>

            <div style="font-size: 0.84rem; color: var(--text-muted); margin-top: 4px; display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <span>⚖️ ${deal.quantity_quintal} qtl</span> &bull; 
              <span>📍 ${deal.location_name}</span> &bull; 
              <span>🕒 ${postedDate}</span>
            </div>

            <div style="margin-top: 6px; font-size: 0.88rem; font-weight: 700; color: #0284c7;">
              💬 ${deal.inquiry_count} ${t("inquiriesReceived")}
            </div>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
            ${!isSold ? `
              <button type="button" class="btn btn-outline" style="min-height:36px; padding:4px 12px; font-size:0.82rem; width:auto; border-color:#16a34a; color:#166534;" onclick="handleMarkSold(${deal.id})">
                ${t("markSoldBtn")}
              </button>
            ` : ''}
            <button type="button" class="btn btn-outline" style="min-height:36px; padding:4px 12px; font-size:0.82rem; width:auto; border-color:#f87171; color:#b91c1c;" onclick="promptDeleteDeal(${deal.id})">
              ${t("deleteBtn")}
            </button>
          </div>
        `;
        container.appendChild(card);
      });
    } else {
      container.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted); background: #f8fafc; border-radius: var(--radius-md); border: 1.5px dashed #cbd5e1;">
          <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🌾</div>
          <h4 style="font-size: 1.05rem; font-weight: 800; color: var(--text-main); margin-bottom: 0.35rem;">
            ${t("noDealsTitle")}
          </h4>
          <p style="font-size: 0.88rem; max-width: 480px; margin: 0 auto;">
            ${t("noDealsDesc")}
          </p>
        </div>
      `;
    }
  } catch (err) {
    console.error("Listing fetch error:", err);
    container.innerHTML = `
      <div style="text-align: center; padding: 1.5rem; color: #b91c1c; background: #fef2f2; border-radius: var(--radius-md);">
        <p style="font-weight: 700; margin-bottom: 0.5rem;">${t("loadError")}</p>
        <button onclick="loadFarmerDeals()" class="btn btn-outline" style="min-height: 32px; padding: 2px 12px; font-size: 0.82rem; width: auto; border-color: #dc2626; color: #b91c1c;">
          ${t("retryBtn")}
        </button>
      </div>
    `;
  }
}

// ==========================================
// 8. Mark as Sold & Delete Flow
// ==========================================
window.handleMarkSold = async function(dealId) {
  try {
    const res = await fetch(`/api/deals/${dealId}/sold`, { method: "PATCH" });
    const data = await res.json();
    if (data.status === "success") {
      showToast(t("dealSoldSuccess"));
      showBanner(t("dealSoldSuccess"), "success");
      loadFarmerDeals();
    } else {
      showToast("⚠️ " + (data.message || "Could not update deal."), true);
    }
  } catch (e) {
    console.error("Sold error:", e);
    showToast(t("networkError"), true);
  }
};

window.promptDeleteDeal = function(dealId) {
  pendingDeleteDealId = dealId;
  const modal = document.getElementById("deleteConfirmModal");
  if (modal) {
    modal.style.display = "flex";
  }
};

window.confirmDelete = async function() {
  if (!pendingDeleteDealId) return;
  const dealId = pendingDeleteDealId;
  pendingDeleteDealId = null;

  const modal = document.getElementById("deleteConfirmModal");
  if (modal) modal.style.display = "none";

  try {
    const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
    const data = await res.json();
    if (data.status === "success") {
      showToast(t("dealDeletedSuccess"));
      showBanner(t("dealDeletedSuccess"), "success");
      // Instant in-place card removal or refresh
      const el = document.getElementById(`dealCard-${dealId}`);
      if (el) el.remove();
      loadFarmerDeals();
    } else {
      showToast("⚠️ " + (data.message || "Could not delete deal."), true);
    }
  } catch (e) {
    console.error("Delete error:", e);
    showToast(t("networkError"), true);
  }
};

// ==========================================
// 9. Page Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  // Multilingual toggle buttons
  document.querySelectorAll(".lang-btn").forEach(btn => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  // Deal Form Submit
  const dealForm = document.getElementById("sellerPostDealForm");
  if (dealForm) dealForm.addEventListener("submit", handlePostDeal);

  // Phone input listener to auto-refresh listings when phone changes
  const phoneInput = document.getElementById("dealFarmerPhone");
  if (phoneInput) {
    // Populate stored phone if available
    const storedPhone = localStorage.getItem("krishimitra_farmer_phone");
    if (storedPhone) {
      phoneInput.value = storedPhone;
    }
    const storedName = localStorage.getItem("krishimitra_farmer_name");
    const nameInput = document.getElementById("dealFarmerName");
    if (storedName && nameInput) {
      nameInput.value = storedName;
    }

    phoneInput.addEventListener("blur", () => {
      if (/^[6-9]\d{9}$/.test(phoneInput.value.trim())) {
        loadFarmerDeals(phoneInput.value.trim());
      }
    });
  }

  // Delete modal buttons
  document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => {
    pendingDeleteDealId = null;
    const modal = document.getElementById("deleteConfirmModal");
    if (modal) modal.style.display = "none";
  });
  document.getElementById("confirmDeleteBtn")?.addEventListener("click", confirmDelete);

  // Banner dismiss
  document.getElementById("sellerFeedbackDismiss")?.addEventListener("click", clearBanner);

  // Set initial language & load data
  setLanguage(currentLang);
  loadCrops().then(() => {
    loadFarmerDeals();
  });
});
