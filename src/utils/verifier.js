import mustEnd from './rules/basicValidators/mustEnd';
import mustReadBeforeWrite from './rules/basicValidators/mustReadBeforeWrite';
import noActionAfterEnd from './rules/basicValidators/noActionAfterEnd';
import noCommitOrAbortFirst from './rules/basicValidators/noCommitOrAbortFirst';

import mustHaveWriteLockForWrite from './rules/rules2PL/mustHaveWriteLockForWrite';
import mustLockBeforeReadOrWrite from './rules/rules2PL/mustLockBeforeReadOrWrite ';
import noLockAfterUnlock from './rules/rules2PL/noLockAfterUnlock';
import noUnlockBeforeAllLocks from './rules/rules2PL/noUnlockBeforeAllLocks';
import noUnlockWithoutLock from './rules/rules2PL/noUnlockWithoutLock';
import noCommitWithActiveLocks from './rules/rules2PL/noCommitWithActiveLocks';

const defaultRules = [
  mustEnd,
  mustReadBeforeWrite,
  noActionAfterEnd,
  noCommitOrAbortFirst,

  noLockAfterUnlock,
  mustLockBeforeReadOrWrite,
  noUnlockWithoutLock,
  noUnlockBeforeAllLocks,
  mustHaveWriteLockForWrite,
  noCommitWithActiveLocks
];

export default function verifier(instructions = [], rules = defaultRules) {
  const violations = [];

  for (const rule of rules) {
    const result = rule(instructions);

    if (!result) continue;

    // Caso 1: objeto único com vários nomes e índices
    if (Array.isArray(result?.name) && Array.isArray(result?.indices)) {
      result.name.forEach((message, idx) => {
        const index = result.indices[idx];
        if (index !== undefined) {
          violations.push({
            name: message,
            indices: [index]
          });
        }
      });
    }

    // Caso 2: objeto simples
    else if (result?.indices?.length) {
      violations.push(result);
    }

    // Caso 3: lista de erros
    else if (Array.isArray(result)) {
      result.forEach(item => {
        if (item?.indices?.length) {
          violations.push(item);
        }
      });
    }
  }

  const flaggedIndexes = Array.from(
    { length: instructions.length },
    (_, i) => violations.some(err => err.indices.includes(i))
  );

  return {
    errors: violations,
    indicesWithError: flaggedIndexes
  };
}
