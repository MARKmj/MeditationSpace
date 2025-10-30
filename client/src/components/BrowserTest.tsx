import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { detectBrowser, detectFeatures, checkPWASupport, isMobileDevice, isTouchDevice } from '@/lib/browserCompatibility';

interface TestResult {
  name: string;
  status: 'success' | 'warning' | 'error';
  message: string;
}

export default function BrowserTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // 浏览器检测
    const browser = detectBrowser();
    results.push({
      name: '浏览器类型',
      status: browser.isIE ? 'error' : 'success',
      message: `${browser.name} ${browser.version}`
    });

    // 移动设备检测
    const mobile = isMobileDevice();
    results.push({
      name: '设备类型',
      status: 'success',
      message: mobile ? '移动设备' : '桌面设备'
    });

    // 触摸支持
    const touch = isTouchDevice();
    results.push({
      name: '触摸支持',
      status: touch ? 'success' : 'warning',
      message: touch ? '支持触摸操作' : '不支持触摸操作'
    });

    // 功能检测
    const features = detectFeatures();

    results.push({
      name: '本地存储',
      status: features.localStorage ? 'success' : 'error',
      message: features.localStorage ? '支持 localStorage' : '不支持 localStorage'
    });

    results.push({
      name: 'Web Audio API',
      status: features.webAudioAPI ? 'success' : 'error',
      message: features.webAudioAPI ? '支持 Web Audio API' : '不支持 Web Audio API'
    });

    results.push({
      name: 'Service Worker',
      status: features.serviceWorker ? 'success' : 'warning',
      message: features.serviceWorker ? '支持 Service Worker' : '不支持 Service Worker'
    });

    results.push({
      name: 'CSS Grid',
      status: features.cssGrid ? 'success' : 'warning',
      message: features.cssGrid ? '支持 CSS Grid' : '不支持 CSS Grid'
    });

    results.push({
      name: 'CSS Flexbox',
      status: features.cssFlexbox ? 'success' : 'error',
      message: features.cssFlexbox ? '支持 CSS Flexbox' : '不支持 CSS Flexbox'
    });

    results.push({
      name: 'Intersection Observer',
      status: features.intersectionObserver ? 'success' : 'warning',
      message: features.intersectionObserver ? '支持 Intersection Observer' : '不支持 Intersection Observer'
    });

    results.push({
      name: '文件 API',
      status: features.fileAPI ? 'success' : 'warning',
      message: features.fileAPI ? '支持文件 API' : '不支持文件 API'
    });

    // PWA 支持
    const pwaSupport = checkPWASupport();
    const pwaSupported = pwaSupport.serviceWorker && pwaSupport.webAppManifest;

    results.push({
      name: 'PWA 支持',
      status: pwaSupported ? 'success' : 'warning',
      message: pwaSupported ? '完全支持 PWA' : '部分支持 PWA'
    });

    // 性能测试
    const startTime = performance.now();
    const testArray = Array.from({ length: 10000 }, (_, i) => i);
    testArray.sort();
    const endTime = performance.now();

    const performanceScore = endTime - startTime;
    results.push({
      name: '性能测试',
      status: performanceScore < 10 ? 'success' : performanceScore < 50 ? 'warning' : 'error',
      message: `排序 10000 个元素用时 ${performanceScore.toFixed(2)}ms`
    });

    // 音频测试
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      oscillator.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);

      results.push({
        name: '音频播放',
        status: 'success',
        message: '音频系统正常'
      });
    } catch (error) {
      results.push({
        name: '音频播放',
        status: 'error',
        message: '音频系统异常'
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
    }
  };

  const overallScore = testResults.length > 0
    ? Math.round((testResults.filter(r => r.status === 'success').length / testResults.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-4">浏览器兼容性测试</h1>
          <p className="text-muted-foreground mb-6">
            这个测试页面会检查您的浏览器对静心空间功能的支持情况。
          </p>

          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="w-full md:w-auto"
            >
              {isRunning ? '测试中...' : '开始测试'}
            </Button>

            {testResults.length > 0 && (
              <div className="text-sm text-muted-foreground">
                总分: <span className="font-bold text-lg">{overallScore}%</span>
              </div>
            )}
          </div>

          {testResults.length > 0 && (
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <span className="font-medium">{result.name}</span>
                    </div>
                    <span className="text-sm">{result.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {testResults.length > 0 && (
            <Card className="mt-6 p-4 bg-muted/50">
              <h3 className="font-medium mb-2">测试总结</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-green-600">✅ 通过: {testResults.filter(r => r.status === 'success').length}</span>
                </div>
                <div>
                  <span className="text-yellow-600">⚠️ 警告: {testResults.filter(r => r.status === 'warning').length}</span>
                </div>
                <div>
                  <span className="text-red-600">❌ 失败: {testResults.filter(r => r.status === 'error').length}</span>
                </div>
              </div>

              {overallScore < 80 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>建议:</strong> 为了获得最佳体验，建议使用最新版本的 Chrome、Firefox、Safari 或 Edge 浏览器。
                  </p>
                </div>
              )}
            </Card>
          )}
        </Card>
      </div>
    </div>
  );
}