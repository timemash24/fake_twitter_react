import { dbService, storageService } from 'fbase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

const Tweet = ({ tweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);

  const onDeleteClick = async () => {
    const ok = window.confirm('Delete this tweet?');
    if (ok) {
      try {
        console.log(tweetObj);
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
            <div className="tweet__actions">
              <span onClick={onDeleteClick}>
                <FontAwesomeIcon icon={faTrash} />
              </span>
              <span onClick={toggleEditing}>
                <FontAwesomeIcon icon={faPencilAlt} />
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Tweet;
