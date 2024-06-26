import React, { useState, useEffect } from 'react';
import ChatList from './ChatList';
import ChatMenu from './ChatMenu';
import { AiFillAlert } from 'react-icons/ai';
import { MdOutlineNavigateBefore } from 'react-icons/md';
import { MdOutlineNavigateNext } from 'react-icons/md';

import { FiMoreVertical } from 'react-icons/fi';
import MessageContainer from './MessageContainer';
import {
  completePost,
  contentFetch,
  reportPost,
  statusChange,
} from '../../api/chat/api';
import { useParams } from 'react-router-dom';
// import { Stomp } from '@stomp/stompjs';
import { Client } from '@stomp/stompjs';
// import { stompClientSetup } from '../../api/stompServer';
const InputField = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { chatId, wasteId } = useParams();
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  //채팅 내용 api호출
  const [messageContent, setMessageContent] = useState([]);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    const fetchData = async (wasteId, chatId) => {
      try {
        const messageList = await contentFetch(wasteId, chatId);
        // setMessages(messageList);
        setMessageContent(messageList);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData(wasteId, chatId);
  }, [wasteId, chatId]);
  //판매완료
  const handleCompleted = async (wasteId, chatRoomId) => {
    await completePost(wasteId, chatRoomId);
  };
  //예약중 변경
  const handleBooking = async () => {
    await statusChange.sellStatus(chatId, 'BOOKING');
  };
  //판매중 변경
  const handleOngoing = async () => {
    await statusChange.sellStatus(chatId, 'ONGOING');
  };
  //신고하기
  const handleReport = async chatRoomId => {
    await reportPost(chatRoomId);
  };
  const [currentUser, setCurrentUser] = useState(null);
  //유저 정보 가져오기------------------------------------------------------
  useEffect(() => {
    // 현재 로그인한 사용자 정보 가져오기
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);
  // 로컬 스토리지에서 사용자 정보 가져오기-----------------------
  const getCurrentUser = () => {
    const userData = localStorage.getItem('access-token');

    try {
      const [header, payload, signature] = userData.split('.');

      const decodedPayload = atob(payload);

      const user = JSON.parse(decodedPayload);
      console.log(user);

      return user;
    } catch (error) {
      console.error('사용자 정보를 파싱하는 도중 오류가 발생했습니다:', error);
      return null;
    }
  };
  //웹소켓 연결----------------------------------------------------------------------------
  const [stompClient, setStompClient] = useState(null);

  const [inputMessage, setInputMessage] = useState('');
  // const access = localStorage.getItem('access-token');
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const stomp = new Client({
          brokerURL: 'ws://localhost:8080/chat-ws',
          // connectHeaders: {
          //   Authorization: `Bearer ${access}`,
          // },
          debug: str => {
            console.log(str);
          },
        });
        setStompClient(stomp);
        // console.log(stomp);
        // console.log(stompClient);
        stomp.activate();

        stomp.onConnect = () => {
          const subscriptionDestination = `/topic/chats.${chatId}`;

          stomp.subscribe(subscriptionDestination, msg => {
            // console.log(JSON.parse(msg.body).message);
            // console.log(JSON.parse(msg.body).createdAt);
            try {
              const parsedMessage = JSON.parse(msg.body);
              setMessages(prevMessages => [...prevMessages, parsedMessage]);
              console.log('WebSocket 연결이 열렸습니다.');
              console.log('수신한 메세지', parsedMessage);
            } catch (error) {
              console.error('오류가 발생했습니다:', error);
            }
          });
        };
        console.log(stompClient);
      } catch (error) {
        console.error('웹소켓 연결을 실패했습니다.', error);
      }
    };

    // 채팅 초기설정
    initializeChat();
    console.log(stompClient);

    // return () => {
    //   if (stompClient && stompClient.connected) {
    //     stompClient.deactivate();
    //   }
    // };
    // 컴포넌트 언마운트 시 연결 종료
    return () => {
      if (stompClient !== null) {
        stompClient.deactivate();
      }
    };
  }, [chatId]);

  //채팅 메세지 전송-------------------------------
  const sendMessage = (chatId, memberId) => {
    if (!inputMessage.trim()) return;
    console.log('전송한 메세지', inputMessage);
    const destination = `/app/${chatId}/message/${memberId}`;
    stompClient.publish({
      destination,
      body: JSON.stringify({
        message: inputMessage,
        // sender: currentUser,
      }),
    });

    setInputMessage('');
  };

  return (
    <div className="flex justify-center relative">
      <ChatMenu
        isOpen={isSidebarOpen}
        key={messageContent && messageContent.id}
        messageList={messageContent && messageContent}
      />
      {isSidebarOpen && <ChatList isOpen={isSidebarOpen} />}
      <div className=" z-30 h-screen flex flex-col w-7/12  ">
        <div className="bg-[var(--yellow-naples)] p-2  text-white flex justify-between  items-center ">
          <button
            className={`btn  text-black font-bold py-2 px-4    ${isSidebarOpen ? '' : ''}`}
            onClick={toggleSidebar}
          >
            {!isSidebarOpen ? (
              <MdOutlineNavigateBefore size={22} />
            ) : (
              <MdOutlineNavigateNext size={22} />
            )}
          </button>
          <p className="text-xl">
            '
            {messageContent &&
              messageContent.chatRoom &&
              messageContent.chatRoom.wasteTitle}
            ' 애물단지 채팅방
          </p>

          <div className="flex">
            <button
              className="btn m-1"
              onClick={() =>
                handleReport(
                  messageContent &&
                    messageContent.chatRoom &&
                    messageContent.chatRoom.id,
                )
              }
            >
              <AiFillAlert color="red" size={22} />
            </button>
            {currentUser &&
              messageContent &&
              messageContent.chatRoom &&
              currentUser.id === messageContent.chatRoom.sellerId && (
                <div className=" mr-2 dropdown dropdown-end text-black">
                  <button className="btn m-1">
                    <FiMoreVertical size={22} />
                  </button>
                  {messageContent &&
                  messageContent.chatRoom &&
                  messageContent.chatRoom.sellStatus !== 'CLOSE' ? (
                    <ul
                      tabIndex={0}
                      className="z-50 dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      {messageContent.chatRoom &&
                        messageContent.chatRoom.sellStatus !== 'CLOSE' && (
                          <li
                            onClick={() =>
                              handleCompleted(
                                messageContent.chatRoom &&
                                  messageContent.chatRoom.wasteId,
                                messageContent.chatRoom &&
                                  messageContent.chatRoom.id,
                              )
                            }
                          >
                            <p>판매완료</p>
                          </li>
                        )}
                      {messageContent.chatRoom &&
                      messageContent.chatRoom.sellStatus !== 'BOOKING' ? (
                        <li
                          onClick={() =>
                            handleBooking(
                              messageContent.chatRoom &&
                                messageContent.chatRoom.id,
                            )
                          }
                        >
                          <p> 예약중</p>
                        </li>
                      ) : (
                        <li
                          onClick={() =>
                            handleOngoing(
                              messageContent.chatRoom &&
                                messageContent.chatRoom.id,
                            )
                          }
                        >
                          <p> 판매중으로 변경</p>
                        </li>
                      )}
                    </ul>
                  ) : (
                    <ul
                      tabIndex={0}
                      className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                    >
                      <li>
                        <p>판매완료된 상품입니다.</p>
                      </li>
                    </ul>
                  )}
                </div>
              )}
          </div>
        </div>
        {/* 채팅 화면 */}
        <div
          className="bg-gray-100 h-full overflow-y-auto "
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <MessageContainer
            key={messages}
            messages={messages}
            messageContent={messageContent}
            user={currentUser}
            // partner={messageContent}
          />
        </div>
        {/* ------채팅입력----- */}
        <div className="bg-white p-4 flex items-center  ">
          <input
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder="채팅을 입력하세요"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none"
          />
          <button
            onClick={() =>
              sendMessage(
                messageContent &&
                  messageContent.chatRoom &&
                  messageContent.chatRoom.id,
                currentUser && currentUser.id,
              )
            }
            className="bg-gray-300 text-white rounded-full p-2 ml-2 focus:outline-none"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputField;
