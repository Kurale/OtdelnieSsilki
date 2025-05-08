document.addEventListener("DOMContentLoaded", function () {
    const connectors = [
        document.getElementById("connector_1"),
        document.getElementById("connector_2"),
        document.getElementById("connector_3"),
        document.getElementById("connector_4")
    ];
    const gnezda = [
        document.getElementById("gnezdo_1"),
        document.getElementById("gnezdo_2"),
        document.getElementById("gnezdo_3"),
        document.getElementById("gnezdo_4")
    ];
    const svg = document.getElementById("victorinaShablon");
    const snapThreshold = 30; // Пороговое расстояние для снапа

    const connectionMatrix = {
        "connector_1": "gnezdo_2",
        "connector_2": "gnezdo_4",
        "connector_3": "gnezdo_1",
        "connector_4": "gnezdo_3"
    };

    // Функция для проверки соединений
    function checkConnections() {
        let correct = 0;
        let incorrect = 0;
        connectors.forEach((connector) => {
            if (connector.dataset.snappedTo === connectionMatrix[connector.id]) {
                correct++;
            } else {
                incorrect++;
            }
        });
        // Обновление счетчиков
        document.getElementById("scoreCorrect").textContent = `${correct}`;
        document.getElementById("scoreIncorrect").textContent = `${incorrect}`;
    }

    // Обработчик для кнопки "Проверить"
    document.getElementById("buttonProverit").addEventListener("click", function () {
        checkConnections();
    });

    connectors.forEach((connector) => {
        let isDragging = false;
        let startX = connector.cx.baseVal.value;
        let startY = connector.cy.baseVal.value;
        let line;
        let snappedGnezdo = null;

        connector.addEventListener("mousedown", (e) => {
            isDragging = true;
            connector.dataset.snappedTo = ""; // Сбрасываем привязку
            snappedGnezdo = null;

            if (!line) {
                line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("stroke", "#9aa8cf");
                line.setAttribute("stroke-width", "2");
                svg.appendChild(line);
            }

            line.setAttribute("x1", startX);
            line.setAttribute("y1", startY);
            line.setAttribute("x2", startX);
            line.setAttribute("y2", startY);
        });

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            let CTM = svg.getScreenCTM();
            let x = (e.clientX - CTM.e) / CTM.a;
            let y = (e.clientY - CTM.f) / CTM.d;

            connector.setAttribute("cx", x);
            connector.setAttribute("cy", y);
            line.setAttribute("x2", x);
            line.setAttribute("y2", y);
        });

        document.addEventListener("mouseup", () => {
            if (!isDragging) return;
            isDragging = false;

            let closestGnezdo = null;
            let minDistance = Infinity;
            let connectorX = connector.cx.baseVal.value;
            let connectorY = connector.cy.baseVal.value;

            gnezda.forEach((gnezdo) => {
                let gX = gnezdo.cx.baseVal.value;
                let gY = gnezdo.cy.baseVal.value;
                let distance = Math.hypot(gX - connectorX, gY - connectorY);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestGnezdo = gnezdo;
                }
            });

            if (closestGnezdo && minDistance <= snapThreshold) {
                let snapX = closestGnezdo.cx.baseVal.value;
                let snapY = closestGnezdo.cy.baseVal.value;
                connector.setAttribute("cx", snapX);
                connector.setAttribute("cy", snapY);
                line.setAttribute("x2", snapX);
                line.setAttribute("y2", snapY);
                connector.dataset.snappedTo = closestGnezdo.id;
            } else {
                connector.setAttribute("cx", startX);
                connector.setAttribute("cy", startY);
                line.setAttribute("x2", startX);
                line.setAttribute("y2", startY);
                if (line) {
                    svg.removeChild(line);
                    line = null;
                }
            }
        });
    });
});
