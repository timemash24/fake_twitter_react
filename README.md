## Cloning Twitter with React and Firebase
Demo Site 🔗 https://timemash24.github.io/fake_twitter_react/


## 사용스택
<img src="https://img.shields.io/badge/Firebase 9.10.0-FFCA28?style=for-the-badge&logo=firebase&logoColor=white"/> <img src="https://img.shields.io/badge/React 18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white"/> <img src="https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=white"/> <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/> <img src="https://img.shields.io/badge/CSS3-572B6?style=for-the-badge&logo=css3&logoColor=white"/>


## 구현 화면
<img src="https://user-images.githubusercontent.com/56548122/195624682-ca9bd323-170b-428e-8052-fba41e9d3a87.PNG" width="50%" height="50%" />
<img src="https://user-images.githubusercontent.com/56548122/195624689-ea22d36c-1ff4-44ff-9db1-04d3194495e0.PNG" width="50%" height="50%" />
<img src="https://user-images.githubusercontent.com/56548122/195624693-e17bec41-1870-4fee-8207-be7500738c09.PNG" width="50%" height="50%" />

## 기능 설명
- 회원가입 & 로그인
  - Firebase auth 활용하여 이메일 회원가입 후 로그인 또는 구글, 깃허브 로그인 가능
  - 로그인 후 홈화면으로 이동하여 트윗 작성 가능

- 새로운 트윗 작성하기
  - 이미지 파일과 함께 게시 가능
  - Firebase firestore에 트윗 정보, storage에 이미지 저장 후 활용하여 실시간 업데이트
  - 작성자의 프로필 사진과 이름 표시

- 트윗 관련 기능들
  - firestore에 저장된 트윗 정보 활용하여 본인이 작성한 트윗만 수정, 삭제 가능하고 실시간 업데이트
  - 좋아요, 리트윗 한 유저 수와 답글로 달린 트윗 수 표시
  - 답글 아이콘 클릭시 답글 트윗 하단에 보여주기
  - 답글은 답하고자 하는 트윗의 작성자 표시하기

- 마이페이지
  - auth, firestore, storage 활용하여 사용자 프로필 이름과 사진 수정 기능과 로그아웃
  - My Tweets: 사용자가 작성한 트윗과 리트윗한 트윗 모아보기
  - Liked Tweets: 사용자가 좋아요를 누른 트윗 모아보기
