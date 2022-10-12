import {
  faComment,
  faHeart as emptyHeart,
} from '@fortawesome/free-regular-svg-icons';
import {
  faHeart,
  faPencilAlt,
  faRetweet,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService, storageService } from 'fbase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';
import { useEffect, useState } from 'react';
import Reply from './Reply';

const Tweet = ({ tweetObj, isOwner, userObj }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);
  const [likeCnt, setLikeCnt] = useState(tweetObj.likes);
  const [like, setLike] = useState(tweetObj.likedBy.includes(userObj.uid));
  const [retweetCnt, setRetweetCnt] = useState(tweetObj.retweets);
  const [retweet, setRetweet] = useState(
    tweetObj.retweetedBy.includes(userObj.uid)
  );
  const [reply, setReply] = useState(false);
  const [replyCnt, setReplyCnt] = useState(tweetObj.replies);
  const [creatorPic, setCreatorPic] = useState(tweetObj.creatorPicURL);

  const onDeleteClick = async () => {
    const ok = window.confirm('Delete this tweet?');
    if (ok) {
      try {
        // const replyObj = tweetObj.tweetIdReplyTo;
        console.log(tweetObj.tweetIdReplyTo);
        if (tweetObj.tweetIdReplyTo) {
          const docSnap = await getDoc(
            doc(dbService, 'tweets', `${tweetObj.tweetIdReplyTo}`)
          );
          if (docSnap.data()) {
            setReplyCnt(docSnap.data().replies - 1);
            await updateDoc(
              doc(dbService, 'tweets', `${tweetObj.tweetIdReplyTo}`),
              {
                replies: docSnap.data().replies - 1,
              }
            );
          } else {
            window.alert('The original tweet you replied was deleted.');
          }
        }
        // 삭제하려는 트윗 firestore에서 삭제
        await deleteDoc(doc(dbService, 'tweets', `${tweetObj.id}`));
        // 삭제하려는 트윗에 이미지 파일 존재하는 경우
        if (tweetObj.attachmentURL !== '') {
          await deleteObject(ref(storageService, tweetObj.attachmentURL));
        }
        // console.log(replyObj);
      } catch (error) {
        console.log(error);
        window.alert('failed to delete the tweet!');
      }
    }
  };

  const toggleEditing = () => setEditing((prev) => !prev);

  const onSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
      text: newTweet,
    });
    setEditing(false);
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setNewTweet(value);
  };

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

  // const getCreatorImg = async () => {
  //   const profileRef = ref(storageService, `${tweetObj.creatorId}/profile`);
  //     const response = await uploadString(
  //       profileRef,
  //       tweetIbj,
  //       'data_url'
  //     );
  //     profilePicURL = await getDownloadURL(response.ref);
  // }

  useEffect(() => {
    setReplyCnt(tweetObj.replies);
  }, [tweetObj.replies]);

  // useEffect(() => {

  // }, [userObj])

  return (
    <div>
      {editing ? (
        <div className="tweet">
          {isOwner && (
            <>
              {
                <form onSubmit={onSubmit} className="container tweetEdit">
                  <input
                    type="text"
                    placeholder="Edit your tweet"
                    value={newTweet}
                    onChange={onChange}
                    required
                    autoFocus
                    className="formInput"
                  />
                  <input
                    type="submit"
                    value="Update tweet"
                    className="formBtn"
                  />
                </form>
              }
            </>
          )}
          <span onClick={toggleEditing} className="formBtn cancelBtn">
            Cancel
          </span>
        </div>
      ) : (
        <>
          {retweet ? (
            <span>
              <FontAwesomeIcon icon={faRetweet} />
              You Retweeted
            </span>
          ) : null}

          <div className={reply ? 'tweet selected' : 'tweet'}>
            <div className="tweetCreator">
              <img src={tweetObj.creatorPicURL} alt="user-profile" />
              <span>{tweetObj.creatorName}</span>
            </div>
            {tweetObj.tweetIdReplyTo ? (
              <div style={{ marginBottom: 5, color: '#6d6d6d' }}>
                Replying to{' '}
                <span style={{ color: '#33691e', fontWeight: 'bold' }}>
                  @{tweetObj.usernameReplyTo}
                </span>
              </div>
            ) : null}
            <h4>{tweetObj.text}</h4>
            {tweetObj.attachmentURL && (
              <img alt={tweetObj.text} src={tweetObj.attachmentURL} />
            )}
            {isOwner && (
              <div className="tweet__edits">
                <span onClick={onDeleteClick}>
                  <FontAwesomeIcon icon={faTrash} />
                </span>
                <span onClick={toggleEditing}>
                  <FontAwesomeIcon icon={faPencilAlt} />
                </span>
              </div>
            )}
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
                  <FontAwesomeIcon
                    icon={faHeart}
                    style={{ color: 'indianred' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={emptyHeart} />
                )}
                <span>{likeCnt}</span>
              </span>
            </div>
          </div>
          {reply ? <Reply userObj={userObj} tweetId={tweetObj.id} /> : null}
        </>
      )}
    </div>
  );
};

export default Tweet;
