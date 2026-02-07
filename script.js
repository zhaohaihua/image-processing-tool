// 全局变量
let baseImage = null;
let adjustImage = null;
let isDragging = false;
let isRotating = false;
let startX = 0;
let startY = 0;
let currentScale = 1;
let currentRotate = 0;
let currentX = 0;
let currentY = 0;
let currentOpacity = 0.7;
let rotateHandle = null;
let imageWrapper = null;
let baseImageZoom = 1;

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
const resolutionWidth = document.getElementById('resolution-width');
const resolutionHeight = document.getElementById('resolution-height');
const resolutionSelect = document.getElementById('resolution-select');
const customResolution = document.getElementById('custom-resolution');
const applyResolutionBtn = document.getElementById('apply-resolution-btn');
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
    applyResolutionBtn.addEventListener('click', handleApplyResolution);
    resolutionSelect.addEventListener('change', handleResolutionSelectChange);
    applyGuidelinesBtn.addEventListener('click', handleApplyGuidelines);
    clearGuidelinesBtn.addEventListener('click', handleClearGuidelines);
    lineOpacityInput.addEventListener('input', handleLineOpacityChange);
    zoomInBtn.addEventListener('click', handleZoomIn);
    zoomOutBtn.addEventListener('click', handleZoomOut);
    zoomResetBtn.addEventListener('click', handleZoomReset);
    
    // 绑定拖拽事件
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
            
            // 设置底图尺寸为当前选择的分辨率
            const width = parseInt(resolutionWidth.value);
            const height = parseInt(resolutionHeight.value);
            
            imageWrapper.style.width = width + 'px';
            imageWrapper.style.height = height + 'px';
            baseImg.style.width = width + 'px';
            baseImg.style.height = height + 'px';
            
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
            // 重置调整参数
            resetAdjustParams();
            // 添加旋转手柄
            addRotateHandles();
        };
        reader.readAsDataURL(file);
    }
}

// 添加旋转手柄
function addRotateHandles() {
    // 移除旧的旋转手柄
    const oldHandles = document.querySelectorAll('.rotate-handle');
    oldHandles.forEach(handle => handle.remove());
    
    // 添加新的旋转手柄
    const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
    positions.forEach(position => {
        const handle = document.createElement('div');
        handle.className = `rotate-handle ${position}`;
        handle.addEventListener('mousedown', (e) => startRotate(e, position));
        imageWrapper.appendChild(handle);
    });
}

// 重置调整参数
function resetAdjustParams() {
    currentScale = 1;
    currentRotate = 0;
    currentX = 0;
    currentY = 0;
    currentOpacity = 0.7;
    opacitySlider.value = 70;
    opacityValue.textContent = '70%';
    updateAdjustImageTransform();
}

// 开始拖拽
function startDrag(e) {
    if (e.target.classList.contains('rotate-handle')) return;
    isDragging = true;
    startX = e.clientX - currentX;
    startY = e.clientY - currentY;
    adjustImg.style.cursor = 'grabbing';
}

// 拖拽中
function drag(e) {
    if (isDragging) {
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateAdjustImageTransform();
    } else if (isRotating) {
        handleRotate(e);
    }
}

// 结束拖拽
function endDrag() {
    isDragging = false;
    isRotating = false;
    adjustImg.style.cursor = 'move';
}

// 开始旋转
function startRotate(e, position) {
    e.preventDefault();
    e.stopPropagation();
    isRotating = true;
    rotateHandle = position;
    
    // 计算图片中心点
    const rect = adjustImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // 计算初始角度
    const initialAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    adjustImg.dataset.initialAngle = initialAngle;
}

// 处理旋转
function handleRotate(e) {
    if (!isRotating) return;
    
    const rect = adjustImg.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const initialAngle = parseFloat(adjustImg.dataset.initialAngle);
    
    const angleDiff = currentAngle - initialAngle;
    currentRotate += angleDiff * (180 / Math.PI);
    
    adjustImg.dataset.initialAngle = currentAngle;
    updateAdjustImageTransform();
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
    adjustImg.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale}) rotate(${currentRotate}deg)`;
    adjustImg.style.opacity = currentOpacity;
}

// 处理矫正
function handleCorrect() {
    if (!adjustImage) {
        alert('请先上传处理图片');
        return;
    }
    
    // 简单的矫正功能 - 重置旋转角度
    currentRotate = 0;
    updateAdjustImageTransform();
    alert('图片已矫正');
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
            
            // 应用旋转
            ctx.rotate(currentRotate * Math.PI / 180);
            
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

// 处理分辨率选择变化
function handleResolutionSelectChange(e) {
    const value = e.target.value;
    
    if (value === 'custom') {
        customResolution.style.display = 'block';
    } else {
        customResolution.style.display = 'none';
        const [width, height] = value.split('x').map(Number);
        resolutionWidth.value = width;
        resolutionHeight.value = height;
    }
}

// 处理应用分辨率
function handleApplyResolution() {
    const width = parseInt(resolutionWidth.value);
    const height = parseInt(resolutionHeight.value);
    
    if (width < 100 || width > 4096 || height < 100 || height > 4096) {
        alert('分辨率必须在100-4096之间');
        return;
    }
    
    imageWrapper.style.width = width + 'px';
    imageWrapper.style.height = height + 'px';
    
    // 如果已有底图，调整底图大小
    if (baseImg.src) {
        baseImg.style.width = width + 'px';
        baseImg.style.height = height + 'px';
        
        // 重新计算缩放比例
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
            imageWrapper.style.transformOrigin = 'top left';
        };
    }
    
    // 清除现有辅助线
    handleClearGuidelines();
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