// TryFi Internal QRious Wrapper
// This ensures QRious is properly bundled

import QRious from 'qrious';

// Create our namespaced version
export const TryFiQRious = QRious;

// Mark as internal
if (typeof TryFiQRious === 'function') {
  TryFiQRious.__TryFiInternal = true;
}

export default TryFiQRious; 