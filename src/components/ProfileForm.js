import { faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { authService, storageService } from 'fbase';
import { updateProfile } from 'firebase/auth';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const ProfileForm = ({ userObj, refreshUser }) => {
  const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
  const [newProfilePic, setNewProfilePic] = useState('');
  const navigate = useNavigate();

  const onLogOutClick = () => {
    authService.signOut();
    navigate('/');
  };

  const onChange = (e) => {
    const {
      target: { value },
    } = e;
    setNewDisplayName(value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    let profilePicURL = '';
    if (newProfilePic !== '') {
      const profileRef = ref(storageService, `${userObj.uid}/profile`);
      const response = await uploadString(
        profileRef,
        newProfilePic,
        'data_url'
      );
      profilePicURL = await getDownloadURL(response.ref);
    }

    if (userObj.displayName !== newDisplayName) {
      if (profilePicURL !== '') {
        // console.log('이름 사진 변경');
        await updateProfile(authService.currentUser, {
          displayName: newDisplayName,
          photoURL: profilePicURL,
        });
      } else {
        // console.log('이름 변경');
        await updateProfile(authService.currentUser, {
          displayName: newDisplayName,
        });
      }
      refreshUser();
    } else if (profilePicURL !== '') {
      // console.log('사진 변경');
      await updateProfile(authService.currentUser, {
        photoURL: profilePicURL,
      });
      refreshUser();
    }

    setNewProfilePic('');
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
      setNewProfilePic(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <form onSubmit={onSubmit} className="profileForm">
        {newProfilePic && (
          <div style={{ alignSelf: 'center' }}>
            <img
              src={newProfilePic}
              alt="profile-pic"
              style={{
                width: 60,
                padding: 10,
                backgroundImage: newProfilePic,
              }}
            />
          </div>
        )}
        <label
          htmlFor="profile-img"
          className="factoryInput__label"
          style={{ textAlign: 'center' }}
        >
          <span>Edit Profile Picture</span>
          <FontAwesomeIcon icon={faPen} />
        </label>
        <input
          id="profile-img"
          type="file"
          accept="image/*"
          onChange={onFileChange}
          style={{
            opacity: 0,
          }}
        />
        <input
          type="text"
          value={newDisplayName}
          placeholder="Display name"
          onChange={onChange}
          autoFocus
          className="formInput"
        />
        <input
          type="submit"
          value="Update Profile"
          className="formBtn"
          style={{
            marginTop: 10,
          }}
        />
      </form>
      <span onClick={onLogOutClick} className="formBtn cancelBtn logOut">
        Log Out
      </span>
    </>
  );
};

export default ProfileForm;
