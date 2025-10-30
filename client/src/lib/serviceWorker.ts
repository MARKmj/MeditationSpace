/**
 * Service Worker 注册和管理
 */

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker 注册成功:', registration.scope);

      // 监听更新
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新版本可用
            if (confirm('发现新版本，是否立即更新？')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });

      // 监听控制器变化
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker 控制器已更新');
        window.location.reload();
      });

      return registration;
    } catch (error) {
      console.error('Service Worker 注册失败:', error);
      return null;
    }
  } else {
    console.warn('当前浏览器不支持 Service Worker');
    return null;
  }
};

// 检查网络状态
export const checkNetworkStatus = () => {
  const isOnline = navigator.onLine;

  // 添加网络状态监听
  const handleOnline = () => {
    console.log('网络已连接');
    document.body.classList.remove('offline');
  };

  const handleOffline = () => {
    console.log('网络已断开');
    document.body.classList.add('offline');
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // 初始化状态
  if (!isOnline) {
    document.body.classList.add('offline');
  }

  return {
    isOnline,
    removeListeners: () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  };
};

// 请求通知权限
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

// 显示通知
export const showNotification = (title: string, options?: NotificationOptions) => {
  if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  }
};

// 离线数据管理
export class OfflineDataManager {
  private static instance: OfflineDataManager;
  private queue: Array<() => Promise<any>> = [];

  static getInstance() {
    if (!OfflineDataManager.instance) {
      OfflineDataManager.instance = new OfflineDataManager();
    }
    return OfflineDataManager.instance;
  }

  // 添加操作到队列
  addToQueue<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  // 处理队列
  async processQueue() {
    if (!navigator.onLine) {
      console.log('离线状态，等待网络连接...');
      return;
    }

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        try {
          await operation();
        } catch (error) {
          console.error('处理队列操作失败:', error);
        }
      }
    }
  }

  // 获取队列状态
  getQueueStatus() {
    return {
      length: this.queue.length,
      isOnline: navigator.onLine
    };
  }
}

// PWA 安装提示
export const registerPWAInstallPrompt = () => {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;

    // 显示安装提示（这里可以自定义UI）
    console.log('PWA 安装提示已准备');

    // 例如：显示安装按钮
    const installButton = document.createElement('button');
    installButton.textContent = '安装应用';
    installButton.className = 'pwa-install-button';
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      z-index: 9999;
    `;

    installButton.addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
          console.log('用户接受了安装提示');
        } else {
          console.log('用户拒绝了安装提示');
        }

        deferredPrompt = null;
        installButton.remove();
      }
    });

    document.body.appendChild(installButton);
  });

  // 监听安装完成
  window.addEventListener('appinstalled', () => {
    console.log('PWA 已安装成功');
  });
};