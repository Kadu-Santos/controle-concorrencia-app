import * as basic from './rules/basicValidators';
import * as twoPL from './rules/rules2PL';

const defaultRules = [
  ...Object.values(basic),
  ...Object.values(twoPL)
];

export default function verifier(instructions = [], rules = defaultRules) {
  const violations = [];

  for (const rule of rules) {
    const results = rule(instructions) || [];
    results.forEach(r => {
      if (r?.indices?.length) violations.push(r);
    });
  }

  const errorSet = new Set();
  violations.forEach(err => err.indices.forEach(i => errorSet.add(i)));

  const flaggedIndexes = instructions.map((_, i) => errorSet.has(i));

  return {
    errors: violations,
    indicesWithError: flaggedIndexes
  };
}
