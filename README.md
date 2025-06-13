# TryFi Wallet

A **disposable embedded Web3 wallet** that lets users try your dApp before connecting their actual wallet. Perfect for previewing, testing, and demo purposes on any EVM chain.

## Why TryFi?

**TryFi is the only wallet that lets users safely test your dApp without any risk:**

- **Zero Risk** - Disposable wallets that can be deleted anytime
- **Universal** - Works on any browser/device (no extensions required)
- **Any Chain** - Supports all EVM networks (Mainnet, Testnet, L2s)
- **Privacy First** - Fully client-side, no backend, no APIs
- **100% Free** - Open source and completely free to use
- **Developer Friendly** - Single line integration, no code changes needed
- **Zero Dependencies** - All dependencies bundled internally, no conflicts with your dApp's libraries

Perfect for **demos**, **onboarding new users**, **testing on mainnet**, or **showcasing dApps** without asking users to risk their real wallets.

## 🎉 What's New in v1.0

**Zero Dependencies Setup!** TryFi now bundles all dependencies (ethers.js, qrious) internally with proper namespace isolation. This means:

- ✅ **One script install** instead of three
- ✅ **No version conflicts** with your dApp's ethers version
- ✅ **Smaller total bundle size** thanks to tree shaking
- ✅ **No peer dependency warnings**
- ✅ **Works everywhere** without external CDN dependencies

---

## Quick Start

### 1. Add TryFi to Your dApp

**Option A: CDN (Easiest)**
```html
<!-- Single script - no additional dependencies needed! -->
<script src="https://unpkg.com/tryfi@latest/dist/tryfi.umd.js"></script>
```

**Option B: NPM Install**
```bash
# Single package - ethers and qrious are bundled internally
npm install tryfi
```

### 2. Initialize TryFi

**Single line of code - that's it!**

```javascript
// Minimal setup (works immediately)
TryFi.init({
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    chainId: 1,
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io']
});
```

**That's it!** TryFi will appear as a wallet device in the bottom-right corner. Users can click it to create and use disposable wallets.

---

## Configuration Options

### Required Configuration
```javascript
TryFi.init({
    // Required: Network details
    chainName: 'Ethereum Mainnet',        // Display name for your network
    rpcUrl: 'https://your-rpc-url.com',   // RPC endpoint
    chainId: 1,                           // Chain ID (number)
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io'],
    
    // Optional: Customize appearance and behavior
    position: 'bottom-right',             // Widget position
    theme: 'default',                     // UI theme
    faucetUrl: 'https://faucet.com',      // Testnet faucet link
    iconUrls: []
});
```

### Position Options
- `'bottom-right'` (default) - Bottom right corner
- `'bottom-left'` - Bottom left corner  
- `'top-right'` - Top right corner
- `'top-left'` - Top left corner
- `'hidden'` - Hidden by default (show programmatically)

### Available Themes
- `'default'` - Clean light theme
- `'default-dark'` - Dark theme
- `'glassmorphism'` - Modern glass effect

---

## Complete Examples

### Ethereum Mainnet
```javascript
TryFi.init({
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    chainId: 1,
    position: 'bottom-right',
    theme: 'default',
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io']
});
```

### Polygon Network
```javascript
TryFi.init({
    chainName: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137,
    theme: 'glassmorphism',
    nativeCurrency: {
        name: 'Polygon',
        symbol: 'MATIC',
        decimals: 18
    },
    blockExplorerUrls: ['https://polygonscan.com']
});
```

### Sepolia Testnet (with Faucet)
```javascript
TryFi.init({
    chainName: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    chainId: 11155111,
    position: 'bottom-left',
    theme: 'default-dark',
    faucetUrl: 'https://sepoliafaucet.com',
    nativeCurrency: {
        name: 'Sepolia Ether',
        symbol: 'SEP',
        decimals: 18
    },
    blockExplorerUrls: ['https://sepolia.etherscan.io']
});
```

### Arbitrum One
```javascript
TryFi.init({
    chainName: 'Arbitrum One',
    rpcUrl: 'https://arb1.arbitrum.io/rpc',
    chainId: 42161,
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18
    },
    blockExplorerUrls: ['https://arbiscan.io']
});
```

---

## Programmatic Control

### Show/Hide Widget
```javascript
// Show the widget
TryFi.show();

// Hide the widget  
TryFi.hide();

// Toggle visibility
TryFi.toggle();

// Clean up (removes from DOM)
TryFi.destroy();
```

## Integration with Existing dApps

**TryFi is designed to work alongside your existing wallet connection logic without any changes.**

