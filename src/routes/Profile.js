import ProfileForm from 'components/ProfileForm';
import ProfileTweets from 'components/ProfileTweets';

const Profile = ({ refreshUser, userObj }) => {
  return (
    <div className="container">
      <ProfileForm userObj={userObj} refreshUser={refreshUser} />
      <ProfileTweets userObj={userObj} />
    </div>
  );
};

export default Profile;
