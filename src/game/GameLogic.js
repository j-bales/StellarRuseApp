import { executeAbility } from './AbilityRegistry';

export const CardGame = {
  name: 'stellar-ruse',
  
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
    for (let p = 0; p < ctx.numPlayers; p++) {
      hands[p.toString()] = deck.splice(0, 5).map(card => ({
        ...card,
        owner: p.toString()
      }));
    }

    return {
      deck: deck,
      hands: hands,
      playAreaStacks: [], 
    };
  },

  moves: {
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
    minMoves: 1,
  }
};
