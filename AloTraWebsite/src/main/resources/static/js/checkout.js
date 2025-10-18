"use strict";

const contextPath = "/alotra-website";
const fmt = v => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v ?? 0);

let selectedAddressId = null;
let selectedBranchId = null;
let selectedCarrierId = null;
let couponCode = null;
let subtotal = 0;
let discount = 0;
let shippingFee = 0;
let cartItems = [];

document.addEventListener("DOMContentLoaded", async () => {
    await loadCheckoutItems();
    await loadAddresses();
    await loadBranches();
    await loadCarriers();

    document.getElementById("apply-coupon-btn").onclick = applyCoupon;
    document.getElementById("btn-confirm-order").onclick = confirmOrder;
    document.getElementById("branch-select").onchange = handleBranchChange;
    document.getElementById("carrier-select").onchange = handleCarrierChange;
    document.getElementById("btn-add-address").onclick = showAddAddressModal;
    document.getElementById("btn-save-address").onclick = saveNewAddress;
});

// 🌀 Vòng tròn loading toàn trang
function showLoading() {
    let overlay = document.getElementById("loading-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "loading-overlay";
        overlay.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        const style = document.createElement("style");
        style.innerHTML = `
            #loading-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255, 255, 255, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 2000;
            }
        `;
        document.head.appendChild(style);
    }
    overlay.style.display = "flex";
}

function hideLoading() {
    const overlay = document.getElementById("loading-overlay");
    if (overlay) overlay.style.display = "none";
}

// 🧭 Hàm gọi API chung
async function api(url, method = 'GET', data) {
    const opt = { method, headers: { 'Content-Type': 'application/json' } };
    if (data) opt.body = JSON.stringify(data);
    const res = await fetch(contextPath + url, opt);
    if (!res.ok) throw new Error(`❌ Lỗi API: ${url}`);
    return res.json();
}

// 🛒 Load sản phẩm checkout
async function loadCheckoutItems() {
    const ids = JSON.parse(localStorage.getItem("checkoutItems") || "[]");
    if (ids.length === 0) {
        document.getElementById("checkout-item-list").innerHTML =
            `<div class="alert alert-warning">Không có sản phẩm nào để thanh toán</div>`;
        return;
    }

    cartItems = await api("/api/orders/cart-items/by-ids", "POST", ids);
    subtotal = cartItems.reduce((sum, it) => sum + ((it.unitPrice + it.toppingTotalEach) * it.quantity), 0);
    renderCheckoutItems();
    updateSummary();
}

// 🧋 Render danh sách item
function renderCheckoutItems() {
    const list = document.getElementById("checkout-item-list");
    list.innerHTML = cartItems.map(it => {
        const toppingHtml = it.toppings?.length
            ? `<div class="small text-muted">
                   Topping: ${it.toppings.map(t => `${t.name} (${fmt(t.price)})`).join(", ")}
               </div>` : "";
        const noteHtml = it.note ? `<div class="small text-info">Ghi chú: ${it.note}</div>` : "";
        return `
            <div class="d-flex justify-content-between mb-2 border-bottom pb-2">
                <div>
                    <strong>${it.productName}</strong>
                    <div class="small text-muted">${it.sizeName ?? ""}</div>
                    ${toppingHtml}
                    ${noteHtml}
                </div>
                <div class="text-end">
                    ${fmt(it.unitPrice + it.toppingTotalEach)} x ${it.quantity}
                </div>
            </div>
        `;
    }).join("");
}

// 💰 Cập nhật tổng
function updateSummary() {
    document.getElementById("subtotal").innerText = fmt(subtotal);
    document.getElementById("discount").innerText = fmt(discount);
    document.getElementById("ship-fee-summary").innerText = fmt(shippingFee);
    document.getElementById("grand-total").innerText = fmt(subtotal - discount + shippingFee);
}

