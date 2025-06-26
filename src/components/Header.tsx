
import Logo from './Logo';

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <Logo />
      </div>
    </header>
  );
};

export default Header;
