nutrite-alimenta-web-v2/
|-- README.md
|-- .gitignore
|
|-- backend/
|   |-- config/
|   |   |-- db.js
|   |
|   |-- features/
|   |   |-- auth/
|   |   |   |--auth.controller.js
|   |   |   |--auth.routes.js
|   |   |-- orders/
|   |   |   |--order.controller.js
|   |   |   |--order.model.js
|   |   |   |--order.routes.js
|   |   |-- products/
|   |   |   |--products.controller.js
|   |   |   |--products.model.js
|   |   |   |--products.routes.js
|   |   |-- shipping/
|   |   |   |--shipping.controller.js
|   |   |   |--shipping.model.js
|   |   |   |--shipping.routes.js
|   |   |-- users/
|   |   |   |--user.controller.js
|   |   |   |--user.model.js
|   |   |   |--user.routes.js
|   |
|   |-- shared/
|   |   |-- middlewares/
|   |   |   |--adminMiddleware.js
|   |   |   |--auth.middleware.js
|   |   |-- utils/
|   |   |   |--logger.js
|   |
|   |-- src/
|   |   |-- api/
|   |   |   |--axios.js
|   |   |-- utils/
|   |   |   |--generateToken.js
|   |
|   |-- .env
|   |-- .gitignore
|   |-- package-lock.json
|   |-- package.json
|   |-- server.js
|   |
|
|-- frontend/
|   |-- public/
|   |   |--  vite.svg  
|   |
|   |-- src/
|   |   |-- api/
|   |   |   |--axios.js
|   |   |-- components/
|   |   |   |--layout/
|   |   |   |--|--Footer.jsx
|   |   |   |--|--Footer.module.css
|   |   |   |--|--Header.jsx
|   |   |   |--|--Header.module.css
|   |   |   |--|--MainLayout.jsx
|   |   |   |--|--MainLayout.module.css
|   |   |   |--routing/
|   |   |   |--|--AdminRoute.jsx
|   |   |   |--|--GuestRoute.jsx
|   |   |   |--|--PrivateRoute.jsx
|   |   |   |--ui/
|   |   |   |--|--Button.jsx
|   |   |   |--|--Button.module.css
|   |   |   |--|--Input.jsx
|   |   |   |--|--Input.module.css
|   |   |   |--|--Paginate.jsx
|   |   |   |--|--Paginate.module.css
|   |   |   |--|--Spinner.jsx
|   |   |-- context/
|   |   |   |--AuthContext.js
|   |   |   |--AuthProvider.jsx
|   |   |   |--CartContext.js
|   |   |   |--CartProvider.jsx
|   |   |-- features/
|   |   |   |--|--auth/
|   |   |   |--|--|--Login.jsx
|   |   |   |--|--|--Registro.jsx
|   |   |   |--|--|--AuthForm.module.css
|   |   |   |--|--cart/
|   |   |   |--|--|--CartModal.jsx
|   |   |   |--|--|--CartModal.module.css
|   |   |   |--|--products/
|   |   |   |--|--|--ProductCard.jsx
|   |   |   |--|--|--ProductCart.module.css
|   |   |   |--|--|--ProductForm.jsx
|   |   |   |--|--users/
|   |   |   |--|--|--UpdatePasswordForm.jsx
|   |   |   |--|--|--UpdateProfileForm.jsx
|   |   |   |--|--|--UserForms.module.css
|   |   |-- hooks/
|   |   |   |--useAuth.js
|   |   |   |--useCart.js
|   |   |   |--useDocumentTitle.js
|   |   |-- pages/
|   |   |   |--AdminCreateManualPage.jsx
|   |   |   |--AdminDashboard.jsx
|   |   |   |--AdminHomePage.jsx
|   |   |   |--AdminProductsPage.jsx
|   |   |   |--AdminSalesHistoryPage.jsx
|   |   |   |--AdminShippingConfigPage.jsx
|   |   |   |--AdminUserPage.jsx
|   |   |   |--AuthPage.jsx
|   |   |   |--CartPage.jsx
|   |   |   |--CheckoutPage.jsx
|   |   |   |--ClientHomePage.jsx
|   |   |   |--CreateProductPage.jsx
|   |   |   |--EditProductPage.jsx
|   |   |   |--GuestHomePage.jsx
|   |   |   |--HomePage.jsx
|   |   |   |--LoginPage.jsx
|   |   |   |--MyOrdersPage.jsx
|   |   |   |--NotFoundPage.jsx
|   |   |   |--OrderDetailPage.jsx
|   |   |   |--OrderTrackingPage.jsx
|   |   |   |--ProductDetailPage.jsx
|   |   |   |--ProductPage.jsx
|   |   |   |--ProfilePage.jsx
|   |   |-- router/
|   |   |-- services/
|   |   |-- App.css
|   |   |-- App.jsx
|   |   |-- environment.css
|   |   |-- index.css
|   |   |-- main.jsx
|   |   |
|   |-- .env
|   |-- .gitignore
|   |-- eslint.config.js
|   |-- index.html
|   |-- package-lock.json
|   |-- package.json
|   |-- README.md
|   |-- vercel.json
|   |-- vite.config.js
