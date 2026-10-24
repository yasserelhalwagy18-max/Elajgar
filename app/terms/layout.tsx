import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'قوانین و مقررات',
  description: 'شرایط، ضوابط و تعهدات استفاده از پلتفرم و خدمات سلامت علاجگر',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
