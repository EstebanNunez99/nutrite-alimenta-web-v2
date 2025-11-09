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
|   |   |-- cart/
|   |   |   |--cart.controller.js
|   |   |   |--cart.model.js
|   |   |   |--cart.routes.js
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
|   |   |   |--routing/
|   |   |   |--ui/
|   |   |-- context/
|   |   |-- features/
|   |   |   |--|--auth/
|   |   |   |--|--cart/
|   |   |   |--|--products/
|   |   |   |--|--users/
|   |   |-- hooks/
|   |   |-- pages/
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
