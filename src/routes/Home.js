import { v4 as uuidv4 } from 'uuid';
import Tweet from 'components/Tweet';
import { dbService, storageService } from 'fbase';
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import TweetFactory from 'components/TweetFactory';

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
      setTweets(tweetArr);
    });
  }, []);

  return (
    <div>
      <TweetFactory userObj={userObj} />
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
