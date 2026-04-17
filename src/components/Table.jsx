import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { PlayStack } from './PlayStack';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

export function Table({ G, ctx, moves, events, playerID }) {
  const [stagedCardIds, setStagedCardIds] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [peekState, setPeekState] = useState(null); // { card, stackId }
  const playAreaRef = useRef(null);
  const handAreaRef = useRef(null);

  // If playerID is null, we are observing. Assuming local single player for mockup:
  const localPlayer = playerID || '0';
  
  const hand = G.hands[localPlayer] || [];
  const playAreaStacks = G.playAreaStacks || [];

  const handleCardClick = (id) => {
    if (ctx.currentPlayer !== localPlayer || isFlipping) return;

    setStagedCardIds(prev => 
      prev.includes(id) 
        ? prev.filter(cardId => cardId !== id) 
        : [...prev, id]
    );
  };

  const handleConfirm = async () => {
    if (stagedCardIds.length === 0) return;

    // Phase 1: Flip face down in hand
    setIsFlipping(true);

    // Phase 2: Wait 0.5 seconds
    await new Promise(resolve => setTimeout(resolve, 500));

    // Phase 3: Play to area
    moves.playMultipleCards(stagedCardIds);
    
    // Reset local state
    setStagedCardIds([]);
    setIsFlipping(false);
  };

  const startPeek = (card, stackId) => {
    if (card.owner === localPlayer) {
      setPeekState({ card, stackId });
    }
  };

  const endPeek = () => {
    setPeekState(null);
  };

  return (
    <LayoutGroup id="card-moves">
      <div 
        onClick={endPeek}
        style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '2rem',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        
        {/* Opponents Area (Mocked) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '160px' }}>
          <div className="glass-panel" style={{ 
            width: '45%', 
            padding: '1rem', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
             <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-text-muted)' }}>Opponent 1</h4>
             <div style={{ display: 'flex', gap: '-40px', transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                {(G.hands['1'] || []).map(card => (
                  <Card key={card.id} {...card} isFaceDown={true} isPlayable={false} />
                ))}
             </div>
          </div>
          <div className="glass-panel" style={{ 
            width: '45%', 
            padding: '1rem', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
             <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-text-muted)' }}>Opponent 2</h4>
             <div style={{ display: 'flex', gap: '-40px', transform: 'scale(0.6)', transformOrigin: 'top center' }}>
                {(G.hands['2'] || []).map(card => (
                  <Card key={card.id} {...card} isFaceDown={true} isPlayable={false} />
                ))}
             </div>
          </div>
        </div>

        {/* Central Play Area */}
        <div 
          className="glass-panel" 
          ref={playAreaRef}
          style={{
            flexGrow: 1,
            margin: '2rem 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            position: 'relative'
          }}
        >
          {playAreaStacks.length === 0 ? (
            <h2 style={{ color: 'var(--color-text-muted)', opacity: 0.5 }}>Play Cards Here</h2>
          ) : (
            playAreaStacks.map((stack) => (
              <PlayStack 
                key={stack.id}
                stack={stack}
                moves={moves}
                localPlayer={localPlayer}
                peekedCard={peekState?.card}
                onPeekStart={(card) => startPeek(card, stack.id)}
                playAreaRef={playAreaRef}
                handAreaRef={handAreaRef}
              />
            ))
          )}
        </div>

        {/* Local Player Hand & Peek Overlay */}
        <div 
          ref={handAreaRef}
          style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          height: '250px',
          paddingBottom: '20px',
          position: 'relative',
          transition: 'background 0.3s',
          borderRadius: '20px'
        }}>
          {/* Peeking Overlay - Shows the card faceup above the hand with actions */}
          <AnimatePresence>
            {peekState && (
              <div style={{
                position: 'absolute',
                top: '-180px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '15px'
              }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1.1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 20 }}
                >
                  <Card {...peekState.card} id={`${peekState.card.id}-peek`} isFaceDown={false} onClick={() => {}} />
                </motion.div>

                {/* Tactical Action Menu */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: '10px' }}
                >
                  <button 
                    className="glass-panel"
                    onClick={(e) => { e.stopPropagation(); moves.flipStack(peekState.stackId); endPeek(); }}
                    style={{ padding: '8px 16px', background: 'rgba(59, 130, 246, 0.5)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🔄 {peekState.card.isFaceDown ? 'Reveal Stack' : 'Hide Stack'}
                  </button>
                  <button 
                    className="glass-panel"
                    onClick={(e) => { e.stopPropagation(); moves.returnCardToHand({ stackId: peekState.stackId, cardId: peekState.card.id }); endPeek(); }}
                    style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.5)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    📥 Return Card
                  </button>
                  <button 
                    className="glass-panel"
                    onClick={(e) => { e.stopPropagation(); moves.returnStackToHand(peekState.stackId); endPeek(); }}
                    style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.5)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    🗃️ Return Stack
                  </button>
                </motion.div>

                <div style={{
                  background: 'rgba(0,0,0,0.8)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  color: '#FBBF24',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(251, 191, 36, 0.4)'
                }}>
                  PEEKING
                </div>
              </div>
            )}
          </AnimatePresence>

          {/* Staging Action Button - Hovers above hand */}
          <AnimatePresence>
            {stagedCardIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                style={{
                  position: 'absolute',
                  top: '-70px',
                  zIndex: 80,
                }}
              >
                <button
                  onClick={handleConfirm}
                  className="glass-panel"
                  style={{
                    padding: '0.8rem 2rem',
                    background: 'var(--color-primary)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1.2rem',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
                    letterSpacing: '1px'
                  }}
                >
                  🚀 PLAY CARDS ({stagedCardIds.length})
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {hand.map((card) => (
            <Card 
              key={card.id} 
              {...card} 
              isPlayable={ctx.currentPlayer === localPlayer && !isFlipping}
              isStaged={stagedCardIds.includes(card.id)}
              isFaceDown={isFlipping && stagedCardIds.includes(card.id)}
              onClick={handleCardClick}
            />
          ))}
        </div>
        
        {/* Controls & Turn indicator */}
        <div style={{ 
          position: 'fixed', 
          bottom: '2rem', 
          right: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          </AnimatePresence>

          <div className="glass-panel" style={{ overflow: 'hidden', minWidth: '150px' }}>
            <div style={{ padding: '1rem', fontWeight: 'bold' }}>
              {ctx.currentPlayer === localPlayer ? '🟢 Your Turn' : '🔴 Opponent Turn'}
            </div>
            {ctx.currentPlayer === localPlayer && (
              <button 
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  background: 'var(--color-primary)', 
                  color: 'white', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
                onClick={() => events.endTurn()}
              >
                End Turn
              </button>
            )}
          </div>
        </div>

      </div>
    </LayoutGroup>
  );
}
