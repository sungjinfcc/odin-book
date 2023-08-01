import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { useNavigate } from "react-router-dom";
import Post from "./Modules/Post";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCamera } from "@fortawesome/free-solid-svg-icons";

function Profile() {
  const api = process.env.REACT_APP_API_BASE_URL;
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated, logout } = useAuth();
  const [onEdit, setOnEdit] = useState(false);
  const [me, setMe] = useState();
  const [username, setUsername] = useState("");
  const [friends, setFriends] = useState([]);
  const [posts, setPosts] = useState([]);
  const navigator = useNavigate();
  const imageUrl = `${process.env.PUBLIC_URL}/assets/person_icon.png`;
  const [formErrors, setFormErrors] = useState({
    username: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (username.trim() === "") {
      setFormErrors({
        username: "This field is required",
      });
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
        setError(error.message);
        return;
      }
      setUsername("");
      setOnEdit(false);
      getUser();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`${api}/user/${user._id}/delete`, {
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
      logout();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
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
      setError(null);
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const addPhoto = async (event) => {
    const photoFile = event.target.files[0];
    const formData = new FormData();
    formData.append("photo", photoFile);

    try {
      const response = await fetch(`${api}/user/${user._id}/add_photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.message);
        return;
      }

      getUser();
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
      {error && <p className="error-message">{error}</p>}
      <div className="namecard">
        <div className="img-div">
          {!me?.photo ? (
            <img src={imageUrl} alt="default"></img>
          ) : (
            <img src={api + me?.photo} alt="user"></img>
          )}
          <label htmlFor="photo-input" className="add-photo">
            <FontAwesomeIcon icon={faCamera} />
          </label>
          <input
            type="file"
            id="photo-input"
            accept="image/*"
            onChange={addPhoto}
            style={{ display: "none" }}
          />
        </div>
        <div className="name-div">
          {!onEdit ? (
            <div className="name">
              <h1>{username || "Enter username"}</h1>
              <button onClick={() => setOnEdit(!onEdit)}>Edit</button>
            </div>
          ) : (
            <div className="name">
              <input
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></input>
              {formErrors.username !== "" && (
                <p className="error-message">{formErrors.username}</p>
              )}
              <button onClick={handleSubmit}>Save</button>
              <button onClick={() => setOnEdit(false)}>Cancel</button>
            </div>
          )}
          <p>{me?.friends.length} Friends</p>
          <button className="delete" onClick={() => handleDelete()}>
            Delete account
          </button>
        </div>
      </div>
      <div className="contents">
        <div className="friends">
          <h2>Friends</h2>
          {friends.map((friend) => (
            <div className="friend-card">
              {!friend?.photo ? (
                <img src={imageUrl} alt="default"></img>
              ) : (
                <img src={api + friend?.photo} alt="user"></img>
              )}
              <p>{friend.username || friend.email}</p>
            </div>
          ))}
        </div>
        <div className="posts">
          <h2>Posts</h2>
          {posts.length === 0 && "No posts yet"}
          {posts.map((post) => (
            <div>
              <Post post={post} />
              <div className="br"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Profile;
