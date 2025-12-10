/**
 * 全景编辑器 - 主应用
 * 完整功能版本
 */

'use strict';

// 应用状态
const appState = {
  viewer: null,
  scenes: [],
  currentScene: null,
  hotspots: [],
  autoRotate: false,
  rotateAnimation: null,
  gyroEnabled: false
};

// API_BASE_URL moved to dynamic initialization below

/**
 * 显示通知
 */
function showNotification(message, type = 'info') {
  const container = document.getElementById('notification-container') || (() => {
    const div = document.createElement('div');
    div.id = 'notification-container';
    div.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px;';
    document.body.appendChild(div);
    return div;
  })();

  const toast = document.createElement('div');
  toast.className = `notification ${type}`;
  toast.style.cssText = `
    padding: 12px 20px;
    border-radius: 4px;
    background: ${type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6'};
    color: white;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    min-width: 200px;
    animation: slideIn 0.3s ease-out;
    display: flex;
    align-items: center;
    justify-content: space-between;
  `;
  
  // Add animation keyframes if not present
  if (!document.getElementById('notification-style')) {
    const style = document.createElement('style');
    style.id = 'notification-style';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeOut 0.3s ease-out forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 获取URL参数
 */
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 全局项目ID
const PROJECT_ID = getUrlParam('projectId');

// API Base URL from query param or default
const API_PARAM = getUrlParam('api');
// 如果是本地开发环境，且没有传入 api 参数，默认使用 localhost:8000
// 否则默认为空字符串（使用相对路径）
const DEFAULT_API_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
  ? 'http://localhost:8000' 
  : '';
const API_BASE_URL = API_PARAM ? decodeURIComponent(API_PARAM) : DEFAULT_API_URL;
function initApp() {
  console.log('🚀 初始化全景编辑器...');
  console.log('Project ID:', PROJECT_ID);
  
  // 检查 Marzipano
  if (typeof Marzipano === 'undefined') {
    console.error('❌ Marzipano 未加载');
    alert('全景库加载失败，请刷新页面重试');
    return;
  }

  // 创建 Marzipano viewer
  appState.viewer = new Marzipano.Viewer(document.getElementById('pano'), {
    controls: {
      mouseViewMode: 'drag'
    }
  });

  // 绑定事件
  bindEvents();
  
  // 加载项目
  if (PROJECT_ID) {
    loadProjectFromBackend();
  } else {
    loadProject(); // Fallback to localStorage
  }
  
  // 如果没有场景，显示默认星空
  // Note: loadProjectFromBackend is async, so this check might happen before load finishes.
  // We'll handle empty state inside load functions.
  if (!PROJECT_ID && appState.scenes.length === 0) {
    showDefaultSky();
  }
  
  console.log('✅ 应用初始化完成');
}

/**
 * 加载单个场景 (Promise wrapper)
 */
function loadOnePano(pano) {
  return new Promise((resolve) => {
    // Use URL from server
    const imageUrl = pano.url.startsWith('http') ? pano.url : `${API_BASE_URL}${pano.url}`;
    
    let thumbnailUrl = pano.thumbnail || imageUrl;
    if (pano.thumbnail && !pano.thumbnail.startsWith('http')) {
        thumbnailUrl = `${API_BASE_URL}${pano.thumbnail}`;
    }
    
    const img = new Image();
    img.onload = () => {
      try {
         const aspectRatio = img.width / img.height;
         let geometry;
         if (aspectRatio > 1.8 && aspectRatio < 2.2) {
           geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
         } else {
           geometry = new Marzipano.CubeGeometry([{ tileSize: 1024, size: 1024 }]);
         }
         const limiter = Marzipano.RectilinearView.limit.traditional(4096, 120 * Math.PI / 180);
         
         let initialView = { yaw: 0, pitch: 0, fov: 90 * Math.PI / 180 };
         if (pano.scene_data && pano.scene_data.view) {
           initialView = pano.scene_data.view;
         }
         
         const view = new Marzipano.RectilinearView(initialView, limiter);
         
         const source = Marzipano.ImageUrlSource.fromString(imageUrl);
         const scene = appState.viewer.createScene({
           source: source,
           geometry: geometry,
           view: view,
           pinFirstLevel: true
         });
         
         const sceneData = {
           id: pano.id,
           name: pano.name,
           imageData: imageUrl,
           scene: scene,
           view: view,
           hotspots: [],
           thumbnail: thumbnailUrl,
           isDefault: false
         };
         
         if (pano.hotspots && Array.isArray(pano.hotspots)) {
           sceneData.hotspots = pano.hotspots;
         }
         
         appState.scenes.push(sceneData);
         resolve(sceneData);
      } catch (err) {
         console.error('Error creating scene:', err);
         resolve(null);
      }
    };
    img.onerror = () => {
       console.error('Failed to load image:', imageUrl);
       resolve(null);
    };
    img.src = imageUrl;
  });
}

/**
 * 从后端加载项目 (优化版：优先加载首图，后台加载其余)
 */
async function loadProjectFromBackend() {
  if (!PROJECT_ID) return;
  
  showLoading();
  setProgress(10, '获取项目列表...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/panoramas/?project_id=${PROJECT_ID}`);
    if (!response.ok) throw new Error('Failed to load project data');
    
    const panos = await response.json();
    console.log('Loaded panos:', panos);
    
    if (panos.length === 0) {
      showDefaultSky();
      hideLoading();
      return;
    }
    
    // 1. Load the first panorama immediately
    setProgress(30, '加载首个场景...');
    await loadOnePano(panos[0]);
    
    updateSceneList();
    if (appState.scenes.length > 0) {
      switchScene(appState.scenes[0].id);
    }
    
    // 2. Hide loading screen immediately so user can interact
    hideLoading();
    
    // 3. Load remaining panoramas in background
    if (panos.length > 1) {
      console.log('Background loading remaining scenes...');
      // Load sequentially in background to avoid freezing UI
      for (let i = 1; i < panos.length; i++) {
        await loadOnePano(panos[i]);
        updateSceneList(); // Update list as they come in
      }
      console.log('All scenes loaded.');
    }
    
  } catch (e) {
    console.error('加载项目失败:', e);
    alert('加载项目失败，请检查网络');
    showDefaultSky();
    hideLoading();
  }
}

/**
 * 保存项目 (适配后端)
 */
async function saveProject() {
  const saveStatus = document.getElementById('saveStatus');
  const showStatus = (text) => {
    if (saveStatus) {
      saveStatus.textContent = text;
      saveStatus.classList.add('show');
    }
  };
  const hideStatus = () => {
    if (saveStatus) {
      saveStatus.classList.remove('show');
    }
  };

  if (!PROJECT_ID) {
    // Fallback to localStorage
    const projectData = {
      scenes: appState.scenes.map(s => ({
        id: s.id,
        name: s.name,
        imageData: s.imageData,
        hotspots: s.hotspots,
        thumbnail: s.thumbnail,
        isDefault: s.isDefault
      }))
    };
    localStorage.setItem('pano_project_structure', JSON.stringify(projectData));
    console.log('项目结构已保存 (Local)');
    showStatus('已保存');
    setTimeout(hideStatus, 2000);
    return;
  }

  // Save to Backend
  // We need to upsert scenes. 
  // For simplicity, we can just update the current scene or iterate all.
  // Better approach: Sync all changes.
  
  const saveBtn = document.getElementById('saveBtn');
  const originalText = saveBtn ? saveBtn.textContent : ''; // Handle if saveBtn is null but usually it is there
  if (saveBtn) {
    saveBtn.textContent = '保存中...';
    saveBtn.disabled = true;
  }
  showStatus('正在保存...');

  try {
    for (const sceneData of appState.scenes) {
      if (sceneData.isDefault) continue;
      
      const payload = {
        id: sceneData.id.startsWith('scene_') ? null : sceneData.id, // If it has 'scene_' prefix, it might be new and not yet persisted with DB ID, but wait, createScene generates temp ID.
        // Actually, if we loaded from DB, ID is DB ID. If new, it is temp ID.
        // But our create_panorama endpoint expects us to POST to create.
        // Let's assume if ID starts with 'scene_', it's new.
        project_id: PROJECT_ID,
        name: sceneData.name,
        url: sceneData.imageData, // This should be the server URL
        thumbnail: sceneData.thumbnail,
        hotspots: sceneData.hotspots,
        scene_data: {
          view: sceneData.view.parameters()
        }
      };

      if (sceneData.id.startsWith('scene_') || sceneData.id.startsWith('PANO-') === false) {
         // Create new
         const res = await fetch(`${API_BASE_URL}/api/v1/panoramas/`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
         });
         if (res.ok) {
           const newPano = await res.json();
           sceneData.id = newPano.id; // Update ID to DB ID
         }
      } else {
        // Update existing
        await fetch(`${API_BASE_URL}/api/v1/panoramas/${sceneData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
    }
    console.log('项目已保存 (Server)');
    if (saveBtn) saveBtn.textContent = '已保存';
    showStatus('已保存');
    setTimeout(() => { 
        if (saveBtn) { saveBtn.textContent = originalText; saveBtn.disabled = false; } 
        hideStatus();
    }, 2000);
    
  } catch (e) {
    console.error('保存失败:', e);
    // alert('保存失败');
    if (saveBtn) { saveBtn.textContent = '保存失败'; saveBtn.disabled = false; }
    showStatus('保存失败');
    setTimeout(hideStatus, 3000);
  }
}


/**
 * 绑定所有事件
 */
function bindEvents() {
  // 上传区域事件
  const uploadArea = document.getElementById('uploadArea');
  const fileInput = document.getElementById('fileInput');
  
  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', handleFileSelect);
  
  // 拖拽上传
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    handleFileSelect({ target: { files: e.dataTransfer.files } });
  });
  
  // 其他按钮事件
  document.getElementById('uploadTrigger').addEventListener('click', () => fileInput.click());
  document.getElementById('addSceneBtn').addEventListener('click', () => fileInput.click());
  const sidebarToggle = document.getElementById('sidebarToggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      const sidebar = document.getElementById('sidebar');
      sidebar.classList.toggle('collapsed');
      renderSceneDock();
    });
  }
  // Bottom control bar bindings
  const bottomAutoRotateBtn = document.getElementById('bottomAutoRotateBtn');
  if (bottomAutoRotateBtn) bottomAutoRotateBtn.addEventListener('click', toggleAutoRotate);
  
  const bottomFullscreenBtn = document.getElementById('bottomFullscreenBtn');
  if (bottomFullscreenBtn) bottomFullscreenBtn.addEventListener('click', toggleFullscreen);

  const bottomCompassBtn = document.getElementById('bottomCompassBtn');
  if (bottomCompassBtn) bottomCompassBtn.addEventListener('click', toggleCompass);

  const gyroBtn = document.getElementById('gyroBtn');
  if (gyroBtn) gyroBtn.addEventListener('click', toggleGyroscope);

  const bottomAddHotspotBtn = document.getElementById('bottomAddHotspotBtn');
  if (bottomAddHotspotBtn) bottomAddHotspotBtn.addEventListener('click', showHotspotModal);

  const bottomAddMusicBtn = document.getElementById('bottomAddMusicBtn');
  if (bottomAddMusicBtn) bottomAddMusicBtn.addEventListener('click', addBackgroundMusic);

  const bottomAddTextBtn = document.getElementById('bottomAddTextBtn');
  if (bottomAddTextBtn) bottomAddTextBtn.addEventListener('click', addTextHotspot);

  const bottomScreenshotBtn = document.getElementById('bottomScreenshotBtn');
  if (bottomScreenshotBtn) bottomScreenshotBtn.addEventListener('click', takeScreenshot);

  // Keep old ID binding just in case
  const oldAutoRotateBtn = document.getElementById('autoRotateBtn');
  if (oldAutoRotateBtn) oldAutoRotateBtn.addEventListener('click', toggleAutoRotate);
  const oldFullscreenBtn = document.getElementById('fullscreenBtn');
  if (oldFullscreenBtn) oldFullscreenBtn.addEventListener('click', toggleFullscreen);
  const oldAddHotspotBtn = document.getElementById('addHotspotBtn');
  if (oldAddHotspotBtn) oldAddHotspotBtn.addEventListener('click', showHotspotModal);
  const toggleHotspotsBtn = document.getElementById('toggleHotspotsBtn');
  if (toggleHotspotsBtn) {
    toggleHotspotsBtn.addEventListener('click', () => {
      toggleHotspots();
      toggleHotspotsBtn.classList.toggle('active');
    });
  }
  const prevSceneBtn = document.getElementById('prevSceneBtn');
  if (prevSceneBtn) prevSceneBtn.addEventListener('click', prevScene);
  const nextSceneBtn = document.getElementById('nextSceneBtn');
  if (nextSceneBtn) nextSceneBtn.addEventListener('click', nextScene);
  const minimapBtn = document.getElementById('minimapBtn');
  if (minimapBtn) minimapBtn.addEventListener('click', toggleMinimap);
  document.getElementById('settingsBtn').addEventListener('click', togglePropertiesPanel);
  document.getElementById('closePanelBtn').addEventListener('click', togglePropertiesPanel);
  const saveBtn = document.getElementById('saveBtn');
  if (saveBtn) saveBtn.addEventListener('click', saveProject);
  const exportBtn = document.getElementById('exportBtn');
  if (exportBtn) exportBtn.addEventListener('click', exportProject);
  const helpBtn = document.getElementById('helpBtn');
  if (helpBtn) helpBtn.addEventListener('click', showHelp);
  const graphBtn = document.getElementById('graphBtn');
  if (graphBtn) graphBtn.addEventListener('click', toggleGraph);
  const depBtn = document.getElementById('depBtn');
  if (depBtn) depBtn.addEventListener('click', showDependencies);
  initResizeHandlers();
  
  // 模态框事件
  document.getElementById('closeModalBtn').addEventListener('click', hideHotspotModal);
  document.getElementById('cancelHotspotBtn').addEventListener('click', hideHotspotModal);
  document.getElementById('confirmHotspotBtn').addEventListener('click', createHotspot);
  
  // 热点类型切换
  document.getElementById('hotspotType').addEventListener('change', (e) => {
    const contentGroup = document.getElementById('hotspotContentGroup');
    const linkGroup = document.getElementById('hotspotLinkGroup');
    if (e.target.value === 'link') {
      contentGroup.style.display = 'none';
      linkGroup.style.display = 'block';
      updateHotspotLinkOptions();
    } else {
      contentGroup.style.display = 'block';
      linkGroup.style.display = 'none';
    }
  });
  
  // 场景名称输入
  document.getElementById('sceneNameInput').addEventListener('change', (e) => {
    if (appState.currentScene) {
      appState.currentScene.name = e.target.value;
      updateSceneList();
      saveProject();
    }
  });
  const exposureInput = document.getElementById('exposureInput');
  const toneSelect = document.getElementById('toneMappingSelect');
  if (exposureInput) exposureInput.addEventListener('input', applyEXRSettings);
  if (toneSelect) toneSelect.addEventListener('change', applyEXRSettings);
  
  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    // Ctrl+S 保存
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      saveProject();
    }
    // F 键全屏
    if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    }
    // 空格键自动旋转
    if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      toggleAutoRotate();
    }
    // H 键切换热点显示
    if ((e.key === 'h' || e.key === 'H') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      toggleHotspots();
    }
    // 左右方向键切换场景
    if (e.key === 'ArrowLeft') {
      prevScene();
    }
    if (e.key === 'ArrowRight') {
      nextScene();
    }
    // Ctrl+E 导出项目
    if (e.ctrlKey && (e.key === 'e' || e.key === 'E')) {
      e.preventDefault();
      exportProject();
    }
    // ? 显示帮助
    if (e.key === '?') {
      showHelp();
    }
    if (e.key === 'd' || e.key === 'D') {
      showDependencies();
    }
  });
}

/**
 * 将 DataURL 转换为 Blob
 */
function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while(n--){
      u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], {type:mime});
}

/**
 * 上传文件到服务器
 */
async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/api/v1/upload/panorama`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    throw new Error('Upload failed: ' + response.statusText);
  }

  const result = await response.json();
  return result;
}

/**
 * 处理文件选择 (优化版：并行上传 + 云端存储)
 */
async function handleFileSelect(e) {
  const files = Array.from(e.target.files);
  if (files.length === 0) return;

  removeDefaultSceneIfPresent();
  showLoading();
  setProgress(1, '准备处理...');

  const total = files.length;
  let completed = 0;
  
  // 并发控制
  const CONCURRENCY = 3;
  
  // 处理单个文件
  const processFile = async (file) => {
    const name = file.name || `图片${Date.now()}`;
    const isImage = file.type.startsWith('image/');
    const isEXR = window.EXRDecoder && EXRDecoder.isEXRFile(name);

    if (!isImage && !isEXR) {
        showNotification(`不支持的文件格式: ${name}`, 'error');
        return;
    }

    // 文件大小检查 (100MB 限制)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
        showNotification(`文件过大 (${(file.size / 1024 / 1024).toFixed(1)}MB), 请上传小于 100MB 的文件`, 'error');
        return;
    }

    try {
      let imageUrl;
      let uploadFileObj = file;

      if (isEXR) {
        // EXR 解码
        const res = await EXRDecoder.processFile(file, (pct, msg) => {
          // 忽略解码进度，主要关注整体进度
        });
        
        // 转换 DataURL 为 Blob (转为 PNG 上传，减小体积)
        const blob = dataURLtoBlob(res.dataURL);
        uploadFileObj = new File([blob], name.replace(/\.exr$/i, '.png'), { type: 'image/png' });
      }

      // 上传到服务器
      // setProgress(Math.round((completed / total) * 100), `上传中: ${name}`);
      const uploadResult = await uploadFile(uploadFileObj);
      imageUrl = uploadResult.url;
      const thumbnailUrl = uploadResult.thumbnail;

      // 创建场景 (使用服务器 URL)
      createScene(imageUrl, name, completed === 0, { thumbnail: thumbnailUrl });
      showNotification(`场景 ${name} 创建成功`, 'success');
      
    } catch (err) {
      console.error('处理文件失败:', err);
      // alert(`文件 ${name} 处理失败: ${err.message}`); // 避免弹窗轰炸
      showNotification(`文件 ${name} 上传失败: ${err.message}`, 'error');
    } finally {
      completed++;
      const pct = Math.round((completed / total) * 100);
      setProgress(pct, `已完成 ${completed}/${total}`);
    }
  };

  // 执行队列
  const queue = [...files];
  const activeJobs = [];

  while (queue.length > 0 || activeJobs.length > 0) {
    while (queue.length > 0 && activeJobs.length < CONCURRENCY) {
      const file = queue.shift();
      const promise = processFile(file);
      activeJobs.push(promise);
      promise.then(() => {
        activeJobs.splice(activeJobs.indexOf(promise), 1);
      });
    }
    
    if (activeJobs.length > 0) {
      await Promise.race(activeJobs);
    }
  }

  hideLoading();
  e.target.value = '';
}

async function applyEXRSettings() {
  const scene = appState.currentScene;
  if (!scene || !scene.exrBuffer) return;
  const exposureEl = document.getElementById('exposureInput');
  const toneEl = document.getElementById('toneMappingSelect');
  const exposure = parseFloat(exposureEl?.value || '1');
  const tone = toneEl?.value || 'ACES';
  showLoading();
  setProgress(10, '应用 HDR 设置...');
  try {
    const dataUrl = await EXRDecoder.renderEXRFromBuffer(scene.exrBuffer, { exposure, toneMapping: tone }, (pct, msg) => {
      setProgress(Math.max(1, Math.min(99, Math.round(pct))), msg || '渲染中...');
    });
    await rebuildSceneTexture(scene, dataUrl);
    setProgress(100, '完成');
  } catch (e) {
    console.error(e);
  } finally {
    setTimeout(() => hideLoading(), 200);
  }
}

async function rebuildSceneTexture(sceneData, newImageData) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let geometry;
      if (aspectRatio > 1.8 && aspectRatio < 2.2) {
        geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
      } else {
        geometry = new Marzipano.CubeGeometry([{ tileSize: 1024, size: 1024 }]);
      }
      const limiter = Marzipano.RectilinearView.limit.traditional(4096, 120 * Math.PI / 180);
      const currentParams = sceneData.view.parameters();
      const view = new Marzipano.RectilinearView(currentParams, limiter);
      const source = Marzipano.ImageUrlSource.fromString(newImageData);
      const newScene = appState.viewer.createScene({ source, geometry, view, pinFirstLevel: true });
      sceneData.scene = newScene;
      sceneData.view = view;
      sceneData.imageData = newImageData;
      sceneData.thumbnail = newImageData;
      if (appState.currentScene?.id === sceneData.id) {
        switchScene(sceneData.id);
      }
      resolve(true);
    };
    img.src = newImageData;
  });
}

