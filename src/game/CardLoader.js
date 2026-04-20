/**
 * CardLoader.js
 *
 * Fetches and validates the card catalog from /cards/catalog.json.
 * The catalog file is served by Vite's dev server via the `public` alias,
 * or placed in the `public/` folder for production builds.
 *
 * Usage:
 *   import { loadCardCatalog } from './CardLoader';
 *   const catalog = await loadCardCatalog();
 */

const CATALOG_PATH = '/cards/catalog.json';

const REQUIRED_FIELDS = ['id', 'name', 'attack', 'cost', 'abilities'];
const REQUIRED_COST_RESOURCES = ['S', 'E', 'I'];
const VALID_TRIGGERS = ['exhaust', 'play', 'passive'];

/**
 * Validates a single card object from the catalog.
 * Returns an array of validation error strings (empty = valid).
 */
function validateCard(card) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (card[field] === undefined || card[field] === null) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  if (card.cost && typeof card.cost === 'object') {
    for (const resource of REQUIRED_COST_RESOURCES) {
      if (typeof card.cost[resource] !== 'number') {
        errors.push(`cost.${resource} must be a number`);
      }
    }
  }

  if (Array.isArray(card.abilities)) {
    card.abilities.forEach((ability, i) => {
      if (!ability.key) {
        errors.push(`abilities[${i}] missing "key"`);
      }
      if (ability.trigger && !VALID_TRIGGERS.includes(ability.trigger)) {
        errors.push(`abilities[${i}] has invalid trigger: "${ability.trigger}"`);
      }
      if (typeof ability.requiresTarget !== 'boolean') {
        errors.push(`abilities[${i}] missing boolean "requiresTarget"`);
      }
    });
  }

  return errors;
}

/**
 * Loads and validates the card catalog.
 *
 * @returns {Promise<Array>} Array of valid card definition objects.
 */
export async function loadCardCatalog() {
  let data;

  try {
    const response = await fetch(CATALOG_PATH);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    data = await response.json();
  } catch (err) {
    console.error(
      `[CardLoader] Failed to load catalog from "${CATALOG_PATH}".`,
      err
    );
    return [];
  }

  if (!Array.isArray(data.cards)) {
    console.error('[CardLoader] catalog.json must have a top-level "cards" array.');
    return [];
  }

  const validCards = [];

  for (const card of data.cards) {
    const errors = validateCard(card);
    if (errors.length > 0) {
      console.warn(
        `[CardLoader] Card "${card.id ?? '(unknown)'}" failed validation and was skipped:`,
        errors
      );
    } else {
      validCards.push(card);
    }
  }

  console.info(`[CardLoader] Loaded ${validCards.length} of ${data.cards.length} cards.`);
  return validCards;
}
