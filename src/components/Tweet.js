import { authService, dbService, storageService } from 'fbase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPencilAlt,
  faRetweet,
  faHeart,
} from '@fortawesome/free-solid-svg-icons';
import {
  faComment,
  faHeart as emptyHeart,
} from '@fortawesome/free-regular-svg-icons';

const Tweet = ({ tweetObj, isOwner, userObj }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);
  const [likeCnt, setLikeCnt] = useState(tweetObj.likes);
  const [like, setLike] = useState(tweetObj.likedBy.includes(userObj.uid));
  const [retweetCnt, setRetweetCnt] = useState(tweetObj.retweets);
  const [retweet, setRetweet] = useState(
    tweetObj.retweetedBy.includes(userObj.uid)
  );

  const onDeleteClick = async () => {
    const ok = window.confirm('Delete this tweet?');
    if (ok) {
      try {
        // console.log(tweetObj);
        // 삭제하려는 트윗 firestore에서 삭제
        await deleteDoc(doc(dbService, 'tweets', `${tweetObj.id}`));
        // 삭제하려는 트윗에 이미지 파일 존재하는 경우
        if (tweetObj.attachmentURL !== '') {
          await deleteObject(ref(storageService, tweetObj.attachmentURL));
        }
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
    // 리트윗 누르면 리트윗 카운트 + 1 하면서 색상 초록으로 변경, 다시 누르면 - 1
    // 리트윗한 트윗은 profile 페이지 my tweets 에서 보여줘야 함
    // tweetObj에 prop 추가 - retweets 리트윗 수, retweetedBy 리트윗한 유저 배열
    // retweetedBy에 내 uid 있으면 my tweets에 보여주는 조건 추가
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
        <div>
          {retweet ? (
            <span>
              <FontAwesomeIcon icon={faRetweet} />
              You Retweeted
            </span>
          ) : null}
          <div className="tweet">
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
              <span>
                <FontAwesomeIcon icon={faComment} />
                <span>1</span>
              </span>
              <span onClick={onRetweetClick}>
                {retweet ? (
                  <FontAwesomeIcon
                    icon={faRetweet}
                    style={{ color: '#629749' }}
                  />
                ) : (
                  <FontAwesomeIcon icon={faRetweet} />
                )}
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
        </div>
      )}
    </div>
  );
};

export default Tweet;