function showDependencies() {
  const modal = document.getElementById('depModal');
  const content = document.getElementById('depContent');
  if (!modal || !content) return;
  const hasThree = !!window.THREE;
  const hasEXR = !!(window.THREE && (THREE.EXRLoader || window.createEXRLoader || window.getEXRLoaderClass));
  const sources = [
    { name: '本地 three.min.js', url: 'pano-viewer/libs/three.min.js' },
    { name: '本地 EXRLoader.js', url: 'pano-viewer/libs/EXRLoader.js' },
    { name: 'CDN three', url: 'cdn.jsdelivr/cdnjs/unpkg' },
    { name: 'CDN EXRLoader', url: 'cdn.jsdelivr/cdnjs/unpkg' }
  ];
  const html = `
    <div>Three.js：${hasThree ? '已加载' : '未加载'}</div>
    <div>EXRLoader：${hasEXR ? '已加载' : '未加载'}</div>
    <div style="margin-top:8px;color:#64748b;">建议将 three.min.js 和 EXRLoader.js 放到目录：pano-viewer/libs/ 并刷新页面，以避免网络拦截。</div>
  `;
  content.innerHTML = html;
  modal.style.display = 'flex';
  const closeBtn = document.getElementById('closeDepBtn');
  const confirmBtn = document.getElementById('confirmDepBtn');
  const hide = () => { modal.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = hide;
  if (confirmBtn) confirmBtn.onclick = hide;
}

/**
 * 创建场景
 */
function createScene(imageData, filename, switchTo = false, options = {}) {
  const sceneId = 'scene_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  const sceneName = filename.replace(/\.[^/.]+$/, '');
  
  const source = Marzipano.ImageUrlSource.fromString(imageData);
  
  const img = new Image();
  img.onload = () => {
    const aspectRatio = img.width / img.height;
    let geometry;
    
    if (aspectRatio > 1.8 && aspectRatio < 2.2) {
      geometry = new Marzipano.EquirectGeometry([{ width: 4096 }]);
    } else {
      geometry = new Marzipano.CubeGeometry([{ tileSize: 1024, size: 1024 }]);
    }
    
    const limiter = Marzipano.RectilinearView.limit.traditional(4096, 120 * Math.PI / 180);
    const view = new Marzipano.RectilinearView({ yaw: 0, pitch: 0, fov: 90 * Math.PI / 180 }, limiter);
    
    const scene = appState.viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });
    
    const sceneData = {
      id: sceneId,
      name: sceneName,
      imageData: imageData,
      scene: scene,
      view: view,
      hotspots: [],
      thumbnail: options.thumbnail || imageData,
      isDefault: !!options.isDefault
    };
    
    appState.scenes.push(sceneData);
    updateSceneList();
    
    if (switchTo || appState.scenes.length === 1) {
      switchScene(sceneId);
    }
    
    saveProject();
  };
  img.src = imageData;
}

