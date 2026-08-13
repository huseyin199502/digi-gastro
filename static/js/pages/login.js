(function () {
    window.switchMode = function (mode) {
        const chefBtn = document.getElementById('mode-chef');
        const staffBtn = document.getElementById('mode-staff');
        const chefForm = document.getElementById('chef-form');
        const staffForm = document.getElementById('staff-form');
        const chef = mode === 'chef';
        chefBtn.classList.toggle('active', chef);
        staffBtn.classList.toggle('active', !chef);
        chefForm.classList.toggle('hidden', !chef);
        staffForm.classList.toggle('hidden', chef);
    };

    window.loadStaff = async function () {
        const email = document.getElementById('staff-email').value.trim();
        if (!email) return alert('Bitte Restaurant E-Mail eingeben');
        const select = document.getElementById('staff-select');
        const section = document.getElementById('staff-section');
        const pinInput = document.querySelector('#staff-form input[name=pin]');
        select.innerHTML = '<option value="">Lade Mitarbeiter...</option>';
        select.disabled = true;
        try {
            const data = await DigiGastro.api('/api/staff-by-email?email=' + encodeURIComponent(email));
            if (!data.staff?.length) throw new Error('empty');
            select.innerHTML = '<option value="">— Mitarbeiter wählen —</option>' +
                data.staff.map(s => `<option value="${s.name}">${s.name} (${s.role})</option>`).join('');
            select.disabled = false;
            pinInput.disabled = false;
            section.classList.add('visible');
        } catch (_) {
            select.innerHTML = '<option value="">— Keine Mitarbeiter gefunden —</option>';
            section.classList.remove('visible');
        }
    };
}());
