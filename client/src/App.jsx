import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Register from './pages/register.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import DisplayHome from './pages/DisplayHome.jsx';
import ForgetPassword from './pages/ForgetPassword.jsx';
import DashboardLayout from './Components/DashboardLayout.jsx';
import Music from './pages/Music.jsx';
import Chat from './pages/Chat.jsx';
import Watch from './pages/Watch.jsx';
import Profile from './pages/Profile.jsx';
import Post from './pages/Post.jsx';
import Explore from './pages/Explore.jsx';



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes WITHOUT sidebar */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgetpassword" element={<ForgetPassword />} />

        {/* Routes WITH sidebar */}
       
        <Route
          path="/DisplayHome"
          element={
            <DashboardLayout>
              <DisplayHome />
            </DashboardLayout>
          }
        />
         <Route
          path="/music"
          element={
            <DashboardLayout>
              <Music />
            </DashboardLayout>
          }
        />
        <Route
          path="/chat"
          element={
            <DashboardLayout>
              <Chat />
            </DashboardLayout>
          }
        />
         <Route
          path="/watch"
          element={
            <DashboardLayout>
              <Watch />
            </DashboardLayout>
          }
        />
         <Route
          path="/profile"
          element={
            <DashboardLayout>
              <Profile />
            </DashboardLayout>
          }
        />
         <Route
          path="/post"
          element={
            <DashboardLayout>
              <Post />
            </DashboardLayout>
          }
        />
         <Route
          path="/explore"
          element={
            <DashboardLayout>
              <Explore />
            </DashboardLayout>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};


export default App;
 