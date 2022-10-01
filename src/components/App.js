import AppRouter from 'components/Router';
import { authService } from 'fbase';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { useEffect, useState } from 'react';

function App() {
  const [init, setInit] = useState(false);
  const [userObj, setUserObj] = useState(null);
  useEffect(() => {
    const auth = getAuth();
    // 로그인 상태 변했을 때
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // setUserObj(user);
        setUserObj({
          displayName: user.displayName,
          uid: user.uid,
          updateProfile: (args) =>
            updateProfile(user, { displayName: user.displayName }),
        });
      }
      setInit(true);
    });
  }, []);

  const refreshUser = () => {
    const user = authService.currentUser;
    setUserObj({
      displayName: user.displayName,
      uid: user.uid,
      updateProfile: (args) =>
        updateProfile(user, { displayName: user.displayName }),
    });
  };

  return (
    <>
      {init ? (
        <AppRouter
          isLoggedIn={Boolean(userObj)}
          userObj={userObj}
          refreshUser={refreshUser}
        />
      ) : (
        'Initializing...'
      )}
    </>
  );
}

export default App;
