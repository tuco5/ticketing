import App from 'next/app';
import axiosToNginx from '../api/axios-to-nginx';

import Header from '../components/header';

import 'bootstrap/dist/css/bootstrap.css';

export default function AppComponent({ Component, pageProps, currentUser }) {
  return (
    <>
      <Header currentUser={currentUser} />
      <div className="container">
        <Component {...pageProps} currentUser={currentUser} />
      </div>
    </>
  );
}

AppComponent.getInitialProps = async (appContext) => {
  // passing context to axios because we need to pull the headers with the cookie remember.
  const myAxios = axiosToNginx(appContext.ctx);
  const { data } = await myAxios.get('/api/users/currentuser');

  appContext.ctx.myAxios = myAxios;
  appContext.ctx.currentUser = data.currentUser;

  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const pageProps = await App.getInitialProps(appContext);

  return { ...pageProps, ...data };
};