/**
 * 移除默认场景
 */
function removeDefaultSceneIfPresent() {
  const idx = appState.scenes.findIndex(s => s.isDefault);
  if (idx !== -1) {
    const wasCurrent = appState.currentScene && appState.currentScene.id === appState.scenes[idx].id;
    appState.scenes.splice(idx, 1);
    if (wasCurrent) {
      document.getElementById('emptyViewer').style.display = 'flex';
      document.getElementById('controlBar').style.display = 'none';
    }
    updateSceneList();
  }
}

/**
 * 显示默认星空场景 (升级版：数字空间)
 */
function showDefaultSky() {
  const width = 4096;
  const height = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // 1. 深空背景
  const grd = ctx.createLinearGradient(0, 0, 0, height);
  grd.addColorStop(0, '#020408');
  grd.addColorStop(0.5, '#0a1525'); // 地平线附近稍亮
  grd.addColorStop(1, '#020408');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);

  // 2. 科技感网格
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'; // 亮青色
  ctx.lineWidth = 2;

  // 经线 (垂直)
  for (let x = 0; x <= width; x += width / 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }

  // 纬线 (水平)
  for (let y = 0; y <= height; y += height / 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // 3. 地平线光效
  const horizonGlow = ctx.createLinearGradient(0, height / 2 - 150, 0, height / 2 + 150);
  horizonGlow.addColorStop(0, 'rgba(56, 189, 248, 0)');
  horizonGlow.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)');
  horizonGlow.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, height / 2 - 150, width, 300);

  // 4. 随机粒子/星星
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2.5;
    const opacity = Math.random() * 0.8 + 0.2;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
    
    // 偶尔出现彩色粒子
    if (Math.random() > 0.95) {
      ctx.fillStyle = `rgba(56, 189, 248, ${opacity})`; // 青色
    }
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // 5. 顶部极光效果
  const aurora = ctx.createRadialGradient(width/2, 0, 0, width/2, 0, height/2);
  aurora.addColorStop(0, 'rgba(139, 92, 246, 0.2)'); // 紫色
  aurora.addColorStop(1, 'transparent');
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, width, height/2);

  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
  createScene(dataUrl, '数字空间', true, { isDefault: true });
}

