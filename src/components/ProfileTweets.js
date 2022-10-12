import Tweet from 'components/Tweet';
import { dbService } from 'fbase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const ProfileTweets = ({ userObj }) => {
  const [myTweetObjs, setMyTweetObjs] = useState([]);
  const [likedTweetObjs, setLikedTweetObjs] = useState([]);
  const [toggleMyTweets, setToggleMyTweets] = useState(true);

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
  );
};

export default ProfileTweets;
