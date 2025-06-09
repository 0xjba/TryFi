import { themes } from './themes/index.js';

class TryFiWallet {
    constructor(config) {
        // Validate required configuration
        const requiredFields = ['network', 'rpcUrl', 'chainId'];
        for (const field of requiredFields) {
            if (!config[field]) {
                throw new Error(`TryFi: Missing required configuration field: ${field}`);
            }
        }
        
        this.config = {
            position: 'bottom-right',
            theme: 'default',
            ...config
        };
        this.wallet = null;
        this.provider = null;
        this.isActive = false;
        this.transactions = [];
        this.originalEthereum = window.ethereum;
        this.currentTab = 'assets';
        this._statusTimeout = null;
        this._balanceInterval = null;
        this._pendingTx = null;
        this._pendingSign = null;
        this._pendingSignTypedData = null;
        this._autoHideTimeout = null;
        this._autoHideDelay = 3000; // 3 seconds after success
        
        this.init();
    }
    
    init() {
        console.log('TryFi: Initializing...');
        this.loadTheme();
        this.createWidget();
        this.setupEventListeners();
        this.loadWallet();
        console.log('TryFi: Ready!');
    }
    
    loadTheme() {
        // Remove existing theme
        const existingTheme = document.getElementById('tryfi-theme');
        if (existingTheme) {
            existingTheme.remove();
        }
        
        // Get theme CSS
        const themeCSS = themes[this.config.theme] || themes.default;
        
        // Add new theme
        const styleEl = document.createElement('style');
        styleEl.id = 'tryfi-theme';
        styleEl.textContent = themeCSS;
        document.head.appendChild(styleEl);
    }
    
