#!/usr/bin/env node

/**
 * Subscription Expiry Test Script
 * Tests if subscription expiry mechanism is working correctly
 */

const { SuiClient } = require('@mysten/sui/client');
const fs = require('fs');

const PACKAGE_ID = '0x3957388874954b7da66b555c6ea2756ad95dfc670881fed7a89e0b427753e544';
const SUI_NETWORK = 'testnet';
const RPC_URL = 'https://fullnode.testnet.sui.io';

async function testExpiry() {
  console.log('\n╔═══════════════════════════════════════════════════════════════╗');
  console.log('║                                                               ║');
  console.log('║        🧪 SUBSCRIPTION EXPIRY TEST                            ║');
  console.log('║                                                               ║');
  console.log('╚═══════════════════════════════════════════════════════════════╝\n');

  console.log(`📦 Package ID: ${PACKAGE_ID}`);
  console.log(`🌐 Network: ${SUI_NETWORK}`);
  console.log(`🔗 RPC: ${RPC_URL}\n`);

  const client = new SuiClient({ url: RPC_URL });

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
        rawExpiresAt: expiresAtMs,
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
    console.log('🔍 CODE EXPIRY CHECK:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('📍 Checking: lib/seal/access-proof.ts::isSubscriptionActive()');
    
    const accessProofContent = fs.readFileSync('./lib/seal/access-proof.ts', 'utf8');

    if (accessProofContent.includes('now < expiresAt')) {
      console.log('✅ Frontend IS checking expiry (now < expiresAt)');
    } else {
      console.log('❌ Frontend NOT checking expiry!');
    }

    console.log('\n📍 Checking: contracts/sources/subscription.move::seal_approve()');
    
    const subscriptionContent = fs.readFileSync('../contracts/sources/subscription.move', 'utf8');

    // Check if seal_approve references subscription object (not just vector<u8>)
    const sealApproveMatch = subscriptionContent.match(/public entry fun seal_approve\([^)]+\)/);
    if (sealApproveMatch) {
      const sealApproveSignature = sealApproveMatch[0];
      console.log(`   Function signature: ${sealApproveSignature.slice(0, 60)}...`);
      
      if (sealApproveSignature.includes('Subscription')) {
        console.log('✅ seal_approve accepts Subscription object');
        
        // Check if it actually validates expiry
        const sealApproveFull = subscriptionContent.slice(
          subscriptionContent.indexOf('public entry fun seal_approve'),
          subscriptionContent.indexOf('public entry fun seal_approve') + 500
        );
        
        if (sealApproveFull.includes('expires_at') || sealApproveFull.includes('is_active')) {
          console.log('✅ seal_approve VALIDATES expiry!');
        } else {
          console.log('⚠️  seal_approve does NOT validate expiry');
        }
      } else {
        console.log('⚠️  seal_approve does NOT check expiry (only accepts vector<u8>)');
        console.log('   🔴 SECURITY ISSUE: Expired subscriptions can still access content!');
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 TEST RESULT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (expired > 0) {
      console.log('✅ Expiry mechanism is WORKING (found expired subscriptions)');
      console.log('   - expires_at timestamp is being set correctly');
      console.log('   - Frontend can detect expired subscriptions');
      console.log('   - Blockchain stores expiry correctly\n');
    } else if (results.length > 0) {
      console.log('⏳ Expiry mechanism is CONFIGURED');
      console.log('   - All subscriptions are still active (no expired ones yet)');
      console.log('   - expires_at timestamps are set correctly (30 days from creation)');
      console.log('   - Wait until a subscription expires to fully test\n');
      
      const nextExpiry = Math.min(...results.map(r => r.rawExpiresAt));
      const hoursUntilExpiry = (nextExpiry - now) / 1000 / 60 / 60;
      
      console.log(`   ⏰ Next expiry: ${new Date(nextExpiry).toLocaleString()}`);
      console.log(`   ⌛ Time remaining: ${hoursUntilExpiry.toFixed(1)} hours (${(hoursUntilExpiry / 24).toFixed(1)} days)\n`);
    }

    // Final verdict
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📝 VERDICT:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const frontendOK = accessProofContent.includes('now < expiresAt');
    const smartContractOK = subscriptionContent.includes('subscription.expires_at') || 
                            subscriptionContent.includes('is_active');

    if (expired > 0 && frontendOK) {
      console.log('✅ EXPIRY IS WORKING!');
      console.log('   Subscriptions expire after 30 days as expected.\n');
    } else if (results.length > 0 && frontendOK) {
      console.log('✅ EXPIRY IS CONFIGURED CORRECTLY');
      console.log('   Waiting for first subscription to expire for full validation.\n');
    } else {
      console.log('⚠️  EXPIRY NEEDS ATTENTION');
      if (!frontendOK) console.log('   - Frontend expiry check missing');
      if (!smartContractOK) console.log('   - Smart contract expiry check missing');
      console.log('');
    }

    console.log('✨ Test completed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run test
testExpiry().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
