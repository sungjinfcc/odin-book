import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub } from "@fortawesome/free-brands-svg-icons";

function Footer() {
  return (
    <footer className="footer">
      <p>Copyright © 2023 sungjinfcc</p>
      <a href="https://github.com/sungjinfcc" target="_blank" rel="noreferrer">
        <FontAwesomeIcon icon={faGithub} className="fab fa-github" />
      </a>
    </footer>
  );
}

export default Footer;
