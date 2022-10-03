import Tweet from 'components/Tweet';
import { authService, dbService } from 'fbase';
import { updateProfile } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = ({ refreshUser, userObj }) => {
  const navigate = useNavigate();
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [myTweetObjs, setMyTweetObjs] = useState([]);

  const onLogOutClick = () => {
    authService.signOut();
    navigate('/');
  };

  useEffect(() => {
    const getMyTweets = async () => {
      const q = query(
        collection(dbService, 'tweets'),
        where('creatorId', '==', userObj.uid),
        orderBy('createdAt', 'desc')
      );

      // 실시간 업데이트
      let tweetArr = [];
      onSnapshot(q, (snapshot) => {
        tweetArr = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setMyTweetObjs(tweetArr);
      });
    };
    getMyTweets();
  }, [userObj]);

  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setNewDisplayName(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (userObj.displayName !== newDisplayName) {
      await updateProfile(authService.currentUser, {
        displayName: newDisplayName,
      });
      refreshUser();
    }
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit} className="profileForm">
        <input
          type="text"
          value={newDisplayName}
          placeholder="Display name"
          onChange={onChange}
          autoFocus
          className="formInput"
        />
        <input
          type="submit"
          value="Update Profile"
          className="formBtn"
          style={{
            marginTop: 10,
          }}
        />
      </form>
      <span onClick={onLogOutClick} className="formBtn cancelBtn logOut">
        Log Out
      </span>
      <div style={{ marginTop: 50 }}>
        <h4 style={{ textAlign: 'center', marginBottom: 10 }}>My Tweets</h4>
        {myTweetObjs.map((tweetObj) => (
          <Tweet key={tweetObj.createdAt} tweetObj={tweetObj} isOwner={true} />
        ))}
      </div>
    </div>
  );
};

export default Profile;
