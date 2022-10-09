import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { authService } from 'fbase';

const Navigation = ({ userObj }) => {
  const [profilePic, setProfilePic] = useState('');
  useEffect(() => {
    const user = authService.currentUser;
    setProfilePic(user.photoURL);
  }, [userObj]);

  return (
    <nav>
      <ul style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
        <li>
          <Link to="/">
            <FontAwesomeIcon icon={faTwitter} color={'#629749'} size="2x" />
          </Link>
        </li>
        <li>
          <Link
            to="/profile"
            style={{
              marginLeft: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              fontSize: 12,
            }}
          >
            <img
              src={profilePic}
              style={{ height: 30, width: 30 }}
              alt="profile"
            />
            {/* <FontAwesomeIcon icon={faUser} color={'#629749'} size="2x" /> */}
            <span style={{ marginTop: 10 }}>
              {userObj.displayName
                ? `${userObj.displayName}의 Profile`
                : 'Profile'}
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
