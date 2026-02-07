// 全局变量
let baseImage = null;
let adjustImage = null;
let isDragging = false;
let startX = 0;
let startY = 0;
let currentScale = 1;
let currentX = 0;
let currentY = 0;
let currentOpacity = 0.7;
let imageWrapper = null;
let baseImageZoom = 1;

let distortionPoints = {
    tl: { x: 0, y: 0 },
    tr: { x: 0, y: 0 },
    bl: { x: 0, y: 0 },
    br: { x: 0, y: 0 }
};

let draggingDistortionPoint = null;
let selectedDistortionPoint = 'tl';
let imageBounds = { width: 0, height: 0 };

// DOM元素
const baseImageInput = document.getElementById('base-image');
const adjustImageInput = document.getElementById('adjust-image');
const selectBgBtn = document.getElementById('select-bg-btn');
const selectImgBtn = document.getElementById('select-img-btn');
const baseImg = document.getElementById('base-img');
const adjustImg = document.getElementById('adjust-img');
const opacitySlider = document.getElementById('opacity-slider');
const opacityValue = document.getElementById('opacity-value');
const correctBtn = document.getElementById('correct-btn');
const cropBtn = document.getElementById('crop-btn');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const horizontalLinesInput = document.getElementById('horizontal-lines');
const verticalLinesInput = document.getElementById('vertical-lines');
const lineColorInput = document.getElementById('line-color');
const lineOpacityInput = document.getElementById('line-opacity');
const lineOpacityValue = document.getElementById('line-opacity-value');
const applyGuidelinesBtn = document.getElementById('apply-guidelines-btn');
const clearGuidelinesBtn = document.getElementById('clear-guidelines-btn');
const guidelinesContainer = document.getElementById('guidelines-container');
const zoomInBtn = document.getElementById('zoom-in-btn');
const zoomOutBtn = document.getElementById('zoom-out-btn');
const zoomResetBtn = document.getElementById('zoom-reset-btn');
const applyDistortionBtn = document.getElementById('apply-distortion-btn');
const resetDistortionBtn = document.getElementById('reset-distortion-btn');
const pointTL = document.getElementById('point-tl');
const pointTR = document.getElementById('point-tr');
const pointBL = document.getElementById('point-bl');
const pointBR = document.getElementById('point-br');

// 初始化
function init() {
    imageWrapper = document.getElementById('image-wrapper');
    
    // 绑定事件监听器
    selectBgBtn.addEventListener('click', () => baseImageInput.click());
    selectImgBtn.addEventListener('click', () => adjustImageInput.click());
    baseImageInput.addEventListener('change', handleBaseImageUpload);
    adjustImageInput.addEventListener('change', handleAdjustImageUpload);
    opacitySlider.addEventListener('input', handleOpacityChange);
    correctBtn.addEventListener('click', handleCorrect);
    cropBtn.addEventListener('click', handleCrop);
    resetBtn.addEventListener('click', handleReset);
    saveBtn.addEventListener('click', handleSave);
    applyGuidelinesBtn.addEventListener('click', handleApplyGuidelines);
    clearGuidelinesBtn.addEventListener('click', handleClearGuidelines);
    lineOpacityInput.addEventListener('input', handleLineOpacityChange);
    zoomInBtn.addEventListener('click', handleZoomIn);
    zoomOutBtn.addEventListener('click', handleZoomOut);
    zoomResetBtn.addEventListener('click', handleZoomReset);
    applyDistortionBtn.addEventListener('click', handleApplyDistortion);
    resetDistortionBtn.addEventListener('click', handleResetDistortion);
    
    pointTL.addEventListener('mousedown', (e) => startDragDistortionPoint(e, 'tl'));
    pointTR.addEventListener('mousedown', (e) => startDragDistortionPoint(e, 'tr'));
    pointBL.addEventListener('mousedown', (e) => startDragDistortionPoint(e, 'bl'));
    pointBR.addEventListener('mousedown', (e) => startDragDistortionPoint(e, 'br'));
    
    pointTL.addEventListener('click', () => selectDistortionPoint('tl'));
    pointTR.addEventListener('click', () => selectDistortionPoint('tr'));
    pointBL.addEventListener('click', () => selectDistortionPoint('bl'));
    pointBR.addEventListener('click', () => selectDistortionPoint('br'));
    
    document.addEventListener('mousemove', dragDistortionPoint);
    document.addEventListener('mouseup', endDragDistortionPoint);
    document.addEventListener('keydown', handleKeyboard);
    
    adjustImg.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // 绑定鼠标滚轮缩放事件
    adjustImg.addEventListener('wheel', handleWheelZoom);
}

