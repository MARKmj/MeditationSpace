import { useEffect, useRef, useState, useCallback } from 'react';
import { globalCache, throttle } from '@/lib/performance';

interface AudioState {
  playing: boolean;
  loading: boolean;
  error: string | null;
  duration: number;
  currentTime: number;
}

interface UseAudioPlayerOptions {
  preload?: boolean;
  loop?: boolean;
  volume?: number;
}

export const useAudioPlayer = (src: string, options: UseAudioPlayerOptions = {}) => {
  const {
    preload = false,
    loop = true,
    volume = 0.7
  } = options;

  const [state, setState] = useState<AudioState>({
    playing: false,
    loading: false,
    error: null,
    duration: 0,
    currentTime: 0
  });

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // 获取或创建音频实例
  const getAudioInstance = useCallback(() => {
    const cacheKey = `audio_${src}`;
    let audio = globalCache.get(cacheKey);

    if (!audio) {
      audio = new Audio();
      audio.src = src;
      audio.preload = preload ? 'auto' : 'metadata';
      audio.loop = loop;
      audio.volume = volume;
      globalCache.set(cacheKey, audio, 30 * 60 * 1000); // 缓存30分钟
      audioRef.current = audio;
    }

    return audio as HTMLAudioElement;
  }, [src, preload, loop, volume]);

  // 更新播放进度
  const updateProgress = useCallback(() => {
    if (audioRef.current) {
      setState(prev => ({
        ...prev,
        currentTime: audioRef.current!.currentTime,
        duration: audioRef.current!.duration || 0
      }));
    }
  }, []);

  // 播放
  const play = useCallback(async () => {
    const audio = getAudioInstance();

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await audio.play();
      setState(prev => ({ ...prev, playing: true, loading: false }));

      // 开始更新进度
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
      progressInterval.current = setInterval(updateProgress, 100);
    } catch (error) {
      setState(prev => ({
        ...prev,
        playing: false,
        loading: false,
        error: error instanceof Error ? error.message : '播放失败'
      }));
    }
  }, [getAudioInstance, updateProgress]);

  // 暂停
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState(prev => ({ ...prev, playing: false }));

      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    }
  }, []);

  // 设置音量
  const setVolume = useCallback((newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
    }
  }, []);

  // 跳转到指定时间
  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(time, audioRef.current.duration));
    }
  }, []);

  // 节流的音量设置函数
  const throttledSetVolume = useCallback(
    throttle((volume: number) => setVolume(volume), 100),
    [setVolume]
  );

  // 初始化音频事件监听
  useEffect(() => {
    const audio = getAudioInstance();

    const handleLoadStart = () => setState(prev => ({ ...prev, loading: true }));
    const handleCanPlay = () => setState(prev => ({ ...prev, loading: false, error: null }));
    const handleError = (e: Event) => {
      const error = (e.target as HTMLAudioElement)?.error;
      setState(prev => ({
        ...prev,
        loading: false,
        playing: false,
        error: error?.message || '音频加载失败'
      }));
    };
    const handleEnded = () => {
      setState(prev => ({ ...prev, playing: false }));
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
        progressInterval.current = null;
      }
    };

    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [getAudioInstance]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  return {
    ...state,
    play,
    pause,
    setVolume: throttledSetVolume,
    seek,
    audio: audioRef.current
  };
};

// 多音频管理器
export const useMultiAudioPlayer = (sources: string[]) => {
  const players = sources.map(src => useAudioPlayer(src));

  const playMultiple = useCallback(async (indices: number[]) => {
    const promises = indices
      .filter(index => index < players.length)
      .map(index => players[index].play());

    try {
      await Promise.allSettled(promises);
    } catch (error) {
      console.warn('部分音频播放失败:', error);
    }
  }, [players]);

  const pauseMultiple = useCallback((indices: number[]) => {
    indices
      .filter(index => index < players.length)
      .forEach(index => players[index].pause());
  }, [players]);

  const pauseAll = useCallback(() => {
    players.forEach(player => player.pause());
  }, [players]);

  const setVolumes = useCallback((volumes: number[]) => {
    volumes.forEach((volume, index) => {
      if (index < players.length) {
        players[index].setVolume(volume);
      }
    });
  }, [players]);

  return {
    players,
    playMultiple,
    pauseMultiple,
    pauseAll,
    setVolumes
  };
};