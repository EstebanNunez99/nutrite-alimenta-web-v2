//revisado
// src/App.jsx

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AuthProvider from './context/AuthProvider.jsx';
import CartProvider from './context/CartProvider.jsx';

// El componente de Layout
import MainLayout from './components/layout/MainLayout.jsx';
import ScrollToTop from './components/routing/ScrollToTop.jsx';

function App() {
    return (
        <Router>
            <ScrollToTop />
            <AuthProvider>
                <CartProvider>
                    <MainLayout />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;