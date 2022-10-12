const TweetEdit = ({
  newTweet,
  setNewTweet,
  onSubmit,
  toggleEditing,
  isOwner,
}) => {
  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setNewTweet(value);
  };
  return (
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
              <input type="submit" value="Update tweet" className="formBtn" />
            </form>
          }
        </>
      )}
      <span onClick={toggleEditing} className="formBtn cancelBtn">
        Cancel
      </span>
    </div>
  );
};

export default TweetEdit;
