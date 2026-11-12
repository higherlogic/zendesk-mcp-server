import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const READ_ONLY = { readOnlyHint: true, destructiveHint: false };
const WRITE = { readOnlyHint: false, destructiveHint: false };
const DESTRUCTIVE = { readOnlyHint: false, destructiveHint: true };

function expectedAnnotations(name) {
  if (name.startsWith('delete_')) return DESTRUCTIVE;
  if (name.startsWith('create_') || name.startsWith('update_')) return WRITE;
  return READ_ONLY;
}

test('every tool publishes a description and both hints over stdio', async () => {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: ['src/index.js'],
    cwd: fileURLToPath(new URL('..', import.meta.url)),
    env: {
      PATH: process.env.PATH,
      ZENDESK_SUBDOMAIN: 'example',
      ZENDESK_EMAIL: 'test@example.com',
      ZENDESK_API_TOKEN: 'fake-token'
    },
    stderr: 'ignore'
  });
  const client = new Client({ name: 'tools-list-test', version: '0.0.0' });
  await client.connect(transport);
  try {
    const { tools } = await client.listTools();
    assert.equal(tools.length, 49);
    for (const tool of tools) {
      assert.ok(tool.description, `${tool.name} has no description`);
      assert.deepEqual(tool.annotations, expectedAnnotations(tool.name), tool.name);
      assert.equal(tool.inputSchema.type, 'object', tool.name);
    }
  } finally {
    await client.close();
  }
});
