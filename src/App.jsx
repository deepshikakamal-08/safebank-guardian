import React from 'react';
import { GuardianProvider, useGuardian } from './context/GuardianContext';
import Navbar from './components/common/Navbar';
import StepTracker from './components/common/StepTracker';
import BankingHome from './components/screens/BankingHome';
import SendMoney from './components/screens/SendMoney';
import ScamContext from './components/screens/ScamContext';
import GuardianAnalysis from './components/screens/GuardianAnalysis';
import ProtectionScreen from './components/screens/ProtectionScreen';
import Login from './components/screens/Login';
import { Shield } from 'lucide-react';

function AppContent() {
  const { activeScreen } = useGuardian();

  const renderActiveScreen = () => {
    switch (activeScreen) {
      case 'login':
        return <Login />;
      case 'home':
        return <BankingHome />;
      case 'send':
        return <SendMoney />;
      case 'context':
        return <ScamContext />;
      case 'analysis':
        return <GuardianAnalysis />;
      case 'protection':
      case 'paused':
        return <ProtectionScreen />;
      default:
        return <BankingHome />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      
      <main className="main-content">
        <StepTracker />
        {renderActiveScreen()}
      </main>

      <footer style={{ 
        borderTop: '1px solid var(--border-light)', 
        padding: '20px', 
        textAlign: 'center', 
        fontSize: '0.8rem', 
        color: 'var(--text-muted)',
        background: 'var(--bg-surface)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
          <Shield size={14} color="#0284c7" />
          <strong style={{ color: 'var(--text-primary)' }}>SafeBank Guardian</strong>
          <span>— Hackathon Security Prototype</span>
        </div>
        <div>
          Connecting scam context, customer intent, and behavioral signals for explainable social engineering protection.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <GuardianProvider>
      <AppContent />
    </GuardianProvider>
  );
}
