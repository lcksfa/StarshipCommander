import React, { useEffect, useState, useRef } from "react";

interface AnimatedNumberProps {
  value: number;
  duration?: number; // 动画持续时间（毫秒）/ Animation duration in milliseconds
  className?: string;
  formatValue?: (value: number) => string; // 自定义格式化函数 / Custom format function
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 1000,
  className = "",
  formatValue,
}) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    // 值没有变化，不执行动画 / No animation if value hasn't changed
    if (value === prevValue) {
      return;
    }

    // 开始动画 / Start animation
    setIsAnimating(true);
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // 使用缓动函数使动画更自然 / Use easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = prevValue + (value - prevValue) * easeOutQuart;

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // 动画完成 / Animation complete
        setDisplayValue(value);
        setIsAnimating(false);
        setPrevValue(value);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // 清理函数 / Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, prevValue, duration]);

  // 格式化显示值 / Format display value
  const formattedValue = formatValue
    ? formatValue(Math.round(displayValue))
    : Math.round(displayValue).toLocaleString();

  return (
    <span
      className={`transition-colors duration-200 ${
        isAnimating ? "text-neon-green scale-110" : ""
      } ${className}`}
    >
      {formattedValue}
    </span>
  );
};

export default AnimatedNumber;
