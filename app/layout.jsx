import './globals.css';
import Header from '../components/starlight/Header';

export const metadata = {
  title: 'Spec Driven Development (SDD) | Portal Oficial',
  description: 'Metodología estandarizada de 7 fases para transformar requerimientos de negocio en software riguroso.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" data-theme="dark">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
