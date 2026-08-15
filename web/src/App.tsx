import { StoreProvider, useStore } from './store';
import { LoginScreen } from './screens/Login';
import { HrApp } from './screens/hr';
import { MerchantApp } from './screens/merchant';
import { AdminApp } from './screens/admin';

function Root() {
  const { session } = useStore();
  if (!session || session.role === 'employee') return <LoginScreen />;
  if (session.role === 'hr') return <HrApp />;
  if (session.role === 'merchant') return <MerchantApp />;
  return <AdminApp />;
}

export default function App() {
  return (
    <StoreProvider>
      <Root />
    </StoreProvider>
  );
}