// 处理固定底图上传
function handleBaseImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgUrl = e.target.result;
            baseImg.src = imgUrl;
            baseImage = imgUrl;
            
            // 加载图片获取原始尺寸
            const img = new Image();
            img.src = imgUrl;
            img.onload = function() {
                // 获取工作区尺寸
                const canvasContainer = document.querySelector('.canvas-container');
                const containerWidth = canvasContainer.clientWidth - 40;
                const containerHeight = canvasContainer.clientHeight - 40;
                
                // 计算缩放比例，使图片适应工作区
                const scaleX = containerWidth / img.width;
                const scaleY = containerHeight / img.height;
                const scale = Math.min(scaleX, scaleY, 1);
                
                // 设置图片边界
                imageBounds.width = img.width * scale;
                imageBounds.height = img.height * scale;
                
                // 应用缩放
                baseImageZoom = scale;
                imageWrapper.style.transform = `scale(${baseImageZoom})`;
                imageWrapper.style.transformOrigin = 'top left';
            };
        };
        reader.readAsDataURL(file);
    }
}

// 处理可调整图片上传
function handleAdjustImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgUrl = e.target.result;
            adjustImg.src = imgUrl;
            adjustImage = imgUrl;
            resetAdjustParams();
        };
        reader.readAsDataURL(file);
    }
}

// 重置调整参数
function resetAdjustParams() {
    currentScale = 1;
    currentX = 0;
    currentY = 0;
    currentOpacity = 0.7;
    opacitySlider.value = 70;
    opacityValue.textContent = '70%';
    updateAdjustImageTransform();
}

// 开始拖拽
function startDrag(e) {
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    adjustImg.style.cursor = 'grabbing';
}

// 拖拽中
function drag(e) {
    if (draggingDistortionPoint) {
        dragDistortionPoint(e);
    } else if (isDragging) {
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateAdjustImageTransform();
    }
}

// 结束拖拽
function endDrag() {
    isDragging = false;
    adjustImg.style.cursor = 'move';
    
    if (draggingDistortionPoint) {
        endDragDistortionPoint();
    }
}

// 处理透明度变化
function handleOpacityChange(e) {
    currentOpacity = parseInt(e.target.value) / 100;
    opacityValue.textContent = `${e.target.value}%`;
    updateAdjustImageTransform();
}

// 处理鼠标滚轮缩放
function handleWheelZoom(e) {
    e.preventDefault();
    
    // 计算缩放因子
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    
    // 更新缩放值
    currentScale *= zoomFactor;
    
    // 限制缩放范围
    currentScale = Math.max(0.1, Math.min(3, currentScale));
    
    // 应用变换
    updateAdjustImageTransform();
}

