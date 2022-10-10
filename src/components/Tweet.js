import { authService, dbService, storageService } from 'fbase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faPencilAlt,
  faRetweet,
} from '@fortawesome/free-solid-svg-icons';
import { faComment, faHeart } from '@fortawesome/free-regular-svg-icons';

const Tweet = ({ tweetObj, isOwner, userObj }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);
  const [likeCnt, setLikeCnt] = useState(tweetObj.likes);

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

  const onLikeClick = async (e) => {
    // 하트 클릭하면 하트 색 바뀌고 옆에 숫자 카운트 + 1
    // 클릭한 tweetObj에 하트 클릭한 user.uid랑 하트클릭수 저장 - 새로운prop 만들기
    // 내 페이지에서 tweetObj에 하트 클릭 목록에 내 uid 존재하면 띄우기
    e.preventDefault();
    const currentUser = userObj.uid;
    if (!tweetObj.likedBy.includes(currentUser)) {
      await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
        likedBy: [...tweetObj.likedBy, userObj.uid],
        likes: tweetObj.likes + 1,
      });
      setLikeCnt(tweetObj.likes + 1);
    } else {
      await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
        likedBy: tweetObj.likedBy.filter((user) => user !== currentUser),
        likes: tweetObj.likes - 1,
      });
      setLikeCnt(tweetObj.likes - 1);
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
            <span>
              <FontAwesomeIcon icon={faRetweet} />
              <span>1</span>
            </span>
            <span onClick={onLikeClick}>
              <FontAwesomeIcon icon={faHeart} />
              <span>{likeCnt}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tweet;
