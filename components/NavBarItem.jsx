import React from 'react';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

const NavBarItem = ({ children, href, className, icon, tabIndex, testId }) => {
  const pathname = usePathname();
  const activeClass = 'navbar-item-active';
  const activeClasses = className ? `${className} ${activeClass}` : activeClass;
  return (
    <span className="d-inline-flex align-items-center navbar-item">
      {icon && icon.length > 0 && <FontAwesomeIcon icon={`fa-solid fa-${icon}`} className="mr-3" />}
      <span className={pathname === href ? activeClasses : className} tabIndex={tabIndex} data-testid={testId}>
        {children}
      </span>
    </span>
  );
};

export default NavBarItem;
