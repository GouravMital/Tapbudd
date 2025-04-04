import React from 'react';
import { SidebarProvider } from '../contexts/SidebarContext';
import Sidebar from './Sidebar';
import MobileSidebarToggle from './MobileSidebarToggle';

export default function SidebarWithContext() {
  return (
    <SidebarProvider>
      <Sidebar />
      <MobileSidebarToggle />
    </SidebarProvider>
  );
}