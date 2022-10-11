import Tweet from 'components/Tweet';
import TweetFactory from 'components/TweetFactory';
import { dbService } from 'fbase';
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';

// 특정 트윗에 대한 답글 트윗 표시
const Reply = ({ userObj, tweetObj }) => {
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    console.log(tweetObj);

    // 최근 글 순으로 정렬
    const q = query(
      collection(dbService, 'tweets'),
      // where('id', 'in', 'tweetObj.repliedTweets'),
      orderBy('createdAt', 'desc')
    );
    // 실시간 업데이트
    onSnapshot(q, (snapshot) => {
      const tweetArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
      }));
      const replyArr = tweetArr.filter(
        (tweet) => tweet.replyTo?.id === tweetObj.id
      );
      setTweets([...replyArr]);
    });
  }, []);

  return (
    <div className="replyContainer">
      <p style={{ textAlign: 'center', paddingBottom: 5 }}>Replying...</p>
      <TweetFactory userObj={userObj} replyTo={tweetObj} />

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
  );
};

export default Reply;
