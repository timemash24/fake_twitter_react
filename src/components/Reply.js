import Tweet from 'components/Tweet';
import TweetFactory from 'components/TweetFactory';
import { dbService } from 'fbase';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';

// 특정 트윗에 대한 답글 트윗 표시
const Reply = ({ userObj, tweetId }) => {
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
      const replyArr = tweetArr.filter((tweet) => tweet.replyTo === tweetId);
      for (const tweet of replyArr) {
        if (tweet.creatorId === userObj.uid) {
          tweet.creatorPicURL = userObj.photoURL;
          tweet.creatorName = userObj.displayName;
        }
      }
      setTweets([...replyArr]);
    });
  }, []);

  return (
    <div
      style={{
        borderLeft: '1px solid rgba(255, 255, 255, 0.7)',
      }}
    >
      <div className="replyContainer">
        <p style={{ textAlign: 'center', paddingBottom: 5 }}>Replying...</p>
        <TweetFactory userObj={userObj} replyTo={tweetId} />

        <div style={{ marginTop: 30 }}>
          {tweets?.map((twt, i) => (
            <Tweet
              key={`${twt.replyTo}${i}`}
              tweetObj={twt}
              userObj={userObj}
              isOwner={twt.creatorId === userObj.uid}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reply;
