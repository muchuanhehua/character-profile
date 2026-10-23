import { readFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

export const name = 'character-profile';
export const inject = ['skills'];

const skillDirectory = fileURLToPath(new URL('../', import.meta.url));
const skillPath = fileURLToPath(new URL('../SKILL.md', import.meta.url));
// DSH's public bundled-provider rank lets project and user skills take precedence.
const bundledRank = 600;

function parseSkill(raw) {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/u.exec(raw);
  if (!frontmatter) throw new Error('character-profile: SKILL.md has no YAML frontmatter');
  const metadata = parse(frontmatter[1]);
  if (metadata?.name !== name || typeof metadata.description !== 'string'
      || !metadata.description.trim() || metadata.description.length > 1024) {
    throw new Error('character-profile: invalid skill name or description');
  }
  return { description: metadata.description, content: raw.slice(frontmatter[0].length).trim() };
}

export function apply(ctx) {
  const { description } = parseSkill(readFileSync(skillPath, 'utf8'));
  const candidate = {
    name,
    description,
    path: skillPath,
    invocation: { modelInvocable: true, userInvocable: true },
    provider: name,
    source: 'bundled',
    rank: bundledRank,
    resourceBase: { kind: 'directory', path: skillDirectory.replaceAll('\\', '/') },
    locator: skillPath,
  };
  ctx.skills.registerProvider(() => ({
    name,
    list: async () => [candidate],
    async get(selected, options) {
      const raw = await readFile(selected.locator, { encoding: 'utf8', signal: options.signal });
      const { rank, locator, ...summary } = selected;
      return { ...summary, ...parseSkill(raw) };
    },
  }));
}
