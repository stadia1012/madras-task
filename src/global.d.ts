declare global {
  
}
type ToastType = 'success' | 'error' | 'info';

type Toast = {
  id: string;
  message: string;
  type: ToastType;
  duration?: number; // 기본 유지 시간(ms)
}

export const ReactNativeWebView = window.ReactNativeWebView;