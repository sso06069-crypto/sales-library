import React from 'react';

function Footer() {
  return (
    <div className="mt-16 pb-8 flex items-center justify-center gap-2 text-gray-400 text-xs">
      <span>© Sales Library</span>
      <span>·</span>
      <a
        href="https://github.com/sso06069-crypto/sales-library"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 hover:text-gray-600 transition-all"
      >
        🔗 GitHub
      </a>
    </div>
  );
}

export default Footer;