let autoSaveTimer = null;
function autoSaveProject() {
  if (autoSaveTimer) clearTimeout(autoSaveTimer);
  const statusEl = document.getElementById('saveStatus');
  if (statusEl) statusEl.textContent = '...'; // Saving indicator if we had one
  
  autoSaveTimer = setTimeout(() => {
    saveProject();
    autoSaveTimer = null;
  }, 2000);
}

/**
 * 切换场景
 */
function switchScene(sceneId) {
  const sceneData = appState.scenes.find(s => s.id === sceneId);
  if (!sceneData) return;
  
  sceneData.scene.switchTo({
    transitionDuration: 1000
  });
  
  appState.currentScene = sceneData;
  
  updateSceneList();
  document.getElementById('emptyViewer').style.display = 'none';
  document.getElementById('controlBar').style.display = 'flex';
  document.getElementById('currentSceneName').textContent = sceneData.name;
  document.getElementById('sceneNameInput').value = sceneData.name;
  
  // Update overlay info
  const overlayName = document.getElementById('overlaySceneName');
  const overlayCount = document.getElementById('overlaySceneCount');
  if (overlayName) overlayName.textContent = sceneData.name;
  if (overlayCount) {
    const total = appState.scenes.filter(s => !s.isDefault).length;
    const currentIdx = appState.scenes.filter(s => !s.isDefault).findIndex(s => s.id === sceneId) + 1;
    overlayCount.textContent = `${currentIdx} / ${total}`;
  }

  clearHotspots();
  sceneData.hotspots.forEach(hotspotData => {
    addHotspotToScene(sceneData, hotspotData);
  });
  renderMinimap();
  if (graphMode) renderGraph();
  renderSceneDock();
}

