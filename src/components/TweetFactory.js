import { dbService, storageService } from 'fbase';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';

function TweetFactory({ userObj, tweetIdReplyTo }) {
  const [tweet, setTweet] = useState('');
  const [attachment, setAttachment] = useState('');

  const addReplyCnt = async () => {
    if (tweetIdReplyTo) {
      const docSnap = await getDoc(
        doc(dbService, 'tweets', `${tweetIdReplyTo}`)
      );
      await updateDoc(doc(dbService, 'tweets', `${tweetIdReplyTo}`), {
        replies: docSnap.data().replies + 1,
      });
    }
  };

  const onSubmit = async (e) => {
    if (tweet === '') return;

    e.preventDefault();
    let attachmentURL = '';

    if (attachment !== '') {
      const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
      const response = await uploadString(
        attachmentRef,
        attachment,
        'data_url'
      );
      attachmentURL = await getDownloadURL(response.ref);
    }

    let username = null;
    if (tweetIdReplyTo) {
      const docSnap = await getDoc(
        doc(dbService, 'tweets', `${tweetIdReplyTo}`)
      );
      username = docSnap.data().creatorName;
    }

    const twt = {
      text: tweet,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      creatorName: userObj.displayName,
      creatorPicURL: userObj.photoURL,
      attachmentURL,
      likedBy: [],
      likes: 0,
      retweetedBy: [],
      retweets: 0,
      replies: 0,
      tweetIdReplyTo: tweetIdReplyTo ? tweetIdReplyTo : null,
      usernameReplyTo: username ? username : null,
    };

    await addDoc(collection(dbService, 'tweets'), twt);
    addReplyCnt();
    setTweet('');
    setAttachment('');
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setTweet(value);
  };

  const onFileChange = (e) => {
    const {
      target: { files },
    } = e;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = (finishedEvent) => {
      const {
        currentTarget: { result },
      } = finishedEvent;
      setAttachment(result);
    };
    reader.readAsDataURL(file);
  };

  const onClearAttachment = () => setAttachment('');

  return (
    <form onSubmit={onSubmit} className="factoryForm">
      <div className="factoryInput__container">
        <input
          value={tweet}
          onChange={onChange}
          type="text"
          placeholder="What's on your mind?"
          maxLength={120}
          className="factoryInput__input"
        />
        <input type="submit" value="&rarr;" className="factoryInput__arrow" />
      </div>
      <label htmlFor="attach-file" className="factoryInput__label">
        <span>Add photos</span>
        <FontAwesomeIcon icon={faPlus} />
      </label>
      <input
        id="attach-file"
        type="file"
        accept="image/*"
        onChange={onFileChange}
        style={{
          opacity: 0,
        }}
      />
      {attachment && (
        <div className="factoryForm__attachment">
          <img
            src={attachment}
            alt=""
            style={{
              backgroundImage: attachment,
            }}
          />
          <div className="factoryForm__clear" onClick={onClearAttachment}>
            <span>Remove</span>
            <FontAwesomeIcon icon={faTimes} />
          </div>
        </div>
      )}
    </form>
  );
}

export default TweetFactory;
