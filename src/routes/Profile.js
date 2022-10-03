import Tweet from 'components/Tweet';
import { authService, dbService } from 'fbase';
import { updateProfile } from 'firebase/auth';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
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

  const getMyTweets = async () => {
    const q = query(
      collection(dbService, 'tweets'),
      where('creatorId', '==', userObj.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const myTweets = [];
    querySnapshot.forEach((doc) => {
      myTweets.push(doc.data());
    });
    setMyTweetObjs([...myTweetObjs, ...myTweets]);
  };

  useEffect(() => {
    getMyTweets();
  }, []);

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
        <input type="submit" value="Update Profile" />
      </form>
      <span onClick={onLogOutClick}>Log Out</span>
      {myTweetObjs.map((tweetObj) => (
        <Tweet key={tweetObj.createdAt} tweetObj={tweetObj} isOwner={true} />
      ))}
    </div>
  );
};

export default Profile;
