import {
  faComment,
  faHeart as emptyHeart,
} from '@fortawesome/free-regular-svg-icons';
import { faHeart, faRetweet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService } from 'fbase';
import { doc, updateDoc } from 'firebase/firestore';
import { useState } from 'react';

const TweetActions = ({
  tweetObj,
  userObj,
  setRetweet,
  retweet,
  setReply,
  reply,
  replyCnt,
}) => {
  const [likeCnt, setLikeCnt] = useState(tweetObj.likes);
  const [like, setLike] = useState(tweetObj.likedBy.includes(userObj.uid));
  const [retweetCnt, setRetweetCnt] = useState(tweetObj.retweets);

  const onLikeClick = async () => {
    const currentUser = userObj.uid;
    if (!tweetObj.likedBy.includes(currentUser)) {
      await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
        likedBy: [...tweetObj.likedBy, userObj.uid],
        likes: tweetObj.likes + 1,
      });
      setLike(true);
      setLikeCnt(tweetObj.likes + 1);
    } else {
      await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
        likedBy: tweetObj.likedBy.filter((user) => user !== currentUser),
        likes: tweetObj.likes - 1,
      });
      setLike(false);
      setLikeCnt(tweetObj.likes - 1);
    }
  };

  const onRetweetClick = async () => {
    const currentUser = userObj.uid;
    if (!tweetObj.retweetedBy.includes(currentUser)) {
      await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
        retweetedBy: [...tweetObj.retweetedBy, userObj.uid],
        retweets: tweetObj.retweets + 1,
      });
      setRetweet(true);
      setRetweetCnt(tweetObj.retweets + 1);
    } else {
      await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
        retweetedBy: tweetObj.retweetedBy.filter(
          (user) => user !== currentUser
        ),
        retweets: tweetObj.retweets - 1,
      });
      setRetweet(false);
      setRetweetCnt(tweetObj.retweets - 1);
    }
  };

  const onReplyClick = async () => {
    // 답글 이모티콘 클릭시 원글 색 변경
    // 아래에 새로운 입력창과 띄우고 달린 답글 트윗 모두 보여주기
    // 답글 트윗은 @답글단트윗id 표시
    // 답글 카운트 수 + 1 이후 과정은 새로운 트윗 추가랑 같음
    // tweeterObj에 prop추가 - replies 답글 수, tweetIdReplyTo 이 트윗이 답글이면 답글 한 원트윗 id
    // 내가 답글로 단 트윗은 profile 페이지 my tweets에 보여짐
    setReply(!reply);
  };

  return (
    <div className="tweet__actions">
      <span onClick={onReplyClick}>
        <FontAwesomeIcon
          icon={faComment}
          style={reply ? { color: '#629749' } : null}
        />
        <span>{replyCnt}</span>
      </span>
      <span onClick={onRetweetClick}>
        <FontAwesomeIcon
          icon={faRetweet}
          style={retweet ? { color: '#629749' } : null}
        />
        <span>{retweetCnt}</span>
      </span>
      <span onClick={onLikeClick}>
        {like ? (
          <FontAwesomeIcon icon={faHeart} style={{ color: 'indianred' }} />
        ) : (
          <FontAwesomeIcon icon={emptyHeart} />
        )}
        <span>{likeCnt}</span>
      </span>
    </div>
  );
};

export default TweetActions;
