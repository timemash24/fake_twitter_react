import { faPencilAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dbService, storageService } from 'fbase';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { deleteObject, ref } from 'firebase/storage';

const TweetOwnerActions = ({ tweetObj, setReplyCnt, toggleEditing }) => {
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
  return (
    <div className="tweet__edits">
      <span onClick={onDeleteClick}>
        <FontAwesomeIcon icon={faTrash} />
      </span>
      <span onClick={toggleEditing}>
        <FontAwesomeIcon icon={faPencilAlt} />
      </span>
    </div>
  );
};

export default TweetOwnerActions;