### Web3Modal/RainbowKit Integration
```javascript
// Your existing wallet setup
import { createWeb3Modal } from '@web3modal/wagmi'

// Add TryFi (doesn't interfere with existing wallets)
TryFi.init({
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    chainId: 1,
    position: 'bottom-left'  // Keep separate from your main connect button
});

// Your existing logic works unchanged
const modal = createWeb3Modal({...})
```

### With Ethers.js
```javascript
// Your existing code
async function connectWallet() {
    if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        // ... your logic
    }
}

// TryFi provides window.ethereum automatically when active
TryFi.init({
    chainName: 'Polygon',
    rpcUrl: 'https://polygon-rpc.com',
    chainId: 137
});
```

---

## Production Best Practices

### Mainnet Configuration
```javascript
TryFi.init({
    chainName: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',  // Use reliable RPC
    chainId: 1,
    position: 'bottom-right',
    theme: 'default',
    faucetUrl: null,  // No faucet for mainnet
    nativeCurrency: {
        name: 'Ethereum',
        symbol: 'ETH', 
        decimals: 18
    },
    blockExplorerUrls: ['https://etherscan.io']
});
```

### Multi-Chain Support
```javascript
const chains = {
    ethereum: {
        chainName: 'Ethereum',
        rpcUrl: 'https://ethereum-rpc.publicnode.com',
        chainId: 1,
        symbol: 'ETH'
    },
    polygon: {
        chainName: 'Polygon',
        rpcUrl: 'https://polygon-rpc.com', 
        chainId: 137,
        symbol: 'MATIC'
    }
};

function initTryFi(chain) {
    TryFi.destroy();
    TryFi.init({
        chainName: chains[chain].chainName,
        rpcUrl: chains[chain].rpcUrl,
        chainId: chains[chain].chainId,
        nativeCurrency: {
            name: chains[chain].chainName,
            symbol: chains[chain].symbol,
            decimals: 18
        }
    });
}
```

---

## Security & Privacy

- **Fully Client-Side**: All wallet operations happen in the browser
- **No Backend**: Zero server communication required  
- **No APIs**: No external API calls for core functionality
- **Disposable**: Wallets can be deleted instantly
- **Local Storage**: Private keys stored locally (can be cleared)
- **Open Source**: Complete transparency, audit the code yourself

---

## User Experience

### What Users See
1. **Wallet Device**: Small widget in corner of your dApp
2. **One-Click Setup**: Click to create instant disposable wallet  
3. **Familiar Interface**: Standard wallet UI with balance, transactions
4. **Receive Funds**: QR codes and addresses for funding
5. **Full Functionality**: Send, sign, approve - just like real wallets
6. **Easy Cleanup**: Delete wallet and start fresh anytime

### Perfect For
- **Product Demos** - Show your dApp in action
- **User Testing** - Let users try before they buy
- **Tutorials** - Risk-free learning environment  
- **Onboarding** - Introduce Web3 newcomers safely
- **Development** - Test your dApp on mainnet safely

---

## Browser Compatibility

**Works everywhere - no extensions required:**

- Chrome/Chromium browsers
- Firefox  
- Safari (iOS/macOS)
- Edge
- Mobile browsers (iOS Safari, Chrome Mobile)
- In-app browsers (Discord, Twitter, etc.)

---

## Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/your-org/tryfi
cd tryfi

# Install dependencies  
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### File Structure
```
tryfi/
├── src/
│   ├── index.js           # Main entry point & API
│   ├── TryFiWallet.js     # Core wallet implementation  
│   └── themes/            # UI themes
│       ├── default.js
│       ├── default-dark.js
│       └── glassmorphism.js
├── dist/                  # Built files
├── demo-updated.html      # Live demo
└── package.json
```

---

## Contributing

We welcome contributions! TryFi is completely open source.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Get Started Now

Ready to let users try your dApp risk-free? Add just these two lines:

```html
<!-- Single script - all dependencies bundled! -->
<script src="https://unpkg.com/tryfi@latest/dist/tryfi.umd.js"></script>
<script>
    TryFi.init({
        chainName: 'Ethereum Mainnet',
        rpcUrl: 'https://ethereum-rpc.publicnode.com',
        chainId: 1,
        nativeCurrency: {
            name: 'Ethereum',
            symbol: 'ETH',
            decimals: 18
        },
        blockExplorerUrls: ['https://etherscan.io']
    });
</script>
```

**That's it!** Your users can now safely try your dApp with disposable wallets. No additional dependencies needed! 

---

**Made with love for the Web3 community**

*TryFi - Try before you connect.* 