import { faRetweet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService } from 'fbase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import Reply from './Reply';
import TweetActions from './TweetActions';
import TweetEdit from './TweetEdit';
import TweetOwnerActions from './TweetOwnerActions';

const Tweet = ({ tweetObj, isOwner, userObj }) => {
  const [editing, setEditing] = useState(false);
  const [newTweet, setNewTweet] = useState(tweetObj.text);

  const [retweet, setRetweet] = useState(
    tweetObj.retweetedBy.includes(userObj.uid)
  );
  const [reply, setReply] = useState(false);
  const [replyCnt, setReplyCnt] = useState(tweetObj.replies);

  const toggleEditing = () => setEditing((prev) => !prev);

  const onSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(dbService, 'tweets', `${tweetObj.id}`), {
      text: newTweet,
    });
    setEditing(false);
  };

  useEffect(() => {
    setReplyCnt(tweetObj.replies);
  }, [tweetObj.replies]);

  return (
    <div>
      {editing ? (
        <TweetEdit
          newTweet={newTweet}
          setNewTweet={setNewTweet}
          onSubmit={onSubmit}
          toggleEditing={toggleEditing}
          isOwner={isOwner}
        />
      ) : (
        <>
          {retweet && (
            <span>
              <FontAwesomeIcon icon={faRetweet} />
              You Retweeted
            </span>
          )}

          <div className={reply ? 'tweet selected' : 'tweet'}>
            <div className="tweetCreator">
              <img src={tweetObj.creatorPicURL} alt="user-profile" />
              <span>{tweetObj.creatorName}</span>
            </div>
            {tweetObj.tweetIdReplyTo && (
              <div style={{ marginBottom: 5, color: '#6d6d6d' }}>
                Replying to{' '}
                <span style={{ color: '#33691e', fontWeight: 'bold' }}>
                  @{tweetObj.usernameReplyTo}
                </span>
              </div>
            )}
            <h4>{tweetObj.text}</h4>
            {tweetObj.attachmentURL && (
              <img alt={tweetObj.text} src={tweetObj.attachmentURL} />
            )}
            {isOwner && (
              <TweetOwnerActions
                tweetObj={tweetObj}
                setReplyCnt={setReplyCnt}
                toggleEditing={toggleEditing}
              />
            )}
            <TweetActions
              tweetObj={tweetObj}
              userObj={userObj}
              setRetweet={setRetweet}
              retweet={retweet}
              setReply={setReply}
              reply={reply}
              replyCnt={replyCnt}
            />
          </div>
          {reply ? <Reply userObj={userObj} tweetId={tweetObj.id} /> : null}
        </>
      )}
    </div>
  );
};

export default Tweet;
