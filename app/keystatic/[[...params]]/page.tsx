import type { Metadata } from 'next';
import Keystatic from '../keystatic';

export const metadata: Metadata = {
  title: 'CMS Admin — alke.dev',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return <Keystatic />;
}
