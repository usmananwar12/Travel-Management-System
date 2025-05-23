# Al Zahid Madni Travels – Landing Page & Travel Management System

This is the landing page and management system for Al Zahid Madni Travels, where users can manage bookings, explore travel services like airline ticketing, Hajj & Umrah packages, hotel bookings, and submit feedback.

## Features

- Navigation Bar – Easy access to Home, Services, About Us, and Feedback.  
- User Login System – Users can log in securely to manage their bookings (now backed by MongoDB).  
- Services Section – Showcases airline ticketing, Hajj & Umrah packages, and hotel bookings.  
- About Us Section – Displays company details and mission statement.  
- Floating Chat Button – Users can interact via a chat popup for quick assistance.  
- Feedback Section – Users can submit feedback and view customer reviews dynamically.  
- Responsive Design – Fully responsive, works on all screen sizes (mobile, tablet, desktop).  
- MongoDB Integration – All user and feedback data is now stored in MongoDB (no more `.json` files).  
- RESTful API Backend – Powered by Express.js for handling login, registration, and feedback submission.  
- Scalable Structure – Easily extendable for booking management, payment integration, and admin dashboard.  

## Technologies Used

### Frontend:
- HTML5 – Structure and layout  
- CSS3 & Bootstrap 4/5 – Styling, layout, and responsive design  
- JavaScript (script.js) – Handles UI interactions and form validations  
- jQuery – Simplifies DOM manipulation and animations  
- AJAX (XMLHttpRequest & jQuery AJAX) – Fetches and posts dynamic data to backend APIs  
- Font Awesome – For modern icons and UI consistency  

### Backend:
- Node.js – JavaScript runtime for server-side logic  
- Express.js – Backend framework to handle API routes and requests  
- MongoDB – NoSQL database for storing users, feedback, and future bookings  
- Mongoose – ODM (Object Data Modeling) to interact with MongoDB  
- REST APIs – For login, registration, feedback submission, and fetching reviews  

### Tools & Version Control:
- Postman – For testing APIs  
- Git & GitHub – Version control and collaboration  

## Future Enhancements
- JWT Authentication – To secure user sessions  
- Hotel Booking Management – Allow users to book hotels directly  
- Flight Booking System – Integrate flight search and booking APIs  
- Admin Dashboard – For managing users, bookings, and reviews  
- Payment Integration – For secure online payments  
