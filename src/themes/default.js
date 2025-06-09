export const defaultTheme = `
/* Reset & Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

/* TryFi Widget Styles */
.tryfi-widget {
    position: fixed;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
}

/* Position classes for widget */
.tryfi-widget.position-bottom-right { right: 24px; bottom: 24px; }
.tryfi-widget.position-top-right { right: 24px; top: 24px; }
.tryfi-widget.position-top-left { left: 24px; top: 24px; }
.tryfi-widget.position-bottom-left { left: 24px; bottom: 24px; }
.tryfi-widget.position-hidden .tryfi-device { display: none; }

.tryfi-device {
    width: 52px;
    height: 52px;
    background: linear-gradient(145deg, #4a5568, #2d3748);
    border-radius: 6px;
    position: relative;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 
        0 6px 20px rgba(0, 0, 0, 0.4),
        0 3px 10px rgba(0, 0, 0, 0.3),
        inset 0 2px 3px rgba(255, 255, 255, 0.15),
        inset 0 -2px 3px rgba(0, 0, 0, 0.3);
    border: 1px solid #1a202c;
    display: flex;
    align-items: center;
    justify-content: center;
}

.tryfi-device::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    background: linear-gradient(145deg, #374151, #1f2937);
    border-radius: 4px;
    box-shadow: 
        inset 0 2px 3px rgba(0, 0, 0, 0.3),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.tryfi-device:hover {
    transform: translateY(-2px);
    box-shadow: 
        0 10px 28px rgba(0, 0, 0, 0.5),
        0 5px 13px rgba(0, 0, 0, 0.4),
        inset 0 2px 3px rgba(255, 255, 255, 0.2),
        inset 0 -2px 3px rgba(0, 0, 0, 0.3);
    background: linear-gradient(145deg, #4a5568, #374151);
}

.tryfi-device:hover::before {
    background: linear-gradient(145deg, #4a5568, #2d3748);
}

.tryfi-device:active {
    transform: translateY(0);
    box-shadow: 
        0 3px 12px rgba(0, 0, 0, 0.4),
        0 2px 6px rgba(0, 0, 0, 0.3),
        inset 0 3px 5px rgba(0, 0, 0, 0.4),
        inset 0 -1px 2px rgba(255, 255, 255, 0.1);
}

.tryfi-device-screen {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 36px;
    height: 36px;
    background: linear-gradient(145deg, #0a0e1a, #0f172a);
    border-radius: 3px;
    border: 1px solid #000;
    box-shadow: 
        inset 0 2px 5px rgba(0, 0, 0, 0.8),
        inset 0 -1px 2px rgba(255, 255, 255, 0.03);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 3;
    overflow: hidden;
}

.tryfi-device-screen::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.02) 0%, 
        transparent 50%, 
        rgba(0, 0, 0, 0.1) 100%);
    pointer-events: none;
}

.tryfi-device-icon {
    position: relative;
    z-index: 4;
    color: #60a5fa;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(1);
    opacity: 1;
}

.tryfi-device-icon.hide {
    transform: scale(0.8) rotate(90deg);
    opacity: 0;
}

.tryfi-close-icon {
    position: absolute;
    z-index: 4;
    color: #ffffff;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    transform: scale(0.8) rotate(-90deg);
    opacity: 0;
}

.tryfi-close-icon.show {
    transform: scale(1) rotate(0deg);
    opacity: 1;
}

/* Modal Styles */
.tryfi-modal {
    position: fixed;
    z-index: 10001;
    display: none;
}

/* Modal positioning */
.tryfi-modal.position-bottom-right { right: 24px; bottom: 100px; }
.tryfi-modal.position-top-right { right: 24px; top: 80px; }
.tryfi-modal.position-top-left { left: 24px; top: 80px; }
.tryfi-modal.position-bottom-left { left: 24px; bottom: 100px; }
.tryfi-modal.position-hidden { 
    right: 50%; 
    bottom: 50%; 
    transform: translate(50%, 50%); /* Center modal */
}

/* Bottom position animations */
@keyframes tryfi-device-open-bottom {
    from {
        opacity: 0;
        transform: translateY(20px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes tryfi-device-close-bottom {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(20px) scale(0.9);
    }
}

/* Top position animations */
@keyframes tryfi-device-open-top {
    from {
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes tryfi-device-close-top {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    to {
        opacity: 0;
        transform: translateY(-20px) scale(0.9);
    }
}

/* Hidden/center position animations */
@keyframes tryfi-device-open-center {
    from {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.9);
    }
    to {
        opacity: 1;
        transform: translate(50%, 50%) scale(1);
    }
}

@keyframes tryfi-device-close-center {
    from {
        opacity: 1;
        transform: translate(50%, 50%) scale(1);
    }
    to {
        opacity: 0;
        transform: translate(50%, 50%) scale(0.9);
    }
}

/* Apply animations based on position */
.tryfi-modal.position-bottom-right,
.tryfi-modal.position-bottom-left {
    animation: tryfi-device-open-bottom 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tryfi-modal.position-top-right,
.tryfi-modal.position-top-left {
    animation: tryfi-device-open-top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.tryfi-modal.position-hidden {
    animation: tryfi-device-open-center 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Closing animations */
.tryfi-modal.closing.position-bottom-right,
.tryfi-modal.closing.position-bottom-left {
    animation: tryfi-device-close-bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tryfi-modal.closing.position-top-right,
.tryfi-modal.closing.position-top-left {
    animation: tryfi-device-close-top 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tryfi-modal.closing.position-hidden {
    animation: tryfi-device-close-center 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tryfi-hardware-container {
    width: 420px;
    height: 500px;
    background: linear-gradient(145deg, #4a5568, #2d3748);
    border-radius: 6px;
    position: relative;
    box-shadow: 
        0 24px 64px rgba(0, 0, 0, 0.6),
        0 8px 24px rgba(0, 0, 0, 0.4),
        inset 0 1px 0 rgba(255, 255, 255, 0.1),
        inset 0 -2px 0 rgba(0, 0, 0, 0.2);
    border: 1px solid #1a202c;
}

.tryfi-hardware-container::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    background: linear-gradient(145deg, #374151, #1f2937);
    border-radius: 3px;
    box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.3);
}

.tryfi-main-screen {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    bottom: 12px;
    background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
    border-radius: 3px;
    border: 3px solid #0f172a;
    box-shadow: 
        inset 0 4px 12px rgba(0, 0, 0, 0.7),
        inset 0 -2px 4px rgba(255, 255, 255, 0.05);
    z-index: 2;
    overflow: hidden;
}

.tryfi-screen-content {
    padding: 10px;
    height: 100%;
    overflow-y: auto;
    background: linear-gradient(180deg, #0a0e1a 0%, #0f172a 50%, #1e293b 100%);
    color: #e2e8f0;
    position: relative;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.tryfi-screen-content::-webkit-scrollbar {
    display: none;
}

.tryfi-screen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.tryfi-screen-title {
    display: flex;
    align-items: center;
    gap: 12px;
    color: #e2e8f0;
    font-weight: 600;
    font-size: 18px;
}

.tryfi-screen-logo {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    color: #fff;
}

.tryfi-trash-btn {
    background: rgba(239, 68, 68, 0.2);
    border: 1px solid rgba(239, 68, 68, 0.3);
    width: 32px;
    height: 32px;
    border-radius: 4px;
    color: #f87171;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 16px;
}

.tryfi-trash-btn:hover {
    background: rgba(239, 68, 68, 0.3);
    color: #ffffff;
    border-color: rgba(239, 68, 68, 0.5);
    transform: translateY(-1px);
}

/* UI Components */
.tryfi-network-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    border: 1px solid rgba(34, 197, 94, 0.3);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tryfi-network-dot {
    width: 6px;
    height: 6px;
    background: #4ade80;
    border-radius: 50%;
    box-shadow: 0 0 8px rgba(74, 222, 128, 0.6);
}

.tryfi-balance-display {
    text-align: center;
    margin: 20px 0;
}

.tryfi-main-balance {
    font-size: 28px;
    font-weight: 700;
    color: #e2e8f0;
    margin-bottom: 4px;
}

.tryfi-balance-usd {
    font-size: 14px;
    color: #64748b;
}

.tryfi-address-display {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 12px 16px;
    border-radius: 4px;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    font-size: 11px;
    margin: 16px 0;
    word-break: break-all;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #94a3b8;
}

.tryfi-address-display:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
}

.copy-btn {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 2px;
    transition: background 0.2s ease;
    color: #64748b;
    min-width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.copy-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: #e2e8f0;
}

.tryfi-action-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 20px 0;
}

.tryfi-action-btn {
    padding: 12px 16px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    color: #e2e8f0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 500;
    transition: all 0.2s ease;
    font-family: inherit;
    text-decoration: none;
}

.tryfi-action-btn:hover {
    background: rgba(0, 0, 0, 0.4);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-1px);
}

.tryfi-action-btn.primary {
    background: rgba(37, 99, 235, 0.3);
    border-color: rgba(37, 99, 235, 0.5);
    color: #60a5fa;
}

.tryfi-action-btn.primary:hover {
    background: rgba(37, 99, 235, 0.4);
    border-color: rgba(37, 99, 235, 0.6);
}

/* Tabs */
.tryfi-tab-nav {
    display: flex;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    padding: 3px;
    margin-bottom: 16px;
}

.tryfi-tab-btn {
    flex: 1;
    padding: 8px 12px;
    background: none;
    border: none;
    border-radius: 2px;
    color: #64748b;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
    font-family: inherit;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.tryfi-tab-btn.active {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border: 1px solid rgba(59, 130, 246, 0.3);
}

.tryfi-tab-btn:not(.active):hover {
    color: #94a3b8;
    background: rgba(255, 255, 255, 0.05);
}

.tryfi-content-area {
    max-height: 200px;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
}

.tryfi-content-area::-webkit-scrollbar {
    display: none;
}

/* Form Inputs */
input[type="text"],
input[type="number"] {
    outline: none;
    transition: border-color 0.2s ease, background-color 0.2s ease;
}

input[type="text"]:focus,
input[type="number"]:focus {
    border-color: rgba(59, 130, 246, 0.5) !important;
    background: rgba(0, 0, 0, 0.4) !important;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type="number"] {
    -moz-appearance: textfield;
}

/* Asset Items */
.tryfi-asset-item {
    display: flex;
    align-items: center;
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-bottom: 8px;
}

.tryfi-asset-item:hover {
    background: rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.1);
}

.tryfi-asset-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    color: #fff;
}

.tryfi-asset-info {
    flex: 1;
}

.tryfi-asset-name {
    color: #e2e8f0;
    font-weight: 500;
    font-size: 13px;
    margin-bottom: 2px;
}

.tryfi-asset-symbol {
    color: #64748b;
    font-size: 11px;
}

.tryfi-asset-balance {
    text-align: right;
}

.tryfi-asset-amount {
    color: #e2e8f0;
    font-weight: 500;
    font-size: 13px;
    margin-bottom: 2px;
}

.tryfi-asset-value {
    color: #64748b;
    font-size: 11px;
}

/* Status Messages */
.tryfi-status {
    margin: 12px 0;
    padding: 10px 12px;
    border-radius: 3px;
    font-size: 12px;
    font-weight: 500;
    animation: tryfi-fade-in 0.3s ease;
    border: 1px solid;
    word-wrap: break-word;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
    max-width: 100%;
    line-height: 1.4;
}

@keyframes tryfi-fade-in {
    from { 
        opacity: 0; 
        transform: translateY(-4px); 
    }
    to { 
        opacity: 1; 
        transform: translateY(0); 
    }
}

.tryfi-status.success {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border-color: rgba(34, 197, 94, 0.3);
}

.tryfi-status.error {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border-color: rgba(239, 68, 68, 0.3);
}

.tryfi-status.info {
    background: rgba(59, 130, 246, 0.2);
    color: #60a5fa;
    border-color: rgba(59, 130, 246, 0.3);
}

/* Welcome Screen */
.tryfi-welcome {
    text-align: center;
    padding: 40px 20px;
}

.tryfi-welcome-icon {
    width: 64px;
    height: 64px;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border-radius: 4px;
    margin: 0 auto 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: #fff;
    box-shadow: 0 0 24px rgba(59, 130, 246, 0.4);
}

.tryfi-welcome h4 {
    margin: 0 0 12px 0;
    color: #e2e8f0;
    font-size: 18px;
    font-weight: 600;
}

.tryfi-welcome p {
    color: #64748b;
    margin-bottom: 24px;
    line-height: 1.5;
    font-size: 13px;
}

/* Empty States */
.tryfi-empty-message {
    text-align: center;
    padding: 30px 20px;
    color: #64748b;
}

.tryfi-empty-message svg {
    opacity: 0.3;
    margin-bottom: 12px;
}

/* Overlay */
.tryfi-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 9999;
    display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
    .tryfi-overlay.show {
        display: block;
    }
}

@media (max-width: 480px) {
    .tryfi-widget {
        right: 12px;
        bottom: 12px;
    }
    
    .tryfi-modal {
        right: 12px;
        bottom: 80px;
    }
    
    .tryfi-hardware-container {
        width: calc(100vw - 24px);
        max-width: 380px;
        height: 500px;
    }
}
`;