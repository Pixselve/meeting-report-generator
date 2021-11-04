import type { AppProps } from 'next/app';
import 'antd/dist/antd.css';
import frFR from 'antd/lib/locale/fr_FR';
import { ConfigProvider } from "antd";

function MyApp({ Component, pageProps }: AppProps) {
  return <ConfigProvider locale={ frFR }><Component { ...pageProps } /></ConfigProvider>;
}

export default MyApp;
