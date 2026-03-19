#!/usr/bin/env node
/**
 * Generate a bcrypt hash for the admin password.
 * Usage: npm run hash-password
 * Then set the output as ADMIN_PASSWORD_HASH in Vercel env vars.
 */
const bcrypt   = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Enter admin password: ', async (password) => {
  rl.close();
  if (!password) { console.error('Password cannot be empty'); process.exit(1); }
  const hash = await bcrypt.hash(password, 12);
  console.log('\nYour ADMIN_PASSWORD_HASH:');
  console.log(hash);
  console.log('\nSet this in Vercel → Settings → Environment Variables.');
});
