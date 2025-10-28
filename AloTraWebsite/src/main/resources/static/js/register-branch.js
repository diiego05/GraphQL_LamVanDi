"use strict";

import { apiFetch } from '/alotra-website/js/auth-helper.js';

async function geocodeIfMissing(address) {
	if (!address || !address.trim()) return null;
	try {
		const res = await fetch(`/alotra-website/api/geocoding/geocode?address=${encodeURIComponent(address)}`);
		if (!res.ok) return null;
		const data = await res.json();
		const lat = Number(data.latitude);
		const lng = Number(data.longitude);
		if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
	} catch (_) { }
	return null;
}

// ✅ VN bounds check (khớp server-side)
function isValidVietnameseCoordinates(lat, lng) {
	return Number.isFinite(lat) && Number.isFinite(lng) && lat >= 8.0 && lat <= 24.5 && lng >= 102.0 && lng <= 110.5;
}

// 🔁 Resolve coords: dataset -> Google client geocode -> server geocode
async function resolveCoordinates(address, dsLat, dsLng) {
	// 1) Dataset from autocomplete
	if (isValidVietnameseCoordinates(dsLat, dsLng)) {
		return { lat: dsLat, lng: dsLng };
	}

	// 2) Try client-side Google geocode if available
	try {
		if (window.googleMapsLoader && typeof window.googleMapsLoader.geocode === 'function') {
			const r = await window.googleMapsLoader.geocode(address);
			if (r && isValidVietnameseCoordinates(r.lat, r.lng)) {
				return { lat: r.lat, lng: r.lng };
			}
		}
	} catch (_) { }

	// 3) Fallback: server geocoding (Google -> Nominatim)
	const fromServer = await geocodeIfMissing(address);
	if (fromServer && isValidVietnameseCoordinates(fromServer.lat, fromServer.lng)) {
		return fromServer;
	}

	return null;
}

// 🗺️ Initialize autocomplete for branch address inputs
async function initBranchAddressAutocomplete() {
	// Main create form input
	await attachAutocompleteTo('#address');
	// Edit modal input
	await attachAutocompleteTo('#editBranchAddress');
}

async function attachAutocompleteTo(selector) {
	const input = document.querySelector(selector);
	if (!input) {
		console.warn(`⚠️ Input ${selector} not found`);
		return;
	}

	// Clear any previous coords
	input.dataset.lat = '';
	input.dataset.lng = '';

	// Use centralized Google Maps Loader
	const autocomplete = await window.googleMapsLoader.createAutocomplete(input, {
		types: ['geocode']
	});

	if (!autocomplete) {
		console.warn(`⚠️ Autocomplete initialization failed for ${selector}`);
		return;
	}

	// ✅ Handle Google Places Autocomplete
	if (autocomplete.addListener) {
		autocomplete.addListener('place_changed', () => {
			const place = autocomplete.getPlace();
			if (!place || !place.address_components) return;

			// Parse địa chỉ sử dụng parser từ Google Maps Loader
			const parsed = window.googleMapsLoader.parseVietnameseAddress(place.address_components);

			// ✅ Kết hợp street + ward + district + city thành địa chỉ đầy đủ cho chi nhánh
			const fullAddress = [
				parsed.street,
				parsed.ward,
				parsed.district,
				parsed.city
			].filter(Boolean).join(', ');

			input.value = fullAddress;

			// 📍 Lưu toạ độ nếu có
			if (place.geometry && place.geometry.location) {
				try {
					const lat = place.geometry.location.lat();
					const lng = place.geometry.location.lng();
					input.dataset.lat = String(lat);
					input.dataset.lng = String(lng);
				} catch (_) { /* ignore */ }
			}
			console.log(`✅ Branch address filled for ${selector}:`, fullAddress, input.dataset.lat, input.dataset.lng);
		});
		console.log(`✅ Google Places autocomplete initialized for ${selector}`);
	}
	// ✅ Handle Nominatim Autocomplete (fallback)
	else if (autocomplete.nominatim) {
		input.addEventListener('nominatim-select', (e) => {
			const detail = e.detail;
			console.log(`📍 Nominatim address selected for ${selector}:`, detail.address);

			// Set the full address cho chi nhánh
			input.value = detail.address;

			// 📍 Lưu toạ độ nếu có
			if (detail && (detail.lat || detail.lon || detail.lng)) {
				input.dataset.lat = String(detail.lat ?? detail.latitude ?? '');
				input.dataset.lng = String(detail.lon ?? detail.lng ?? detail.longitude ?? '');
			}
		});
		console.log(`✅ Nominatim autocomplete initialized for ${selector}`);
	}
}


