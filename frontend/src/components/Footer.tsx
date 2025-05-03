import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#162447] py-4 text-center mt-auto text-base text-[#cccccc]">
      &copy; {new Date().getFullYear()} CRUD App. All rights reserved.
    </footer>
  );
};

export default Footer;