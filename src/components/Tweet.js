import { dbService, storageService } from 'fbase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import React, { useState } from 'react';

const Tweet = ({ tweetObj, isOwner }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);

  const onDeleteClick = async () => {
    const ok = window.confirm('Delete this tweet?');
    if (ok) {
      await deleteDoc(doc(dbService, 'tweets', `${tweetObj.id}`));
      await deleteObject(ref(storageService, tweetObj.attachmentURL));
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
        <>
          {isOwner && (
            <>
              {
                <form onSubmit={onSubmit}>
                  <input
                    type="text"
                    placeholder="Edit your tweet"
                    value={newTweet}
                    onChange={onChange}
                    required
                  />
                  <input type="submit" value="Update tweet" />
                </form>
              }
            </>
          )}
          <button onClick={toggleEditing}>Cancel</button>
        </>
      ) : (
        <>
          <h4>{tweetObj.text}</h4>
          {tweetObj.attachmentURL && (
            <img
              alt={tweetObj.text}
              src={tweetObj.attachmentURL}
              width="50px"
              height="50px"
            />
          )}
          {isOwner && (
            <>
              <button onClick={onDeleteClick}>Delete</button>
              <button onClick={toggleEditing}>Edit</button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Tweet;