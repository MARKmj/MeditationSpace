/**
 * 浏览器兼容性检测和 polyfills
 */

// 浏览器检测
export const detectBrowser = () => {
  const ua = navigator.userAgent;
  const isChrome = /Chrome/.test(ua) && /Google Inc/.test(navigator.vendor);
  const isFirefox = /Firefox/.test(ua);
  const isSafari = /Safari/.test(ua) && /Apple Computer/.test(navigator.vendor);
  const isEdge = /Edg/.test(ua);
  const isOpera = /Opera/.test(ua) || /OPR/.test(ua);
  const isIE = /MSIE|Trident/.test(ua);

  return {
    isChrome,
    isFirefox,
    isSafari,
    isEdge,
    isOpera,
    isIE,
    name: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isSafari ? 'Safari' : isEdge ? 'Edge' : isOpera ? 'Opera' : isIE ? 'IE' : 'Unknown',
    version: ua.match(/(Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident)\/?\s*(\d+)/i)?.[2] || 'Unknown'
  };
};

// 功能检测
export const detectFeatures = () => {
  return {
    // Web APIs
    serviceWorker: 'serviceWorker' in navigator,
    webAudioAPI: 'AudioContext' in window || 'webkitAudioContext' in window,
    webGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(window.WebGLRenderingContext &&
          (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    })(),

    // Storage APIs
    localStorage: (() => {
      try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    })(),

    sessionStorage: (() => {
      try {
        const test = 'test';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    })(),

    // Modern JavaScript features
    asyncAwait: typeof async === 'function',
    arrowFunctions: (() => {
      try {
        eval('(() => {})');
        return true;
      } catch (e) {
        return false;
      }
    })(),

    // CSS features
    cssGrid: CSS.supports('display', 'grid'),
    cssFlexbox: CSS.supports('display', 'flex'),
    cssCustomProperties: CSS.supports('--test', '0'),

    // Media features
    touchEvents: 'ontouchstart' in window,
    deviceOrientation: 'DeviceOrientationEvent' in window,
    geolocation: 'geolocation' in navigator,

    // Performance APIs
    performanceAPI: 'performance' in window,
    intersectionObserver: 'IntersectionObserver' in window,
    mutationObserver: 'MutationObserver' in window,

    // File APIs
    fileAPI: window.File && window.FileReader && window.FileList && window.Blob,
    dragAndDrop: 'draggable' in document.createElement('div'),
  };
};

// 显示兼容性警告
export const showCompatibilityWarning = (browser: ReturnType<typeof detectBrowser>, features: ReturnType<typeof detectFeatures>) => {
  const warnings: string[] = [];

  // 检查不支持的浏览器
  if (browser.isIE) {
    warnings.push('Internet Explorer 不受支持，请使用现代浏览器如 Chrome、Firefox、Safari 或 Edge');
  }

  // 检查关键功能
  if (!features.localStorage) {
    warnings.push('本地存储不可用，您的设置和记录将无法保存');
  }

  if (!features.webAudioAPI) {
    warnings.push('Web Audio API 不可用，音频播放功能可能受限');
  }

  if (!features.serviceWorker) {
    warnings.push('Service Worker 不可用，离线功能将被禁用');
  }

  // 显示警告
  if (warnings.length > 0) {
    const warningDiv = document.createElement('div');
    warningDiv.className = 'browser-warnings';
    warningDiv.innerHTML = `
      <div style="position: fixed; top: 0; left: 0; right: 0; background: #f59e0b; color: white; padding: 16px; z-index: 10000; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="max-width: 800px; margin: 0 auto;">
          <h4 style="margin: 0 0 8px 0; font-size: 16px;">⚠️ 浏览器兼容性提醒</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            ${warnings.map(w => `<li style="margin: 4px 0;">${w}</li>`).join('')}
          </ul>
          <button onclick="this.parentElement.parentElement.remove()" style="margin-top: 12px; padding: 8px 16px; background: white; color: #f59e0b; border: none; border-radius: 4px; cursor: pointer;">知道了</button>
        </div>
      </div>
    `;
    document.body.appendChild(warningDiv);
  }
};

// Polyfills

// IntersectionObserver polyfill
if (!('IntersectionObserver' in window)) {
  // 简单的 polyfill 实现
  (window as any).IntersectionObserver = class IntersectionObserver {
    constructor(callback: any, options?: any) {
      this.callback = callback;
      this.options = options || {};
    }

    observe() {
      // 简单实现：立即触发回调
      setTimeout(() => {
        this.callback([{ isIntersecting: true, target: document.body }]);
      }, 100);
    }

    unobserve() {}
    disconnect() {}
  };
}

// requestAnimationFrame polyfill
if (!('requestAnimationFrame' in window)) {
  (window as any).requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 1000 / 60);
  };

  (window as any).cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}

// CustomEvent polyfill
if (typeof window.CustomEvent !== 'function') {
  function CustomEvent(event: string, params?: any) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }

  CustomEvent.prototype = (window as any).Event.prototype;
  (window as any).CustomEvent = CustomEvent;
}

// Promise polyfill (如果需要)
if (!window.Promise) {
  // 这里应该加载 Promise polyfill，但在现代项目中通常不需要
  console.warn('Promise 不可用，某些功能可能无法正常工作');
}

// 初始化兼容性检查
export const initCompatibilityCheck = () => {
  const browser = detectBrowser();
  const features = detectFeatures();

  // 输出兼容性信息到控制台
  console.group('浏览器兼容性检查');
  console.log('浏览器:', `${browser.name} ${browser.version}`);
  console.log('功能支持:', features);
  console.groupEnd();

  // 显示警告
  showCompatibilityWarning(browser, features);

  // 添加浏览器信息到 body 类名
  document.body.className += ` browser-${browser.name.toLowerCase()} browser-v${browser.version}`;

  // 根据功能支持添加类名
  Object.entries(features).forEach(([feature, supported]) => {
    document.body.className += supported ? ` ${feature}-supported` : ` ${feature}-not-supported`;
  });

  return { browser, features };
};

// 检查移动设备
export const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 检查触摸设备
export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

// 检查 PWA 支持
export const checkPWASupport = () => {
  return {
    serviceWorker: 'serviceWorker' in navigator,
    webAppManifest: 'onbeforeinstallprompt' in window,
    displayModes: {
      standalone: 'standalone' in window.navigator,
      fullscreen: 'fullscreen' in document.documentElement,
      minimalUI: 'minimal-ui' in window.navigator,
    },
    installable: 'BeforeInstallPromptEvent' in window
  };
};