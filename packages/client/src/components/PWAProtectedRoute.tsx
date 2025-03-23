import { Navigate } from 'react-router-dom';
import PWAInstallationCheck from './PWAInstallationCheck';

const PWAProtectedRoute = ({ element }: any) => {
  return (
    <PWAInstallationCheck>
      {(isPWAInstalled: any) =>
        isPWAInstalled ? element : <Navigate to='/install' replace />
      }
    </PWAInstallationCheck>
  );
};

export default PWAProtectedRoute;
