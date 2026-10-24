import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ارزیابی هوشمند سلامت',
  description: 'پرسشنامه هوشمند ارزیابی درد مفاصل و عضلات و تحلیل وضعیت بدنی',
};

export default function WizardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
