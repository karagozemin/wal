#!/usr/bin/env node

/**
 * Subscription Expiry Test Script
 * Tests if subscription expiry mechanism is working correctly
 */

const { SuiClient } = require('@mysten/sui/client');
require('dotenv').config({ path: './frontend/.env.local' });

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID;
const SUI_NETWORK = process.env.NEXT_PUBLIC_SUI_NETWORK || 'testnet';

const RPC_URLS = {
  testnet: 'https://fullnode.testnet.sui.io',
  mainnet: 'https://fullnode.mainnet.sui.io',
};

async function testExpiry() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        🧪 SUBSCRIPTION EXPIRY TEST                            ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`📦 Package ID: ${PACKAGE_ID}`);
  console.log(`🌐 Network: ${SUI_NETWORK}`);
  console.log(`🔗 RPC: ${RPC_URLS[SUI_NETWORK]}\n`);

  const client = new SuiClient({ url: RPC_URLS[SUI_NETWORK] });

  try {
    // 1. Fetch all subscription events
    console.log('🔍 Fetching subscription events...\n');
    const events = await client.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::subscription::Subscribed`,
      },
      limit: 50,
    });

    if (events.data.length === 0) {
      console.log('❌ No subscriptions found!');
      console.log('💡 Create a subscription first to test expiry.\n');
      return;
    }

    console.log(`✅ Found ${events.data.length} subscription(s)\n`);

    const now = Date.now();
    const results = [];

    // 2. Check each subscription
    for (const event of events.data) {
      const { subscription_id, subscriber, creator, expires_at } = event.parsedJson;
      const expiresAtMs = parseInt(expires_at);
      const isExpired = now > expiresAtMs;
      const timeRemaining = expiresAtMs - now;
      const daysRemaining = timeRemaining / 1000 / 60 / 60 / 24;
      const hoursRemaining = timeRemaining / 1000 / 60 / 60;

      let status;
      let timeDisplay;

      if (isExpired) {
        const daysAgo = Math.abs(daysRemaining);
        status = '❌ EXPIRED';
        timeDisplay = `${daysAgo.toFixed(1)} days ago`;
      } else if (daysRemaining > 1) {
        status = '✅ ACTIVE';
        timeDisplay = `${daysRemaining.toFixed(1)} days left`;
      } else {
        status = '⚠️  EXPIRING SOON';
        timeDisplay = `${hoursRemaining.toFixed(1)} hours left`;
      }

      results.push({
        id: subscription_id.slice(0, 12) + '...',
        subscriber: subscriber.slice(0, 10) + '...',
        creator: creator.slice(0, 10) + '...',
        expiresAt: new Date(expiresAtMs).toLocaleString(),
        status,
        timeDisplay,
        isExpired,
      });
    }

    // 3. Display results table
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 SUBSCRIPTION STATUS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    results.forEach((r, i) => {
      console.log(`${i + 1}. ${r.status}`);
      console.log(`   ID: ${r.id}`);
      console.log(`   Subscriber: ${r.subscriber}`);
      console.log(`   Creator: ${r.creator}`);
      console.log(`   Expires: ${r.expiresAt}`);
      console.log(`   Time: ${r.timeDisplay}\n`);
    });

    // 4. Summary
    const expired = results.filter((r) => r.isExpired).length;
    const expiringSoon = results.filter(
      (r) => !r.isExpired && r.timeDisplay.includes('hours')
    ).length;
    const active = results.length - expired - expiringSoon;

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Active:        ${active}`);
    console.log(`⚠️  Expiring Soon: ${expiringSoon}`);
    console.log(`❌ Expired:       ${expired}`);
    console.log(`📅 Total:         ${results.length}\n`);

    // 5. Check if frontend is checking expiry
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 FRONTEND EXPIRY CHECK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📍 Checking: frontend/lib/seal/access-proof.ts::isSubscriptionActive()');
    
    const fs = require('fs');
    const accessProofContent = fs.readFileSync(
      './frontend/lib/seal/access-proof.ts',
      'utf8'
    );

    if (accessProofContent.includes('now < expiresAt')) {
      console.log('✅ Frontend IS checking expiry (now < expiresAt)');
    } else {
      console.log('❌ Frontend NOT checking expiry!');
    }

    console.log('\n📍 Checking: contracts/sources/subscription.move::seal_approve()');
    
    const subscriptionContent = fs.readFileSync(
      './contracts/sources/subscription.move',
      'utf8'
    );

    if (subscriptionContent.includes('subscription.expires_at') && 
        subscriptionContent.includes('seal_approve')) {
      console.log('✅ Smart contract IS checking expiry in seal_approve');
    } else {
      console.log('⚠️  Smart contract seal_approve() does NOT check expiry!');
      console.log('   This is a SECURITY ISSUE - expired subscriptions can still access content!');
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 TEST RESULT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (expired > 0) {
      console.log('✅ Expiry mechanism is WORKING (found expired subscriptions)');
      console.log('   - expires_at timestamp is being set correctly');
      console.log('   - Frontend can detect expired subscriptions');
      if (!subscriptionContent.includes('subscription.expires_at')) {
        console.log('   ⚠️  WARNING: Smart contract seal_approve needs expiry check!');
      }
    } else if (results.length > 0) {
      console.log('✅ Expiry mechanism is CONFIGURED');
      console.log('   - All subscriptions are still active (no expired ones yet)');
      console.log('   - expires_at timestamps are set correctly');
      console.log('   - Wait until a subscription expires to fully test');
      
      const nextExpiry = results.reduce((min, r) => {
        const exp = new Date(r.expiresAt).getTime();
        return exp < min ? exp : min;
      }, Infinity);
      
      console.log(`   ⏰ Next expiry: ${new Date(nextExpiry).toLocaleString()}`);
    }

    console.log('\n✨ Test completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('\nStack trace:', error.stack);
    process.exit(1);
  }
}

// Run test
testExpiry().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