// 🏠 Load địa chỉ
async function loadAddresses() {
    const list = await api("/api/addresses");
    const container = document.getElementById("address-list");
    container.innerHTML = "";

    list.forEach(addr => {
        const div = document.createElement("div");
        div.className = "form-check";
        div.innerHTML = `
            <input class="form-check-input" type="radio" name="address" value="${addr.id}" ${addr.isDefault ? "checked" : ""}>
            <label class="form-check-label">
                <strong>${addr.recipient}</strong> - ${addr.phone}<br>
                ${addr.line1}, ${addr.ward}, ${addr.district}, ${addr.city}
                ${addr.isDefault ? '<span class="badge bg-success ms-2">Mặc định</span>' : ''}
            </label>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll("input[name='address']").forEach(r => {
        r.onchange = e => selectedAddressId = parseInt(e.target.value);
        if (r.checked) selectedAddressId = parseInt(r.value);
    });
}

// 🏡 Modal thêm địa chỉ
function showAddAddressModal() {
    const modal = new bootstrap.Modal(document.getElementById("addAddressModal"));
    modal.show();
}

// 🏡 Lưu địa chỉ mới
async function saveNewAddress() {
    const body = {
        recipient: document.getElementById("new-recipient").value.trim(),
        phone: document.getElementById("new-phone").value.trim(),
        line1: document.getElementById("new-line1").value.trim(),
        ward: document.getElementById("new-ward").value.trim(),
        district: document.getElementById("new-district").value.trim(),
        city: document.getElementById("new-city").value.trim(),
        isDefault: document.getElementById("new-default").checked
    };

    if (!body.recipient || !body.phone || !body.line1) {
        alert("⚠️ Vui lòng nhập đủ thông tin bắt buộc");
        return;
    }

    try {
        await api("/api/profile/addresses", "POST", body);
        bootstrap.Modal.getInstance(document.getElementById("addAddressModal")).hide();
        await loadAddresses();
    } catch (e) {
        console.error(e);
        alert("❌ Không thể thêm địa chỉ. Vui lòng thử lại.");
    }
}

// 🏪 Load chi nhánh
async function loadBranches() {
    const select = document.getElementById("branch-select");
    select.innerHTML = `<option value="">-- Chọn chi nhánh --</option>`;
    try {
        const branches = await api("/api/public/branches/active", "GET");
        branches.forEach(b => {
            const opt = document.createElement("option");
            opt.value = b.id;
            opt.textContent = b.name;
            select.appendChild(opt);
        });
    } catch (e) {
        console.error("❌ Không thể tải danh sách chi nhánh:", e);
        select.innerHTML = `<option value="">(Không thể tải chi nhánh)</option>`;
    }
}

// 📍 Khi chọn chi nhánh → kiểm tra availability
async function handleBranchChange(e) {
    selectedBranchId = parseInt(e.target.value) || null;
    const branchWarning = document.getElementById("branch-warning");

    if (selectedBranchId) {
        const unavailable = await api(`/api/public/branches/${selectedBranchId}/check-availability`, "POST",
            cartItems.map(it => it.cartItemId)
        );
        if (unavailable.length > 0) {
            branchWarning.style.display = "block";
            branchWarning.textContent = `⚠️ Có ${unavailable.length} sản phẩm không khả dụng tại chi nhánh này.`;
        } else {
            branchWarning.style.display = "none";
        }
    } else {
        branchWarning.style.display = "none";
    }
}

// 🚚 Load đơn vị vận chuyển
async function loadCarriers() {
    const carriers = await api("/api/public/shipping-carriers");
    const select = document.getElementById("carrier-select");
    select.innerHTML = `<option value="">-- Chọn đơn vị vận chuyển --</option>`;

    carriers.forEach(c => {
        const opt = document.createElement("option");
        opt.value = c.id;
        opt.textContent = c.name;
        select.appendChild(opt);
    });
}

// 🪙 Chọn đơn vị vận chuyển
async function handleCarrierChange(e) {
    selectedCarrierId = parseInt(e.target.value) || null;

    if (selectedCarrierId) {
        const carrier = await api(`/api/public/shipping-carriers/${selectedCarrierId}/fee`);
        shippingFee = carrier.discountedFee;
    } else {
        shippingFee = 0;
    }

    document.getElementById("shipping-fee").innerText = fmt(shippingFee);
    document.getElementById("ship-fee-summary").innerText = fmt(shippingFee);
    updateSummary();
}

// 🎟️ Áp mã giảm giá
async function applyCoupon() {
    const code = document.getElementById("coupon-code").value.trim();
    if (!code) return;

    const productIds = cartItems.map(it => it.productId);

    try {
        const res = await api(`/api/public/coupons/validate/${code}?orderTotal=${subtotal}`, "POST", productIds);
        discount = res;
        couponCode = code;
        document.getElementById("coupon-msg").innerText = `✅ Áp dụng mã thành công - Giảm ${fmt(discount)}`;
        updateSummary();
    } catch (e) {
        console.error(e);
        document.getElementById("coupon-msg").innerText = `❌ Mã không hợp lệ hoặc không áp dụng cho sản phẩm`;
        discount = 0;
        couponCode = null;
        updateSummary();
    }
}

// ✅ Xác nhận đặt hàng
async function confirmOrder() {
    const btn = document.getElementById("btn-confirm-order");
    btn.disabled = true;
    showLoading();

    try {
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

        if (!selectedAddressId && paymentMethod !== "PICKUP") {
            alert("⚠️ Vui lòng chọn địa chỉ giao hàng");
            return;
        }
        if (!selectedBranchId) {
            alert("⚠️ Vui lòng chọn chi nhánh");
            return;
        }

        const unavailable = await api(`/api/public/branches/${selectedBranchId}/check-availability`, "POST",
            cartItems.map(it => it.cartItemId)
        );
        if (unavailable.length > 0) {
            alert(`⚠️ Có ${unavailable.length} sản phẩm không khả dụng tại chi nhánh này.`);
            return;
        }

        // 📦 Gửi request tạo đơn hàng
        const body = {
            cartItemIds: cartItems.map(it => it.cartItemId),
            branchId: selectedBranchId,
            shippingCarrierId: selectedCarrierId,
            couponCode: couponCode,
            paymentMethod: paymentMethod,
            addressId: selectedAddressId
        };

        const res = await api("/api/orders", "POST", body);

        // ⚡ Nếu là VNPay → chuyển hướng thanh toán
        if (paymentMethod === "BANK") {
            const paymentRes = await fetch(`${contextPath}/api/payment/vnpay/create?orderId=${res.orderId}`, {
                method: "POST"
            });
            if (!paymentRes.ok) throw new Error("Không thể tạo link thanh toán VNPay");
            const paymentUrl = await paymentRes.text();
            localStorage.removeItem("checkoutItems");
            window.location.href = paymentUrl; // 🔁 chuyển hướng sang VNPay
        } else {
            // ✅ THAY ALERT BẰNG MODAL ĐẸP
            showSuccessModal(res.code);
        }
    } catch (e) {
        console.error(e);
        alert("❌ Không thể đặt hàng. Vui lòng thử lại.");
    } finally {
        hideLoading();
        btn.disabled = false;
    }
}

// ✅ THÊM FUNCTION MỚI - HIỂN THỊ MODAL THÀNH CÔNG
function showSuccessModal(orderCode) {
    const modalHTML = `
        <div class="success-modal-overlay" id="successModalOverlay">
            <div class="success-modal">
                <div class="success-modal-header">
                    <div class="success-modal-icon">
                        <i class="fas fa-check"></i>
                    </div>
                    <h2 class="success-modal-title">Đặt hàng thành công!</h2>
                    <p class="success-modal-subtitle">Cảm ơn bạn đã tin tưởng AloTra</p>
                </div>
                <div class="success-modal-body">
                    <div class="order-code-box">
                        <div class="order-code-label">Mã đơn hàng của bạn</div>
                        <div class="order-code-value">${orderCode}</div>
                    </div>
                    <p class="success-modal-message">
                        <i class="fas fa-info-circle"></i>
                        Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ gửi thông báo khi đơn hàng được xác nhận.
                    </p>
                </div>
                <div class="success-modal-footer">
                    <button class="success-modal-btn success-modal-btn-secondary" id="btnGoHome">
                        <i class="fas fa-home"></i> Về trang chủ
                    </button>
                    <button class="success-modal-btn success-modal-btn-primary" id="btnGoOrders">
                        <i class="fas fa-receipt"></i> Xem đơn hàng
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // ✅ GẮN SỰ KIỆN CHO CÁC NÚT SAU KHI MODAL ĐƯỢC THÊM VÀO DOM
    document.getElementById('btnGoHome').addEventListener('click', function() {
        localStorage.removeItem("checkoutItems");
        window.location.href = contextPath + "/";
    });

    document.getElementById('btnGoOrders').addEventListener('click', function() {
        localStorage.removeItem("checkoutItems");
        window.location.href = contextPath + "/orders";
    });

    // ✅ THÊM: Click overlay để đóng modal
    document.getElementById('successModalOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            localStorage.removeItem("checkoutItems");
            window.location.href = contextPath + "/orders";
        }
    });
}
// ✅ THÊM FUNCTION - ĐÓNG MODAL VÀ VỀ TRANG CHỦ
function closeSuccessModal() {
    const overlay = document.getElementById('successModalOverlay');
    if (overlay) {
        overlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            overlay.remove();
            localStorage.removeItem("checkoutItems");
            window.location.href = contextPath + "/";
        }, 300);
    }
}

// ✅ THÊM FUNCTION - CHUYỂN ĐẾN TRANG ĐƠN HÀNG
function goToOrders() {
    localStorage.removeItem("checkoutItems");
    window.location.href = contextPath + "/orders";
}