function prevScene() {
  if (appState.scenes.length === 0 || !appState.currentScene) return;
  const idx = appState.scenes.findIndex(s => s.id === appState.currentScene.id);
  const targetIdx = (idx - 1 + appState.scenes.length) % appState.scenes.length;
  switchScene(appState.scenes[targetIdx].id);
}

function nextScene() {
  if (appState.scenes.length === 0 || !appState.currentScene) return;
  const idx = appState.scenes.findIndex(s => s.id === appState.currentScene.id);
  const targetIdx = (idx + 1) % appState.scenes.length;
  switchScene(appState.scenes[targetIdx].id);
}

/**
 * 更新场景列表
 */
function updateSceneList() {
  const sceneList = document.getElementById('sceneList');
  
  if (appState.scenes.length === 0) {
    sceneList.innerHTML = `
      <div class="empty-state">
        <p>暂无场景</p>
        <p class="hint">上传全景图开始创建</p>
      </div>
    `;
    return;
  }
  
  sceneList.innerHTML = appState.scenes.map(scene => `
    <div class="scene-item ${scene.id === appState.currentScene?.id ? 'active' : ''}" data-scene-id="${scene.id}">
      <img src="${scene.thumbnail}" alt="${scene.name}" class="scene-thumbnail">
      <div class="scene-info">
        <span class="scene-name">${scene.name}</span>
        <div class="scene-actions">
          <button class="scene-action-btn edit" data-action="edit" title="编辑">✏️</button>
          <button class="scene-action-btn delete" data-action="delete" title="删除">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
  
  sceneList.querySelectorAll('.scene-item').forEach(item => {
    const sceneId = item.dataset.sceneId;
    
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.scene-actions')) {
        switchScene(sceneId);
      }
    });
    
    item.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.dataset.action;
        if (action === 'delete') {
          deleteScene(sceneId);
        } else if (action === 'edit') {
          switchScene(sceneId);
          togglePropertiesPanel();
        }
      });
    });
  });
  renderSceneDock();
}

/**
 * 删除场景
 */
function deleteScene(sceneId) {
  if (!confirm('确定要删除这个场景吗？')) return;
  
  const index = appState.scenes.findIndex(s => s.id === sceneId);
  if (index === -1) return;
  
  appState.scenes.splice(index, 1);
  
  if (appState.currentScene?.id === sceneId) {
    if (appState.scenes.length > 0) {
      switchScene(appState.scenes[0].id);
    } else {
      appState.currentScene = null;
      document.getElementById('emptyViewer').style.display = 'flex';
      document.getElementById('controlBar').style.display = 'none';
    }
  }
  
  updateSceneList();
  saveProject();
}

/**
 * 自动旋转
 */
function toggleAutoRotate() {
  appState.autoRotate = !appState.autoRotate;
  
  // Sync state to all auto-rotate buttons
  const btns = document.querySelectorAll('#autoRotateBtn, #bottomAutoRotateBtn');
  
  if (appState.autoRotate) {
    btns.forEach(btn => btn.classList.add('active'));
    startAutoRotate();
    showNotification('✓ 自动旋转已开启');
  } else {
    btns.forEach(btn => btn.classList.remove('active'));
    stopAutoRotate();
    showNotification('✓ 自动旋转已关闭');
  }
}

function startAutoRotate() {
  if (!appState.currentScene) return;
  
  const velocity = -0.3;
  appState.rotateAnimation = Marzipano.autorotate({
    yawSpeed: velocity * Math.PI / 180,
    targetPitch: 0,
    targetFov: Math.PI / 2
  });
  
  appState.viewer.startMovement(appState.rotateAnimation);
}

function stopAutoRotate() {
  if (appState.rotateAnimation) {
    appState.viewer.stopMovement();
    appState.rotateAnimation = null;
  }
}

/**
 * 全屏
 */
function toggleFullscreen() {
  const element = document.documentElement;
  
  if (!document.fullscreenElement) {
    element.requestFullscreen().catch(err => {
      console.error('无法进入全屏:', err);
    });
  } else {
    document.exitFullscreen();
  }
}

/**
 * 热点相关
 */
function showHotspotModal() {
  if (!appState.currentScene) {
    alert('请先选择一个场景');
    return;
  }
  
  document.getElementById('hotspotModal').style.display = 'flex';
  document.getElementById('hotspotType').value = 'info';
  document.getElementById('hotspotTitle').value = '';
  document.getElementById('hotspotContent').value = '';
  document.getElementById('hotspotContentGroup').style.display = 'block';
  document.getElementById('hotspotLinkGroup').style.display = 'none';
}

function hideHotspotModal() {
  document.getElementById('hotspotModal').style.display = 'none';
}

function createHotspot() {
  const type = document.getElementById('hotspotType').value;
  const title = document.getElementById('hotspotTitle').value.trim();
  const content = document.getElementById('hotspotContent').value.trim();
  const linkScene = document.getElementById('hotspotLinkScene').value;
  
  if (!title) {
    alert('请输入热点标题');
    return;
  }
  
  if (type === 'link' && !linkScene) {
    alert('请选择链接场景');
    return;
  }
  
  const view = appState.currentScene.view;
  const coords = view.parameters();
  
  const hotspotData = {
    id: 'hotspot_' + Date.now(),
    type: type,
    title: title,
    content: type === 'link' ? linkScene : content,
    yaw: coords.yaw,
    pitch: coords.pitch
  };
  
  appState.currentScene.hotspots.push(hotspotData);
  addHotspotToScene(appState.currentScene, hotspotData);
  
  hideHotspotModal();
  saveProject();
  updateHotspotList();
}

function addHotspotToScene(sceneData, hotspotData) {
  const hotspotElement = document.createElement('div');
  hotspotElement.className = 'hotspot';
  hotspotElement.setAttribute('data-hotspot-id', hotspotData.id);
  
  const icon = hotspotData.type === 'link' ? '🚪' : hotspotData.type === 'image' ? '🖼️' : 'ℹ️';
  
  hotspotElement.innerHTML = `
    <div class="hotspot-circle">${icon}</div>
    <div class="hotspot-tooltip">${hotspotData.title}</div>
  `;
  
  hotspotElement.addEventListener('click', () => {
    handleHotspotClick(hotspotData);
  });
  
  sceneData.scene.hotspotContainer().createHotspot(hotspotElement, {
    yaw: hotspotData.yaw,
    pitch: hotspotData.pitch
  });
}

function handleHotspotClick(hotspotData) {
  if (hotspotData.type === 'link') {
    switchScene(hotspotData.content);
  } else if (hotspotData.type === 'info') {
    alert(`${hotspotData.title}\n\n${hotspotData.content}`);
  } else if (hotspotData.type === 'image') {
    alert(`图片热点: ${hotspotData.title}`);
  }
}

function clearHotspots() {
  if (appState.currentScene) {
    const container = appState.currentScene.scene.hotspotContainer().domElement();
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }
}

function updateHotspotLinkOptions() {
  const select = document.getElementById('hotspotLinkScene');
  select.innerHTML = '<option value="">选择场景</option>' +
    appState.scenes
      .filter(s => s.id !== appState.currentScene?.id)
      .map(s => `<option value="${s.id}">${s.name}</option>`)
      .join('');
}

function updateHotspotList() {
  const hotspotList = document.getElementById('hotspotList');
  
  if (!appState.currentScene || appState.currentScene.hotspots.length === 0) {
    hotspotList.innerHTML = '<p class="hint">暂无热点，点击"添加热点"创建</p>';
    return;
  }
  
  hotspotList.innerHTML = appState.currentScene.hotspots.map(hotspot => `
    <div class="hotspot-item">
      <div class="hotspot-item-info">
        <div class="hotspot-item-title">${hotspot.title}</div>
        <div class="hotspot-item-type">${getHotspotTypeName(hotspot.type)}</div>
      </div>
      <button class="scene-action-btn delete" onclick="deleteHotspot('${hotspot.id}')">🗑️</button>
    </div>
  `).join('');
}

function deleteHotspot(hotspotId) {
  if (!appState.currentScene) return;
  
  const index = appState.currentScene.hotspots.findIndex(h => h.id === hotspotId);
  if (index === -1) return;
  
  appState.currentScene.hotspots.splice(index, 1);
  
  clearHotspots();
  appState.currentScene.hotspots.forEach(hotspotData => {
    addHotspotToScene(appState.currentScene, hotspotData);
  });
  
  updateHotspotList();
  saveProject();
}

function getHotspotTypeName(type) {
  const names = {
    'info': '信息热点',
    'link': '场景链接',
    'image': '图片热点'
  };
  return names[type] || type;
}

function togglePropertiesPanel() {
  const panel = document.getElementById('propertiesPanel');
  panel.classList.toggle('show');
  updateHotspotList();
}

function toggleHotspots() {
  if (!appState.currentScene) return;
  const container = appState.currentScene.scene.hotspotContainer().domElement();
  container.classList.toggle('hide-hotspots');
}

/**
 * 加载/保存
 */
function showLoading() {
  document.getElementById('loadingOverlay').style.display = 'flex';
  document.getElementById('progressBar').style.display = 'block';
}

function hideLoading() {
  document.getElementById('loadingOverlay').style.display = 'none';
}

function setProgress(percent, message) {
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('loadingText');
  if (fill) fill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
  if (text) text.textContent = message || `进度 ${percent}%`;
}

function saveProject() {
  const projectData = {
    scenes: appState.scenes
      .filter(scene => !scene.isDefault)
      .map(scene => ({
        id: scene.id,
        name: scene.name,
        hotspots: scene.hotspots
      })),
    currentSceneId: appState.currentScene?.id,
    version: '1.0',
    savedAt: new Date().toISOString()
  };
  
  try {
    localStorage.setItem('pano_project_structure', JSON.stringify(projectData));
    console.log('✅ 项目结构已保存');
    showNotification('✅ 配置已保存');
  } catch (e) {
    console.error('保存失败:', e);
  }
}

function exportProject() {
  const data = {
    scenes: appState.scenes.filter(s => !s.isDefault).map(s => ({ id: s.id, name: s.name, hotspots: s.hotspots })),
    currentSceneId: appState.currentScene?.id,
    version: '1.0',
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pano_project.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function loadProject() {
  try {
    const saved = localStorage.getItem('pano_project_structure');
    if (saved) {
      const projectData = JSON.parse(saved);
      console.log('项目结构已加载');
    }
  } catch (e) {
    console.error('加载项目失败:', e);
  }
}

function showHelp() {
  const modal = document.getElementById('helpModal');
  if (!modal) {
    alert('快捷键：Space 自动旋转，F 全屏，H 热点显示/隐藏，←/→ 场景切换，Ctrl+S 保存，Ctrl+E 导出，? 帮助');
    return;
  }
  modal.style.display = 'flex';
  const closeBtn = document.getElementById('closeHelpBtn');
  const confirmBtn = document.getElementById('confirmHelpBtn');
  const hide = () => { modal.style.display = 'none'; };
  if (closeBtn) closeBtn.onclick = hide;
  if (confirmBtn) confirmBtn.onclick = hide;
}

function toggleMinimap() {
  const el = document.getElementById('minimap');
  if (!el) return;
  const visible = el.style.display !== 'none';
  el.style.display = visible ? 'none' : 'block';
  if (!visible) renderMinimap();
}

function renderMinimap() {
  const el = document.getElementById('minimap');
  if (!el) return;
  const items = appState.scenes.map(s => `
    <div class="minimap-item ${s.id === appState.currentScene?.id ? 'active' : ''}" data-id="${s.id}">
      <img class="minimap-thumb" src="${s.thumbnail}" alt="${s.name}">
      <div>${s.name}</div>
    </div>
  `).join('');
  el.innerHTML = items || '<div>暂无场景</div>';
  el.querySelectorAll('.minimap-item').forEach(item => {
    item.addEventListener('click', () => switchScene(item.dataset.id));
  });
}

function renderSceneDock() {
  const dock = document.getElementById('sceneDock');
  if (!dock) return;
  // 当侧栏折叠时显示横向场景预览，否则隐藏
  const isCollapsed = document.getElementById('sidebar')?.classList.contains('collapsed');
  dock.classList.toggle('hidden', !isCollapsed);
  if (!isCollapsed) return;
  dock.innerHTML = appState.scenes
    .filter(s => !s.isDefault)
    .map(s => `
      <div class="scene-dock-item ${s.id === appState.currentScene?.id ? 'active' : ''}" data-id="${s.id}">
        <img src="${s.thumbnail}" alt="${s.name}">
      </div>
    `).join('');
  dock.querySelectorAll('.scene-dock-item').forEach(el => {
    el.addEventListener('click', () => switchScene(el.dataset.id));
  });
  const toggle = document.getElementById('sceneDockToggle');
  if (toggle) {
    toggle.onclick = () => {
      const hidden = dock.classList.contains('hidden');
      dock.classList.toggle('hidden', !hidden);
      toggle.textContent = hidden ? '▼' : '▲';
    };
  }
}

let graphMode = false;
function toggleGraph() {
  graphMode = !graphMode;
  const el = document.getElementById('minimap');
  el.style.display = graphMode ? 'block' : el.style.display;
  if (graphMode) renderGraph();
}

function renderGraph() {
  const el = document.getElementById('minimap');
  if (!el) return;
  const scenes = appState.scenes.filter(s => !s.isDefault);
  const w = 260, h = 220;
  el.innerHTML = `<svg width="${w}" height="${h}"><defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="6" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L6,3 z" fill="#94a3b8"/></marker></defs></svg>`;
  const svg = el.querySelector('svg');
  const cx = w/2, cy = h/2, r = Math.min(w,h)/2 - 30;
  const positions = scenes.map((s,i) => {
    const angle = (2*Math.PI*i)/Math.max(1, scenes.length);
    return { id: s.id, x: cx + r*Math.cos(angle), y: cy + r*Math.sin(angle), name: s.name };
  });
  positions.forEach(p => {
    const node = document.createElementNS('http://www.w3.org/2000/svg','circle');
    node.setAttribute('cx', p.x);
    node.setAttribute('cy', p.y);
    node.setAttribute('r', 12);
    node.setAttribute('fill', p.id === appState.currentScene?.id ? '#2563eb' : '#64748b');
    node.style.cursor = 'pointer';
    node.addEventListener('click', () => switchScene(p.id));
    svg.appendChild(node);
    const label = document.createElementNS('http://www.w3.org/2000/svg','text');
    label.setAttribute('x', p.x + 14);
    label.setAttribute('y', p.y + 4);
    label.setAttribute('fill', '#fff');
    label.setAttribute('font-size', '12');
    label.textContent = p.name;
    svg.appendChild(label);
  });
  scenes.forEach(s => {
    s.hotspots.filter(h=>h.type==='link').forEach(hs => {
      const from = positions.find(p=>p.id===s.id);
      const to = positions.find(p=>p.id===hs.content);
      if (!from || !to) return;
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', from.x);
      line.setAttribute('y1', from.y);
      line.setAttribute('x2', to.x);
      line.setAttribute('y2', to.y);
      line.setAttribute('stroke', '#94a3b8');
      line.setAttribute('stroke-width', '2');
      line.setAttribute('marker-end','url(#arrow)');
      svg.insertBefore(line, svg.firstChild);
    });
  });
}

// New features implementation

function toggleGyroscope() {
  if (!appState.currentScene) {
    showNotification('⚠ 请先加载场景', 'warning');
    return;
  }
  
  appState.gyroEnabled = !appState.gyroEnabled;
  const btn = document.getElementById('gyroBtn');
  
  if (appState.gyroEnabled) {
    if (btn) btn.classList.add('active');
    startGyroscope();
  } else {
    if (btn) btn.classList.remove('active');
    stopGyroscope();
  }
}

function startGyroscope() {
  if (window.DeviceOrientationEvent) {
    // Check if permission is required (iOS 13+)
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
            showNotification('✓ 陀螺仪已启用');
          } else {
            showNotification('✗ 陀螺仪权限被拒绝', 'error');
            appState.gyroEnabled = false;
            const btn = document.getElementById('gyroBtn');
            if (btn) btn.classList.remove('active');
          }
        })
        .catch(console.error);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
      showNotification('✓ 陀螺仪已启用');
    }
  } else {
    showNotification('✗ 设备不支持陀螺仪', 'error');
    appState.gyroEnabled = false;
    const btn = document.getElementById('gyroBtn');
    if (btn) btn.classList.remove('active');
  }
}

