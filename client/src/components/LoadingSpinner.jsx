// 加载动画组件
import '../index.css';

export default function LoadingSpinner({ text = '加载中...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{text}</p>
    </div>
  );
}
