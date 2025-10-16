import { apiFetch } from '/alotra-website/js/auth-helper.js';

const ordersList = document.getElementById('adminOrdersList');
const filterButtons = document.querySelectorAll('#adminStatusFilter [data-status]');
const branchFilter = document.getElementById('adminBranchFilter');
const searchInput = document.getElementById('adminOrderSearch');
const reloadBtn = document.getElementById('adminOrderReload');

let currentStatus = '';
let currentBranch = '';
let searchKeyword = '';

const fmtVND = v => (Number(v) || 0).toLocaleString('vi-VN') + ' ₫';

// =================== 🏷️ Map trạng thái ===================
function mapStatusColor(status) {
    switch (status) {
        case 'PENDING': return 'warning';
        case 'CONFIRMED': return 'secondary';
        case 'SHIPPING': return 'info';
        case 'COMPLETED': return 'success';
        case 'CANCELED': return 'danger';
        default: return 'secondary';
    }
}
function mapStatusText(status) {
    switch (status) {
        case 'PENDING': return 'Chờ xác nhận';
        case 'CONFIRMED': return 'Đã xác nhận';
        case 'SHIPPING': return 'Đang giao';
        case 'COMPLETED': return 'Hoàn thành';
        case 'CANCELED': return 'Đã hủy';
        default: return status;
    }
}

// =================== 📥 Load chi nhánh ===================
async function loadBranches() {
    try {
        const res = await apiFetch('/api/branches');
        if (!res.ok) throw new Error();
        const data = await res.json();

        branchFilter.innerHTML = `<option value="">Tất cả chi nhánh</option>`;
        data.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.textContent = b.name;
            branchFilter.appendChild(opt);
        });
    } catch (err) {
        console.error("❌ Lỗi tải chi nhánh:", err);
    }
}

// =================== 📥 Load danh sách đơn ===================
filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatus = btn.dataset.status;
        loadAdminOrders();
    });
});

branchFilter.addEventListener('change', () => {
    currentBranch = branchFilter.value;
    loadAdminOrders();
});

searchInput.addEventListener('input', () => {
    searchKeyword = searchInput.value.trim().toLowerCase();
    loadAdminOrders();
});

reloadBtn.addEventListener('click', () => {
    searchKeyword = '';
    searchInput.value = '';
    branchFilter.value = '';
    currentBranch = '';
    loadAdminOrders();
});

async function loadAdminOrders() {
    ordersList.innerHTML = `
        <tr>
            <td colspan="8" class="text-center text-muted py-4">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Đang tải dữ liệu...
            </td>
        </tr>
    `;

    try {
        let url = `/api/admin/orders`;
        const params = [];

        if (currentStatus) params.push(`status=${currentStatus}`);
        if (currentBranch) params.push(`branchId=${currentBranch}`);
        if (params.length > 0) url += `?${params.join('&')}`;

        const res = await apiFetch(url);
        if (!res.ok) throw new Error();
        let data = await res.json();

        if (searchKeyword) {
            data = data.filter(o => o.code.toLowerCase().includes(searchKeyword));
        }

        if (data.length === 0) {
            ordersList.innerHTML = `
                <tr><td colspan="8" class="text-center text-muted py-4">Không có đơn hàng</td></tr>
            `;
            return;
        }

        ordersList.innerHTML = data.map(o => `
            <tr class="order-row" style="cursor:pointer" onclick="showAdminOrderDetail(${o.id})">
                <td class="fw-bold">#${o.code}</td>
                <td>${new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                <td>${o.branchName || '(Không có)'}</td>

                <td class="text-success fw-bold">${fmtVND(o.total)}</td>
                <td>${o.paymentMethod}</td>
                <td><span class="badge bg-${mapStatusColor(o.status)}">${mapStatusText(o.status)}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        ordersList.innerHTML = `
            <tr><td colspan="8" class="text-center text-danger py-4">Lỗi tải đơn hàng</td></tr>
        `;
    }
}

// =================== 📜 Modal chi tiết ===================
window.showAdminOrderDetail = async function(orderId) {
    const modal = new bootstrap.Modal(document.getElementById("adminOrderModal"));
    modal.show();

    const loadingEl = document.getElementById("adminModalLoading");
    const contentEl = document.getElementById("adminModalContent");

    loadingEl.style.display = "block";
    contentEl.style.display = "none";

    const res = await apiFetch(`/api/admin/orders/${orderId}`);
    if (!res.ok) {
        loadingEl.textContent = "⚠️ Lỗi tải dữ liệu!";
        return;
    }
    const order = await res.json();

    document.getElementById("adminModalOrderCode").textContent = `#${order.code}`;
    document.getElementById("adminModalOrderDate").textContent = new Date(order.createdAt).toLocaleString('vi-VN');
    document.getElementById("adminModalOrderStatus").textContent = mapStatusText(order.status);
    document.getElementById("adminModalOrderStatus").className = `badge fs-6 bg-${mapStatusColor(order.status)}`;
    document.getElementById("adminModalPayment").textContent = order.paymentMethod;
    document.getElementById("adminModalBranchName").textContent = order.branchName || '(Không có)';
    document.getElementById("adminModalAddress").textContent = order.deliveryAddress || '—';

    document.getElementById("adminModalSubtotal").textContent = fmtVND(order.subtotal);
    document.getElementById("adminModalDiscount").textContent = fmtVND(order.discount);
    document.getElementById("adminModalShipping").textContent = fmtVND(order.shippingFee);
    document.getElementById("adminModalTotal").textContent = fmtVND(order.total);

    document.getElementById("adminModalOrderItems").innerHTML = order.items.map(it => `
        <tr>
            <td>${it.productName}</td>
            <td>${it.sizeName || '-'}</td>
            <td>${it.quantity}</td>
            <td>${fmtVND(it.unitPrice)}</td>
            <td>${fmtVND(it.lineTotal)}</td>
        </tr>
    `).join('');

    document.getElementById("adminModalOrderHistory").innerHTML = order.statusHistory.length
        ? order.statusHistory.map(h => `
            <li class="mb-2 d-flex align-items-start">
                <div class="timeline-dot bg-${mapStatusColor(h.status)} me-2"></div>
                <div>
                    <div class="fw-bold">${mapStatusText(h.status)}</div>
                    <div class="text-muted small">${new Date(h.changedAt).toLocaleString('vi-VN')}</div>
                    ${h.note ? `<div class="small fst-italic">${h.note}</div>` : ''}
                </div>
            </li>
        `).join('')
        : '<li class="text-muted">Không có lịch sử</li>';

    loadingEl.style.display = "none";
    contentEl.style.display = "block";
};

// =================== 🚀 Khởi chạy ===================
loadBranches();
loadAdminOrders();

const style = document.createElement('style');
style.textContent = `
.timeline-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
.order-row:hover { background-color: #f8f9fa; }
`;
document.head.appendChild(style);
