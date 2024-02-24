import React from 'react';

import {Client as Styletron} from 'styletron-engine-atomic';
import {Provider as StyletronProvider} from 'styletron-react';
import {BaseProvider, DarkTheme, LocaleProvider} from 'baseui';
// import MainPage from "./pages/MainPage/MainPage";
import './App.css'
import ruLocal from "./local/ruLocal";
import SignUpPage from "./pages/SignUp/SignUpPage";
import LoginPage from "./pages/SignIn/LogInPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import MainPage from "./pages/MainPage/MainPage";
import {BrowserRouter, Navigate, Route, Router, Routes, useLocation} from "react-router-dom";
import Header from "./components/Header/Header";
import {SnackbarProvider} from "baseui/snackbar";
import ApplicationPage from "./pages/ApplicationPage/ApplicationPage";
import Chat from "./components/Chat/Chat/Chat";
import AboutPage from "./pages/AboutPage/AboutPage";


const engine = new Styletron();


function App() {
    const ProtectedRoute = ({children}) => {
        const location = useLocation();
        const isAuthenticated = localStorage.getItem('accessToken');

        if (!isAuthenticated) {

            return <Navigate to="/login" state={{from: location}} replace/>;
        }

        return children;
    };
    return (
        <StyletronProvider value={engine}>
            <BaseProvider theme={DarkTheme}>
                <LocaleProvider locale={ruLocal}>
                    <SnackbarProvider>
                        <Header/>
                        <Routes>
                            <Route path="/" element={<MainPage/>}/>
                            <Route path="/signup" element={<SignUpPage/>}/>
                            <Route path="/login" element={<LoginPage/>}/>
                            <Route path="/profile" element={<ProfilePage/>}/>
                            <Route path="/chat" element={<Chat chatId={1}/>}/>
                            <Route path="/about" element={<AboutPage/>}/>
                            <Route path="/application_add" element={
                                <ProtectedRoute>
                                    <ApplicationPage/>
                                </ProtectedRoute>
                            }/>
                            <Route path="*" element={<Navigate to="/" replace/>}/>
                        </Routes>
                    </SnackbarProvider>
                </LocaleProvider>
            </BaseProvider>

        </StyletronProvider>
    );
}

export default App;
