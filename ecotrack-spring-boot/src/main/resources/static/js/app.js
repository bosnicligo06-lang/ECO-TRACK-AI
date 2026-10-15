// EcoTrack AI - Vanilla Client JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // 1. Auto-calculate total waste in Segregation Form
    const wetInput = document.getElementById('wetKg');
    const dryInput = document.getElementById('dryKg');
    const hazInput = document.getElementById('hazardousKg');
    const totalInput = document.getElementById('totalKg');

    function calculateTotal() {
        if (!totalInput) return;
        const wet = parseInt(wetInput?.value) || 0;
        const dry = parseInt(dryInput?.value) || 0;
        const haz = parseInt(hazInput?.value) || 0;
        totalInput.value = (wet + dry + haz) + ' kg';
    }

    if (wetInput && dryInput && hazInput) {
        wetInput.addEventListener('input', calculateTotal);
        dryInput.addEventListener('input', calculateTotal);
        hazInput.addEventListener('input', calculateTotal);
        calculateTotal();
    }

    // 2. Driver & Truck Safe Capacity Validation in Manual Allocation Form
    const driverSelect = document.getElementById('manualDriverSelect');
    const truckSelect = document.getElementById('manualTruckSelect');
    const weightInput = document.getElementById('manualWeightInput');
    const capacityNotice = document.getElementById('capacityNotice');
    const confirmBtn = document.getElementById('confirmManualBtn');

    if (driverSelect && truckSelect && weightInput) {
        function updateCapacityCheck() {
            const selectedOpt = truckSelect.options[truckSelect.selectedIndex];
            if (!selectedOpt) return;

            const remaining = parseInt(selectedOpt.getAttribute('data-remaining') || '0');
            const reqWeight = parseInt(weightInput.value || '0');

            if (capacityNotice) {
                if (reqWeight > remaining) {
                    capacityNotice.textContent = `Warning: Selected truck has only ${remaining} kg remaining. Exceeds capacity by ${reqWeight - remaining} kg!`;
                    capacityNotice.className = 'text-xs text-red-600 font-bold mt-1 block';
                    if (confirmBtn) confirmBtn.disabled = true;
                } else {
                    capacityNotice.textContent = `Safe Allocation: Truck has ${remaining} kg remaining. Remaining after assignment: ${remaining - reqWeight} kg.`;
                    capacityNotice.className = 'text-xs text-emerald-700 font-semibold mt-1 block';
                    if (confirmBtn) confirmBtn.disabled = false;
                }
            }
        }

        // When driver changes, auto-select associated truck
        driverSelect.addEventListener('change', () => {
            const driverOpt = driverSelect.options[driverSelect.selectedIndex];
            const assignedTruck = driverOpt.getAttribute('data-truck');
            if (assignedTruck) {
                for (let i = 0; i < truckSelect.options.length; i++) {
                    if (truckSelect.options[i].value === assignedTruck) {
                        truckSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            updateCapacityCheck();
        });

        truckSelect.addEventListener('change', updateCapacityCheck);
        weightInput.addEventListener('input', updateCapacityCheck);
        updateCapacityCheck();
    }

    // 3. Auto dismiss toasts after 4 seconds
    const toasts = document.querySelectorAll('.toast');
    toasts.forEach(toast => {
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    });
});

// Quick filler for Login page
function fillLogin(identifier, password) {
    const idField = document.getElementById('identifier');
    const passField = document.getElementById('password');
    if (idField && passField) {
        idField.value = identifier;
        passField.value = password;
        idField.focus();
    }
}

// Modal open & close helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'flex';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
}

// Populate manual allocation modal from notification card
function prepareAssignment(complaintId, location, wasteType, weight, priority) {
    const cidInput = document.getElementById('assignComplaintId');
    const locInput = document.getElementById('assignLocation');
    const wasteInput = document.getElementById('assignWasteType');
    const weightInput = document.getElementById('manualWeightInput');
    const prioInput = document.getElementById('assignPriority');

    if (cidInput) cidInput.value = complaintId || '';
    if (locInput) locInput.value = location || '';
    if (wasteInput) wasteInput.value = wasteType || '';
    if (weightInput) weightInput.value = weight || 50;
    if (prioInput) prioInput.value = priority || 'Normal';

    openModal('manualAssignModal');
}
