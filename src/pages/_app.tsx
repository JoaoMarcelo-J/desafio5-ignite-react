import { AppProps } from 'next/app';
import '../styles/globals.scss';
import Header from '../components/Header';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
