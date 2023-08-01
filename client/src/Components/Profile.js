import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";
import Post from "./Modules/Post";

function Profile() {
  const api = process.env.REACT_APP_API_BASE_URL;
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated } = useAuth();
  const [onEdit, setOnEdit] = useState(false);
  const [me, setMe] = useState();
  const [username, setUsername] = useState("");
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const navigator = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (username.trim() === "") {
      return;
    }
    try {
      const response = await fetch(`${api}/user/${user._id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });
      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      setUsername("");
      setOnEdit(false);
      getUser();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const getUser = async () => {
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
      setUsername(data.username);
      setFriends(data.friends);
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const getPosts = async () => {
    try {
      const response = await fetch(`${api}/post/by_user`, {
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

  useEffect(() => {
    if (!isAuthenticated) {
      navigator("/");
    }
    getUser();
    getPosts();
  }, []);

  return (
    <div className="profile">
      <div className="namecard">
        <div className="image-div">Img</div>
        <div className="name-div">
          {!onEdit ? (
            <h1>{username || "USERNAME"}</h1>
          ) : (
            <div>
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
              <button onClick={handleSubmit}>Save</button>
            </div>
          )}
          <p>{me?.friends.length} Friends</p>
        </div>
        <button onClick={() => setOnEdit(!onEdit)}>Edit</button>
      </div>
      <div className="contents">
        <div className="friends">
          {friends.map((friend) => (
            <p>{friend.username || friend.email}</p>
          ))}
        </div>
        <div className="posts">
          {posts.length === 0 && "No posts yet"}
          {posts.map((post) => (
            <Post post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
