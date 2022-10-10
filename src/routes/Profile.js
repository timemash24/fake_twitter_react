import { faPen } from '@fortawesome/free-solid-svg-icons';
import Tweet from 'components/Tweet';
import { authService, dbService, storageService } from 'fbase';
import { updateProfile } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Profile = ({ refreshUser, userObj }) => {
  const navigate = useNavigate();
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [newProfilePic, setNewProfilePic] = useState('');
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
    console.log('photoURL변경전', userObj.photoURL);
    // 빈 사진 업로드 막아야함
    let profilePicURL = '';
    if (newProfilePic !== '') {
      const profileRef = ref(storageService, `${userObj.uid}/profile`);
      const response = await uploadString(
        profileRef,
        newProfilePic,
        'data_url'
      );
      profilePicURL = await getDownloadURL(response.ref);
    }

    if (userObj.displayName !== newDisplayName) {
      if (profilePicURL !== '') {
        console.log('이름 사진 변경');
        await updateProfile(authService.currentUser, {
          displayName: newDisplayName,
          photoURL: profilePicURL,
        });
      } else {
        console.log('이름 변경');
        await updateProfile(authService.currentUser, {
          displayName: newDisplayName,
        });
      }
      refreshUser();
    } else if (profilePicURL !== '') {
      console.log('사진 변경');
      await updateProfile(authService.currentUser, {
        photoURL: profilePicURL,
      });
      refreshUser();
    }

    setNewProfilePic('');
  };

  const onFileChange = (e) => {
    const {
      target: { files },
    } = e;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setNewProfilePic(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="container">
      <form onSubmit={onSubmit} className="profileForm">
        {newProfilePic && (
          <div style={{ alignSelf: 'center' }}>
            <img
              src={newProfilePic}
              alt="profile-pic"
              style={{
                width: 60,
                padding: 10,
                backgroundImage: newProfilePic,
              }}
            />
          </div>
        )}
        <label
          htmlFor="profile-img"
          className="factoryInput__label"
          style={{ textAlign: 'center' }}
        >
          <span>Edit Profile Picture</span>
          <FontAwesomeIcon icon={faPen} />
        </label>
        <input
          id="profile-img"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{
            opacity: 0,
          }}
        />
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
