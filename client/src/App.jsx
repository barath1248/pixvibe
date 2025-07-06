import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Register from './pages/register.jsx';
import Login from './pages/Login.jsx';
import Home from './pages/Home.jsx';
import DisplayHome from './pages/DisplayHome.jsx';
import ForgetPassword from './pages/ForgetPassword.jsx';
import DashboardLayout from './Components/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Chat from './pages/Chat.jsx';
import Watch from './pages/Watch.jsx';
import Profile from './pages/Profile.jsx';
import Post from './pages/Post.jsx';
import ResumeScreening from './pages/ResumeScreening.jsx';
import AIChatbot from './pages/AIChatbot.jsx';

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes WITHOUT sidebar */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />

          {/* Routes WITH sidebar */}
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            }
          />
         
          <Route
            path="/DisplayHome"
            element={
              <DashboardLayout>
                <DisplayHome />
              </DashboardLayout>
            }
          />
           <Route
            path="/AIChatbot"
            element={
              <DashboardLayout>
                <AIChatbot />
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
            path="/chat/:userId"
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
            path="/ResumeScreening"
            element={
              <DashboardLayout>
                <ResumeScreening />
              </DashboardLayout>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
 