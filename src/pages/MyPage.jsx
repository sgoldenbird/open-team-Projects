import { useEffect, useState } from 'react';
import axios from 'axios';
import logoImg from '../assets/logo3-1.png';
import { IoFootsteps } from 'react-icons/io5';
import { useRecoilState } from 'recoil';
import {
  userNameState,
  duplicationState,
  duplicationMessageState,
} from '../recoil/RecoilUserName';
import Header from '../components/common/header/Header';
import Card1 from '../components/common/card/Card1';
import add from '../assets/add1.jpg';
import auction from '../assets/auction2.jpg';
import heart from '../assets/heart1.jpg';
import chat from '../assets/chat1.jpg';
import {
  changeUserInfo,
  fetchRating,
  fetchUserInfo,
  fetchUserNames,
} from '../api/UserInfoAPI';

const MyPage = () => {
  const [image, setImage] = useState(logoImg);
  const [isEditing, setIsEditing] = useState(false);
  const [userName, setUserName] = useRecoilState(userNameState);
  const [address, setAddress] = useState({
    zipcode: '',
    state: '',
    city: '',
    district: '',
    detail: '',
  });

  const [isDuplicate, setIsDuplicate] = useRecoilState(duplicationState);
  const [duplicationMessage, setDuplicationMessage] = useRecoilState(
    duplicationMessageState,
  );
  const [ratings, setRatings] = useState([]);
  const [registerMessage, setRegisterMessage] = useState('');
  // const API_URL = 'http://localhost:8080';
  const S3URL = 'https://fresh-trash-s3.s3.ap-northeast-2.amazonaws.com';
  const API_URL = import.meta.env.VITE_API_URL;
  const [imgFile, setImgFile] = useState(null);

  //마이페이지 들어왔을때 유저정보 불러오기
  useEffect(() => {
    const getUserInfo = async () => {
      const myInfo = await fetchUserInfo();

      setUserName(myInfo.data.nickname);
      setAddress(myInfo.data.address);
      setRatings(myInfo.data.rating);
      setImage(myInfo.data.fileName);
      console.log(myInfo);
      console.log(myInfo.data.fileName);
      console.log(image);

      if (myInfo.data.address === null) {
        setAddress({
          zipcode: '',
          state: '',
          city: '',
          district: '',
          detail: '',
        });
      }
    };
    getUserInfo();
  }, []);

  //함수들-----------------------------------------------------------
  const handleEditProfile = () => {
    setIsEditing(true);
  };

  //유저정보 변경
  const handleChangeUserInfo = async e => {
    e.preventDefault();
    setIsEditing(false);
    const changeMyInfo = await changeUserInfo(
      userName,
      address,
      image,
      setRegisterMessage,
    );
    console.log(changeMyInfo);
    setUserName(changeMyInfo.data.nickname);
    setAddress(changeMyInfo.data.address);
    setImage(changeMyInfo.data.fileName);
    console.log(changeMyInfo.data.fileName);
  };
  console.log('이미지.jpg:' + image);

  //이미지 변경
  const handleImageChange = async e => {
    const file = e.target.files[0];
    console.log(file);
    setImage(file);
    setImgFile(file);
  };

  //이미지 파일 경로-----------------------------
  const getImgUrl = fileName => {
    console.log(fileName);
    // return `${S3URL}/${fileName}`;
    return `${API_URL}/imgs/${fileName}`;
  };

  //이미지삭제
  const handleDeleteImage = async () => {
    try {
      // Call the backend API to update user information with null image
      await changeUserInfo(userName, address, null, setRegisterMessage);
      // If update is successful, set image state to null locally
      setImage(null);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleUserNameChange = e => {
    setUserName(e.target.value);
    setIsDuplicate(false);
    setDuplicationMessage('');
  };

  //닉네임 중복확인
  const handleDuplication = async userName => {
    fetchUserNames(
      setIsDuplicate,
      setDuplicationMessage,
      userName,
      setUserName,
      setRegisterMessage,
    );
  };

  const handleSearchAddress = () => {
    new window.daum.Postcode({
      oncomplete: handleAddressChange,
    }).open();
  };

  const handleAddressChange = data => {
    const newAddress = {
      zipcode: data.zonecode,
      state: data.sido,
      city: data.sigungu,
      district: data.bname,
      detail: data.buildingName,
    };
    setAddress(newAddress);
    if (newAddress === null) {
      setAddress({
        zipcode: '',
        state: '',
        city: '',
        district: '',
        detail: '',
      });
    }
  };

  //사용자 평점 프론트에서 구할때--------------------------------------------------------
  // useEffect(() => {
  //   const fetchRatings = async () => {
  //     try {
  //       const response = await axios.get('http://localhost:3000/ratings');
  //       const ratingsArray = response.data;
  //       setRatings(ratingsArray);
  //     } catch (error) {
  //       console.error('Error fetching ratings: ', error);
  //     }
  //   };
  //   fetchRatings();
  // }, []);

  // const averageRating = () => {
  //   if (ratings.length > 0) {
  //     const totalRating = ratings.reduce((sum, rating) => sum + rating.rate, 0);
  //     const average = (totalRating / ratings.length).toFixed(1);
  //     return average;
  //   } else {
  //     return 'N/A'; //받은 평점이 하나도 없을때
  //   }
  // };

  //프론트 발자국 이동거리
  // const footstep = (averageRating() / 5) * 100 - (30 / greenBarWidth) * 100;
  // if (averageRating() === 0) {
  //   footstep = (averageRating / 5) * 100;
  // }

  //초록바의 길이를 100%로 -------------------------------------------------------------
  const [greenBarWidth, setGreenBarWidth] = useState(0);

  useEffect(() => {
    // Function to update the green bar width
    const updateGreenBarWidth = () => {
      const parentElement = document.querySelector('.ratingBar').parentElement;
      if (parentElement) {
        setGreenBarWidth(parentElement.offsetWidth);
      }
    };
    // Call the function once on mount
    updateGreenBarWidth();

    // Listen for window resize to update the width dynamically
    window.addEventListener('resize', updateGreenBarWidth);

    // Clean up event listener on unmount
    return () => window.removeEventListener('resize', updateGreenBarWidth);
  }, []);

  //백에서 평점 구할때
  const [fetchedAverageRating, setFetchedAverageRating] = useState(null);

  useEffect(() => {
    const fetchAndCalculateFootstep = async () => {
      try {
        const fetchedRating = await fetchRating();
        if (fetchedRating !== null) {
          setFetchedAverageRating(fetchedRating);
        }
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };

    fetchAndCalculateFootstep(); // Call the function to fetch and calculate footstep
  }, [fetchRating]);

  // 백 발자국 이동거리
  let footstep = (fetchedAverageRating / 5) * 100 - (30 / greenBarWidth) * 100;
  if (fetchedAverageRating === 0) {
    footstep = (fetchedAverageRating / 5) * 100;
  }

  //JSX-------------------------------------------------------------
  return (
    <div>
      <Header />

      <div className="px-5">
        <div className="md:flex">
          {/* 프로필 이미지------------------------------------------------------------------------- */}
          <div className="avatar flex flex-col pt-5">
            {/* <div className="w-72 rounded-full mx-auto md:mx-10 ">
              <img
                src={getImgUrl(image)}
                alt=""
                className={'w-full h-full object-cover'}
              />
              {console.log(getImgUrl(image))}
            </div> */}
            {isEditing ? (
              <div className="w-72 rounded-full mx-auto md:mx-10 ">
                <img
                  src={imgFile && URL.createObjectURL(imgFile)}
                  alt=""
                  className={'w-full h-full object-cover'}
                />
                {/* {console.log(getImgUrl(image))} */}
              </div>
            ) : (
              <div className="w-72 rounded-full mx-auto md:mx-10 ">
                <img
                  src={getImgUrl(image)}
                  alt=""
                  className={'w-full h-full object-cover'}
                />
                {console.log(getImgUrl(image))}
              </div>
            )}
            <button
              className="btn btn-wide mx-auto mt-2 md:mx-14"
              onClick={isEditing ? handleChangeUserInfo : handleEditProfile}
              disabled={isEditing && isDuplicate}
            >
              {isEditing ? '프로필 수정 완료' : '프로필 수정'}
            </button>
            {isEditing && (
              <button className="mx-auto mt-2 md:mx-14">
                {!image || image === logoImg ? (
                  <label htmlFor="avatarInput" className="btn btn-wide">
                    <p>이미지 업로드</p>
                    <input
                      type="file"
                      id="avatarInput"
                      className="file-input file-input-bordered hidden"
                      accept=".jpg, .png, .jpeg"
                      onChange={handleImageChange}
                    />
                  </label>
                ) : (
                  <button onClick={handleDeleteImage} className="btn btn-wide">
                    이미지 삭제
                  </button>
                )}
              </button>
            )}
            {registerMessage === '에러' && (
              <p className="text-red-400 text-center">{registerMessage}</p>
            )}
          </div>

          <div className="w-full flex flex-col">
            <div className="mx-auto mt-8 md:mx-14">
              <div className="flex items-center">
                <input
                  type="text"
                  placeholder="닉네임"
                  className={`input input-bordered ${isEditing ? 'mb-2' : 'mb-5'} `}
                  value={userName}
                  onChange={handleUserNameChange}
                  disabled={!isEditing}
                />
                {isEditing && (
                  <button
                    onClick={() => handleDuplication(userName)}
                    className="btn btn-sm ml-2"
                  >
                    중복확인
                  </button>
                )}
              </div>
              {isEditing && (
                <div
                  className={`mb-5 w-fit ${isDuplicate ? 'text-red-400' : 'text-blue-400'}`}
                >
                  {duplicationMessage}
                </div>
              )}

              <div className="addr flex flex-col mx-auto">
                <div className="addr1 flex mb-2 items-center">
                  <input
                    type="text"
                    placeholder="주소검색"
                    className="input input-bordered w-80"
                    value={`${address.zipcode} ${address.state} ${address.city} ${address.district}`}
                    onChange={handleAddressChange}
                    disabled={!isEditing}
                    readOnly
                  />
                  {isEditing && (
                    <button
                      onClick={handleSearchAddress}
                      className="btn btn-sm ml-2"
                    >
                      주소검색
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="상세주소"
                  className="input input-bordered w-80"
                  disabled={!isEditing}
                  value={address.detail}
                  onChange={e =>
                    setAddress(prevAddress => ({
                      ...prevAddress,
                      detail: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* 평점----------------------------------------------------------------------------------------- */}
        <div className="rating flex flex-col mt-14">
          <div className="flex justify-between mb-2">
            <div className="my-rating rounded-lg p-2 bg-green-paleaqua ">
              {userName}의 평점
            </div>
            <div className="rating-value rounded-lg p-2 bg-green-paleaqua ">
              {/*프론트에서 구할때 {averageRating()} / 5 */}
              {fetchedAverageRating} / 5
            </div>
          </div>

          <div>
            <div className="ratingBar relative h-8 rounded-lg bg-gradient-to-br from-green-200 via-green-700 to-green-950 ">
              <IoFootsteps
                className={`absolute text-3xl rotate-90 text-white-ivory`}
                style={{ left: `${footstep}%` }}
              />
            </div>
          </div>
        </div>

        {/* 나의 목록들----------------------------------------------------------------------------------------- */}
        <div className="cards bg-white py-10 mt-5">
          <Card1
            image={add}
            title="나의 거래 내역"
            phrase="My Trade List"
            link="MyTradeList"
          />
          <Card1
            image={auction}
            title="나의 경매 내역"
            phrase="My Auction List"
            link="MyAuctionList"
          />
          <Card1
            image={heart}
            title="나의 관심 목록"
            phrase="MY Likes"
            link="MyLikes"
          />
          <Card1
            image={chat}
            title="나의 채팅 목록"
            phrase="My Chat List"
            link="ChatList"
          />
        </div>
      </div>
    </div>
  );
};

export default MyPage;
