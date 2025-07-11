import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from '../screens/Home/HomeScreen';
import RunPage from '../screens/RunPage/RunPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/RunPage" element={<RunPage />} />
    </Routes>
  );
}

export default AppRoutes;
