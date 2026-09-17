'use client';

// providers
import AlertProvider from '@providers/AlertProvider';
import UserProvider from '@providers/UserProvider';

// components
import Alert from '@components/Alert/Alert';
import Header from '@components/Header/Header';
import Footer from '@components/Footer/Footer';

// interfaces
interface IProps {
  children: React.ReactNode;
}

const Master: React.FC<IProps> = ({ children }) => (
  <div className='light-theme'>
    <UserProvider>
      <AlertProvider>
        <Alert />
        <Header />
        {children}
        <Footer />
      </AlertProvider>
    </UserProvider>
  </div>
);

export default Master;
