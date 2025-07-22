document.addEventListener('DOMContentLoaded', () => {
    // Game state
    let tasks = [];
    let currentTaskIndex = 0;
    let totalAttempts = 0;
    let correctAnswers = 0;
    let isDragging = false;
    let draggedClone = null;
    let offsetX, offsetY;

    // DOM elements
    const welcomeScreen = document.getElementById('welcome-screen');
    const taskScreen = document.getElementById('task-screen');
    const resultScreen = document.getElementById('result-screen');
    const startButton = document.getElementById('start-button');
    const taskQuestion = document.getElementById('task-question');
    const digitPool = document.getElementById('digit-pool');
    const dropZones = document.getElementById('drop-zones');
    const checkButton = document.getElementById('check-button');
    const nextButton = document.getElementById('next-button');
    const resultMessage = document.getElementById('result-message');
    const totalAttemptsEl = document.getElementById('total-attempts');
    const correctAnswersEl = document.getElementById('correct-answers');
    const tryAgainButton = document.getElementById('try-again-button');

    // Load tasks from JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            tasks = data;
            shuffleTasks();
        })
        .catch(error => console.error('Error loading tasks:', error));

    // Shuffle tasks
    function shuffleTasks() {
        tasks.sort(() => Math.random() - 0.5);
    }

    // Switch screens
    function showScreen(screen) {
        [welcomeScreen, taskScreen, resultScreen].forEach(s => s.classList.remove('active'));
        screen.classList.add('active');
    }

    // Initialize task screen
    function initTaskScreen() {
        const task = tasks[currentTaskIndex];
        taskQuestion.textContent = task.question;
        digitPool.innerHTML = '';
        dropZones.innerHTML = '';

        // Create digit pool (0-9)
        for (let i = 0; i <= 9; i++) {
            const digit = document.createElement('div');
            digit.classList.add('digit');
            digit.textContent = i;
            digit.addEventListener('mousedown', startDragging);
            digitPool.appendChild(digit);
        }

        // Create drop zones based on layout
        const layout = task.layout === '1-3-3' ? 7 : 6;
        for (let i = 0; i < layout; i++) {
            const zone = document.createElement('div');
            zone.classList.add('drop-zone');
            dropZones.appendChild(zone);
        }
    }

    // Drag-and-drop functionality
    function startDragging(e) {
        if (isDragging) return;
        isDragging = true;

        const digit = e.target;
        draggedClone = digit.cloneNode(true);
        draggedClone.classList.add('digit', 'dragging');
        document.body.appendChild(draggedClone);

        // Calculate offset to center the digit under the cursor
        const rect = digit.getBoundingClientRect();
        offsetX = e.clientX - rect.left - rect.width / 2;
        offsetY = e.clientY - rect.top - rect.height / 2;

        // Position clone at cursor
        draggedClone.style.position = 'fixed'; // Use fixed for smoother dragging
        draggedClone.style.left = `${e.clientX - offsetX}px`;
        draggedClone.style.top = `${e.clientY - offsetY}px`;
        draggedClone.style.zIndex = '1000';
        draggedClone.style.cursor = 'grabbing';
        draggedClone.style.userSelect = 'none'; // Prevent text selection
        draggedClone.style.display = 'flex'; // Ensure consistent centering
        draggedClone.style.alignItems = 'center';
        draggedClone.style.justifyContent = 'center';

        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', stopDragging);
    }

    function drag(e) {
        if (!draggedClone) return;
        draggedClone.style.left = `${e.clientX - offsetX}px`;
        draggedClone.style.top = `${e.clientY - offsetY}px`;

        // Highlight drop zone if hovered
        const dropZone = getDropZoneUnderCursor(e);
        document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('hover'));
        if (dropZone) {
            dropZone.classList.add('hover');
        }
    }

    function getDropZoneUnderCursor(e) {
        return Array.from(document.querySelectorAll('.drop-zone')).find(zone => {
            const rect = zone.getBoundingClientRect();
            // Expand hitbox slightly for easier dropping
            const padding = 10;
            return e.clientX >= rect.left - padding &&
                   e.clientX <= rect.right + padding &&
                   e.clientY >= rect.top - padding &&
                   e.clientY <= rect.bottom + padding &&
                   !zone.querySelector('.digit');
        });
    }

    function stopDragging(e) {
        if (!draggedClone) return;
        isDragging = false;

        // Remove hover effect
        document.querySelectorAll('.drop-zone').forEach(zone => zone.classList.remove('hover'));

        // Find drop zone under cursor
        const dropZone = getDropZoneUnderCursor(e);

        if (dropZone) {
            // Place clone in drop zone
            draggedClone.style.position = 'static';
            draggedClone.style.cursor = 'default';
            draggedClone.classList.remove('dragging');
            dropZone.appendChild(draggedClone);
            dropZone.classList.add('filled');
            draggedClone.removeEventListener('mousedown', startDragging); // Disable dragging for placed digit
        } else {
            // Remove clone if not dropped in a valid zone
            draggedClone.remove();
        }

        draggedClone = null;
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', stopDragging);
    }

    // Check answer
    function checkAnswer() {
        totalAttempts++;
        const zones = Array.from(dropZones.querySelectorAll('.drop-zone'));
        const userAnswer = zones.map(zone => zone.querySelector('.digit')?.textContent || '0').join('');
        const correctAnswer = tasks[currentTaskIndex].answer;

        // Lock drop zones
        zones.forEach(zone => {
            const digit = zone.querySelector('.digit');
            if (digit) digit.style.pointerEvents = 'none';
        });
        nextButton.disabled = false;
        checkButton.disabled = true;

        // Show result screen
        showScreen(resultScreen);
        if (userAnswer === correctAnswer) {
            correctAnswers++;
            resultMessage.textContent = 'Отлично! Ты правильно собрал число!';
        } else {
            resultMessage.textContent = 'Попробуй ещё раз — у тебя получится!';
        }

        // Update statistics
        totalAttemptsEl.textContent = totalAttempts;
        correctAnswersEl.textContent = correctAnswers;
    }

    // Load next task
    function loadNextTask() {
        currentTaskIndex = (currentTaskIndex + 1) % tasks.length;
        initTaskScreen();
        checkButton.disabled = false;
        nextButton.disabled = true;
        showScreen(taskScreen);
    }

    // Event listeners
    startButton.addEventListener('click', () => {
        initTaskScreen();
        showScreen(taskScreen);
    });

    checkButton.addEventListener('click', checkAnswer);

    nextButton.addEventListener('click', loadNextTask);

    tryAgainButton.addEventListener('click', () => {
        loadNextTask();
    });
});