    createWidget() {
        const widget = document.createElement('div');
        widget.className = `tryfi-widget position-${this.config.position}`;
        widget.innerHTML = `
            <div class="tryfi-overlay" id="tryfi-overlay"></div>
            
            <div class="tryfi-device" id="tryfi-device" title="TryFi Wallet">
                <div class="tryfi-device-screen">
                    <svg class="tryfi-device-icon" id="tryfi-wallet-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 10h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11 10h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 14h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M11 14h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg class="tryfi-close-icon" id="tryfi-close-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
            
            <div class="tryfi-modal" id="tryfi-modal">
                <div class="tryfi-hardware-container">
                    <div class="tryfi-main-screen">
                        <div class="tryfi-screen-content">
                            <div class="tryfi-screen-header">
                                <div class="tryfi-screen-title">
                                    <div class="tryfi-screen-logo">T</div>
                                    TryFi Wallet
                                </div>
                                <button class="tryfi-trash-btn" id="tryfi-trash" title="Delete Wallet" style="display: none;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                        <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </button>
                            </div>
                            
                            <div id="tryfi-content">
                                Loading...
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(widget);
    }
    
    setupEventListeners() {
        document.getElementById('tryfi-device').onclick = () => this.toggleWidget();
        document.getElementById('tryfi-overlay').onclick = () => this.hideWidget();
        document.getElementById('tryfi-trash').onclick = () => this.showDeleteConfirmation();
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('tryfi-modal').style.display === 'block') {
                this.hideWidget();
            }
        });
    }
    
    loadWallet() {
        this.provider = new ethers.JsonRpcProvider(this.config.rpcUrl);
        
        const savedWallet = localStorage.getItem('tryfi-wallet');
        if (savedWallet) {
            const walletData = JSON.parse(savedWallet);
            this.wallet = new ethers.Wallet(walletData.privateKey, this.provider);
            this.transactions = walletData.transactions || [];
            console.log('TryFi: Loaded existing wallet:', this.wallet.address);
            this.activateProvider();
        }
    }
    
    async createWallet() {
        console.log('TryFi: Creating wallet...');
        try {
            this.wallet = ethers.Wallet.createRandom().connect(this.provider);
            this.transactions = [];
            console.log('TryFi: Wallet created:', this.wallet.address);
            
            this.saveWallet();
            this.activateProvider();
            this.updateContent();
        } catch (error) {
            console.error('TryFi: Wallet creation failed:', error);
            this.showStatus('Failed to create wallet: ' + error.message, 'error');
        }
    }
    
    saveWallet() {
        if (!this.wallet) return;
        
        const walletData = {
            privateKey: this.wallet.privateKey,
            transactions: this.transactions
        };
        localStorage.setItem('tryfi-wallet', JSON.stringify(walletData));
    }
    
    async getBalance() {
        if (!this.wallet) return '0.0';
        
        try {
            const balance = await this.provider.getBalance(this.wallet.address);
            return ethers.formatEther(balance);
        } catch (error) {
            console.error('Error getting balance:', error);
            return '0.0';
        }
    }
    
    startAutoHideAfterSuccess() {
        if (this.config.position !== 'hidden') return;
        
        this.clearAutoHide();
        this._autoHideTimeout = setTimeout(() => {
            this.hideWidget();
        }, this._autoHideDelay);
    }
    
    clearAutoHide() {
        if (this._autoHideTimeout) {
            clearTimeout(this._autoHideTimeout);
            this._autoHideTimeout = null;
        }
    }
    
    requiresUI(method) {
        return ['eth_sendTransaction', 'personal_sign', 'eth_signTypedData_v4', 'eth_sign'].includes(method);
    }
    
    updateContent() {
        const content = document.getElementById('tryfi-content');
        const trashBtn = document.getElementById('tryfi-trash');
        
        if (!this.wallet) {
            if (trashBtn) trashBtn.style.display = 'none';
            
            content.innerHTML = this.renderWelcomeScreen();
            
            if (this._balanceInterval) {
                clearInterval(this._balanceInterval);
                this._balanceInterval = null;
            }
            return;
        }
        
        if (trashBtn) trashBtn.style.display = 'flex';
        
        this.currentTab = this.currentTab || 'assets';
        content.innerHTML = this.renderWalletInterface();
        
        this.updateBalance();
        
        if (this._balanceInterval) {
            clearInterval(this._balanceInterval);
        }
        
        this._balanceInterval = setInterval(() => this.updateBalance(), 30000);
    }
    
    renderWelcomeScreen() {
        return `
            <div class="tryfi-welcome">
                <div class="tryfi-welcome-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h4>Welcome to TryFi</h4>
                <p>Create a disposable wallet to safely test dApps without risking your main wallet. Perfect for testing and development.</p>
                
                <button class="tryfi-action-btn primary" onclick="window.tryfi.createWallet()" style="width: 100%;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 5V19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Create Wallet
                </button>
            </div>
        `;
    }
    
    renderWalletInterface() {
        return `
            <div style="text-align: center;">
                <div class="tryfi-network-badge">
                    <div class="tryfi-network-dot"></div>
                    Sepolia Testnet
                </div>
            </div>
            
            <div class="tryfi-balance-display">
                <div class="tryfi-main-balance">Loading...</div>
                <div class="tryfi-balance-usd">$0.00 USD</div>
            </div>
            
            <div class="tryfi-address-display" onclick="this.querySelector('.address-text').select()" title="Click to select address">
                <input type="text" class="address-text" value="${this.wallet.address}" readonly style="background: none; border: none; font-family: inherit; font-size: inherit; width: calc(100% - 32px); color: inherit;">
                <button class="copy-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${this.wallet.address}'); window.tryfi.showStatus('Address copied!', 'success');" title="Copy address">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
                    </svg>
                </button>
            </div>
            
            <div class="tryfi-action-grid">
                <button class="tryfi-action-btn" onclick="window.tryfi.showReceive()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Receive
                </button>
                <button class="tryfi-action-btn" onclick="window.tryfi.showSendForm()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    Send
                </button>
            </div>
            
            <div class="tryfi-tab-nav">
                <button class="tryfi-tab-btn ${this.currentTab === 'assets' ? 'active' : ''}" onclick="window.tryfi.switchTab('assets')">
                    Assets
                </button>
                <button class="tryfi-tab-btn ${this.currentTab === 'activity' ? 'active' : ''}" onclick="window.tryfi.switchTab('activity')">
                    Activity
                </button>
            </div>
            
            <div class="tryfi-content-area" id="tryfi-tab-body">
                ${this.renderTabContent()}
            </div>
            
            <div id="tryfi-status"></div>
        `;
    }
    
    renderTabContent() {
        switch(this.currentTab) {
            case 'assets':
                return this.renderAssetsTab();
            case 'activity':
                return this.renderActivityTab();
            default:
                return this.renderAssetsTab();
        }
    }
    
    renderAssetsTab() {
        return `
            <div class="tryfi-asset-item">
                <div class="tryfi-asset-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="tryfi-asset-info">
                    <div class="tryfi-asset-name">Ethereum</div>
                    <div class="tryfi-asset-symbol">ETH</div>
                </div>
                <div class="tryfi-asset-balance">
                    <div class="tryfi-asset-amount" id="eth-balance">Loading...</div>
                    <div class="tryfi-asset-value">$0.00</div>
                </div>
            </div>
        `;
    }
    
    renderActivityTab() {
        const transactions = this.getFormattedTransactions();
        
        if (transactions.length === 0) {
            return `
                <div class="tryfi-empty-message">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <p style="color: #64748b; font-size: 12px; text-align: center; margin-top: 8px;">
                        No transactions yet.<br>
                        Start testing dApps to see activity.
                    </p>
                </div>
            `;
        }
        
        return transactions.map(tx => `
            <div class="tryfi-asset-item" onclick="window.tryfi.viewTransaction('${tx.hash}')">
                <div class="tryfi-asset-icon" style="background: ${this.getTransactionIconBackground(tx.type)};">
                    ${this.getTransactionIcon(tx.type)}
                </div>
                <div class="tryfi-asset-info">
                    <div class="tryfi-asset-name">${tx.title}</div>
                    <div class="tryfi-asset-symbol">${tx.subtitle}</div>
                </div>
                <div class="tryfi-asset-balance">
                    <div class="tryfi-asset-amount" style="color: ${this.getTransactionAmountColor(tx.type)};">${tx.amount}</div>
                    <div class="tryfi-asset-value" style="color: ${this.getTransactionStatusColor(tx.status)}; text-transform: uppercase; font-size: 10px; font-weight: 600;">${tx.status}</div>
                </div>
            </div>
        `).join('');
    }
    
    getTransactionIconBackground(type) {
        const backgrounds = {
            send: 'linear-gradient(135deg, #ef4444, #dc2626)',
            receive: 'linear-gradient(135deg, #22c55e, #16a34a)',
            approval: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
        };
        return backgrounds[type] || backgrounds.approval;
    }
    
    getTransactionIcon(type) {
        const icons = {
            send: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            receive: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
            approval: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
        };
        return icons[type] || icons.approval;
    }
    
    getTransactionAmountColor(type) {
        const colors = {
            send: '#f87171',
            receive: '#4ade80',
            approval: '#a855f7'
        };
        return colors[type] || colors.approval;
    }
    
    getTransactionStatusColor(status) {
        const colors = {
            confirmed: '#4ade80',
            pending: '#f59e0b',
            failed: '#ef4444'
        };
        return colors[status] || colors.failed;
    }
    
    switchTab(tab) {
        this.currentTab = tab;
        const tabBody = document.getElementById('tryfi-tab-body');
        if (tabBody) {
            tabBody.innerHTML = this.renderTabContent();
            
            document.querySelectorAll('.tryfi-tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            document.querySelector(`.tryfi-tab-btn:nth-child(${tab === 'assets' ? '1' : '2'})`).classList.add('active');
            
            if (tab === 'assets') {
                this.updateBalance();
            }
        }
    }
    
    getFormattedTransactions() {
        return this.transactions.map(tx => {
            let title, subtitle;
            
            switch(tx.type) {
                case 'approval':
                    title = 'Token Approval';
                    subtitle = `Spender: ${tx.spender ? tx.spender.slice(0, 6) + '...' + tx.spender.slice(-4) : 'Unknown'}`;
                    break;
                case 'receive':
                    title = 'Received ETH';
                    subtitle = `From ${tx.from ? tx.from.slice(0, 6) + '...' + tx.from.slice(-4) : 'Unknown'}`;
                    break;
                default:
                    title = 'Sent ETH';
                    subtitle = `To ${tx.to ? tx.to.slice(0, 6) + '...' + tx.to.slice(-4) : 'Unknown'}`;
            }
            
            return {
                hash: tx.hash,
                type: tx.type === 'approval' ? 'approval' : tx.type,
                title: title,
                subtitle: subtitle,
                amount: tx.type === 'approval' 
                    ? `${parseFloat(tx.amount || '0').toFixed(2)} Tokens`
                    : (tx.type === 'send' ? '-' : '+') + `${parseFloat(tx.amount || '0').toFixed(4)} ETH`,
                status: tx.status || 'confirmed'
            };
        }).reverse();
    }
    
    showReceive() {
        const content = document.getElementById('tryfi-content');
        content.innerHTML = `
            <div style="text-align: center;">
                <h4 style="margin: 0 0 20px 0; color: #e2e8f0; font-size: 16px; font-weight: 600;">Receive ETH</h4>
                
                <div style="margin: 20px 0; padding: 20px; background: rgba(0, 0, 0, 0.2); border-radius: 4px; border: 2px dashed rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; align-items: center;">
                    <canvas id="qr-canvas" style="margin-bottom: 12px;"></canvas>
                    <p style="color: #64748b; font-size: 11px; margin: 0;">QR Code for Address</p>
                </div>
                
                <div style="margin: 20px 0;">
                    <div class="tryfi-address-display" onclick="this.querySelector('.address-text').select()">
                        <input type="text" class="address-text" value="${this.wallet.address}" readonly style="background: none; border: none; font-family: inherit; font-size: inherit; width: calc(100% - 32px); color: inherit;">
                        <button class="copy-btn" onclick="event.stopPropagation(); navigator.clipboard.writeText('${this.wallet.address}'); window.tryfi.showStatus('Address copied!', 'success');">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="tryfi-action-grid">
                    <button class="tryfi-action-btn" onclick="window.tryfi.updateContent()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Back
                    </button>
                    ${this.config.faucetUrl ? `
                        <a href="${this.config.faucetUrl}" target="_blank" class="tryfi-action-btn primary" style="text-decoration: none;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M7 3L12 8L17 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 8V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Get Test ETH
                        </a>
                    ` : ''}
                </div>
            </div>
        `;
        
        const canvas = document.getElementById('qr-canvas');
        if (canvas && typeof QRious !== 'undefined') {
            new QRious({
                element: canvas,
                value: this.wallet.address,
                size: 120,
                background: 'transparent',
                foreground: '#e2e8f0',
                level: 'M'
            });
        }
    }
    
    viewTransaction(hash) {
        window.open(`https://sepolia.etherscan.io/tx/${hash}`, '_blank');
    }
    
