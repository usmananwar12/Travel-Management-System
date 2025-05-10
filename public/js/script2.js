// Get username from localStorage
  const username = localStorage.getItem('loggedInUser') || 'User123';

  // Update places where username is shown
  document.querySelectorAll('.username-placeholder').forEach(el => {
    el.textContent = username;
  });

   // Check login status
  if (localStorage.getItem('isLoggedIn') !== 'true') {
    // Not logged in, redirect to home page
    window.location.href = 'index.html';  // Change this to your home page file
  }

  document.querySelector('.dropdown-item').addEventListener('click', function (e) {
    e.preventDefault();
    
    // Clear localStorage
    localStorage.clear();

    // Redirect to home (index.html)
    window.location.href = 'index.html';
  });