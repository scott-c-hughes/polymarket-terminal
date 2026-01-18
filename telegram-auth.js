#!/usr/bin/env node
/**
 * Telegram Authentication Script
 *
 * This script helps you generate a session string for the Telegram API.
 * You only need to run this once - the session string can be reused.
 *
 * Prerequisites:
 * 1. Go to https://my.telegram.org
 * 2. Log in with your phone number
 * 3. Click "API development tools"
 * 4. Create an app to get your api_id and api_hash
 *
 * Usage:
 *   TELEGRAM_API_ID=12345 TELEGRAM_API_HASH=abcdef node telegram-auth.js
 */

const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('TELEGRAM AUTHENTICATION FOR SITUATION MONITOR');
  console.log('='.repeat(60));
  console.log('');

  // Get API credentials
  let apiId = parseInt(process.env.TELEGRAM_API_ID);
  let apiHash = process.env.TELEGRAM_API_HASH;

  if (!apiId) {
    const idStr = await prompt('Enter your API ID: ');
    apiId = parseInt(idStr);
  }
  if (!apiHash) {
    apiHash = await prompt('Enter your API Hash: ');
  }

  if (!apiId || !apiHash) {
    console.error('\nError: API ID and API Hash are required.');
    console.log('\nTo get these credentials:');
    console.log('1. Go to https://my.telegram.org');
    console.log('2. Log in with your phone number');
    console.log('3. Click "API development tools"');
    console.log('4. Create an app to get your api_id and api_hash');
    rl.close();
    process.exit(1);
  }

  console.log('\nConnecting to Telegram...');

  // Create client with empty session
  const session = new StringSession('');
  const client = new TelegramClient(session, apiId, apiHash, {
    connectionRetries: 5,
  });

  try {
    await client.start({
      phoneNumber: async () => {
        const phone = await prompt('\nEnter your phone number (with country code, e.g., +1234567890): ');
        return phone;
      },
      password: async () => {
        const password = await prompt('Enter your 2FA password (if enabled, or press Enter): ');
        return password;
      },
      phoneCode: async () => {
        const code = await prompt('Enter the code you received: ');
        return code;
      },
      onError: (err) => console.error('Error:', err.message),
    });

    console.log('\n' + '='.repeat(60));
    console.log('SUCCESS! Authentication complete.');
    console.log('='.repeat(60));
    console.log('\nYour session string (save this securely):');
    console.log('-'.repeat(60));
    console.log(client.session.save());
    console.log('-'.repeat(60));
    console.log('\nAdd this to your environment variables:');
    console.log('');
    console.log('For local development (.env file):');
    console.log(`  TELEGRAM_API_ID=${apiId}`);
    console.log(`  TELEGRAM_API_HASH=${apiHash}`);
    console.log(`  TELEGRAM_SESSION=${client.session.save()}`);
    console.log('');
    console.log('For Vercel:');
    console.log('  npx vercel env add TELEGRAM_API_ID');
    console.log('  npx vercel env add TELEGRAM_API_HASH');
    console.log('  npx vercel env add TELEGRAM_SESSION');
    console.log('');
    console.log('Then paste the values when prompted.');
    console.log('='.repeat(60));

    // Test fetching from a channel
    console.log('\nTesting connection by fetching from @sentdefender...');
    try {
      const entity = await client.getEntity('sentdefender');
      const messages = await client.getMessages(entity, { limit: 1 });
      if (messages.length > 0) {
        console.log('Latest message preview:');
        console.log(`  "${messages[0].message?.substring(0, 100)}..."`);
        console.log('\nTelegram integration is working!');
      }
    } catch (e) {
      console.log('Could not fetch test message:', e.message);
    }

  } catch (error) {
    console.error('\nAuthentication failed:', error.message);
  }

  await client.disconnect();
  rl.close();
}

main().catch(console.error);
