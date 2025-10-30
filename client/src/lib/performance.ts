/**
 * 性能优化工具函数
 */

// 预加载图片资源
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

// 预加载音频资源
export const preloadAudio = (src: string): Promise<HTMLAudioElement> => {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.src = src;
    audio.preload = 'auto';
    audio.oncanplaythrough = () => resolve(audio);
    audio.onerror = reject;
  });
};

// 批量预加载资源
export const preloadResources = async (resources: Array<{ type: 'image' | 'audio'; src: string }>) => {
  const promises = resources.map(resource => {
    return resource.type === 'image'
      ? preloadImage(resource.src)
      : preloadAudio(resource.src);
  });

  try {
    await Promise.allSettled(promises);
    console.log(`预加载完成: ${resources.length} 个资源`);
  } catch (error) {
    console.warn('部分资源预加载失败:', error);
  }
};

// 防抖函数
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 节流函数
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// 内存缓存类
export class MemoryCache<T> {
  private cache = new Map<string, { data: T; timestamp: number; ttl: number }>();

  set(key: string, data: T, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// 全局缓存实例
export const globalCache = new MemoryCache<any>();

// 检测网络状况
export const getNetworkInfo = () => {
  const connection = (navigator as any).connection ||
                    (navigator as any).mozConnection ||
                    (navigator as any).webkitConnection;

  if (!connection) {
    return { effectiveType: '4g', downlink: 10, rtt: 100 };
  }

  return {
    effectiveType: connection.effectiveType || '4g',
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 100
  };
};

// 根据网络状况调整资源质量
export const getAdaptiveQuality = () => {
  const network = getNetworkInfo();

  if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
    return 'low';
  } else if (network.effectiveType === '3g') {
    return 'medium';
  } else {
    return 'high';
  }
};

// 懒加载观察器
export const createLazyObserver = (callback: IntersectionObserverCallback) => {
  return new IntersectionObserver(callback, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
};

// 性能监控
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} 执行时间: ${(end - start).toFixed(2)}ms`);
};