function stopGyroscope() {
  window.removeEventListener('deviceorientation', handleOrientation);
  showNotification('✓ 陀螺仪已关闭');
}

function handleOrientation(event) {
  if (!appState.gyroEnabled || !appState.currentScene) return;
  
  // const alpha = event.alpha; // Z axis
  const beta = event.beta;   // X axis
  const gamma = event.gamma; // Y axis
  
  const view = appState.currentScene.view;
  const currentParams = view.parameters();
  
  if (beta !== null && gamma !== null) {
      view.setParameters({
        yaw: currentParams.yaw + (gamma * Math.PI / 180) * 0.05,
        pitch: Math.max(-Math.PI/2, Math.min(Math.PI/2, 
                currentParams.pitch + (beta - 90) * Math.PI / 180 * 0.05)),
        fov: currentParams.fov
      });
  }
}

function addBackgroundMusic() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'audio/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const audio = document.getElementById('bgMusic');
    if (audio) {
      const url = URL.createObjectURL(file);
      audio.src = url;
      audio.play()
        .then(() => {
          showNotification('🎵 音乐已添加并播放');
        })
        .catch(err => {
          console.error('播放失败:', err);
          showNotification('❌ 播放失败，请重试', 'error');
        });
    }
  };
  input.click();
}

function addTextHotspot() {
  if (!appState.currentScene) {
    showNotification('⚠ 请先选择一个场景', 'warning');
    return;
  }
  
  showHotspotModal();
  const typeSelect = document.getElementById('hotspotType');
  if (typeSelect) {
    typeSelect.value = 'info';
    typeSelect.dispatchEvent(new Event('change'));
  }
  setTimeout(() => {
    const titleInput = document.getElementById('hotspotTitle');
    if (titleInput) titleInput.focus();
  }, 100);
}

