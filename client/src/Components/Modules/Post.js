import React, { useState } from "react";
import { useAuth } from "../../authContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

function Post({ post }) {
  const api = process.env.REACT_APP_API_BASE_URL;
  const formattedDate = formatDate(post.timestamp);
  const [error, setError] = useState(null);
  const { token, user } = useAuth();
  const [onEdit, setOnEdit] = useState(false);
  const [onCommentEdit, setOnCommentEdit] = useState(false);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [comments, setComments] = useState([]);
  const imageUrl = `${process.env.PUBLIC_URL}/assets/person_icon.png`;
  const [formErrors, setFormErrors] = useState({
    content: "",
    message: "",
  });
  const handleUpdate = async (event) => {
    event.preventDefault();

    if (content.trim() === "") {
      setFormErrors({
        content: "This field is required",
      });
      return;
    }
    try {
      const response = await fetch(`${api}/post/${post._id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      setContent("");
      setOnEdit(false);
      window.location.reload();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const handleDelete = async () => {
    try {
      const response = await fetch(`${api}/post/${post._id}/delete`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      window.location.reload();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const handleLike = async () => {
    try {
      const response = await fetch(`${api}/post/${post._id}/like_post`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      window.location.reload();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const handlePost = async () => {
    if (message.trim() === "") {
      setFormErrors({
        message: "This field is required",
      });
      return;
    }
    try {
      const response = await fetch(`${api}/${post._id}/create_comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      setMessage("");
      setOnCommentEdit(false);
      window.location.reload();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const getComments = async () => {
    try {
      const response = await fetch(`${api}/${post._id}/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }

      const data = await response.json();
      setComments(data);
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  return (
    <div className="post">
      {error && <p className="error-message">{error}</p>}
      <div className="user">
        <div className="img-div">
          {!post.author?.photo ? (
            <img src={imageUrl} alt="default" className="responsive"></img>
          ) : (
            <img
              src={api + post?.author?.photo}
              alt="user"
              className="responsive"
            ></img>
          )}
        </div>
        <div>
          <p className="name">
            {post.author?.username || post.author?.email || "user deleted"}
          </p>
          <p className="date">{formattedDate}</p>
        </div>
        {post.author?._id === user._id && (
          <div className="buttons">
            <button
              onClick={() => {
                setOnEdit(true);
                setContent(post.content);
              }}
              className="edit"
            >
              Edit
            </button>
            <button onClick={() => handleDelete()} className="delete">
              Delete
            </button>
          </div>
        )}
      </div>
      <div className="content">
        <p className="message">{post.content}</p>
        <div className="numbers">
          <p className="like">
            <FontAwesomeIcon icon={faHeart} /> {post.likedUsers.length}
          </p>
          <p>{post.comments.length} comments</p>
        </div>
      </div>
      <div className="buttons extra">
        <button onClick={() => handleLike()}>
          {post.likedUsers.some((likedUser) => likedUser._id === user._id)
            ? "Liked"
            : "Like"}
        </button>
        <button
          onClick={() => {
            if (!onCommentEdit && post.comments.length > 0) {
              getComments();
            }
            setOnCommentEdit(!onCommentEdit);
            setMessage("");
          }}
        >
          Comment
        </button>
      </div>
      {onCommentEdit ? (
        <div>
          <form className="comment-form">
            <input
              id="message"
              type="text"
              placeholder="Add a comment"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={() => handlePost()}>Post</button>
            {formErrors.message !== "" && (
              <p className="error-message">{formErrors.message}</p>
            )}
          </form>
          {comments.map((comment) => (
            <div className="comment" key={comment._id}>
              <p>
                {comment.author?.username ||
                  comment.author?.email ||
                  "user deleted"}
              </p>
              <p className="message">{comment.message}</p>
              <p>{formatDate(comment.timestamp)}</p>
            </div>
          ))}
        </div>
      ) : null}

      {onEdit ? (
        <>
          <div className="modal">
            <form>
              <h1>Update a post</h1>
              <textarea
                id="content"
                type="text"
                placeholder="What's on your mind?"
                rows="3"
                value={content}
                maxLength={200}
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={handleUpdate}>Update</button>
              {formErrors.content !== "" && (
                <p className="error-message">{formErrors.content}</p>
              )}
            </form>
          </div>
          <div
            className="overlay"
            onClick={() => {
              setOnEdit(false);
              setContent("");
            }}
          ></div>
        </>
      ) : null}
    </div>
  );
}

export default Post;