document.addEventListener("DOMContentLoaded", async () => {
	console.log("🏪 Trang đăng ký chi nhánh khởi chạy...");

	window.googleMapsLoader.load().then(loaded => {
		if (loaded) {
			console.log('✅ Google Maps loaded for branch registration');
			initBranchAddressAutocomplete();
		} else {
			console.log('ℹ️ Using Nominatim for branch registration');
			initBranchAddressAutocomplete();
		}
	});
	// ========= ELEMENTS =========
	const avatarPreview = document.getElementById("avatarPreview");
	const avatarInput = document.getElementById("avatarInput");
	const fullName = document.getElementById("fullName");
	const phone = document.getElementById("phone");
	const email = document.getElementById("email");
	const idCardNumber = document.getElementById("idCardNumber");
	const gender = document.getElementById("gender");
	const dob = document.getElementById("dob");
	const btnSaveProfile = document.getElementById("btnSaveProfile");

	const registerType = document.getElementById('registerType');
	const branchJoinGroup = document.getElementById('branch-join-group');
	const branchCreateGroup = document.getElementById('branch-create-group');
	const branchSelect = document.getElementById('branchSelect');
	const btnSubmitBranch = document.getElementById('btnSubmitBranch');
	const historyList = document.getElementById('historyList');

	// ========= Modal sửa =========
	const editModalEl = document.getElementById('editBranchModal');
	const editBranchName = document.getElementById('editBranchName');
	const editBranchPhone = document.getElementById('editBranchPhone');
	const editBranchAddress = document.getElementById('editBranchAddress');
	const editRequestId = document.getElementById('editRequestId');
	const btnSaveEditBranch = document.getElementById('btnSaveEditBranch');
	const editModal = new bootstrap.Modal(editModalEl);

	// ========= LOAD PROFILE =========
	if (editModalEl) {
		editModalEl.addEventListener('shown.bs.modal', async () => {
			console.log('📝 Edit modal shown, initializing autocomplete...');
			await attachAutocompleteTo('#editBranchAddress');
		}, { once: false }); // Allow multiple initializations
	}

	// ========= CẬP NHẬT PROFILE =========


	// ========= HIỂN THỊ HÌNH ĐẠI DIỆN =========
	avatarInput.addEventListener("change", e => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = ev => avatarPreview.src = ev.target.result;
			reader.readAsDataURL(file);
		}
	});

	// ========= XỬ LÝ ĐĂNG KÝ CHI NHÁNH =========
	registerType.addEventListener('change', async () => {
		if (registerType.value === 'JOIN') {
			branchJoinGroup.classList.remove('d-none');
			branchCreateGroup.classList.add('d-none');
			loadBranches();
		} else {
			branchJoinGroup.classList.add('d-none');
			branchCreateGroup.classList.remove('d-none');
			await attachAutocompleteTo('#address');
		}
	});

	btnSubmitBranch.addEventListener('click', async () => {
		const payload = { type: registerType.value };

		if (payload.type === 'JOIN') {
			if (!branchSelect.value) {
				showAlert('⚠️ Vui lòng chọn chi nhánh muốn tham gia.');
				return;
			}
			payload.branchId = branchSelect.value;
		} else {
			const name = document.getElementById('branchName').value.trim();
			const phoneVal = document.getElementById('branchPhone').value.trim();
			const address = document.getElementById('address').value.trim();
			const addrInput = document.getElementById('address');
			let lat = addrInput?.dataset?.lat ? parseFloat(addrInput.dataset.lat) : NaN;
			let lng = addrInput?.dataset?.lng ? parseFloat(addrInput.dataset.lng) : NaN;

			if (!name || !phoneVal || !address) {
				showAlert('⚠️ Vui lòng nhập đầy đủ thông tin chi nhánh.');
				return;
			}

			const coords = await resolveCoordinates(address, lat, lng);
			if (!coords) {
				showAlert('❌ Không thể xác định toạ độ cho địa chỉ chi nhánh. Vui lòng chọn từ gợi ý hoặc nhập địa chỉ chi tiết hơn.');
				return;
			}
			lat = coords.lat; lng = coords.lng;

			payload.name = name;
			payload.phone = phoneVal;
			payload.address = address;
			payload.latitude = lat;
			payload.longitude = lng;
			// 🧩 Compatibility keys in case backend expects short names
			payload.lat = lat;
			payload.lng = lng;
			console.log('📦 Submitting branch payload:', payload);
		}

		try {
			const res = await apiFetch(`/api/register/branch`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload)
			});

			if (res.ok) {
				showAlert('✅ Gửi yêu cầu thành công!');
				loadHistory();
			} else {
				const text = await res.text();
				let message = text;
				try {
					const json = JSON.parse(text);
					message = json.message || json.error || 'Có lỗi xảy ra.';
				} catch (_) { }
				showAlert(`❌ ${message}`);
			}
		} catch (err) {
			showAlert('❌ Không thể kết nối tới máy chủ.');
			console.error(err);
		}
	});

	// ========= TẢI DANH SÁCH CHI NHÁNH =========
	async function loadBranches() {
		const res = await apiFetch(`/api/register/list-branches`);
		if (!res.ok) return;
		const branches = await res.json();
		branchSelect.innerHTML = branches.map(b =>
			`<option value="${b.id}">${b.name} - ${b.address}</option>`
		).join('');
	}

	// ========= SỬA YÊU CẦU =========
	historyList.addEventListener('click', async (e) => {
		if (e.target.classList.contains('btn-edit-request')) {
			const id = e.target.dataset.id;
			const name = e.target.dataset.name;
			const phone = e.target.dataset.phone;
			const address = e.target.dataset.address;
			editRequestId.value = id;
			editBranchName.value = name;
			editBranchPhone.value = phone;
			editBranchAddress.value = address;
			editBranchAddress.dataset.lat = '';
			editBranchAddress.dataset.lng = '';
			editModal.show();
		}

		if (e.target.classList.contains('btn-delete-request')) {
			const id = e.target.dataset.id;
			if (confirm('⚠️ Bạn có chắc muốn xóa yêu cầu này?')) {
				const res = await apiFetch(`/api/register/branch/${id}`, { method: 'DELETE' });
				if (res.ok) {
					showAlert('🗑️ Xóa yêu cầu thành công!');
					loadHistory();
				} else {
					showAlert('❌ Xóa thất bại.');
				}
			}
		}
	});

	btnSaveEditBranch.addEventListener('click', async () => {
		const id = editRequestId.value;
		let lat = editBranchAddress?.dataset?.lat ? parseFloat(editBranchAddress.dataset.lat) : NaN;
		let lng = editBranchAddress?.dataset?.lng ? parseFloat(editBranchAddress.dataset.lng) : NaN;
		const address = editBranchAddress.value.trim();
		const payload = {
			type: "CREATE", // 👈 Thêm type để không bị lỗi validation
			name: editBranchName.value.trim(),
			phone: editBranchPhone.value.trim(),
			address
		};

		if (!payload.name || !payload.phone || !payload.address) {
			showAlert('⚠️ Vui lòng nhập đầy đủ thông tin.');
			return;
		}
		// 🔁 Resolve toạ độ tin cậy
		const coords = await resolveCoordinates(address, lat, lng);
		if (!coords) {
			showAlert('❌ Không thể xác định toạ độ cho địa chỉ chi nhánh.');
			return;
		}
		payload.latitude = coords.lat;
		payload.longitude = coords.lng;
		// 🧩 Compatibility keys
		payload.lat = coords.lat;
		payload.lng = coords.lng;
		console.log('✏️ Submitting edit branch payload:', payload);

		const res = await apiFetch(`/api/register/branch/${id}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (res.ok) {
			showAlert('✅ Cập nhật yêu cầu thành công!');
			editModal.hide();
			loadHistory();
		} else {
			showAlert('❌ Cập nhật thất bại.');
		}
	});

	// ========= LỊCH SỬ YÊU CẦU =========
	async function loadHistory() {
		const res = await apiFetch(`/api/register/branch/my-requests`);
		if (!res.ok) {
			historyList.innerHTML = `<p class="text-center text-danger">Không thể tải lịch sử</p>`;
			return;
		}
		const data = await res.json();
		if (data.length === 0) {
			historyList.innerHTML = `<p class="text-center text-muted">Chưa có yêu cầu nào</p>`;
			return;
		}

		historyList.innerHTML = data.map(r => `
		    <div class="border-bottom py-2 d-flex justify-content-between align-items-start">
		        <div>
		            <div><b>Hình thức:</b> ${r.type === 'CREATE' ? 'Tạo mới' : 'Tham gia'}</div>
		            <div><b>Tên chi nhánh:</b> ${r.branchName || '(Chưa có)'}</div>
		            <div><b>Địa chỉ:</b> ${r.address || '(Chưa có)'}</div>
		            <div><b>SĐT:</b> ${r.phone || '(Chưa có)'}</div>
		            <div><b>Trạng thái:</b>
		                <span class="badge ${r.status === 'PENDING' ? 'bg-warning' : (r.status === 'APPROVED' ? 'bg-success' : 'bg-danger')}">
		                    ${r.status}
		                </span>
		            </div>
		            <div><b>Ngày yêu cầu:</b> ${new Date(r.createdAt).toLocaleString('vi-VN')}</div>
		            ${r.note ? `<div><b>Ghi chú:</b> ${r.note}</div>` : ''}
		        </div>
		        ${(r.status === 'PENDING' || r.status === 'REJECTED') && r.type === 'CREATE' ? `
		        <div class="d-flex flex-column gap-2 ms-2">
		            <button class="btn btn-sm btn-outline-primary btn-edit-request"
		                    data-id="${r.id}"
		                    data-name="${r.branchName}"
		                    data-phone="${r.phone}"
		                    data-address="${r.address}">
		                ✏️
		            </button>
		            <button class="btn btn-sm btn-outline-danger btn-delete-request" data-id="${r.id}">🗑️</button>
		        </div>`
				: (r.status === 'PENDING' || r.status === 'REJECTED') && r.type === 'JOIN' ? `
		        <div class="d-flex flex-column gap-2 ms-2">
		            <button class="btn btn-sm btn-outline-danger btn-delete-request" data-id="${r.id}">🗑️</button>
		        </div>` : ''}
		    </div>
		`).join('');

		// ========= LOAD PROFILE =========
		async function loadProfile() {
			const res = await fetch("/alotra-website/api/profile", {
				headers: { "Authorization": `Bearer ${localStorage.getItem("jwtToken")}` }
			});
			if (!res.ok) return;
			const user = await res.json();
			fullName.value = user.fullName || "";
			phone.value = user.phone || "";
			email.value = user.email || "";
			idCardNumber.value = user.idCardNumber || "";
			gender.value = user.gender || "";
			dob.value = user.dateOfBirth || "";
			avatarPreview.src = user.avatarUrl || "/alotra-website/images/avatar-default.jpg";
		}
	}

	// ========= CẬP NHẬT PROFILE =========
	btnSaveProfile.addEventListener("click", async () => {
		const file = avatarInput.files[0];
		const data = {
			fullName: fullName.value,
			phone: phone.value,
			gender: gender.value,
			dateOfBirth: dob.value,
			idCardNumber: idCardNumber.value
		};

		const formData = new FormData();
		formData.append("data", new Blob([JSON.stringify(data)], { type: "application/json" }));
		if (file) formData.append("file", file);

		const res = await fetch("/alotra-website/api/profile", {
			method: "PUT",
			headers: { "Authorization": `Bearer ${localStorage.getItem("jwtToken")}` },
			body: formData
		});

		if (res.ok) {
			showAlert("✅ Cập nhật thông tin cá nhân thành công!");
			await loadProfile();
			if (window.loadNotifications) await window.loadNotifications();
		} else {
			showAlert("❌ Cập nhật thất bại!");
		}
	});
	// ========= KHỞI TẠO =========
	await loadProfile();
	await loadHistory();
});
