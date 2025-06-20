export interface TryFiConfig {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'hidden';
  theme?: string;
  chainName: string;
  rpcUrl: string;
  chainId: number;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
  faucetUrl?: string | null;
  iconUrls?: string[];
}

export interface TryFiWallet {
  showWidget(): void;
  hideWidget(): void;
  toggleWidget(): void;
  destroy(): void;
}

export interface TryFi {
  init(config: TryFiConfig): TryFiWallet;
  show(): void;
  hide(): void;
  toggle(): void;
  destroy(): void;
}

declare const TryFi: TryFi;

declare global {
  interface Window {
    TryFi: TryFi;
    tryfi?: TryFiWallet;
  }
}

export default TryFi; 