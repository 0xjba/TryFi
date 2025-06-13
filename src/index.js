import TryFiWallet from './TryFiWallet.js';

const TryFi = {
    init(config = {}) {
        if (window.tryfi) {
            console.warn('TryFi already initialized');
            return window.   tryfi;
        }
        
        const defaultConfig = {
            position: 'bottom-right',
            theme: 'defauldark'
        };
        
        // Validate required configuration
        const requiredFields = ['chainName', 'rpcUrl', 'chainId', 'nativeCurrency', 'blockExplorerUrls'];
        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`TryFi: Missing required configuration field: ${field}`);
            }
        }
        
        // Validate nativeCurrency structure
        if (!config.nativeCurrency.name || !config.nativeCurrency.symbol || typeof config.nativeCurrency.decimals !== 'number') {
            throw new Error('TryFi: nativeCurrency must have name, symbol, and decimals properties');
        }
        
        // Validate blockExplorerUrls is an array
        if (!Array.isArray(config.blockExplorerUrls) || config.blockExplorerUrls.length === 0) {
            throw new Error('TryFi: blockExplorerUrls must be a non-empty array');
        }
        
        const finalConfig = { ...defaultConfig, ...config };
        
        window.tryfi = new TryFiWallet(finalConfig);
        
        // Expose global API
        window.TryFi = {
            show: () => window.tryfi?.showWidget(),
            hide: () => window.tryfi?.hideWidget(),
            toggle: () => window.tryfi?.toggleWidget(),
            destroy: () => window.tryfi?.destroy()
        };
        
        return window.tryfi;
    },
    
    show() {
        return window.tryfi?.showWidget();
    },
    
    hide() {
        return window.tryfi?.hideWidget();
    },
    
    toggle() {
        return window.tryfi?.toggleWidget();
    },
    
    destroy() {
        return window.tryfi?.destroy();
    }
};

// Auto-expose for UMD builds
if (typeof window !== 'undefined') {
    window.TryFi = TryFi;
}

export default TryFi;