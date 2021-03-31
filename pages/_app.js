import '../styles/global.css'
import { SWRConfig } from 'swr';
import { AuthProvider } from '../context/auth';
import { ProtectRoute } from '../components/ProtectRoute';
import { fetcher } from '../lib/api';

function MyApp({ Component, pageProps }) {
  return (
    <SWRConfig value={{ fetcher: fetcher }} >
      <AuthProvider>
        <ProtectRoute>
          <Component {...pageProps} />
        </ProtectRoute>
      </AuthProvider>
    </SWRConfig>
  );
}

export default MyApp;
