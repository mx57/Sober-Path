import { useContext } from 'react';
import { RecoveryContext } from '../contexts/RecoveryContext';

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (!context) {
    throw new Error('useRecovery must be used within RecoveryProvider');
  }
  return context;
}