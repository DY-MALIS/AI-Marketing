import type { Metadata } from 'next';
import PrivacyPolicyContent from './PrivacyPolicyContent';

export const metadata: Metadata = {
  title: 'Privacy Policy - Marketing Engine',
  description: 'Read the Privacy Policy for Marketing Engine. Learn how we handle your data securely.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyContent />;
}
