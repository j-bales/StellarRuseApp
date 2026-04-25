import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Card({ 
  id, name, attack, cost, abilities, flavor, art,
  isPlayable, isStaged, isFaceDown, isCompact, isPeeking, isStacked, isHighlyStacked, isExhausted, 
  isTargetable, isInvalidTarget, onClick, onPeekStart 
}) {
  const rotation = isFaceDown ? 180 : 0;

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
        scale: isTargetable ? 1.05 : 1,
        opacity: isInvalidTarget ? 0.5 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 25,
      }}
      whileHover={isPlayable && !isFaceDown ? { scale: 1.05, y: -10, zIndex: 10 } : {}}
      onClick={(e) => {
        if (isTargetable && onClick) {
          e.stopPropagation();
          onClick(id);
        } else if (isPlayable && onClick) {
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
        cursor: (isPlayable || onPeekStart || isTargetable) ? 'pointer' : 'default',
        borderRadius: '12px',
        transformStyle: 'preserve-3d',
        zIndex: (isStaged || isPeeking || isTargetable) ? 50 : 1,
        background: '#1A202C', // Solid fallback background
      }}
    >
      {/* Front Face */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: 'linear-gradient(135deg, #2D3748 0%, #1A202C 100%)',
          border: '1px solid #4A5568',
          borderRadius: '12px',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#E2E8F0',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          fontSize: isCompact ? '0.75rem' : '1rem',
          opacity: isFaceDown ? 0 : 1, 
          pointerEvents: isFaceDown ? 'none' : 'auto',
          zIndex: isFaceDown ? 0 : 2
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
          {renderCost()}
          <div style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#F87171', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
            {attack}A
          </div>
        </div>

        <div style={{ flex: 1, textAlign: 'center', fontWeight: 'bold', color: '#F7FAFC' }}>{name}</div>

        {!isCompact && abilities && abilities.length > 0 && (
          <div style={{ fontSize: '0.65rem', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '4px', margin: '4px 0' }}>
            {abilities[0].description}
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
          background: 'linear-gradient(135deg, #1A365D 0%, #171923 100%)',
          border: '2px solid #2B6CB0',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 16px rgba(0,0,0,0.5)',
          opacity: isFaceDown ? 1 : 0,
          pointerEvents: isFaceDown ? 'auto' : 'none',
          zIndex: isFaceDown ? 2 : 0
        }}
      >
        <div style={{ fontSize: isCompact ? '1.5rem' : '2.5rem' }}>🌟</div>
      </div>
    </motion.div>
  );
}
