export const CardGame = {
  name: 'stellar-ruse',
  
  setup: ({ ctx }) => {
    // Generate some mock cards
    const deck = Array.from({ length: 20 }, (_, i) => ({
      id: `card-${i}`,
      name: `Entity ${i + 1}`,
      power: Math.floor(Math.random() * 8) + 1,
      cost: Math.floor(Math.random() * 5) + 1,
    }));

    return {
      deck: deck,
      hands: {
        '0': deck.slice(0, 5),   // Player 0 hand
        '1': deck.slice(5, 10),  // Player 1 (Enemy 1)
        '2': deck.slice(10, 15)  // Player 2 (Enemy 2)
      },
      playAreaStacks: [], // Array of individual stacks, each containing played cards
    };
  },

  moves: {
    playMultipleCards: ({ G, ctx }, cardIds) => {
      const player = ctx.currentPlayer;
      const stackCards = [];
      cardIds.forEach(cardId => {
        const cardIndex = G.hands[player].findIndex(c => c.id === cardId);
        if (cardIndex !== -1) {
          const [card] = G.hands[player].splice(cardIndex, 1);
          stackCards.push({ ...card, owner: player, isFaceDown: true });
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
        const cardIndex = stack.cards.findIndex(c => c.id === cardId);
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
      const stack = G.playAreaStacks.find(s => s.id === stackId);
      if (stack && stack.cards.length > 0) {
        // Toggle the face down state based on the first card
        const isCurrentlyFaceDown = stack.cards[0].isFaceDown;
        stack.cards.forEach(card => {
           card.isFaceDown = !isCurrentlyFaceDown;
        });
      }
    },
    exhaustCard: ({ G, ctx }, { stackId, cardId }) => {
      const stack = G.playAreaStacks.find(s => s.id === stackId);
      if (stack) {
        const card = stack.cards.find(c => c.id === cardId);
        if (card) {
          card.isExhausted = !card.isExhausted;
        }
      }
    },
    drawCard: ({ G, ctx }) => {
      // Mock draw functionality
    }
  },

  turn: {
    minMoves: 1,
  }
};
