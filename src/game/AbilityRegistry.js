/**
 * AbilityRegistry.js
 *
 * Maps ability key strings (from catalog.json) to pure functions that
 * mutate game state (G).
 *
 * Each ability function signature:
 *   (G, ctx, sourceCard, targetCard | null, params) => void
 *
 * - sourceCard: the card whose ability is being triggered
 * - targetCard: the selected target card (or null for non-targeting abilities)
 * - params:     the `params` object from the card's ability definition
 *
 * Functions MUST mutate G directly (boardgame.io Immer pattern).
 * Return value is ignored.
 */

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function findCardInStacks(G, cardId) {
  for (const stack of G.playAreaStacks) {
    const card = stack.cards.find(c => (c.instanceId ?? c.id) === cardId);
    if (card) return { stack, card };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Ability Functions
// ---------------------------------------------------------------------------

/**
 * reduce_attack
 * Reduces a target card's attack by params.amount.
 * Enforced minimum: attack cannot drop below 0.
 */
function reduce_attack(G, ctx, sourceCard, targetCard, params) {
  if (!targetCard) return;
  const targetId = targetCard.instanceId ?? targetCard.id;
  const found = findCardInStacks(G, targetId);
  if (!found) return;
  found.card.attack = Math.max(0, (found.card.attack ?? 0) - (params.amount ?? 1));
}

/**
 * return_opponent_card
 * Returns a target opponent's card from the play area to their hand.
 */
function return_opponent_card(G, ctx, sourceCard, targetCard, params) {
  if (!targetCard) return;
  const targetId = targetCard.instanceId ?? targetCard.id;
  for (let i = 0; i < G.playAreaStacks.length; i++) {
    const stack = G.playAreaStacks[i];
    const cardIndex = stack.cards.findIndex(c => (c.instanceId ?? c.id) === targetId);
    if (cardIndex !== -1) {
      const [card] = stack.cards.splice(cardIndex, 1);
      G.hands[card.owner].push({ ...card, isFaceDown: false, isExhausted: false });
      if (stack.cards.length === 0) {
        G.playAreaStacks.splice(i, 1);
      }
      break;
    }
  }
}

/**
 * steal_to_hand
 * Removes a target opponent's card from the play area and adds it to the
 * current player's hand.
 */
function steal_to_hand(G, ctx, sourceCard, targetCard, params) {
  if (!targetCard) return;
  const targetId = targetCard.instanceId ?? targetCard.id;
  const currentPlayer = ctx.currentPlayer;
  for (let i = 0; i < G.playAreaStacks.length; i++) {
    const stack = G.playAreaStacks[i];
    const cardIndex = stack.cards.findIndex(c => (c.instanceId ?? c.id) === targetId);
    if (cardIndex !== -1) {
      const [card] = stack.cards.splice(cardIndex, 1);
      // Transfer ownership to current player
      G.hands[currentPlayer].push({
        ...card,
        owner: currentPlayer,
        isFaceDown: false,
        isExhausted: false
      });
      if (stack.cards.length === 0) {
        G.playAreaStacks.splice(i, 1);
      }
      break;
    }
  }
}

/**
 * return_self_to_hand
 * Returns the source card itself from the play area to the acting player's hand.
 * No target needed.
 */
function return_self_to_hand(G, ctx, sourceCard, targetCard, params) {
  const sourceId = sourceCard.instanceId ?? sourceCard.id;
  for (let i = 0; i < G.playAreaStacks.length; i++) {
    const stack = G.playAreaStacks[i];
    const cardIndex = stack.cards.findIndex(c => (c.instanceId ?? c.id) === sourceId);
    if (cardIndex !== -1) {
      const [card] = stack.cards.splice(cardIndex, 1);
      G.hands[card.owner].push({ ...card, isFaceDown: false, isExhausted: false });
      if (stack.cards.length === 0) {
        G.playAreaStacks.splice(i, 1);
      }
      break;
    }
  }
}

// ---------------------------------------------------------------------------
// Registry Map
// ---------------------------------------------------------------------------

export const AbilityRegistry = {
  reduce_attack,
  return_opponent_card,
  steal_to_hand,
  return_self_to_hand,
};

// ---------------------------------------------------------------------------
// Target Filter Validator
// ---------------------------------------------------------------------------

/**
 * Returns true if a candidate card satisfies the given targetFilter constraints.
 *
 * @param {Object} candidateCard - A card object from G.playAreaStacks
 * @param {Object|null} targetFilter - Filter from catalog: { maxAttack, minAttack, ownedBy }
 * @param {string} currentPlayer - The ID of the player using the ability
 */
export function cardMatchesFilter(candidateCard, targetFilter, currentPlayer) {
  if (!targetFilter) return true;

  if (targetFilter.maxAttack !== undefined && candidateCard.attack > targetFilter.maxAttack) {
    return false;
  }
  if (targetFilter.minAttack !== undefined && candidateCard.attack < targetFilter.minAttack) {
    return false;
  }
  if (targetFilter.ownedBy === 'opponent' && candidateCard.owner === currentPlayer) {
    return false;
  }
  if (targetFilter.ownedBy === 'self' && candidateCard.owner !== currentPlayer) {
    return false;
  }

  return true;
}

/**
 * Executes an ability from the registry.
 *
 * @param {string} key - The ability key from catalog.json
 * @param {Object} G - Game state
 * @param {Object} ctx - boardgame.io context
 * @param {Object} sourceCard - The card triggering the ability
 * @param {Object|null} targetCard - The selected target (null for non-targeting abilities)
 * @param {Object} params - Params from the ability definition
 */
export function executeAbility(key, G, ctx, sourceCard, targetCard, params) {
  const fn = AbilityRegistry[key];
  if (!fn) {
    console.warn(`[AbilityRegistry] Unknown ability key: "${key}"`);
    return;
  }
  fn(G, ctx, sourceCard, targetCard, params);
}
