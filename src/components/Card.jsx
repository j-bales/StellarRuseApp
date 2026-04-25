import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Card({ 
  id, name, attack, cost, abilities, flavor, art,
  isPlayable, isStaged, isFaceDown, isCompact, isPeeking, isStacked, isHighlyStacked, isExhausted, onClick, onPeekStart 
}) {
  // Determine the rotation angle.
  const rotation = isFaceDown ? 180 : 0;

  // Helper to render cost pips
  const renderCost = () => {
    if (!cost || typeof cost !== 'object') return null;
    const resources = [
      { key: 'S', color: '#10B981' },
      { key: 'E', color: '#F59E0B' },
      { key: 'I', color: '#8B5CF6' }
    ];

    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {resources.map(res => {
          const amount = cost[res.key] || 0;
          if (amount === 0) return null;
          return (
            <div key={res.key} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '2px',
              fontSize: '0.8em',
              background: 'rgba(0,0,0,0.3)',
              padding: '1px 4px',
              borderRadius: '4px',
              color: res.color,
              fontWeight: 'bold',
              border: `1px solid ${res.color}44`
            }}>
              {amount}{res.key}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <motion.div
      initial={false} 
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
        width: isCompact ? '100px' : '150px',
        height: isCompact ? '142px' : '210px',
        margin: isHighlyStacked ? '0 0 0 -80px' : (isStacked ? '0 0 0 -50px' : (isCompact ? '0' : '0 -15px')),
        position: 'relative',
        cursor: (isPlayable || onPeekStart) ? 'pointer' : 'default',
        borderRadius: '12px',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        zIndex: (isStaged || isPeeking) ? 20 : 1
      }}
    >
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
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: 'var(--color-text-main)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          fontSize: isCompact ? '0.75rem' : '1rem',
          pointerEvents: isFaceDown ? 'none' : 'auto',
          opacity: isFaceDown ? 0 : 1, 
          transition: 'opacity 0.1s'
        }}
      >
        {/* Header: Cost & Attack Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {renderCost()}
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.2)',
            color: '#F87171',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 'bold',
            fontSize: '0.85em',
            border: '1px solid #F8717144'
          }}>
            {attack}A
          </div>
        </div>

        {/* Art Placeholder */}
        <div style={{
          flex: '0 0 60px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '6px',
          margin: '4px 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
           <span style={{ opacity: 0.2, fontSize: '1.2rem' }}>🖼️</span>
        </div>

        {/* Title */}
        <div style={{ 
          textAlign: 'center', 
          fontWeight: 'bold', 
          fontSize: isCompact ? '0.85em' : '1em',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          color: '#E2E8F0'
        }}>
          {name}
        </div>

        {/* Abilities Section */}
        {!isCompact && abilities && abilities.length > 0 && (
          <div style={{
            fontSize: '0.65rem',
            background: 'rgba(0,0,0,0.4)',
            padding: '6px',
            borderRadius: '6px',
            margin: '4px 0',
            border: '1px solid rgba(255,255,255,0.1)',
            minHeight: '40px'
          }}>
            {abilities.map((ability, i) => (
              <div key={i} style={{ lineClamp: 2, overflow: 'hidden' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>⚡ </span>
                {ability.description}
              </div>
            ))}
          </div>
        )}

        {/* Flavor Text */}
        {!isCompact && flavor && (
          <div style={{ 
            fontSize: '0.6rem', 
            color: 'var(--color-text-muted)', 
            textAlign: 'center', 
            fontStyle: 'italic',
            opacity: 0.7 
          }}>
            "{flavor}"
          </div>
        )}
      </div>

      {/* Back Face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, #1E1B4B 0%, #0F172A 100%)',
          border: '2px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          pointerEvents: isFaceDown ? 'auto' : 'none',
          opacity: isFaceDown ? 1 : 0, 
          transition: 'opacity 0.1s'
        }}
      >
        <div style={{
          width: '75%',
          height: '75%',
          border: '1px solid rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
        }}>
          <span style={{ fontSize: isCompact ? '1.5rem' : '2rem', opacity: 0.4 }}>🌟</span>
        </div>
      </div>
    </motion.div>
  );
}
