import React, { useEffect, useState } from "react";
import { useAuth } from "../authContext";
import { Link, useNavigate } from "react-router-dom";

function Friends() {
  const api = process.env.REACT_APP_API_BASE_URL;
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated } = useAuth();
  const [userList, setUserList] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const navigator = useNavigate();

  const getUsers = async () => {
    try {
      const response = await fetch(`${api}/users`, {
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
      const me = data.find((userData) => userData._id === user._id);

      const otherUsers = data.filter(
        (userData) =>
          me.friends.every((friend) => friend._id !== userData._id) &&
          me.friendRequests.every((request) => request._id !== userData._id) &&
          userData.friendRequests.every((request) => request._id !== me._id) &&
          userData._id !== me._id
      );
      const sentRequestList = data.filter((userData) =>
        userData.friendRequests.some((request) => request._id === me._id)
      );
      setUserList(otherUsers);
      setFriends(me.friends);
      setFriendRequests(me.friendRequests);
      setSentRequests(sentRequestList);
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  const onAccept = async (friendId) => {
    try {
      const response = await fetch(`${api}/user/${user._id}/add_friend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      getUsers();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const onDeny = async (friendId) => {
    try {
      const response = await fetch(
        `${api}/user/${user._id}/delete_friend_request`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ friendId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      getUsers();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const onCancel = async (id) => {
    try {
      const response = await fetch(`${api}/user/${id}/delete_friend_request`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId: user._id }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      getUsers();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const onDelete = async (friendId) => {
    try {
      const response = await fetch(`${api}/user/${user._id}/delete_friend`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendId }),
      });

      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      getUsers();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };
  const onSend = async (friendId) => {
    try {
      const response = await fetch(
        `${api}/user/${user._id}/add_friend_request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ friendId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        setError(error.content);
        return;
      }
      getUsers();
    } catch (error) {
      setError("An unexpected error occurred. Please try again later.");
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigator("/");
    }
    getUsers();
  }, []);

  return (
    <div className="friends">
      <div className="friend-requests">
        <h1>Friend Requests</h1>
        {friendRequests.map((request) => (
          <div>
            <p>{request.username || request.email}</p>
            <button onClick={() => onAccept(request._id)}>Accept</button>
            <button onClick={() => onDeny(request._id)}>Deny</button>
          </div>
        ))}
      </div>
      <div className="request-sent">
        <h1>Sent requests</h1>
        {sentRequests.map((request) => (
          <div>
            <p>{request.username || request.email}</p>
            <button onClick={() => onCancel(request._id)}>
              Cancel request
            </button>
          </div>
        ))}
      </div>
      <div className="friends">
        <h1>Friends</h1>
        {friends.map((friend) => (
          <div>
            <p>{friend.username || friend.email}</p>
            <button onClick={() => onDelete(friend._id)}>Delete</button>
          </div>
        ))}
      </div>
      <div className="all-users">
        <h1>All users</h1>
        {userList.map((user) => (
          <div>
            <p>{user.username || user.email}</p>
            <button onClick={() => onSend(user._id)}>Send request</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Friends;
