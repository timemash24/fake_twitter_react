import { HashRouter, Route, Routes } from 'react-router-dom';
import Auth from 'routes/Auth';
import Home from 'routes/Home';
import Profile from 'routes/Profile';
import Navigation from 'components/Navigation';

const Router = ({ refreshUser, isLoggedIn, userObj }) => {
  return (
    <HashRouter>
      {isLoggedIn && <Navigation userObj={userObj} />}
      <Routes>
        {isLoggedIn ? (
          <>
            <Route path="/" element={<Home userObj={userObj} />}></Route>
            <Route
              path="/profile"
              element={<Profile userObj={userObj} refreshUser={refreshUser} />}
            ></Route>
          </>
        ) : (
          <Route path="/" element={<Auth />}></Route>
        )}
      </Routes>
    </HashRouter>
  );
};

export default Router;
