
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Logo />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
