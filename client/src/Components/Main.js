import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Post from "./Modules/Post";

function Main() {
  const api = process.env.REACT_APP_API_BASE_URL;
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [onEdit, setOnEdit] = useState(false);
  const [content, setContent] = useState("");
  const [me, setMe] = useState();
  const navigator = useNavigate();

  const validateForm = () => {
    const updatedErrors = {
      content: content.trim() === "",
    };

    return Object.values(updatedErrors).every((error) => !error);
  };

  const getPosts = async () => {
    try {
      const response = await fetch(`${api}/posts`, {
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
      setPosts(data);
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const getMe = async () => {
    try {
      const response = await fetch(`${api}/user/${user._id}`, {
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
      setMe(data);
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isFormValid = validateForm();

    if (!isFormValid) {
      return;
    }
    try {
      const response = await fetch(`${api}/post/create_post`, {
        method: "POST",
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
      getPosts();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigator("/");
    }
    getPosts();
    getMe();
  }, []);

  return (
    <div className="main">
      <div className="profile-card">
        <div>
          {!me?.photo ? (
            <p>Image</p>
          ) : (
            <img src={me?.photo} alt="user-image"></img>
          )}
        </div>
        <h1>{me?.username || me?.email}</h1>
        <p>{me?.friends.length} friends</p>
        <div className="links">
          <Link to="/profile">View profile</Link>
          <Link to="/friends">View friends</Link>
        </div>
      </div>
      <div className="posts">
        <button onClick={() => setOnEdit(true)}>+ Create post</button>
        {posts.map((post) => (
          <Post post={post} key={post._id} />
        ))}
      </div>
      <div className="copyright-card">
        <p>Copyright © 2023 sungjinfcc</p>
        <a
          href="https://github.com/sungjinfcc"
          target="_blank"
          rel="noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} className="fa-github" />
        </a>
      </div>
      {onEdit ? (
        <>
          <div className="modal">
            <form>
              <h1>Create a post</h1>
              <textarea
                id="content"
                type="text"
                placeholder="What's on your mind?"
                rows="3"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <button onClick={handleSubmit}>Post</button>
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

export default Main;
