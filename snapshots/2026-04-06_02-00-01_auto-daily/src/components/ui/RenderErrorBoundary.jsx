import React from 'react';

/**
 * RenderErrorBoundary - يُمسك أخطاء الـ render ويعرض رسالة بديلة
 * Props: children, resetKey (string)
 */
export class RenderErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromProps(props, state) {
    // إعادة التعيين عند تغيير resetKey
    if (state.prevResetKey !== props.resetKey) {
      return { hasError: false, error: null, prevResetKey: props.resetKey };
    }
    return null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[RenderErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-rose-50 p-8 text-center ring-1 ring-rose-200">
          <div className="text-2xl">⚠️</div>
          <div className="text-sm font-bold text-rose-700">حدث خطأ في عرض هذا القسم</div>
          <div className="text-xs text-rose-500">{this.state.error?.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default RenderErrorBoundary;
