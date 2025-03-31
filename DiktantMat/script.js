const inputs = document.querySelectorAll('.input-box');
const checkBtn = document.getElementById('checkBtn');
const nextBtn = document.getElementById('nextBtn');
const result = document.getElementById('result');

function getTaskNumber() {
    const fileName = window.location.pathname.split('/').pop();
    const taskMatch = fileName.match(/task(\d+)\.html/);
    return taskMatch ? taskMatch[1] : '1';
}

function checkAllFilled() {
    let allFilled = true;
    inputs.forEach(input => {
        if (input.value.trim() === '') {
            allFilled = false;
        }
    });
    checkBtn.classList.toggle('hidden', !allFilled);
}

inputs.forEach(input => {
    input.addEventListener('input', checkAllFilled);
});

function checkAnswers() {
    let correct = 0;
    inputs.forEach(input => {
        if (input.value.trim() === input.dataset.answer) {
            input.style.borderColor = 'green';
            correct++;
        } else {
            input.style.borderColor = 'red';
        }
    });
    result.textContent = `Правильных ответов: ${correct} из ${inputs.length}`;
    nextBtn.classList.remove('hidden');
    nextBtn.dataset.correct = correct;
    nextBtn.dataset.total = inputs.length;
    nextBtn.dataset.task = getTaskNumber();
}

function goToResult(e) {
    e.preventDefault();
    const correct = nextBtn.dataset.correct;
    const total = nextBtn.dataset.total;
    const task = nextBtn.dataset.task;
    const isLast = task === '5';
    if (isLast) {
        window.location.href = `result.html?correct=${correct}&total=${total}&task=${task}&last=true`;
    } else {
        window.location.href = `result.html?correct=${correct}&total=${total}&task=${task}`;
    }
}

checkBtn.addEventListener('click', checkAnswers);
nextBtn.addEventListener('click', goToResult);