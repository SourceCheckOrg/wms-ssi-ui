import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/auth';

const ALLOWED_PAGES = ['Home', 'WebMonetization', 'About', 'SignIn', 'SignUp']

export const ProtectRoute = ({ children }) => {
  const router = useRouter()
  const { isAuthenticated, loading, setRedirectTo } = useAuth();
  const isProtected = ALLOWED_PAGES.indexOf(children.type.name) == -1;

  useEffect(() => {
    if (isProtected && !isAuthenticated) {
      const pathId = router.query.id;
      const redirectTo = `${router.pathname}${pathId ? pathId : ''}`;
      setRedirectTo(redirectTo);
      if (!loading) {
        router.push('/sign-in');
      }
    }
  }), [];

  /*
  console.log('page: ', children.type.name);
  console.log('isProtected: ', isProtected);
  console.log('loading: ', loading);
  console.log('isAuthenticated: ', isAuthenticated);
  console.log('isReady: ', isReady);
  */

  if (isProtected && !isAuthenticated) {
    return (
      <span>Protected page ... </span>
    );
  }

  return children;
};
