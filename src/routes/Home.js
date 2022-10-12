import Tweet from 'components/Tweet';
import TweetFactory from 'components/TweetFactory';
import { dbService } from 'fbase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

const Home = ({ userObj }) => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    // 최근 글 순으로 정렬
    const q = query(
      collection(dbService, 'tweets'),
      orderBy('createdAt', 'desc')
    );
    // 실시간 업데이트
    onSnapshot(q, (snapshot) => {
      const tweetArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      for (const tweet of tweetArr) {
        if (tweet.creatorId === userObj.uid) {
          tweet.creatorPicURL = userObj.photoURL;
          tweet.creatorName = userObj.displayName;
        }
      }
      setTweets(tweetArr);
    });
  }, [userObj]);

  return (
    <div className="container">
      <TweetFactory userObj={userObj} replyTo="" />
      <div style={{ marginTop: 30 }}>
        {tweets.map((twt) => (
          <Tweet
            key={twt.id}
            tweetObj={twt}
            userObj={userObj}
            isOwner={twt.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
