import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { test } from 'node:test';
import { Context } from '@deepseek-ai/cordis';
import SkillRegistry from '@deepseek-ai/dsh-skill';
import { bundlePatchPaths, composeEntries, loadOverlayPatches } from '@deepseek-ai/dsh-app-boot';
import { fileURLToPath } from 'node:url';
import * as plugin from '../dsh/index.js';

test('DSH recognizes and composes the declared bundle patch', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const manifest = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const patches = bundlePatchPaths(root, manifest.dsh.bundle)
    .map(path => loadOverlayPatches('character-profile-test', path));
  const entries = composeEntries(patches);
  assert.equal(entries.length, 1);
  assert.equal(entries[0].id, 'character-profile-skill');
  assert.equal(entries[0].name, manifest.name);
  const codex = JSON.parse(await readFile(new URL('../.codex-plugin/plugin.json', import.meta.url), 'utf8'));
  assert.equal(codex.version, manifest.version);
});

test('DSH loads the original skill body and resources, and unloads it on disposal', async () => {
  const ctx = new Context();
  await ctx.plugin(SkillRegistry);
  const mounted = ctx.plugin(plugin);
  await mounted;
  const listed = await ctx.skills.list();
  assert.equal(listed.length, 1);
  assert.equal(listed[0].name, 'character-profile');
  assert.deepEqual(listed[0].invocation, { modelInvocable: true, userInvocable: true });
  const skill = await ctx.skills.get('character-profile');
  const original = await readFile(new URL('../SKILL.md', import.meta.url), 'utf8');
  const originalBody = original.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/u, '').trim();
  assert.equal(skill.content, originalBody);
  const template = 'references/character-profile-template.md';
  assert.deepEqual(await readFile(join(skill.resourceBase.path, template)),
    await readFile(new URL(`../${template}`, import.meta.url)));
  await mounted.dispose();
  assert.deepEqual(await ctx.skills.list(), []);
});

test('an existing local skill takes precedence over the packaged skill', async () => {
  const ctx = new Context();
  await ctx.plugin(SkillRegistry);
  const mounted = ctx.plugin(plugin);
  await mounted;
  const removeLocal = ctx.skills.register({
    name: 'character-profile',
    description: 'Local character profile customization',
    source: 'project-dsh',
    content: 'Local skill body',
  });
  assert.equal((await ctx.skills.get('character-profile')).content, 'Local skill body');
  removeLocal();
  assert.equal((await ctx.skills.get('character-profile')).provider, 'character-profile');
  await mounted.dispose();
});
