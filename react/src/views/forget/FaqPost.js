import React, { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import axios from "../../plugins/axios";
import "./Post.css";
import CareerBoardTable from "../../component/CareerBoardTable";
import moment from "moment"; //날짜 수정하기 위해 모멘트 설치
import CommentList from "../../component/CommentList"; //댓글 수정하면 나오는 입력창

import { FaThumbsUp } from "react-icons/fa";
import { FaThumbsDown } from "react-icons/fa";

import useStore from "../../plugins/store";

function FaqPost() {

  const store = useStore();
  const nickname = (useStore.getState().member !== null) ? useStore.getState().member.nickname : null;



  const params = useParams();
  const postNo = params.postno;
  const location = useLocation();
  const navigate = useNavigate();

  console.log(location);
  const idx = location.pathname.indexOf("/", 1);
  console.log(idx);
  const boardGroup = location.pathname.slice(1, idx);
  console.log(boardGroup);

  const idx2 = location.pathname.indexOf("/", idx + 1);
  console.log(idx2);

  const boardName = location.pathname.slice(idx + 1, idx2);
  console.log(boardName);

  const [postObject, setPostObject] = useState(null);
  const [comments, setComments] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [updateClicked, setUpdateClicked] = useState(false);
  const [sendComment, setSendComment] = useState(false);
  const [postRecommendOrNot, setPostRecommentOrNot] = useState(false);
  const [replyRecommendOrNot, setReplyRecommentOrNot] = useState(false);

  useEffect(() => {
    getPost(postNo);
  }, []);

  const getPost = function (postNo) {
    axios
      .get(`/${boardName}/${postNo}`)
      .then((response) => {
        console.log(response.data);

        const post = response.data;
        post.postRegdate = dateFormat(new Date(post.postRegdate));

        for (const reply of post.replies) {
          reply.replyRegdate = dateFormat(new Date(reply.replyRegdate));
        }

        setPostObject(post);
        setComments(post.replies);
      })
      .catch((error) => {
        console.log(error);
      });
  };
  function dateFormat(date) {
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    month = month >= 10 ? month : "0" + month;
    day = day >= 10 ? day : "0" + day;
    hour = hour >= 10 ? hour : "0" + hour;
    minute = minute >= 10 ? minute : "0" + minute;
    second = second >= 10 ? second : "0" + second;

    return `${date.getFullYear()}-${month}-${day} ${hour}:${minute}:${second}`;
  }

  // 게시글 삭제
  const deletePost = (postNo) => {

    axios.delete(`/${boardName}/${postNo}/${nickname}`).then(() => {
      navigate(-1);
    });
  };


  const addComment = async function () {
    const formData = new FormData();

    formData.append("content", newComment);
    formData.append("nickname", nickname);

    await axios
      .post(`/${boardName}/${postNo}/reply`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        window.location.reload();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  //댓글 삭제
  const deleteReply = async function (replyNo) {
    await axios({
      method: "DELETE",
      url: `/${boardName}/${postNo}/reply/${replyNo}/${nickname}`,
    }).then(() => {
      setComments(
        comments.filter((val) => {
          return val.replyNo !== replyNo;
        })
      );
      window.location.reload();
    });
  };

  //댓글 수정
  const updateReply = async function (updatedComment, replyNo) {
    const formData = new FormData();
    formData.append("content", updatedComment);
    formData.append("nickname", nickname);

    await axios
      .put(`/${boardName}/${postNo}/reply/${replyNo}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        window.location.reload();
      });
  };

  // const nickname = "닉네임51";

  //추천 버튼 함수   //게시글 추천 //댓글 추천
  const addLike = async (type, targetNo, nickname) => {
    const formData = new FormData();
    formData.append("nickname", nickname);

    await axios
      .post(`/${boardName}/recomm/${type}/${targetNo}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteLike = async (type, targetNo, nickname) => {
    await axios
      .delete(`/${boardName}/recomm/${type}/${targetNo}/${nickname}`)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //추천 추가 ---- 추천 취소 토글 버튼

  return (
    <div className="postContainer">
      {postObject && (
        <div className="postSection">
          <CareerBoardTable moment={moment} tableData={postObject} />
          <div>
            {postObject !== null && nickname === postObject.nickname && (
              <div className="commentAddBtnWrapper">
                <button
                  className="commentAddBtn"
                  onClick={() => {
                    deletePost(postObject.postNo);
                  }}
                >
                  삭제
                </button>
                <button
                  className="commentAddBtn"
                  onClick={() => {
                    navigate("update");
                  }}
                >
                  수정
                </button>
              </div>
            )}
          </div>
          {/* 로그인한 닉네임의 유저가 게시글을 추천한경우 / 아직 안한경우  */}
          {postObject !== null && !postRecommendOrNot ? (
            <FaThumbsUp
              className="recommend"
              onClick={() => {
                addLike("post", postObject.postNo, nickname);
                setPostRecommentOrNot(!postRecommendOrNot);
              }}
            />
          ) : (
            <FaThumbsDown
              className="notRecommend"
              onClick={() => {
                deleteLike("post", postObject.postNo, nickname);
                setPostRecommentOrNot(!postRecommendOrNot);
              }}
            />
          )}

          <div className="listOfComments">
            {postObject != null &&
              postObject.replies.map((reply, index) => {
                return (
                  <div className="comment" key={index}>
                    <div className="commentNickname">{reply.nickname}</div>
                    {updateClicked === true ? (
                      <CommentList
                        sendComment={sendComment}
                        updateReply={updateReply}
                        reply={reply}
                      />
                    ) : (
                      <div>{reply.replyContent}</div>
                    )}
                    <span className="commentTime">
                      {moment(reply.replyRegdate).format("LLL")}
                    </span>
                    <span>
                      {nickname === reply.nickname && (
                        <div className="commentAddBtnWrapper">
                          <button
                            className="commentAddBtn"
                            onClick={() => {
                              setUpdateClicked(!updateClicked);
                            }}
                          >
                            {updateClicked ? "취소" : "수정"}
                          </button>
                          {updateClicked ? (
                            <button
                              className="commentAddBtn"
                              onClick={() => {
                                setSendComment(true);
                              }}
                            >
                              수정
                            </button>
                          ) : (
                            <button
                              className="commentAddBtn"
                              onClick={() => {
                                deleteReply(reply.replyNo);
                              }}
                            >
                              삭제
                            </button>
                          )}
                        </div>
                      )}
                      {/* db에서 회원 댓글 추천 유무 확인 */}
                      {nickname !== reply.nickname && (
                        <div className="replyRecommentContainer">
                          {!replyRecommendOrNot ? (
                            <FaThumbsUp
                              className="replyRecommend"
                              onClick={() => {
                                addLike("reply", reply.replyNo, nickname);
                                setReplyRecommentOrNot(!replyRecommendOrNot);
                              }}
                            />
                          ) : (
                            <FaThumbsDown
                              className="replyNotRecommend"
                              onClick={() => {
                                deleteLike("reply", reply.replyNo, nickname);
                                setReplyRecommentOrNot(!replyRecommendOrNot);
                              }}
                            />
                          )}
                        </div>
                      )}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className="commentSection">
            <div className="commentNickname">{nickname}</div>
            <div className="commentInputWrapper">
              <input
                className="commentInputBox"
                type="text"
                placeholder="댓글을 남겨보세요"
                autoComplete="off"
                value={newComment}
                onChange={(event) => {
                  setNewComment(event.target.value);
                }}
              ></input>
              <div className="commentAddBtnWrapper">
                <button
                  className="commentAddBtn"
                  onClick={() => {
                    addComment();
                  }}
                >
                  등록
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FaqPost;
