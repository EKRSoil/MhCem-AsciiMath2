/// Configuración del Canvas
const canvas = document.getElementById('drawPad');
const ctx = canvas.getContext('2d');
let drawing = false;
let coords = {x: 0, y: 0};

// Inicializar Canvas
function initCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2c3e50';
}
initCanvas();
window.addEventListener('resize', initCanvas);

// Eventos de Dibujo
canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    coords = getPosition(e);
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    draw(e);
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    coords = getPosition(e.touches[0]);
    drawing = true;
});
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!drawing) return;
    draw(e.touches[0]);
});
canvas.addEventListener('touchend', () => drawing = false);

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function draw(e) {
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    coords = getPosition(e);
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
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

// Función Principal de Procesamiento
async function processImage(image) {
    const formData = new FormData();
    formData.append('file', image);
    formData.append('apikey', 'K85275705488957'); // ¡Obtén tu API Key en ocr.space!
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');

    try {
        const response = await fetch('https://api.ocr.space/parse/image', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage);
        
        const equation = data.ParsedResults[0].ParsedText;
        renderResult(equation);
    } catch (error) {
        showError(`Error: ${error.message}`);
    }
}

// Procesar Dibujo
async function processDrawing() {
    const image = canvas.toDataURL('image/png');
    const blob = await fetch(image).then(res => res.blob());
    processImage(blob);
}

// Renderizar Resultado
function renderResult(equation) {
    let formattedEquation = equation.trim();
    
    // Clasificación automática
    if (formattedEquation.includes('->') || formattedEquation.match(/[A-Z][a-z]?\d*/)) {
        formattedEquation = `\\ce{${formattedEquation}}`;
    }
    
    const isChemical = formattedEquation.startsWith('\\ce{');
    const wrapper = isChemical ? `$${formattedEquation}$` : `@${formattedEquation}@`;
    
    document.getElementById('liveResult').innerHTML = wrapper;
    MathJax.typesetPromise();
}

// Utilidades
function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function showError(message) {
    document.getElementById('liveResult').innerHTML = 
        `<div class="error">${message}</div>`;
}