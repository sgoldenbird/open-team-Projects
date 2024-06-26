import React, { useState } from 'react';
import { GoHeart } from 'react-icons/go';
import { GoHeartFill } from 'react-icons/go';
import { useRecoilState } from 'recoil';
import { postsState } from '../../recoil/RecoilWastes';
import { updatePost } from '../../api/WastesApi';
import { Link } from 'react-router-dom';
const API_URL = import.meta.env.REACT_APP_API_URL;
const ProductCard = ({ wastes, onDelete }) => {
  // const data=new Buffer(wastes.fileName,'binary').toString('base64');
  const handleDeleteClick = () => {
    onDelete(wastes.id);
  };
  // const [posts, setPosts] = useRecoilState(postsState);

  // const handleLikeToggle = async () => {
  //   const updatedPost = { ...wastes };
  //   if (updatedPost.hearted) {
  //     updatedPost.likeCount -= 1; // 채워진 하트에서 빈 하트로 변경되면 likeCount 감소
  //   } else {
  //     updatedPost.likeCount += 1; // 빈 하트에서 채워진 하트로 변경되면 likeCount 증가
  //   }
  //   updatedPost.hearted = !updatedPost.hearted; // 하트 상태 업데이트
  //   await updatePost(wastes.id, updatedPost); // 서버에 업데이트 요청
  //   const updatedPosts = posts.map(p => (p.id === wastes.id ? updatedPost : p));
  //   setPosts(updatedPosts); // Recoil 상태 업데이트
  // };

  const getImgeUrl = fileName => {
    return `${API_URL}/imgs/${fileName}`;
  };
  return (
    <div className="card w-80 bg-base-100 shadow md:w-72 xl:w-70 2xl:w-80 ">
      <figure className="w-full h-40 md:h-36 xl:h-48 2xl:h-56 overflow-hidden">
        {/* <img src={`data:image/png;base64,${wastes.fileName}`} alt="이미지" /> */}
        {/* <img
          src="https://daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.jpg"
          alt="Shoes"
        /> */}
        <img
          src={getImgeUrl(wastes.fileName)}
          className="object-cover w-full h-full"
          alt={wastes.title}
        />
        {/* <img src={getImgeUrl(wastes.fileName)} alt="" /> */}
      </figure>
      <div className="card-body">
        <div className="bg-white w-20 text-[var(--yellow-saffron)] font-semibold text-xs py-1 px-2 border border-[var(--yellow-saffron)] rounded">
          {wastes.sellStatus}
        </div>

        <div className="card-title mb-3">{wastes.title}</div>

        <div className="flex justify-between mb-3">
          <div className="flex gap-2">
            <span>{wastes.address.state}</span>
            <span>{wastes.address.district}</span>
          </div>
          <div className="flex items-center">
            <button className="mr-2">
              {/* <button onClick={handleLikeToggle} className="mr-2"> */}{' '}
              {/* {wastes.hearted ? (
                <GoHeartFill size="30" color="green" />
              ) : (
                <GoHeart size="30" color="green" />
              )} */}
            </button>
            <div>관심수 {wastes.likeCount}</div>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-2xl font-bold text-gray-900 ">
            {wastes.wastePrice}원
          </span>
          {/* <Link
            to={`/ProductDetail/${wastes.id}`}
            className="text-white bg-green-900 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  "
          >
            상세보기
          </Link> */}
          <a
            href={`/ProductDetail/${wastes.id}`}
            onClick={() => {
              window.location.href = `/ProductDetail/${wastes.id}`;
            }}
            className="text-white bg-green-900 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  "
          >
            상세보기
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