    async updateBalance() {
        const balance = await this.getBalance();
        
        const totalBalanceEl = document.querySelector('.tryfi-main-balance');
        if (totalBalanceEl) {
            totalBalanceEl.textContent = `${parseFloat(balance).toFixed(4)} ETH`;
        }
        
        const ethBalanceEl = document.getElementById('eth-balance');
        if (ethBalanceEl) {
            ethBalanceEl.textContent = `${parseFloat(balance).toFixed(4)} ETH`;
        }
    }
    
    showSendForm() {
        const content = document.getElementById('tryfi-content');
        content.innerHTML = `
            <div>
                <h4 style="margin: 0 0 20px 0; color: #e2e8f0; text-align: center; font-size: 16px; font-weight: 600;">Send ETH</h4>
                <div>
                    <label style="display: block; margin-bottom: 8px; color: #94a3b8; font-size: 12px; font-weight: 500;">To Address</label>
                    <input type="text" id="send-to" placeholder="0x..." style="width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 3px; color: #e2e8f0; font-size: 12px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; margin-bottom: 16px;">
                    
                    <label style="display: block; margin-bottom: 8px; color: #94a3b8; font-size: 12px; font-weight: 500;">Amount (ETH)</label>
                    <input type="number" id="send-amount" placeholder="0.001" step="0.001" min="0" style="width: 100%; padding: 12px; background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 3px; color: #e2e8f0; font-size: 12px; margin-bottom: 16px;">
                    
                    <div id="tryfi-tx-status"></div>
                    
                    <div class="tryfi-action-grid">
                        <button class="tryfi-action-btn" onclick="window.tryfi.updateContent()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Back
                        </button>
                        <button class="tryfi-action-btn primary" onclick="window.tryfi.sendETH()">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    async sendETH() {
        const to = document.getElementById('send-to').value.trim();
        const amount = document.getElementById('send-amount').value.trim();
        
        if (!to || !amount) {
            this.showStatus('Please fill all fields', 'error');
            return;
        }
        
        try {
            const tx = await this.handleSendTransaction({
                to: to,
                value: ethers.parseEther(amount)
            });
            this.showStatus(`Transaction sent: ${tx.slice(0, 10)}...`, 'success');
            setTimeout(() => this.updateContent(), 2000);
        } catch (error) {
            this.showStatus(`Transaction failed: ${error.message}`, 'error');
        }
    }
    
    showDeleteConfirmation() {
        const content = document.getElementById('tryfi-content');
        content.innerHTML = `
            <div style="text-align: center; padding: 20px;">
                <div class="tryfi-welcome-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); box-shadow: 0 0 24px rgba(239, 68, 68, 0.4);">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 9V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M12 17H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h4 style="margin: 0 0 12px 0; color: #e2e8f0; font-size: 16px; font-weight: 600;">End TryFi Wallet Session?</h4>
                <p style="color: #f87171; margin-bottom: 8px; line-height: 1.5; font-size: 13px; font-weight: 500;">
                    ⚠️ WARNING: You are ending your TryFi Wallet session
                </p>
                <p style="color: #64748b; margin-bottom: 24px; line-height: 1.5; font-size: 12px;">
                    This will permanently delete your disposable wallet and disconnect from all dApps. All transaction history will be lost. This action cannot be undone.
                </p>
                <div class="tryfi-action-grid">
                    <button class="tryfi-action-btn" onclick="window.tryfi.updateContent()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Cancel
                    </button>
                    <button class="tryfi-action-btn" onclick="window.tryfi.confirmEndSession()" style="color: #f87171; border-color: rgba(239, 68, 68, 0.3);">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        End Session
                    </button>
                </div>
            </div>
        `;
    }
    
    confirmEndSession() {
        if (this._balanceInterval) {
            clearInterval(this._balanceInterval);
            this._balanceInterval = null;
        }
        
        const trashBtn = document.getElementById('tryfi-trash');
        if (trashBtn) trashBtn.style.display = 'none';
        
        localStorage.removeItem('tryfi-wallet');
        this.wallet = null;
        this.transactions = [];
        
        window.ethereum = this.originalEthereum;
        this.isActive = false;
        
        this.updateContent();
        this.showStatus('Wallet session ended successfully. You can create a new one anytime!', 'success');
    }
    
    toggleWidget() {
        const modal = document.getElementById('tryfi-modal');
        
        if (modal.style.display === 'block') {
            this.hideWidget();
        } else {
            this.showWidget();
        }
    }
    
    showWidget() {
        const modal = document.getElementById('tryfi-modal');
        const overlay = document.getElementById('tryfi-overlay');
        const walletIcon = document.getElementById('tryfi-wallet-icon');
        const closeIcon = document.getElementById('tryfi-close-icon');
        
        // Apply position class to modal
        modal.className = `tryfi-modal position-${this.config.position}`;
        
        modal.style.display = 'block';
        
        // Always show overlay for click-outside-to-close functionality
        overlay.style.display = 'block';
        // Make overlay completely transparent for all positions
        overlay.style.background = 'transparent';
        
        if (walletIcon) walletIcon.classList.add('hide');
        if (closeIcon) closeIcon.classList.add('show');
        
        this.updateContent();
        modal.classList.remove('closing');
    }
    
    hideWidget() {
        const modal = document.getElementById('tryfi-modal');
        const overlay = document.getElementById('tryfi-overlay');
        const walletIcon = document.getElementById('tryfi-wallet-icon');
        const closeIcon = document.getElementById('tryfi-close-icon');
        
        modal.classList.add('closing');
        
        if (walletIcon) walletIcon.classList.remove('hide');
        if (closeIcon) closeIcon.classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
            modal.classList.remove('closing');
            overlay.style.display = 'none';
            // Reset overlay styles
            overlay.style.background = '';
            
            if (this._balanceInterval) {
                clearInterval(this._balanceInterval);
                this._balanceInterval = null;
            }
        }, 300);
    }
    
    activateProvider() {
        if (this.isActive) return;
        
        this.isActive = true;
        window.ethereum = this.createEIP1193Provider();
    }
    
    createEIP1193Provider() {
        const self = this;
        
        return {
            isTryFi: true,
            chainId: '0x' + this.config.chainId.toString(16),
            
            async request({ method, params = [] }) {
                console.log('TryFi Provider:', method, params);
                
                // Show wallet for signing methods when hidden
                if (self.config.position === 'hidden' && self.requiresUI(method)) {
                    self.showWidget();
                }
                
                // Handle UI methods ourselves
                switch (method) {
                    case 'eth_requestAccounts':
                        if (!self.wallet) {
                            await self.createWallet();
                        }
                        return [self.wallet.address]; // Auto-connected
                    
                    case 'eth_accounts':
                        if (!self.wallet) {
                            return []; // No wallet = no accounts
                        }
                        return [self.wallet.address]; // Return connected account
                    
                    case 'eth_sendTransaction':
                        return await self.handleSendTransaction(params[0]);
                    
                    case 'personal_sign':
                        return await self.handleSign(params[0]);
                        
                    case 'eth_signTypedData_v4':
                        return await self.handleSignTypedData(params[1], params[0]);
                    
                    case 'eth_sign':
                        return await self.handleEthSign(params[1], params[0]);
                    
                    default:
                        // Forward everything else to ethers
                        return await self.provider.send(method, params);
                }
            },
            
            on() {},
            removeListener() {}
        };
    }
    
    // NEW: Add basic eth_sign support
    async handleEthSign(message, address) {
        return new Promise((resolve, reject) => {
            this._pendingSign = { resolve, reject, message, method: 'eth_sign' };
            this.showSignModal(message, 'Sign Message', 'eth_sign');
        });
    }
    
    showSignModal(message, title, method) {
        this.showWidget();
        
        const content = document.getElementById('tryfi-content');
        content.innerHTML = this.renderSignConfirmation(message);
    }
    
    async handleSendTransaction(txParams) {
        if (!this.wallet) throw new Error('No wallet');
        
        try {
            this.showWidget();
            
            const content = document.getElementById('tryfi-content');
            content.innerHTML = this.renderTransactionConfirmation(txParams);
            
            return new Promise((resolve, reject) => {
                this._pendingTx = { resolve, reject, txParams };
            });
        } catch (error) {
            this.showStatus(error.message, 'error');
            throw error;
        }
    }
    
    renderTransactionConfirmation(txParams) {
        return `
            <div>
                <h4 style="margin: 0 0 20px 0; color: #e2e8f0; text-align: center; font-size: 16px; font-weight: 600;">Confirm Transaction</h4>
                
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">From</span>
                        <span style="color: #e2e8f0; font-size: 11px; font-family: monospace;">${this.wallet.address.slice(0, 6)}...${this.wallet.address.slice(-4)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">To</span>
                        <span style="color: #e2e8f0; font-size: 11px; font-family: monospace;">${txParams.to.slice(0, 6)}...${txParams.to.slice(-4)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">Amount</span>
                        <span style="color: #e2e8f0; font-size: 14px; font-weight: 600;">${ethers.formatEther(txParams.value || '0')} ETH</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">Network</span>
                        <span style="color: #e2e8f0; font-size: 11px;">Sepolia</span>
                    </div>
                </div>
                
                <div id="tryfi-tx-status"></div>
                
                <div class="tryfi-action-grid">
                    <button class="tryfi-action-btn" onclick="window.tryfi.rejectTx()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Reject
                    </button>
                    <button class="tryfi-action-btn primary" onclick="window.tryfi.confirmTx()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Confirm
                    </button>
                </div>
            </div>
        `;
    }
    
    async confirmTx() {
        if (!this._pendingTx) return;
        
        const buttonArea = document.querySelector('.tryfi-action-grid');
        if (buttonArea) {
            buttonArea.innerHTML = '<div id="tryfi-tx-status"></div>';
        }
        
        try {
            this.showTxStatus('Submitting transaction...', 'info');
            
            const tx = await this.wallet.sendTransaction({
                to: this._pendingTx.txParams.to,
                value: this._pendingTx.txParams.value || 0,
                gasLimit: this._pendingTx.txParams.gas || '21000'
            });
            
            this.showTxStatus(`Transaction submitted: ${tx.hash.slice(0, 10)}...`, 'info');
            
            const txRecord = {
                hash: tx.hash,
                type: 'send',
                to: this._pendingTx.txParams.to,
                amount: ethers.formatEther(this._pendingTx.txParams.value || '0'),
                status: 'pending',
                timestamp: Date.now()
            };
            this.transactions.push(txRecord);
            this.saveWallet();
            
            this.showTxStatus('Waiting for confirmation...', 'info');
            const receipt = await tx.wait();
            
            const txIndex = this.transactions.findIndex(t => t.hash === tx.hash);
            if (txIndex !== -1) {
                this.transactions[txIndex].status = 'confirmed';
                this.saveWallet();
            }
            
            this.showTxStatus('✅ Transaction confirmed!', 'success');
            this._pendingTx.resolve(tx.hash);
            
            setTimeout(() => {
                this._pendingTx = null;
                this.updateContent();
                this.startAutoHideAfterSuccess(); // ✅ Start timer AFTER success
            }, 2000);
            
        } catch (error) {
            if (this._pendingTx && this.transactions.length > 0) {
                const lastTx = this.transactions[this.transactions.length - 1];
                if (lastTx.status === 'pending') {
                    lastTx.status = 'failed';
                    this.saveWallet();
                }
            }
            
            this.showTxStatus(`❌ Transaction failed: ${error.message}`, 'error');
            this._pendingTx.reject(error);
            
            setTimeout(() => {
                this._pendingTx = null;
                this.updateContent();
            }, 4000);
        }
    }
    
    rejectTx() {
        if (!this._pendingTx) return;
        
        this._pendingTx.reject(new Error('User rejected transaction'));
        this._pendingTx = null;
        this.updateContent();
        
        // Auto-hide in hidden mode after rejection
        if (this.config.position === 'hidden') {
            setTimeout(() => {
                this.hideWidget();
            }, 1000);
        }
    }
    
    async handleSign(message, type = 'personal') {
        if (!this.wallet) throw new Error('No wallet');
        
        this.showWidget();
        
        const content = document.getElementById('tryfi-content');
        content.innerHTML = this.renderSignConfirmation(message);
        
        return new Promise((resolve, reject) => {
            this._pendingSign = { resolve, reject, message, type };
        });
    }
    
    renderSignConfirmation(message) {
        return `
            <div>
                <h4 style="margin: 0 0 20px 0; color: #e2e8f0; text-align: center; font-size: 16px; font-weight: 600;">Sign Message</h4>
                
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">Account</span>
                        <span style="color: #e2e8f0; font-size: 11px; font-family: monospace;">${this.wallet.address.slice(0, 6)}...${this.wallet.address.slice(-4)}</span>
                    </div>
                    <div style="margin-top: 12px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">Message</div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 3px; color: #e2e8f0; font-size: 11px; font-family: monospace; word-break: break-all; max-height: 120px; overflow-y: auto;">${message}</div>
                    </div>
                </div>
                
                <div id="tryfi-sign-status"></div>
                
                <div class="tryfi-action-grid">
                    <button class="tryfi-action-btn" onclick="window.tryfi.rejectSign()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Reject
                    </button>
                    <button class="tryfi-action-btn primary" onclick="window.tryfi.confirmSign()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Sign
                    </button>
                </div>
            </div>
        `;
    }
    
    async handleSignTypedData(typedData, address) {
        if (!this.wallet) throw new Error('No wallet');
        
        this.showWidget();
        
        const data = JSON.parse(typedData);
        const content = document.getElementById('tryfi-content');
        content.innerHTML = this.renderSignTypedDataConfirmation(data);
        
        return new Promise((resolve, reject) => {
            this._pendingSignTypedData = { resolve, reject, data, address };
        });
    }
    
    renderSignTypedDataConfirmation(data) {
        return `
            <div>
                <h4 style="margin: 0 0 20px 0; color: #e2e8f0; text-align: center; font-size: 16px; font-weight: 600;">Sign Typed Data</h4>
                
                <div style="background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 4px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">Account</span>
                        <span style="color: #e2e8f0; font-size: 11px; font-family: monospace;">${this.wallet.address.slice(0, 6)}...${this.wallet.address.slice(-4)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span style="color: #64748b; font-size: 11px; text-transform: uppercase;">Domain</span>
                        <span style="color: #e2e8f0; font-size: 11px;">${data.domain.name || 'Unknown'}</span>
                    </div>
                    <div style="margin-top: 12px;">
                        <div style="color: #64748b; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">Message Data</div>
                        <div style="background: rgba(0, 0, 0, 0.2); padding: 12px; border-radius: 3px; font-size: 10px; font-family: monospace; max-height: 120px; overflow-y: auto;">
                            ${Object.entries(data.message).map(([key, value]) => 
                                `<div style="margin: 2px 0;"><span style="color: #60a5fa;">${key}:</span> <span style="color: #e2e8f0;">${JSON.stringify(value)}</span></div>`
                            ).join('')}
                        </div>
                    </div>
                </div>
                
                <div id="tryfi-sign-status"></div>
                
                <div class="tryfi-action-grid">
                    <button class="tryfi-action-btn" onclick="window.tryfi.rejectSignTypedData()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Reject
                    </button>
                    <button class="tryfi-action-btn primary" onclick="window.tryfi.confirmSignTypedData()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Sign
                    </button>
                </div>
            </div>
        `;
    }
    
    async confirmSign() {
        if (!this._pendingSign) return;
        
        const buttonArea = document.querySelector('.tryfi-action-grid');
        if (buttonArea) {
            buttonArea.innerHTML = '<div id="tryfi-sign-status"></div>';
        }
        
        try {
            this.showSignStatus('Signing message...', 'info');
            const signature = await this.wallet.signMessage(this._pendingSign.message);
            
            // Log different signing methods
            if (this._pendingSign.method === 'eth_sign') {
                console.log('🔏 Raw Data Sign Signature:', {
                    rawData: this._pendingSign.message,
                    signature: signature,
                    address: this.wallet.address,
                    method: 'eth_sign'
                });
            } else {
                console.log('🖊️ Personal Sign Signature:', {
                    message: this._pendingSign.message,
                    signature: signature,
                    address: this.wallet.address,
                    method: 'personal_sign'
                });
            }
            
            this.showSignStatus('✅ Message signed!', 'success');
            this._pendingSign.resolve(signature);
            
            setTimeout(() => {
                this._pendingSign = null;
                this.updateContent();
                this.startAutoHideAfterSuccess(); // ✅ Start timer AFTER success
            }, 2000);
        } catch (error) {
            this.showSignStatus(`❌ Signing failed: ${error.message}`, 'error');
            this._pendingSign.reject(error);
        }
    }
    
    async confirmSignTypedData() {
        if (!this._pendingSignTypedData) return;
        
        const buttonArea = document.querySelector('.tryfi-action-grid');
        if (buttonArea) {
            buttonArea.innerHTML = '<div id="tryfi-sign-status"></div>';
        }
        
        try {
            this.showSignTypedDataStatus('Signing typed data...', 'info');
            
            const { data } = this._pendingSignTypedData;
            const signature = await this.wallet.signTypedData(data.domain, data.types, data.message);
            
            console.log('📝 Typed Data Signature:', {
                domain: data.domain,
                types: data.types,
                message: data.message,
                signature: signature,
                address: this.wallet.address
            });
            
            this.showSignTypedDataStatus('✅ Typed data signed!', 'success');
            this._pendingSignTypedData.resolve(signature);
            
            setTimeout(() => {
                this._pendingSignTypedData = null;
                this.updateContent();
                this.startAutoHideAfterSuccess(); // ✅ Start timer AFTER success
            }, 2000);
        } catch (error) {
            this.showSignTypedDataStatus(`❌ Signing failed: ${error.message}`, 'error');
            this._pendingSignTypedData.reject(error);
        }
    }
    
    rejectSign() {
        if (!this._pendingSign) return;
        
        this._pendingSign.reject(new Error('User rejected signing'));
        this._pendingSign = null;
        this.updateContent();
        
        // Auto-hide in hidden mode after rejection
        if (this.config.position === 'hidden') {
            setTimeout(() => {
                this.hideWidget();
            }, 1000);
        }
    }
    
    rejectSignTypedData() {
        if (!this._pendingSignTypedData) return;
        
        this._pendingSignTypedData.reject(new Error('User rejected typed data signing'));
        this._pendingSignTypedData = null;
        this.updateContent();
        
        // Auto-hide in hidden mode after rejection
        if (this.config.position === 'hidden') {
            setTimeout(() => {
                this.hideWidget();
            }, 1000);
        }
    }
    
    showTxStatus(message, type = 'info') {
        const statusEl = document.getElementById('tryfi-tx-status');
        if (!statusEl) return;
        
        statusEl.innerHTML = `<div class="tryfi-status ${type}">${message}</div>`;
    }
    
    showSignStatus(message, type = 'info') {
        const statusEl = document.getElementById('tryfi-sign-status');
        if (!statusEl) return;
        
        statusEl.innerHTML = `<div class="tryfi-status ${type}">${message}</div>`;
    }
    
    showSignTypedDataStatus(message, type = 'info') {
        const statusEl = document.getElementById('tryfi-sign-status');
        if (!statusEl) return;
        
        statusEl.innerHTML = `<div class="tryfi-status ${type}">${message}</div>`;
    }
    
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('tryfi-status');
        if (!statusEl) return;
        
        if (this._statusTimeout) {
            clearTimeout(this._statusTimeout);
        }
        
        statusEl.innerHTML = `<div class="tryfi-status ${type}">${message}</div>`;
        
        this._statusTimeout = setTimeout(() => {
            statusEl.innerHTML = '';
        }, 5000);
    }
    
    destroy() {
        // Clean up intervals
        if (this._balanceInterval) {
            clearInterval(this._balanceInterval);
            this._balanceInterval = null;
        }
        
        if (this._autoHideTimeout) {
            clearTimeout(this._autoHideTimeout);
            this._autoHideTimeout = null;
        }
        
        // Remove DOM elements
        const widget = document.querySelector('.tryfi-widget');
        if (widget) {
            widget.remove();
        }
        
        const theme = document.getElementById('tryfi-theme');
        if (theme) {
            theme.remove();
        }
        
        // Restore original provider
        window.ethereum = this.originalEthereum;
        
        // Clear references
        window.tryfi = null;
        window.TryFi = null;
    }
}

export default TryFiWallet;