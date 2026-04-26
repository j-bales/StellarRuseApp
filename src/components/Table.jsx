import React, { useState, useRef } from 'react';
import { Card } from './Card';
import { PlayStack } from './PlayStack';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cardMatchesFilter } from '../game/AbilityRegistry';
import { PLAYER_COLORS } from '../theme';

export function Table({ G, ctx, moves, events, playerID }) {
  const [stagedCardIds, setStagedCardIds] = useState([]);
  const [isFlipping, setIsFlipping] = useState(false);
  const [peekState, setPeekState] = useState(null); // { card, stackId }
  const [targetingState, setTargetingState] = useState(null); // { sourceCardId, sourceStackId, ability, abilityIndex }
  const playAreaRef = useRef(null);
  const handAreaRef = useRef(null);

  // If playerID is null, we are observing. Assuming local single player for mockup:
  const localPlayer = playerID || '0';
  
  const hand = G.hands[localPlayer] || [];
  const playAreaStacks = G.playAreaStacks || [];

  const handleCardClick = (cardId) => {
    if (ctx.currentPlayer !== localPlayer || isFlipping || targetingState) return;

    setStagedCardIds(prev => 
      prev.includes(cardId) 
        ? prev.filter(id => id !== cardId) 
        : [...prev, cardId]
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
    if (card.owner === localPlayer && !targetingState) {
      setPeekState({ cardId: card.instanceId ?? card.id, stackId });
    }
  };

  const endPeek = () => {
    setPeekState(null);
  };

  const handleExhaustClick = (activeCard, stackId) => {
    // If the card has no abilities, just toggle exhaustion as normal
    if (!activeCard.abilities || activeCard.abilities.length === 0) {
      moves.exhaustCard({ stackId, cardId: activeCard.instanceId ?? activeCard.id });
      return;
    }

    // Currently only supporting the first ability for simplification
    const abilityIndex = 0;
    const ability = activeCard.abilities[abilityIndex];

    if (ability.requiresTarget) {
      setTargetingState({
        sourceCardId: activeCard.instanceId ?? activeCard.id,
        sourceStackId: stackId,
        ability,
        abilityIndex
      });
      setPeekState(null);
    } else {
      // Direct activation (no target needed)
      moves.activateAbility({
        sourceStackId: stackId,
        sourceCardId: activeCard.instanceId ?? activeCard.id,
        abilityIndex
      });
      setPeekState(null);
    }
  };

  const handleTargetSelection = (targetCard) => {
    if (!targetingState) return;
    
    moves.activateAbility({
      sourceStackId: targetingState.sourceStackId,
      sourceCardId: targetingState.sourceCardId,
      targetCardId: targetCard.instanceId ?? targetCard.id,
      abilityIndex: targetingState.abilityIndex
    });
    
    setTargetingState(null);
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
            overflow: 'hidden',
            border: `1px solid ${PLAYER_COLORS['1'].border}`,
            boxShadow: `inset 0 0 30px ${PLAYER_COLORS['1'].glow}`
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
               <h4 style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                 {G.playerTypes['1'] === 'human' ? 'Player-2' : 'AI Opponent'}
               </h4>
               {G.playerTypes['1'] === 'ai' && (
                 <button 
                   onClick={() => moves.joinGame('1')}
                   style={{ padding: '4px 12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                 >
                   Join Game
                 </button>
               )}
             </div>
             <div style={{ display: 'flex', gap: '-20px', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                {(G.hands['1'] || []).map(card => (
                  <Card key={card.instanceId ?? card.id} {...card} id={card.instanceId ?? card.id} isFaceDown={true} isPlayable={false} />
                ))}
             </div>
          </div>
          <div className="glass-panel" style={{ 
            width: '45%', 
            padding: '1rem', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            border: `1px solid ${PLAYER_COLORS['2'].border}`,
            boxShadow: `inset 0 0 30px ${PLAYER_COLORS['2'].glow}`
          }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '10px' }}>
               <h4 style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                 {G.playerTypes['2'] === 'human' ? 'Player-3' : 'AI Opponent'}
               </h4>
               {G.playerTypes['2'] === 'ai' && (
                 <button 
                   onClick={() => moves.joinGame('2')}
                   style={{ padding: '4px 12px', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                 >
                   Join Game
                 </button>
               )}
             </div>
             <div style={{ display: 'flex', gap: '-20px', transform: 'scale(0.7)', transformOrigin: 'top center' }}>
                {(G.hands['2'] || []).map(card => (
                  <Card key={card.instanceId ?? card.id} {...card} id={card.instanceId ?? card.id} isFaceDown={true} isPlayable={false} />
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
                peekedCard={peekState?.cardId}
                onPeekStart={(card) => startPeek(card, stack.id)}
                playAreaRef={playAreaRef}
                handAreaRef={handAreaRef}
                targetingAbility={targetingState?.ability}
                onTargetSelect={handleTargetSelection}
                currentPlayer={localPlayer}
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
          borderRadius: '20px',
          borderBottom: `4px solid ${PLAYER_COLORS[localPlayer]?.border || PLAYER_COLORS.default.border}`,
          background: `linear-gradient(to top, ${PLAYER_COLORS[localPlayer]?.glow || 'rgba(0,0,0,0)'}, transparent)`
        }}>
          {/* Peeking Overlay - Shows the card faceup above the hand with actions */}
          <AnimatePresence>
            {(() => {
              if (!peekState) return null;
              const activeStack = G.playAreaStacks.find(s => s.id === peekState.stackId);
              const activeCard = activeStack?.cards.find(c => (c.instanceId ?? c.id) === peekState.cardId);
              if (!activeCard) return null;

              return (
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
                    <Card 
                      {...activeCard} 
                      id={`${activeCard.instanceId ?? activeCard.id}-peek`} 
                      isFaceDown={false} 
                      isExhausted={false} 
                      onClick={() => {}} 
                    />
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
                      🔄 {activeCard.isFaceDown ? 'Reveal Stack' : 'Hide Stack'}
                    </button>
                    <button 
                      className="glass-panel"
                      onClick={(e) => { e.stopPropagation(); handleExhaustClick(activeCard, peekState.stackId); }}
                      style={{ padding: '8px 16px', background: activeCard.isExhausted ? 'rgba(251, 191, 36, 0.5)' : 'rgba(107, 114, 128, 0.5)', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      ⚡ {activeCard.isExhausted ? 'Ready Card' : (activeCard.abilities?.length > 0 ? 'Activate Ability' : 'Exhaust Card')}
                    </button>
                    <button 
                      className="glass-panel"
                      onClick={(e) => { e.stopPropagation(); moves.returnCardToHand({ stackId: peekState.stackId, cardId: peekState.cardId }); endPeek(); }}
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
              );
            })()}
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

          {hand.map((card) => {
            const cardId = card.instanceId ?? card.id;
            return (
              <Card 
                key={cardId} 
                {...card} 
                id={cardId}
                isPlayable={ctx.currentPlayer === localPlayer && !isFlipping}
                isStaged={stagedCardIds.includes(cardId)}
                isFaceDown={isFlipping && stagedCardIds.includes(cardId)}
                onClick={() => handleCardClick(cardId)}
              />
            );
          })}
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
          <div className="glass-panel" style={{ overflow: 'hidden', minWidth: '150px' }}>
            <div style={{ padding: '1rem', fontWeight: 'bold' }}>
              {ctx.currentPlayer === localPlayer 
                ? '🟢 Your Turn' 
                : `🔴 Player-${parseInt(ctx.currentPlayer) + 1}'s Turn`}
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
          {targetingState && (
            <button 
              className="glass-panel"
              onClick={() => setTargetingState(null)}
              style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.5)', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              ❌ Cancel Targeting
            </button>
          )}
        </div>

        {/* Global Targeting UI State Info */}
        {targetingState && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--color-primary)',
            padding: '10px 30px',
            borderRadius: '100px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}>
            🎯 SELECT A TARGET: {targetingState.ability.description}
          </div>
        )}

      </div>
    </LayoutGroup>
  );
}
