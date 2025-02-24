// Configuración del Canvas
const canvas = document.getElementById('drawPad');
const ctx = canvas.getContext('2d');
let drawing = false;
let coords = {x: 0, y: 0};

// Inicialización
function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2c3e50';
}

initCanvas();
window.addEventListener('resize', initCanvas);

// Eventos de Dibujo
canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchmove', draw);
canvas.addEventListener('touchend', stopDrawing);

function startDrawing(e) {
    drawing = true;
    const pos = getPosition(e);
    coords = {x: pos.x, y: pos.y};
}

function draw(e) {
    if (!drawing) return;
    e.preventDefault();
    
    const pos = getPosition(e);
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    coords = pos;
}

function stopDrawing() {
    drawing = false;
}

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX || e.touches[0].clientX) - rect.left,
        y: (e.clientY || e.touches[0].clientY) - rect.top
    };
}

// Procesamiento de Imágenes
document.getElementById('imageUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        document.getElementById('imagePreview').innerHTML = 
            `<img src="${event.target.result}" alt="Previsualización">`;
        processImage(file);
    };
    reader.readAsDataURL(file);
});

async function processImage(image) {
    try {
        // Simulación de API DeepSeek (implementar backend real)
        const formData = new FormData();
        formData.append('image', image);
        
        const response = await fetch('https://api.deepseek.com/v1/ocr', {
            method: 'POST',
            headers: {'Authorization': 'Bearer API_KEY'},
            body: formData
        });
        
        const data = await response.json();
        renderResult(data.equation);
    } catch (error) {
        showError('Error al procesar la imagen');
    }
}

function renderResult(equation) {
    const isChemical = /\\ce\{/.test(equation);
    const wrapper = isChemical ? `$\ce{${equation}}$` : `@${equation}@`;
    
    document.getElementById('liveResult').innerHTML = wrapper;
    MathJax.typesetPromise();
}

function showError(message) {
    document.getElementById('liveResult').innerHTML = 
        `<div class="error">${message}</div>`;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}