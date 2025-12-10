/**
 * DCS调试面板 - 强制显示实时数据
 */

import React from 'react';
import { useDCS } from '../../contexts/DCSContext';

export const DCSDebugPanel: React.FC = () => {
  const { processData } = useDCS();
  
  const ticLoop = processData.controlLoops.find(l => l.id === 'TIC-101');
  const picLoop = processData.controlLoops.find(l => l.id === 'PIC-203');
  
  return (
    <div style={{
      position: 'fixed',
      top: '70px',
      right: '380px',
      background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(8px)',
      color: '#22d3ee',
      padding: '8px 16px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 15,
      border: '1px solid rgba(34, 211, 238, 0.3)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      pointerEvents: 'none',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        marginBottom: '4px', 
        fontWeight: 600, 
        color: '#22d3ee',
        fontSize: '11px',
        opacity: 0.8
      }}>
        📊 实时数据
      </div>
      <div style={{ fontSize: '11px', lineHeight: '1.6', color: '#e2e8f0' }}>
        <div>
          TIC-101: <span style={{ color: '#fff', fontWeight: 600 }}>
            {ticLoop?.pv.toFixed(1)}°C
          </span>
          <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '10px' }}>
            SP {ticLoop?.sp}
          </span>
        </div>
        <div>
          PIC-203: <span style={{ color: '#fff', fontWeight: 600 }}>
            {picLoop?.pv.toFixed(2)} MPa
          </span>
          <span style={{ color: '#94a3b8', marginLeft: '4px', fontSize: '10px' }}>
            SP {picLoop?.sp}
          </span>
        </div>
      </div>
    </div>
  );
};
