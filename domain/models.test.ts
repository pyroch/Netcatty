import assert from 'node:assert/strict';
import test from 'node:test';

import { formatKeyBindingForPlatform, keyEventToString, matchesKeyBinding } from './models.ts';

const keyboardEvent = (
  key: string,
  code: string,
  modifiers: Partial<KeyboardEvent> = {},
): KeyboardEvent => ({
  key,
  code,
  altKey: false,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  ...modifiers,
}) as KeyboardEvent;

test('shortcut matching falls back to physical keys for non-Latin layouts', () => {
  const event = keyboardEvent('\u0446', 'KeyW', { ctrlKey: true });

  assert.equal(matchesKeyBinding(event, 'Ctrl + W', false), true);
  assert.equal(keyEventToString(event, false), 'Ctrl + W');
});

test('shortcut matching respects Latin characters from non-QWERTY layouts', () => {
  const event = keyboardEvent('w', 'Comma', { ctrlKey: true });

  assert.equal(matchesKeyBinding(event, 'Ctrl + W', false), true);
  assert.equal(matchesKeyBinding(event, 'Ctrl + ,', false), false);
  assert.equal(keyEventToString(event, false), 'Ctrl + W');
});

test('shortcut matching respects non-ASCII Latin layout characters', () => {
  const event = keyboardEvent('ß', 'Minus', { ctrlKey: true });

  assert.equal(matchesKeyBinding(event, 'Ctrl + ß', false), true);
  assert.equal(matchesKeyBinding(event, 'Ctrl + -', false), false);
  assert.equal(keyEventToString(event, false), 'Ctrl + ß');
});

test('shortcut matching respects punctuation characters from non-QWERTY layouts', () => {
  const event = keyboardEvent(',', 'KeyW', { ctrlKey: true });

  assert.equal(matchesKeyBinding(event, 'Ctrl + ,', false), true);
  assert.equal(matchesKeyBinding(event, 'Ctrl + W', false), false);
  assert.equal(keyEventToString(event, false), 'Ctrl + ,');
});

test('shortcut matching keeps physical digit ranges layout-independent', () => {
  const event = keyboardEvent('&', 'Digit1', { ctrlKey: true });

  assert.equal(matchesKeyBinding(event, 'Ctrl + [1...9]', false), true);
  assert.equal(keyEventToString(event, false), 'Ctrl + &');
});

test('shortcut matching preserves shifted number-row symbols', () => {
  const event = keyboardEvent('!', 'Digit1', { ctrlKey: true, shiftKey: true });

  assert.equal(matchesKeyBinding(event, 'Ctrl + Shift + !', false), true);
  assert.equal(matchesKeyBinding(event, 'Ctrl + Shift + 1', false), false);
  assert.equal(keyEventToString(event, false), 'Ctrl + Shift + !');
});

test('mac shortcuts accept Alt as an Option alias', () => {
  const event = keyboardEvent('c', 'KeyC', { altKey: true });

  assert.equal(matchesKeyBinding(event, '\u2325 + C', true), true);
  assert.equal(matchesKeyBinding(event, 'Alt + C', true), true);
  assert.equal(keyEventToString(event, true), '\u2325 + C');
});

test('pc shortcuts accept Option as an Alt alias', () => {
  const event = keyboardEvent('c', 'KeyC', { altKey: true });

  assert.equal(matchesKeyBinding(event, 'Alt + C', false), true);
  assert.equal(matchesKeyBinding(event, '\u2325 + C', false), true);
  assert.equal(keyEventToString(event, false), 'Alt + C');
});

test('shortcut display uses platform modifier names', () => {
  assert.equal(formatKeyBindingForPlatform('\u2325 + C', false), 'Alt + C');
  assert.equal(formatKeyBindingForPlatform('Alt + C', true), '\u2325 + C');
});
