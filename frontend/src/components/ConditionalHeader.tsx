'use client';
import { usePathname } from 'next/navigation';
import Header from './Header';

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // Hide header for individual coding challenge pages
  const isCodeChallengePage = pathname?.includes('/coding/task/');
  
  if (isCodeChallengePage) {
    return null;
  }
  
  return <Header />;
} 