import { Routes, Route } from 'react-router-dom';
import { BookingPage, AdminPage } from '@/pages';

function App() {
  return (
    <Routes>
      <Route path="/" element={<BookingPage />} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

export default App;
