import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '@/lib/auth/authProvider';
import { SearchProvider } from '@/lib/search/SearchContext';
import ControlPopup from './components/ControlPopup';
import Navbar from './components/navbar';
import Footer from './components/footer';
import ChatButton from './components/chat/ChatButton';
import { ChatProvider } from './components/chat/ChatProvider';

export const metadata: Metadata = {
  title: 'Hired - Plateforme de Recrutement',
  description:
    'Plateforme de mise en relation entre candidats et employeurs. Trouvez votre emploi idéal ou recrutez les meilleurs talents.',
  keywords: "emploi, recrutement, candidats, employeurs, offres d'emploi",
  authors: [{ name: 'Hired Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full">
      <body className="h-full flex flex-col">
        <AuthProvider>
          <ChatProvider>
            <SearchProvider>
              <main className="flex-1">
                <ControlPopup />
                <Navbar />
                <ToastContainer
                  position="top-right"
                  autoClose={4000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  theme="light"
                  closeOnClick
                  pauseOnHover
                />
                {children}
              </main>
              <Footer />
              <ChatButton />
            </SearchProvider>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
