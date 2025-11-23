# Walron 🦭

> **Decentralized Creator Platform Built on the Sui Stack**
> 
> Built for the Walrus Haulout Hackathon 2024

A privacy-first creator monetization platform leveraging Seal encryption and Walrus storage. Creators own their content, fans get verifiable access, and everything runs on-chain.

## 🌟 Overview

**Walron** empowers creators to monetize their content directly on-chain without intermediaries. Fans get transparent, verifiable access to exclusive content, and creators maintain full ownership of their identity and content.

The name **Walron** combines **Walrus** (decentralized storage) + **Patreon** (creator platform), representing our mission to build the future of creator economy on the Sui Stack.

## ✨ Key Features (All Fully Implemented & Working)

### 🎨 Creator Features
- **Creator Profiles**: Complete profile system with custom handles, bios, profile/banner images
- **SuiNS Integration**: Human-readable `.sui` domains for creator profiles (e.g., `alice.sui`)
- **Profile Editing**: Full profile management with image uploads via Walrus
- **Analytics Dashboard**: Real-time stats (wallet balance, revenue, subscribers, content count)
- **Unique Handles**: Each creator gets a unique username with real-time availability checking

### 🔐 Content & Security
- **Seal Encryption**: Real @mysten/seal SDK with Identity-Based Encryption (IBE)
- **Tier-Based Access**: Fine-grained access control based on subscription tiers
- **Walrus Storage**: Decentralized, censorship-resistant content hosting
- **IndexedDB Caching**: Smart client-side caching for instant content loads (0.1s vs 5-8s)
- **Content Management**: Upload, archive, and organize encrypted content

### 💰 Monetization
- **Subscription NFTs**: Tradeable, transferable membership tokens with `has key, store`
- **Multiple Tiers**: Unlimited subscription tiers with custom pricing
- **Direct Payments**: 100% of subscription fees go to creators (no intermediaries)
- **Tipping System**: Instant SUI tips with optional messages
- **Revenue Tracking**: Transparent on-chain revenue tracking

### 🌐 Composability & Portability
- **NFT Transferability**: Subscription NFTs can be sold, traded, or gifted
- **Cross-Platform Compatible**: Access logic works with any platform supporting Sui standards
- **On-Chain Verification**: All access checks happen on-chain (trustless)
- **URL Routing**: Profile pages accessible via SuiNS name, handle, or wallet address

## 🏗️ Architecture

### Tech Stack

- **Blockchain**: Sui (Smart contracts in Move)
- **Storage**: Walrus Protocol (Decentralized blob storage)
- **Encryption**: Seal Protocol (Real @mysten/seal SDK with production key servers)
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Wallet**: @mysten/dapp-kit

### Smart Contracts

Four core Move modules power the platform:

1. **creator_profile.move** - Profile management and creator identity
2. **subscription.move** - Subscription tiers and membership NFTs  
3. **content.move** - Content posts and access control
4. **payment.move** - Tipping and revenue tracking

### Data Flow

```
Creator uploads content
    ↓
1. Content encrypted with Seal (access policy created)
    ↓
2. Encrypted data uploaded to Walrus (blob ID returned)
    ↓
3. On-chain record created (blob ID + policy ID stored)
    ↓
Fan subscribes
    ↓
4. Subscription NFT minted and transferred to fan
    ↓
5. Fan can now decrypt and view content
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Sui CLI
- A Sui wallet (Sui Wallet, Suiet, etc.)
- (Optional) SuiNS domain for human-readable profile URLs

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd wal

# Install frontend dependencies
cd frontend
npm install

# Build Move contracts (already deployed)
cd ../contracts
sui move build
```

### Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_WALRUS_PUBLISHER=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR=https://aggregator.walrus-testnet.walrus.space
NEXT_PUBLIC_PACKAGE_ID=0xdbd66ba1348f60cdac421c2da4a09d2f56a48fa64963307b3842896258723e35
```

### Running Locally

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 💾 **IndexedDB Content Cache**

### **What is it?**
To avoid re-decryption and re-signing on every page refresh, decrypted content is automatically cached in the browser's **IndexedDB** (local storage).

### **Benefits:**
- ⚡ **Instant Load**: Second time viewing content = 0.1 seconds (vs 5-8 seconds)
- 🔑 **No Re-sign**: SessionKey is reused from localStorage
- 🔓 **No Re-decrypt**: Decrypted content loaded from IndexedDB
- 🌐 **No Blockchain Call**: Zero Seal SDK overhead after first load

### **Cache Behavior:**
- **Max Size**: 20MB per content (larger files are not cached)
- **Duration**: 8 hours (automatically cleaned up)
- **Storage**: Browser's IndexedDB (separate from localStorage)
- **Security**: Cleared on logout, subscription cancel, or expiry

### **How to Monitor:**
Add the `<CacheStats />` component to any page to see cache statistics:

```typescript
import { CacheStats } from "@/components/cache/CacheStats";

