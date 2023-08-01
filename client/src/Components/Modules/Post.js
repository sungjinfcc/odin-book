import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../authContext";

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
  const validateForm = () => {
    const updatedErrors = {
      content: content.trim() === "",
    };

    return Object.values(updatedErrors).every((error) => !error);
  };
  const handleUpdate = async (event) => {
    event.preventDefault();
    const isFormValid = validateForm();

    if (!isFormValid) {
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
      <div className="user">
        <div>
          {!post?.author?.photo ? (
            <p>Image</p>
          ) : (
            <img src={post?.author?.photo} alt="user-image"></img>
          )}
        </div>
        <div>
          <p>{post?.author?.username || post?.author?.email}</p>
          <p>{formattedDate}</p>
        </div>
        <div className="buttons">
          <button
            onClick={() => {
              setOnEdit(true);
              setContent(post.content);
            }}
          >
            Edit
          </button>
          <button onClick={() => handleDelete()}>Delete</button>
        </div>
      </div>
      <div className="content">
        <p>{post.content}</p>
        <div className="numbers">
          <p>{post.likedUsers.length} liked</p>
          <p>{post.comments.length} comments</p>
        </div>
      </div>
      <div className="buttons">
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
          </form>
          {comments.map((comment) => (
            <div className="comment" key={comment._id}>
              <p>{comment.author?.username || comment.author?.email}</p>
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
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={handleUpdate}>Update</button>
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
