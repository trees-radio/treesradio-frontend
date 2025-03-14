import { FC, useEffect, useState } from "react";
import { Main } from "./Main";
import TermsOfServicePage from "./TermsOfService";

const AppRouter: FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);
  
  // Listen for path changes
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Listen for popstate events (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    
    // Clean up
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);
  
  // Route to the appropriate component
  if (currentPath === '/terms-of-service') {
    return <TermsOfServicePage />;
  }
  
  // Default route
  return <Main />;
};

export default AppRouter;