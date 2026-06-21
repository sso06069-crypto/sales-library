import React from 'react';
import logo from "../assets/logo.png";

function Footer() {
  return (
    <div className="mt-16 pb-8 flex flex-col items-center gap-3 text-gray-400 text-xs">
      <img
        src={logo}
        alt="Sales Library"
        className="w-32 h-auto opacity-80"
      />

      <div>
        <span>© Sales Library</span>
        <span> · </span>
        <a
          href="https://github.com/sso06069-crypto/sales-library"
          target="_blank"
          rel="noopener noreferrer"
        >
          🔗 GitHub
        </a>
      </div>

    </div>
  );
}

export default Footer;