// In your page component:
<CacheStats />
```

### **Cache Locations:**
- `frontend/lib/cache/indexed-db-cache.ts` - Core implementation
- `frontend/components/content/ContentViewer.tsx` - Integrated (read/write)
- `frontend/components/auth/WalletButton.tsx` - Clear on logout
- `frontend/components/cache/CacheStats.tsx` - Stats component (optional)

---

## 📝 Usage Guide

### For Creators

1. **Connect Wallet** - Click "Connect Wallet" in the header (SuiNS name displayed if available)
2. **Create Profile** - Go to Dashboard and create your creator profile
   - Choose a unique handle (real-time availability checking)
   - Upload profile and banner images
   - Add bio and description
   - SuiNS name auto-detected if you own one
3. **Set Up Tiers** - Create subscription tiers with custom pricing
4. **Upload Content** - Upload encrypted content for your subscribers (max 5MB per file)
   - Content automatically encrypted with Seal
   - Stored on Walrus for decentralization
   - Assign to specific tiers for access control
5. **Manage Profile** - Edit profile, view analytics, track revenue
6. **Share Profile** - Share via `yourname.sui`, `yourhandle`, or wallet address

### For Fans

1. **Connect Wallet** - Connect your Sui wallet
2. **Explore Creators** - Browse creators on the Explore page
3. **Subscribe** - Choose a tier and subscribe with SUI
4. **Access Content** - View exclusive content from your subscribed creators
5. **Send Tips** - Support creators with direct tips

## 🔐 Security & Privacy

- All non-public content is encrypted with **real Seal SDK** (Identity-Based Encryption)
- Uses **threshold cryptography** (1-of-2 key servers) for decentralized key management
- Encryption keys are managed on-chain via access policies
- Subscription verification happens on-chain (trustless)
- No centralized server can access encrypted content
- Walrus ensures content is distributed and always available
- **File size limit**: 5MB per upload (optimized for Seal encryption performance)

## 🎯 Hackathon Track: Data Security & Privacy

### The Problem
Creators need to monetize exclusive content, but centralized platforms:
- Can access/leak private content
- Control creator-fan relationships  
- Take 5-30% fees
- Can censor or ban creators

### Walron's Solution: Privacy-First Architecture
Built entirely on the Sui Stack:

**🔐 Seal Encryption**
- Real IBE (Identity-Based Encryption) with @mysten/seal SDK
- Tier-based access policies
- Threshold cryptography (1-of-2 key servers)
- Only verified subscribers can decrypt

**🌐 Walrus Storage**
- Decentralized blob storage
- Censorship-resistant
- Verifiable content integrity
- No single point of failure

**⛓️ On-Chain Verification**
- Subscription NFTs prove membership
- Access checks happen on-chain (trustless)
- Zero-knowledge-like: no content exposed
- Transparent, auditable policies

**🎯 Result**
Creators fully control their content and revenue, fans get verifiable access, and privacy is guaranteed by cryptography—not trust in a platform.

## 📊 Deployment

### Testnet Deployment

- **Package ID**: `0xdbd66ba1348f60cdac421c2da4a09d2f56a48fa64963307b3842896258723e35`
- **Network**: Sui Testnet
- **Explorer**: [View on SuiScan](https://suiscan.xyz/testnet/object/0xdbd66ba1348f60cdac421c2da4a09d2f56a48fa64963307b3842896258723e35)


## 🎥 Demo

[Demo video link will be added here]

### Key Demo Points

1. Creator profile creation
2. Subscription tier setup
3. Content upload with encryption
4. Fan subscribing to creator
5. Accessing encrypted content
6. Sending tips

## 🔮 Future Enhancements

- **zkLogin/Passkeys**: Passwordless authentication for better UX
- **Direct Messaging**: Encrypted creator-fan communication
- **Content Bundles**: Package multiple content pieces together
- **Auto-Renewal**: Automatic subscription renewals
- **Multi-Tier Access**: Subscribe to multiple tiers simultaneously
- **NFT Gating**: Use existing NFTs as access keys
- **Comments System**: Fan engagement with creator posts
- **Advanced Analytics**: Detailed revenue breakdowns and growth charts

## 🏆 What Makes This Special

### Technical Excellence ⚡
- **Complete Sui Stack Integration**: Sui blockchain + Walrus storage + Seal encryption + SuiNS
- **Real Seal SDK**: Production-ready IBE encryption (not mock implementation)
- **Gas-Efficient Contracts**: Optimized Move code with proper error handling
- **Smart Caching**: IndexedDB integration for instant content loads
- **Composable NFTs**: Subscription tokens with `has key, store` for full transferability

### Innovation 🚀
- **First Decentralized Patreon**: Complete working implementation with encrypted content
- **Subscription NFT Marketplace**: Tradeable memberships create secondary markets
- **Identity-Based Encryption**: Fine-grained tier access without complex key management
- **True Content Ownership**: Creators control everything on-chain
- **SuiNS URLs**: Human-readable profile links (`alice.sui` instead of `0x123...`)

### User Experience 🎨
- **Familiar Interface**: Patreon-like UX for easy onboarding
- **Real-Time Validation**: Handle availability checking, transaction confirmations
- **Instant Content Access**: 0.1s load times after first decrypt (via caching)
- **Profile Customization**: Full profile editing with image uploads
- **Analytics Dashboard**: Live stats for creators

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

Built solo for the Walrus Haulout Hackathon

## 🙏 Acknowledgments

- Sui Foundation for the amazing blockchain platform
- Walrus Protocol for decentralized storage
- Seal Protocol for encryption capabilities
- DeepSurge platform for hackathon hosting

## 📧 Contact

For questions or feedback, reach out via:
- GitHub Issues
- Twitter: [Your Twitter]
- Email: [Your Email]

---

**Built with ❤️ on the Sui Stack**

