'use client';

import { TitleBar } from './TitleBar';
import { ReactNode } from 'react';

interface ClientLayoutProps {
  children: ReactNode;
  tabs: Array<{ id: string; title: string }>;
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onNewTab: () => void;
  onDeleteTab: (tabId: string) => void;
}

export function ClientLayout({
  children,
  tabs,
  activeTabId,
  onTabSelect,
  onNewTab,
  onDeleteTab,
}: ClientLayoutProps) {
  return (
    <>
      <TitleBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={onTabSelect}
        onNewTab={onNewTab}
        onDeleteTab={onDeleteTab}
      />
      <main className="flex-1 overflow-y-auto overflow-x-hidden">{children}</main>
    </>
  );
}
