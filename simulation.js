const canvas = document.getElementById('fieldCanvas');
const ctx = canvas.getContext('2d');

const charges = [
    { x: canvas.width / 3, y: canvas.height / 2, q: 1, radius: 10, color: 'red' },  // 正の点電荷
    { x: 2 * canvas.width / 3, y: canvas.height / 2, q: -1, radius: 10, color: 'blue' } // 負の点電荷
];

const maxArrowLength = 10; // 矢印の最大長さ
const minArrowLength = 10;  // 矢印の最小長さ
const gridSpacing = 20;
const fieldStrengthFactor = 10000; // 電場の強さに対するスケーリング係数を調整
let isDragging = false;
let draggedChargeIndex = -1;

function drawArrow(fromX, fromY, toX, toY) {
    const headLength = 5; // 矢印の頭の長さ
    const dx = toX - fromX;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle - Math.PI / 6), toY - headLength * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLength * Math.cos(angle + Math.PI / 6), toY - headLength * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawCharge(charge) {
    ctx.beginPath();
    ctx.arc(charge.x, charge.y, charge.radius, 0, 2 * Math.PI);
    ctx.fillStyle = charge.color;
    ctx.fill();
    ctx.stroke();
}

function drawElectricField() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    charges.forEach(drawCharge);
    for (let x = 0; x < canvas.width; x += gridSpacing) {
        for (let y = 0; y < canvas.height; y += gridSpacing) {
            let ex = 0;
            let ey = 0;
            charges.forEach(charge => {
                const dx = x - charge.x;
                const dy = y - charge.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const fieldStrength = charge.q / (distance * distance);
                ex += (dx / distance) * fieldStrength * fieldStrengthFactor;
                ey += (dy / distance) * fieldStrength * fieldStrengthFactor;
            });

            const arrowLength = Math.min(maxArrowLength, Math.max(minArrowLength, Math.sqrt(ex * ex + ey * ey)));
            drawArrow(x, y, x + ex / Math.sqrt(ex * ex + ey * ey) * arrowLength, y + ey / Math.sqrt(ex * ex + ey * ey) * arrowLength);
        }
    }
}

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    charges.forEach((charge, index) => {
        const dx = mouseX - charge.x;
        const dy = mouseY - charge.y;
        if (Math.sqrt(dx * dx + dy * dy) < charge.radius) {
            isDragging = true;
            draggedChargeIndex = index;
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && draggedChargeIndex !== -1) {
        const rect = canvas.getBoundingClientRect();
        charges[draggedChargeIndex].x = e.clientX - rect.left;
        charges[draggedChargeIndex].y = e.clientY - rect.top;
        drawElectricField();
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedChargeIndex = -1;
});

canvas.addEventListener('mouseout', () => {
    isDragging = false;
    draggedChargeIndex = -1;
});

drawElectricField();