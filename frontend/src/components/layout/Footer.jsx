const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-[#e0f7fa] to-[#f0fdfa] text-gray-700 text-center py-6 shadow-inner border-t border-gray-300">
      <div className="max-w-5xl mx-auto flex flex-col items-center space-y-2">
        <p className="text-sm md:text-base font-medium">
          &copy; {new Date().getFullYear()} <span className="font-bold text-primary">MoCA Check</span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
