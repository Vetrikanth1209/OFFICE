import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Table from './table';
import Form from './form';
import SignIn from './signin';
import ConsolidateAndSummary from './consolidate_summary';
import { Admin } from './admin';
import Update from './update';

const App = () => {
  const isLoggedIn = sessionStorage.getItem('logged');
  const isAdmin = sessionStorage.getItem('admin') === 'true';

  return (
    <BrowserRouter>
      <Routes>
        {isLoggedIn ? (
          isAdmin ? (
            // Routes for admin users
            <>
              <Route path='/' element={<Admin />} />
              <Route path='/form' element={<Form />} />
              <Route path='/cs' element={<ConsolidateAndSummary />} />
              <Route path='/table' element={<Table />} />
              <Route path='*' element={<Navigate to="/" />} />
              <Route path="/update/:id" element={<Update />} />
            </>
          ) : (
            // Routes for non-admin users
            <>
              <Route path='/' element={<Table />} />
              <Route path='/form' element={<Form />} />
              <Route path='/cs' element={<ConsolidateAndSummary />} />
              <Route path='*' element={<Navigate to="/" />} />
              <Route path="/update/:id" element={<Update />} />
            </>
          )
        ) : (
          // Routes for users who are not logged in
          <>
            <Route path='/' element={<SignIn />} />
            <Route path='*' element={<Navigate to="/" />} />
          </>
        )}
      </Routes>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
