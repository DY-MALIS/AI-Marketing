import type { Metadata } from 'next';
import TermsOfServiceContent from './TermsOfServiceContent';

export const metadata: Metadata = {
  title: 'Terms of Service - Marketing Engine',
  description: 'Read the Terms of Service for Marketing Engine, an AI-powered marketing platform.',
};

export default function TermsOfServicePage() {
  return <TermsOfServiceContent />;
}
