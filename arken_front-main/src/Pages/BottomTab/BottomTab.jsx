import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { C } from '../../theme';
import { MarketsIcon, KolIcon, WalletNavIcon, ProfileIcon } from '../../Components/Icons';

const tabs = [
  { id: 'markets',  label: 'Markets', Icon: MarketsIcon, link: '/markets' },
  { id: 'kol',      label: 'KOL',     Icon: KolIcon,     link: null, soon: true },
  { id: 'wallet',   label: 'Wallet',  Icon: WalletNavIcon, link: '/Wallet' },
  { id: 'profile',  label: 'Profile', Icon: ProfileIcon,  link: '/profile' },
];

const BottomTab = ({ tabAct }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (tab) => {
    if (tabAct !== undefined) {
      // legacy numeric tabAct support
      const idx = tabs.findIndex(t => t.id !== 'kol');
      const activeTab = [1,2,3,4].indexOf(tabAct);
      return tabs.indexOf(tab) === activeTab;
    }
    return location.pathname === tab.link;
  };

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
      width: '100%', maxWidth: 420,
      background: C.surface, borderTop: `1px solid ${C.border}`,
      display: 'flex', padding: '10px 0 20px', zIndex: 50,
    }}>
      {tabs.map((tab) => {
        const active = tabAct
          ? (tab.id === 'markets' && tabAct === 1) ||
            (tab.id === 'kol'     && tabAct === 2) ||
            (tab.id === 'wallet'  && tabAct === 3) ||
            (tab.id === 'profile' && tabAct === 4)
          : location.pathname === tab.link;

        if (tab.soon) {
          return (
            <div key={tab.id} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '2px 0', cursor: 'not-allowed', opacity: 0.45, position: 'relative',
            }}>
              <div style={{ color: C.muted }}><tab.Icon /></div>
              <span style={{ fontSize: 10, fontWeight: 600, color: C.muted }}>{tab.label}</span>
              <div style={{ fontSize: 8, fontWeight: 700, color: '#f59e0b', letterSpacing: 0.5 }}>SOON</div>
            </div>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => navigate(tab.link)}
            style={{
              flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '2px 0', position: 'relative',
            }}
          >
            <div style={{ color: active ? C.purpleL : C.muted }}><tab.Icon /></div>
            <span style={{ fontSize: 10, fontWeight: 600, color: active ? C.purpleL : C.muted }}>
              {tab.label}
            </span>
            {active && (
              <div style={{
                width: 3, height: 3, borderRadius: '50%', background: C.purple,
                position: 'absolute', bottom: -6,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default BottomTab;
