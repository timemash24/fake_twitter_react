import Tweet from 'components/Tweet';
import { dbService } from 'fbase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useRevalidator } from 'react-router-dom';

const Home = ({ userObj }) => {
  const [tweet, setTweet] = useState('');
  const [tweets, setTweets] = useState([]);

  useEffect(() => {
    // 최근 글 순으로 정렬
    const q = query(
      collection(dbService, 'tweets'),
      orderBy('createAt', 'desc')
    );
    // 실시간 업데이트
    onSnapshot(q, (snapshot) => {
      const tweetArr = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTweets(tweetArr);
    });
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(dbService, 'tweets'), {
      text: tweet,
      createAt: Date.now(),
      creatorId: userObj.uid,
    });
    setTweet('');
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setTweet(value);
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <input
          value={tweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
        />
        <input type="submit" value="Tweet" />
      </form>
      <div>
        {tweets.map((twt) => (
          <Tweet
            key={twt.id}
            tweetObj={twt}
            isOwner={twt.creatorId === userObj.uid}
          />
        ))}
      </div>
    </div>
  );
};

export default Home;
