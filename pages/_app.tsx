import type { AppProps } from 'next/app';
import { initializeApp, getApps } from 'firebase/app';
import 'antd/dist/antd.css';
import frFR from 'antd/lib/locale/fr_FR';
import { ConfigProvider } from "antd";
import { AuthProvider } from "../lib/AuthProvider";

if (getApps().length === 0) {
  initializeApp({
    apiKey: "AIzaSyBzXNeviZuew8WwwYHJ0mFtAXqSDFIl95Y",
    authDomain: "rendezvousform.firebaseapp.com",
    projectId: "rendezvousform",
    storageBucket: "rendezvousform.appspot.com",
    messagingSenderId: "842794282928",
    appId: "1:842794282928:web:1c9b21ab2ea00903403075"
  });
}



function MyApp({ Component, pageProps }: AppProps) {
  return <AuthProvider><ConfigProvider locale={ frFR }><Component { ...pageProps } /></ConfigProvider></AuthProvider>;
}

export default MyApp;
