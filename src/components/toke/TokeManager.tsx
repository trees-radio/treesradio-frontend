// src/components/TokeManager.tsx
import React from 'react';
import { observer } from 'mobx-react-lite';
import NonModalTokeDialog from './NonModalTokeDialog';
import tokeStore from '../../stores/toke';

// This component can be placed in your main App to manage the toke dialog visibility
const TokeManager: React.FC = observer(() => {
  // Only render the dialog when a toke is underway or was recently underway
  if (!tokeStore.tokeUnderway && tokeStore.remainingTime === 0) {
    return null;
  }
  
  return <NonModalTokeDialog />;
});

export default TokeManager;