function takeScreenshot() {
    if (!appState.viewer) return;
    
    const canvas = document.querySelector('#pano canvas');
    if (canvas) {
        try {
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = 'screenshot-' + Date.now() + '.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showNotification('📸 截图已保存');
        } catch (e) {
            console.error(e);
            showNotification('❌ 截图失败 (跨域限制?)', 'error');
        }
    } else {
        showNotification('❌ 无法获取画面', 'error');
    }
}

function toggleCompass() {
    // 重置视角到初始位置 (正北)
    if (appState.currentScene && appState.currentScene.view) {
        appState.currentScene.view.setParameters({
            yaw: 0,
            pitch: 0,
            fov: appState.currentScene.view.parameters().fov
        });
        showNotification('🧭 视角已重置');
    }
}

function showNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    background: ${type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#10b981'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    font-size: 14px;
    font-weight: 500;
    transition: opacity 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function initResizeHandlers() {
  const sidebar = document.getElementById('sidebar');
  const sidebarResizer = document.getElementById('sidebarResizer');
  const panel = document.getElementById('propertiesPanel');
  const panelResizer = document.getElementById('panelResizer');
  let dragging = null;
  const onMove = (e) => {
    if (dragging === 'sidebar') {
      const rect = sidebar.getBoundingClientRect();
      const newW = Math.max(200, Math.min(500, e.clientX - rect.left));
      sidebar.style.width = `${newW}px`;
    } else if (dragging === 'panel') {
      const rect = panel.getBoundingClientRect();
      const newW = Math.max(260, Math.min(560, rect.right - e.clientX));
      panel.style.width = `${newW}px`;
    }
  };
  const onUp = () => { dragging = null; document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  if (sidebarResizer) sidebarResizer.addEventListener('mousedown', () => { dragging='sidebar'; document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); });
  if (panelResizer) panelResizer.addEventListener('mousedown', () => { dragging='panel'; document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onUp); });
  if (sidebarResizer) sidebarResizer.addEventListener('dblclick', () => { const sidebar = document.getElementById('sidebar'); sidebar.classList.toggle('collapsed'); });
  const resetBtn = document.getElementById('resetHDRBtn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    const exposureEl = document.getElementById('exposureInput');
    const toneEl = document.getElementById('toneMappingSelect');
    if (exposureEl) exposureEl.value = '1';
    if (toneEl) toneEl.value = 'ACES';
    applyEXRSettings();
  });
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// 导出到全局作用域
window.deleteHotspot = deleteHotspot;
