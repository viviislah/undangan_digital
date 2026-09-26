import React from 'react';
import { motion } from 'motion/react';
import { useIntersectionObserver, UseIntersectionObserverOptions } from '../hooks/useIntersectionObserver';

interface IntersectionSectionProps extends UseIntersectionObserverOptions {
  as?: 'section' | 'div' | 'article' | 'header' | 'footer';
  id?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode | ((props: { isIntersecting: boolean }) => React.ReactNode);
  delay?: number; // In seconds
  slideDistance?: number; // In px
  duration?: number; // In seconds
  direction?: 'up' | 'down' | 'left' | 'right' | 'zoom' | 'none';
  staggerChildren?: boolean;
  withBlur?: boolean;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const IntersectionSection: React.FC<IntersectionSectionProps> = ({
  as = 'section',
  id,
  className = '',
  style = {},
  children,
  delay = 0,
  slideDistance = 28,
  duration = 0.8,
  direction = 'up',
  threshold = 0.06,
  rootMargin = '0px 0px -25px 0px',
  triggerOnce = true,
  withBlur = false,
  onClick,
}) => {
  const { elementRef, isIntersecting } = useIntersectionObserver<HTMLElement>({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const getInitialValues = () => {
    const blur = withBlur ? 'blur(4px)' : 'none';
    switch (direction) {
      case 'left':
        return { opacity: 0, x: -slideDistance, y: 0, scale: 0.99, filter: blur };
      case 'right':
        return { opacity: 0, x: slideDistance, y: 0, scale: 0.99, filter: blur };
      case 'down':
        return { opacity: 0, x: 0, y: -slideDistance, scale: 0.99, filter: blur };
      case 'zoom':
        return { opacity: 0, x: 0, y: 0, scale: 0.95, filter: blur };
      case 'none':
        return { opacity: 0, x: 0, y: 0, scale: 1, filter: 'none' };
      case 'up':
      default:
        return { opacity: 0, x: 0, y: slideDistance, scale: 1, filter: blur };
    }
  };

  const initialValues = getInitialValues();
  const animateValues = isIntersecting
    ? { opacity: 1, x: 0, y: 0, scale: 1, filter: 'none' }
    : initialValues;

  const transitionConfig = {
    duration,
    delay,
    ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
  };

  const MotionComponent =
    as === 'div'
      ? motion.div
      : as === 'article'
      ? motion.article
      : as === 'header'
      ? motion.header
      : as === 'footer'
      ? motion.footer
      : motion.section;

  return (
    <MotionComponent
      ref={elementRef as React.Ref<any>}
      id={id}
      initial={initialValues}
      animate={animateValues}
      transition={transitionConfig}
      onClick={onClick}
      className={`intersection-observed-section relative ${className}`}
      style={{
        ...style,
        willChange: isIntersecting ? 'auto' : 'opacity, transform',
      }}
    >
      {typeof children === 'function' ? children({ isIntersecting }) : children}
    </MotionComponent>
  );
};