// 更新可调整图片的变换
function updateAdjustImageTransform() {
    adjustImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale})`;
    adjustImg.style.opacity = currentOpacity;
}

// 处理矫正
function handleCorrect() {
    if (!adjustImage) {
        alert('请先上传处理图片');
        return;
    }
    
    alert('图片已重置');
}

// 处理裁剪
function handleCrop() {
    if (!adjustImage) {
        alert('请先上传处理图片');
        return;
    }
    
    alert('裁剪功能开发中...');
}

// 处理重置
function handleReset() {
    resetAdjustParams();
}

// 处理保存
function handleSave() {
    if (!baseImage || !adjustImage) {
        alert('请先上传两张图片');
        return;
    }
    
    // 创建Canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // 获取图片尺寸
    const baseImgElement = new Image();
    baseImgElement.src = baseImage;
    
    baseImgElement.onload = function() {
        // 设置Canvas尺寸为底图尺寸
        canvas.width = baseImgElement.width;
        canvas.height = baseImgElement.height;
        
        // 绘制黑色背景
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 绘制可调整图片
        const adjustImgElement = new Image();
        adjustImgElement.src = adjustImage;
        
        adjustImgElement.onload = function() {
            // 保存当前状态
            ctx.save();
            
            // 计算绘制参数
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            // 转换坐标系到Canvas中心
            ctx.translate(centerX, centerY);
            
            // 应用缩放
            ctx.scale(currentScale, currentScale);
            
            // 应用平移
            ctx.translate(currentX, currentY);
            
            // 设置透明度为100%
            ctx.globalAlpha = 1.0;
            
            // 绘制图片，以图片中心为原点
            ctx.drawImage(
                adjustImgElement,
                -adjustImgElement.width / 2,
                -adjustImgElement.height / 2
            );
            
            // 恢复状态
            ctx.restore();
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = 'aligned-image.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
    };
}

// 处理线条透明度变化
function handleLineOpacityChange(e) {
    lineOpacityValue.textContent = e.target.value + '%';
}

// 处理应用辅助线
function handleApplyGuidelines() {
    // 清除现有辅助线
    handleClearGuidelines();
    
    const horizontalCount = parseInt(horizontalLinesInput.value);
    const verticalCount = parseInt(verticalLinesInput.value);
    const color = lineColorInput.value;
    const opacity = parseInt(lineOpacityInput.value) / 100;
    
    // 获取容器尺寸
    const containerWidth = imageWrapper.offsetWidth;
    const containerHeight = imageWrapper.offsetHeight;
    
    // 创建水平线
    for (let i = 0; i < horizontalCount; i++) {
        const line = document.createElement('div');
        line.className = 'guideline horizontal';
        line.style.backgroundColor = color;
        line.style.opacity = opacity;
        
        // 计算位置，均匀分布
        const position = (i + 1) * (containerHeight / (horizontalCount + 1));
        line.style.top = position + 'px';
        
        guidelinesContainer.appendChild(line);
    }
    
    // 创建垂直线
    for (let i = 0; i < verticalCount; i++) {
        const line = document.createElement('div');
        line.className = 'guideline vertical';
        line.style.backgroundColor = color;
        line.style.opacity = opacity;
        
        // 计算位置，均匀分布
        const position = (i + 1) * (containerWidth / (verticalCount + 1));
        line.style.left = position + 'px';
        
        guidelinesContainer.appendChild(line);
    }
}

// 处理清除辅助线
function handleClearGuidelines() {
    guidelinesContainer.innerHTML = '';
}

// 处理放大
function handleZoomIn() {
    baseImageZoom = Math.min(baseImageZoom * 1.2, 3);
    imageWrapper.style.transform = `scale(${baseImageZoom})`;
}

// 处理缩小
function handleZoomOut() {
    baseImageZoom = Math.max(baseImageZoom / 1.2, 0.1);
    imageWrapper.style.transform = `scale(${baseImageZoom})`;
}

// 处理重置缩放
function handleZoomReset() {
    if (baseImage) {
        const img = new Image();
        img.src = baseImage;
        img.onload = function() {
            const canvasContainer = document.querySelector('.canvas-container');
            const containerWidth = canvasContainer.clientWidth - 40;
            const containerHeight = canvasContainer.clientHeight - 40;
            
            const scaleX = containerWidth / img.width;
            const scaleY = containerHeight / img.height;
            const scale = Math.min(scaleX, scaleY, 1);
            
            baseImageZoom = scale;
            imageWrapper.style.transform = `scale(${baseImageZoom})`;
        };
    } else {
        baseImageZoom = 1;
        imageWrapper.style.transform = `scale(${baseImageZoom})`;
    }
}

// 初始化应用
init();

// 畸变矫正功能
function startDragDistortionPoint(e, corner) {
    e.preventDefault();
    e.stopPropagation();
    draggingDistortionPoint = corner;
    selectDistortionPoint(corner);
    
    const point = e.target.closest('.distortion-point');
    const rect = point.getBoundingClientRect();
    
    startX = e.clientX - rect.left - rect.width / 2;
    startY = e.clientY - rect.top - rect.height / 2;
    
    point.style.cursor = 'grabbing';
}

function dragDistortionPoint(e) {
    if (!draggingDistortionPoint) return;
    
    const point = e.target.closest('.distortion-point');
    if (!point) return;
    
    const rect = point.getBoundingClientRect();
    
    let x = e.clientX - startX - rect.width / 2;
    let y = e.clientY - startY - rect.height / 2;
    
    const maxX = imageBounds.width / 2;
    const maxY = imageBounds.height / 2;
    
    x = Math.max(-maxX, Math.min(maxX, x));
    y = Math.max(-maxY, Math.min(maxY, y));
    
    distortionPoints[draggingDistortionPoint].x = x;
    distortionPoints[draggingDistortionPoint].y = y;
    
    updateDistortionTransform();
}

function endDragDistortionPoint() {
    draggingDistortionPoint = null;
    document.querySelectorAll('.distortion-point').forEach(p => {
        p.style.cursor = 'move';
    });
}

function handleApplyDistortion() {
    if (!baseImage || !adjustImage) {
        alert('请先上传两张图片');
        return;
    }
    
    applyDistortionTransform();
    alert('畸变矫正已应用');
}

function handleResetDistortion() {
    distortionPoints = {
        tl: { x: 0, y: 0 },
        tr: { x: 0, y: 0 },
        bl: { x: 0, y: 0 },
        br: { x: 0, y: 0 }
    };
    
    updateDistortionTransform();
    alert('控制点已重置');
}

function selectDistortionPoint(corner) {
    selectedDistortionPoint = corner;
    
    document.querySelectorAll('.distortion-point').forEach(p => {
        p.classList.remove('selected');
    });
    
    const pointMap = {
        'tl': pointTL,
        'tr': pointTR,
        'bl': pointBL,
        'br': pointBR
    };
    
    pointMap[corner].classList.add('selected');
    pointMap[corner].focus();
}

function handleKeyboard(e) {
    if (!baseImage || !adjustImage) return;
    
    const step = e.shiftKey ? 10 : 2;
    
    switch(e.key) {
        case 'ArrowUp':
            distortionPoints[selectedDistortionPoint].y -= step;
            e.preventDefault();
            break;
        case 'ArrowDown':
            distortionPoints[selectedDistortionPoint].y += step;
            e.preventDefault();
            break;
        case 'ArrowLeft':
            distortionPoints[selectedDistortionPoint].x -= step;
            e.preventDefault();
            break;
        case 'ArrowRight':
            distortionPoints[selectedDistortionPoint].x += step;
            e.preventDefault();
            break;
        case '1':
            selectDistortionPoint('tl');
            e.preventDefault();
            break;
        case '2':
            selectDistortionPoint('tr');
            e.preventDefault();
            break;
        case '3':
            selectDistortionPoint('bl');
            e.preventDefault();
            break;
        case '4':
            selectDistortionPoint('br');
            e.preventDefault();
            break;
        default:
            return;
    }
    
    const maxX = imageBounds.width / 2;
    const maxY = imageBounds.height / 2;
    
    distortionPoints[selectedDistortionPoint].x = Math.max(-maxX, Math.min(maxX, distortionPoints[selectedDistortionPoint].x));
    distortionPoints[selectedDistortionPoint].y = Math.max(-maxY, Math.min(maxY, distortionPoints[selectedDistortionPoint].y));
    
    updateDistortionTransform();
}

function updateDistortionTransform() {
    if (!baseImage || !adjustImage) return;
    
    const img = new Image();
    img.src = baseImage;
    
    img.onload = function() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0);
        
        const adjustImgElement = new Image();
        adjustImgElement.src = adjustImage;
        
        adjustImgElement.onload = function() {
            ctx.save();
            
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            ctx.translate(centerX, centerY);
            ctx.scale(currentScale, currentScale);
            ctx.translate(currentX, currentY);
            ctx.globalAlpha = 1.0;
            
            ctx.drawImage(
                adjustImgElement,
                -adjustImgElement.width / 2,
                -adjustImgElement.height / 2
            );
            
            ctx.restore();
            
            adjustImg.src = canvas.toDataURL('image/png');
        };
    };
}