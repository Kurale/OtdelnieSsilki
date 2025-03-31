document.addEventListener('DOMContentLoaded', function() {
    const star1 = document.getElementById('Star_1');
    const star2 = document.getElementById('Star_2');
    const star3 = document.getElementById('Star_3');
    const homeBtn = document.getElementById('home');
    const nextBtn = document.getElementById('next');

    // Удаляем старые обработчики перед добавлением новых
    nextBtn.removeEventListener('click', handleNextClick);
    homeBtn.removeEventListener('click', handleHomeClick);

    function showStars() {
        const urlParams = new URLSearchParams(window.location.search);
        const correct = parseInt(urlParams.get('correct')) || 0;
        const total = parseInt(urlParams.get('total')) || 10;
        const task = parseInt(urlParams.get('task')) || 1;
        const isLast = urlParams.get('last') === 'true';
        const errors = total - correct;

        console.log('Task:', task, 'Correct:', correct, 'Total:', total, 'IsLast:', isLast);

        if (errors === 0) {
            star1.style.animation = 'starAppear 0.5s ease forwards';
            setTimeout(() => {
                star2.style.animation = 'starAppear 0.5s ease forwards';
            }, 300);
            setTimeout(() => {
                star3.style.animation = 'starAppear 0.5s ease forwards';
            }, 600);
        } else if (errors === 1) {
            star1.style.animation = 'starAppear 0.5s ease forwards';
            setTimeout(() => {
                star2.style.animation = 'starAppear 0.5s ease forwards';
            }, 300);
        } else {
            star1.style.animation = 'starAppear 0.5s ease forwards';
        }

        if (isLast) {
            nextBtn.classList.add('hidden');
        } else {
            nextBtn.classList.remove('hidden');
        }
    }

    function handleHomeClick(e) {
        e.preventDefault();
        console.log('Home clicked');
        window.location.assign('start.html'); // Используем assign вместо href для надежности
    }

    function handleNextClick(e) {
        e.preventDefault();
        const urlParams = new URLSearchParams(window.location.search);
        const currentTask = parseInt(urlParams.get('task')) || 1;
        const nextTask = currentTask + 1;

        console.log('Next clicked - Current Task:', currentTask, 'Next Task:', nextTask);

        if (nextTask <= 5) {
            window.location.assign(`task${nextTask}.html`);
        } else {
            console.log('No more tasks');
        }
    }

    homeBtn.addEventListener('click', handleHomeClick);
    nextBtn.addEventListener('click', handleNextClick);

    showStars();
});