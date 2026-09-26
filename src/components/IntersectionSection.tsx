import React from 'react';
import { motion } from 'motion/react';
import { useIntersectionObserver, UseIntersectionObserverOptions } from '../hooks/useIntersectionObserver';

interface IntersectionSectionProps extends UseIntersectionObserverOptions {
  as?: 'section' | 'div' | 'article';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode | ((props: { isIntersecting: boolean }) => React.ReactNode);
  delay?: number; // In seconds
  slideDistance?: number; // In px
  duration?: number; // In seconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'none';
  staggerChildren?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const IntersectionSection: React.FC<IntersectionSectionProps> = ({
  as = 'section',
  id,
  className = '',
  style = {},
  children,
  delay = 0,
  slideDistance = 38,
  duration = 0.88,
  direction = 'up',
  threshold = 0.12,
  rootMargin = '0px 0px -40px 0px',
  triggerOnce = true,
  onClick,
}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const getInitialValues = () => {
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -slideDistance, y: 0, scale: 0.98, filter: 'blur(4px)' };
      case 'right':
        return { opacity: 0, x: slideDistance, y: 0, scale: 0.98, filter: 'blur(4px)' };
      case 'down':
        return { opacity: 0, x: 0, y: -slideDistance, scale: 0.98, filter: 'blur(4px)' };
      case 'zoom':
        return { opacity: 0, x: 0, y: 0, scale: 0.93, filter: 'blur(4px)' };
      case 'none':
        return { opacity: 0, x: 0, y: 0, scale: 1, filter: 'none' };
      case 'up':
      default:
        return { opacity: 0, x: 0, y: slideDistance, scale: 0.98, filter: 'blur(4px)' };
    }
  };

  const initialValues = getInitialValues();
  const animateValues = isIntersecting
    ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }
    : initialValues;

  const transitionConfig = {
    duration,
    delay,
    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
  };

  const MotionComponent = as === 'div' ? motion.div : as === 'article' ? motion.article : motion.section;

  return (
    <MotionComponent
      ref={elementRef as React.Ref<any>}
      id={id}
      initial={initialValues}
      animate={animateValues}
      transition={transitionConfig}
      onClick={onClick}
      className={`intersection-observed-section relative ${className}`}
      style={style}
    >
      {typeof children === 'function' ? children({ isIntersecting }) : children}
    </MotionComponent>
  );
};
