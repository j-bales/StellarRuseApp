import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Card({ id, name, power, cost, isPlayable, isStaged, isFaceDown, isCompact, isPeeking, isStacked, isHighlyStacked, isExhausted, onClick, onPeekStart, onPeekEnd }) {
  // Determine the rotation angle.
  const rotation = isFaceDown ? 180 : 0;

  return (
    <motion.div
      layout
      layoutId={id}
      initial={false} // Prevent re-triggering entrance animations during layout moves
      animate={{
        rotateY: rotation,
        rotateZ: isExhausted ? 90 : 0,
        scale: 1,
        opacity: 1
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
        rotateY: { duration: 0.4 },
        rotateZ: { type: 'spring', stiffness: 200, damping: 20 }
      }}
      whileHover={isPlayable && !isFaceDown ? { scale: 1.05, y: -10, zIndex: 10 } : {}}
      whileTap={isPlayable ? { scale: 0.95 } : {}}
      onClick={(e) => {
        if (isPlayable && onClick) {
          onClick(id);
        } else if (onPeekStart) {
          e.stopPropagation();
          onPeekStart();
        }
      }}
      style={{
        width: isCompact ? '100px' : '140px',
        height: isCompact ? '142px' : '200px',
        margin: isHighlyStacked ? '0 0 0 -80px' : (isStacked ? '0 0 0 -50px' : (isCompact ? '0' : '0 -15px')),
        position: 'relative',
        cursor: (isPlayable || onPeekStart) ? 'pointer' : 'default',
        borderRadius: '12px',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        zIndex: (isStaged || isPeeking) ? 20 : 1
      }}
    >
      {/* Selection Highlight */}
      <AnimatePresence>
        {isStaged && (
          <motion.div
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            style={{
              position: 'absolute',
              inset: '-4px',
              borderRadius: '16px',
              border: '3px solid var(--color-primary)',
              boxShadow: '0 0 15px var(--color-primary-glow)',
              pointerEvents: 'none',
              zIndex: -1
            }}
          />
        )}
      </AnimatePresence>

      {/* Front Face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, var(--color-card-bg) 0%, #111827 100%)',
          border: '1px solid var(--color-card-border)',
          borderRadius: '12px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'var(--color-text-main)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          fontSize: isCompact ? '0.75rem' : '1rem',
          pointerEvents: isFaceDown ? 'none' : 'auto',
          opacity: isFaceDown ? 0 : 1, // Instant swap
          transition: 'opacity 0.1s'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9em', fontWeight: 'bold' }}>
          <span style={{ color: 'var(--color-accent)' }}>{cost}🔋</span>
          <span style={{ color: '#F87171' }}>{power}⚔️</span>
        </div>

        <div style={{ textAlign: 'center', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>
          {name}
        </div>

        <div style={{ fontSize: '0.7em', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          Entity
        </div>
      </div>

      {/* Back Face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
          border: '3px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
          pointerEvents: isFaceDown ? 'auto' : 'none',
          opacity: isFaceDown ? 1 : 0, // Instant swap
          transition: 'opacity 0.1s'
        }}
      >
        <div style={{
          width: '80%',
          height: '80%',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{ fontSize: isCompact ? '1.5rem' : '2rem', opacity: 0.3 }}>✨</span>
        </div>
      </div>
    </motion.div>
  );
}
