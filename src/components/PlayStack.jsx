import React, { useState, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Card } from './Card';
import { cardMatchesFilter } from '../game/AbilityRegistry';

export function PlayStack({ stack, moves, localPlayer, peekedCard, onPeekStart, playAreaRef, handAreaRef, targetingAbility, onTargetSelect, currentPlayer }) {
  const [isDraggingStack, setIsDraggingStack] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const controls = useAnimation();
  const dragLockRef = useRef(false);

  const isOpponentStack = stack.cards[0]?.owner !== localPlayer;

  const handleDragEnd = (e, info) => {
    setIsDraggingStack(false);
    
    // Check if dropped into hand area
    if (handAreaRef.current) {
      const handRect = handAreaRef.current.getBoundingClientRect();
      const pt = info.point;
      
      const isInHand = (
        pt.x >= handRect.left && 
        pt.x <= handRect.right && 
        pt.y >= handRect.top && 
        pt.y <= handRect.bottom
      );

      if (isInHand && !isOpponentStack) {
         moves.returnStackToHand(stack.id);
         return;
      }
    }

    if (playAreaRef.current) {
      const rect = playAreaRef.current.getBoundingClientRect();
      const pt = info.point;
      
      const isOutside = (
        pt.x < rect.left || 
        pt.x > rect.right || 
        pt.y < rect.top || 
        pt.y > rect.bottom
      );

      if (isOutside) {
        controls.start({ 
          x: dragPos.x, 
          y: dragPos.y,
          transition: { type: 'spring', stiffness: 300, damping: 25 }
        });
      } else {
        const newPos = {
          x: dragPos.x + info.offset.x,
          y: dragPos.y + info.offset.y
        };
        setDragPos(newPos);
        controls.set({ x: newPos.x, y: newPos.y }); 
      }
    }

    setTimeout(() => {
      dragLockRef.current = false;
    }, 50);
  };

  return (
    <motion.div 
      drag 
      dragMomentum={false}
      initial={{ x: dragPos.x, y: dragPos.y, scale: isOpponentStack ? 0.85 : 1 }}
      animate={{ ...controls, scale: isOpponentStack ? 0.85 : 1 }}
      onDragStart={() => {
        setIsDraggingStack(true);
        dragLockRef.current = true;
      }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '0 2rem', 
        cursor: isDraggingStack ? 'grabbing' : 'grab',
        zIndex: isDraggingStack ? 50 : 1,
        position: 'relative',
        opacity: isOpponentStack ? 0.8 : 1
      }}
    >
      {stack.cards.map((card, index) => {
        const isTargetable = targetingAbility ? cardMatchesFilter(card, targetingAbility.targetFilter, currentPlayer) : false;
        const isOpponentCard = card.owner !== localPlayer;
        
        return (
          <Card 
            key={card.instanceId ?? card.id} 
            {...card} 
            isExhausted={card.isExhausted}
            isPlayable={false} 
            isCompact={true} 
            isStacked={index > 0}
            isHighlyStacked={isDraggingStack && index > 0}
            isPeeking={peekedCard === (card.instanceId ?? card.id)}
            isTargetable={isTargetable}
            isOpponent={isOpponentCard}
            isInvalidTarget={!!targetingAbility && !isTargetable}
            onPeekStart={() => !dragLockRef.current && !isOpponentStack && onPeekStart(card, stack.id)}
            onClick={isTargetable ? () => onTargetSelect(card) : null}
          />
        );
      })}
    </motion.div>
  );
}
