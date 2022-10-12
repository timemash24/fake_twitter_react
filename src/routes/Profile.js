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
  const [likedTweetObjs, setLikedTweetObjs] = useState([]);
  const [toggleMyTweets, setToggleMyTweets] = useState(true);

  const onLogOutClick = () => {
    authService.signOut();
    navigate('/');
  };

  // 리트윗 + 내가 작성한 트윗 가져오기
  const getMyTweets = async () => {
    const q = query(
      collection(dbService, 'tweets'),
      orderBy('createdAt', 'desc')
    );

    // 실시간 업데이트
    let tweetArr = [];
    onSnapshot(q, (snapshot) => {
      tweetArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // 리트윗한 시간도 저장해서 순서 정렬 필요
      // tweeterObj의 retweetedBy porp 변경 - [{user: userObj.uid, retweetedAt: Date.now()}]
      // retweetedBy.retweetedAt과 reweetedAt에 내 아이디 없으면 createdAt으로 비교 정렬
      for (const tweet of tweetArr) {
        if (tweet.creatorId === userObj.uid) {
          tweet.creatorPicURL = userObj.photoURL;
          tweet.creatorName = userObj.displayName;
        }
      }
      setMyTweetObjs(
        tweetArr.filter(
          (tweet) =>
            tweet.creatorId === userObj.uid ||
            tweet.retweetedBy.includes(userObj.uid)
        )
      );
    });
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
        // console.log('이름 사진 변경');
        await updateProfile(authService.currentUser, {
          displayName: newDisplayName,
          photoURL: profilePicURL,
        });
      } else {
        // console.log('이름 변경');
        await updateProfile(authService.currentUser, {
          displayName: newDisplayName,
        });
      }
      refreshUser();
    } else if (profilePicURL !== '') {
      // console.log('사진 변경');
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

  const getLikedTweets = async () => {
    const q = query(
      collection(dbService, 'tweets'),
      orderBy('createdAt', 'desc')
    );

    let tweetArr = [];
    onSnapshot(q, (snapshot) => {
      tweetArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLikedTweetObjs(
        tweetArr.filter((tweet) => tweet.likedBy.includes(userObj.uid))
      );
    });
  };

  const onSortClick = (e) => {
    if (e.target.innerText === 'My Tweets') {
      setToggleMyTweets(true);
      getMyTweets();
    } else if (e.target.innerText === 'Liked Tweets') {
      setToggleMyTweets(false);
      getLikedTweets();
    }
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
      <section style={{ marginTop: 20 }}>
        <div className="profileTweets" onClick={onSortClick}>
          <h4 style={{ textAlign: 'center', marginBottom: 10 }} name="my">
            My Tweets
          </h4>
          <h4 style={{ textAlign: 'center', marginBottom: 10 }} name="liked">
            Liked Tweets
          </h4>
        </div>
        {toggleMyTweets
          ? myTweetObjs.map((tweetObj) => (
              <Tweet
                key={tweetObj.createdAt}
                tweetObj={tweetObj}
                isOwner={tweetObj.creatorId === userObj.uid}
                userObj={userObj}
              />
            ))
          : likedTweetObjs.map((tweetObj) => (
              <Tweet
                key={tweetObj.createdAt}
                tweetObj={tweetObj}
                isOwner={tweetObj.creatorId === userObj.uid}
                userObj={userObj}
              />
            ))}
      </section>
    </div>
  );
};

export default Profile;
