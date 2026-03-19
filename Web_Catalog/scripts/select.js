document.addEventListener('DOMContentLoaded', () => {

    const customSelect = document.querySelector('.custom-select');
    
    if (!customSelect) {
        console.error("ОШИБКА: Блок .custom-select не найден в HTML!");
        return;
    }

    const trigger = customSelect.querySelector('.custom-select_trigger');
    const valueDisplay = customSelect.querySelector('.custom-select_value');
    const options = customSelect.querySelectorAll('.custom-select_option');

    trigger.addEventListener('click', (e) => {
        customSelect.classList.toggle('open');
    });


    options.forEach(option => {
        option.addEventListener('click', () => {
            valueDisplay.textContent = option.textContent; 
            customSelect.classList.remove('open'); 
        });
    });

    document.addEventListener('click', (e) => {
        if (!customSelect.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });
});