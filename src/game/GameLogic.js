import { executeAbility } from './AbilityRegistry';

export const CardGame = {
  name: 'stellar-ruse',
  
  playerView: (G, ctx, playerID) => {
    let newG = { ...G };
    
    // Create a new hands object where opponents' cards are hidden stubs
    const newHands = {};
    for (const [pID, hand] of Object.entries(G.hands)) {
      if (pID === playerID) {
        newHands[pID] = hand;
      } else {
        newHands[pID] = hand.map(card => ({
          id: 'hidden-card',
          instanceId: card.instanceId,
          owner: card.owner
        }));
      }
    }
    newG.hands = newHands;
    
    // Hide deck contents
    if (G.deck) {
      newG.deck = G.deck.map(card => ({
        id: 'hidden-card',
        instanceId: card.instanceId
      }));
    }
    
    return newG;
  },
  
  setup: function({ ctx, setupData }) {
    // catalog is injected via setupData or via global fallback
    const catalog = setupData || window.CARD_CATALOG || [];
    
    // Create a deck by duplicating cards from the catalog to reach a reasonable size
    // Each card gets a unique instanceId to distinguish multiple copies
    let deck = [];
    const targetDeckSize = 30;
    
    const getUniqueId = (prefix, i) => `${prefix}-${i}-${Math.random().toString(36).substr(2, 9)}`;

    if (catalog.length > 0) {
      for (let i = 0; i < targetDeckSize; i++) {
        const baseCard = catalog[i % catalog.length];
        deck.push({
          ...baseCard,
          instanceId: getUniqueId('inst', i)
        });
      }
      // Shuffle the deck
      deck = deck.sort(() => Math.random() - 0.5);
    } else {
      // Fallback mock cards if catalog failed to load
      deck = Array.from({ length: 20 }, (_, i) => ({
        id: `mock-${i}`,
        instanceId: getUniqueId('mock', i),
        name: `Entity ${i + 1}`,
        attack: Math.floor(Math.random() * 8) + 1,
        cost: { S: 1, E: 1, I: 1 },
        abilities: []
      }));
    }

    const hands = {};
    const playerTypes = {};
    for (let p = 0; p < ctx.numPlayers; p++) {
      const pid = p.toString();
      hands[pid] = deck.splice(0, 5).map(card => ({
        ...card,
        owner: pid
      }));
      // Default: Player 0 is human, others are AI
      playerTypes[pid] = (pid === '0') ? 'human' : 'ai';
    }

    return {
      deck: deck,
      hands: hands,
      playAreaStacks: [], 
      playerTypes: playerTypes,
    };
  },

  moves: {
    joinGame: ({ G, ctx }, playerID) => {
      if (G.playerTypes[playerID] === 'ai') {
        G.playerTypes[playerID] = 'human';
        
        // Return current hand to deck
        const currentHand = G.hands[playerID] || [];
        G.deck.push(...currentHand.map(card => ({ ...card, owner: null })));
        
        // Shuffle deck
        G.deck = G.deck.sort(() => Math.random() - 0.5);
        
        // Deal 5 fresh cards
        G.hands[playerID] = G.deck.splice(0, 5).map(card => ({
          ...card,
          owner: playerID
        }));
      }
    },
    playMultipleCards: ({ G, ctx }, cardIds) => {
      const player = ctx.currentPlayer;
      const stackCards = [];
      cardIds.forEach(cardId => {
        const cardIndex = G.hands[player].findIndex(c => (c.instanceId ?? c.id) === cardId);
        if (cardIndex !== -1) {
          const [card] = G.hands[player].splice(cardIndex, 1);
          stackCards.push({ ...card, owner: player, isFaceDown: true, isExhausted: false });
        }
      });
      if (stackCards.length > 0) {
        G.playAreaStacks.push({
          id: `stack-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          cards: stackCards
        });
      }
    },
    returnStackToHand: ({ G, ctx }, stackId) => {
      const stackIndex = G.playAreaStacks.findIndex(s => s.id === stackId);
      if (stackIndex !== -1) {
        const stack = G.playAreaStacks[stackIndex];
        stack.cards.forEach(card => {
           G.hands[card.owner].push({ ...card, isFaceDown: false, isExhausted: false });
        });
        G.playAreaStacks.splice(stackIndex, 1);
      }
    },
    returnCardToHand: ({ G, ctx }, { stackId, cardId }) => {
      const stackIndex = G.playAreaStacks.findIndex(s => s.id === stackId);
      if (stackIndex !== -1) {
        const stack = G.playAreaStacks[stackIndex];
        const cardIndex = stack.cards.findIndex(c => (c.instanceId ?? c.id) === cardId);
        if (cardIndex !== -1) {
          const [card] = stack.cards.splice(cardIndex, 1);
          G.hands[card.owner].push({ ...card, isFaceDown: false, isExhausted: false });
          if (stack.cards.length === 0) {
            G.playAreaStacks.splice(stackIndex, 1);
          }
        }
      }
    },
    flipStack: ({ G, ctx }, stackId) => {
      G.playAreaStacks = G.playAreaStacks.map(stack => {
        if (stack.id !== stackId) return stack;
        const isCurrentlyFaceDown = stack.cards[0]?.isFaceDown;
        return {
          ...stack,
          cards: stack.cards.map(card => ({
            ...card,
            isFaceDown: !isCurrentlyFaceDown
          }))
        };
      });
    },
    exhaustCard: ({ G, ctx }, { stackId, cardId }) => {
      G.playAreaStacks = G.playAreaStacks.map(stack => {
        if (stack.id !== stackId) return stack;
        return {
          ...stack,
          cards: stack.cards.map(card => {
            if ((card.instanceId ?? card.id) !== cardId) return card;
            return { ...card, isExhausted: !card.isExhausted };
          })
        };
      });
    },

    activateAbility: ({ G, ctx }, { sourceStackId, sourceCardId, targetCardId, abilityIndex }) => {
      const sourceStack = G.playAreaStacks.find(s => s.id === sourceStackId);
      if (!sourceStack) return;

      const sourceCard = sourceStack.cards.find(c => (c.instanceId ?? c.id) === sourceCardId);
      if (!sourceCard || sourceCard.isExhausted) return;

      const ability = sourceCard.abilities[abilityIndex];
      if (!ability) return;

      let targetCard = null;
      if (targetCardId) {
        for (const stack of G.playAreaStacks) {
          targetCard = stack.cards.find(c => (c.instanceId ?? c.id) === targetCardId);
          if (targetCard) break;
        }
      }

      // Execute the ability effect
      executeAbility(ability.key, G, ctx, sourceCard, targetCard, ability.params);

      // Exhaust the card as part of activation
      sourceCard.isExhausted = true;
    },

    drawCard: ({ G, ctx }) => {
      // Mock draw functionality
    }
  },

  turn: {
    onBegin: ({ G, ctx, events }) => {
      const currentPlayerID = ctx.currentPlayer;
      
      // Simulation for AI opponents
      if (G.playerTypes[currentPlayerID] === 'ai') {
        const hand = G.hands[currentPlayerID];
        if (!hand || hand.length === 0) {
          events.endTurn();
          return;
        }

        // AI Logic: Play 1 or 2 stacks
        const numStacksToPlay = Math.floor(Math.random() * 2) + 1;
        
        for (let s = 0; s < numStacksToPlay; s++) {
          const currentHand = G.hands[currentPlayerID];
          if (currentHand.length === 0) break;
          
          // AI plays 1 to 2 random cards in a stack
          const cardsInStackCount = Math.min(currentHand.length, Math.floor(Math.random() * 2) + 1);
          const stackCards = [];
          
          for (let c = 0; c < cardsInStackCount; c++) {
            const [card] = G.hands[currentPlayerID].splice(0, 1);
            stackCards.push({ 
              ...card, 
              owner: currentPlayerID, 
              isFaceDown: true, 
              isExhausted: false 
            });
          }

          if (stackCards.length > 0) {
            G.playAreaStacks.push({
              id: `ai-stack-${currentPlayerID}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
              cards: stackCards
            });
          }
        }
        
        // Finalize the AI turn
        events.endTurn();
      }
    },
    minMoves: 0,
  }
};
