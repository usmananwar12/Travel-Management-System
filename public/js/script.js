document.addEventListener("DOMContentLoaded", function () {

    // Login functionality
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", function (e) {
        console.log("Login form submitted.");
        e.preventDefault();

        const enteredUsername = document.getElementById("username").value.trim();
        const enteredPassword = document.getElementById("password").value.trim();

        fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: enteredUsername,
                password: enteredPassword
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Save login flag
                    localStorage.setItem('isLoggedIn', 'true');
                    // Redirect to dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    alert(data.message);
                }
            })
            .catch(err => {
                console.error('Error:', err);
                alert('Error connecting to server.');
            });
    });

    // Show/hide signup popup
    document.getElementById("openSignup").addEventListener("click", function (e) {
        e.preventDefault();
        document.getElementById("signupPopup").style.display = "block";
    });
    document.getElementById("closeSignup").addEventListener("click", function () {
        document.getElementById("signupPopup").style.display = "none";
    });

    // Handle signup form submit
    document.getElementById("signupForm").addEventListener("submit", function (e) {
        e.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const username = document.getElementById("signupUsername").value.trim();
        const password = document.getElementById("signupPassword").value.trim();

        if (!name || !username || !password) {
            alert("Please fill in all fields.");
            return;
        }

        fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, username, password })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    alert("Signup successful. You can now log in.");
                    document.getElementById("signupPopup").style.display = "none";
                } else {
                    alert("Signup failed: " + data.message);
                }
            })
            .catch(err => {
                alert("Error: " + err.message);
            });
    });


    function generateStars(rating) {
        let starsHTML = '';
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star fa-1x"></i>';
        }
        if (halfStar) {
            starsHTML += '<i class="fas fa-star-half-alt fa-1x"></i>';
        }
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star fa-1x"></i>';
        }

        return starsHTML;
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'json/reviews.json', true);

    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            const container = document.getElementById('reviews-container');

            data.reviews.forEach(review => {
                const reviewHTML = `
                <div class="col-md-4 mb-4">
                    <div class="service-card">
                        <h2>${review.name}</h2>
                        ${generateStars(review.rating)}
                        <p>"${review.review}"</p>
                    </div>
                </div>
            `;
                container.innerHTML += reviewHTML;
            });
        } else {
            console.error('Error loading reviews. Status:', xhr.status);
        }
    };

    xhr.onerror = function () {
        console.error('Network error while loading reviews.');
    };

    xhr.send();

    //jquerry 
    $(document).ready(function () {
        $('#chatBtn').click(function () {
            $('#chatPopup').fadeIn();
        });

        $('#closeChat').click(function () {
            $('#chatPopup').fadeOut();
        });
    });

    $('#feedbackForm').submit(function (e) {
        let name = $('#name').val();
        let feedback = $('#message').val();

        if (!feedback || !name) {
            alert("Please fill all fields.");
            e.preventDefault();
        } else {
            alert("Thank you for your feedback!");
        }
    });

    $('h2').click(function () {
        console.log('H2 tag clicked:', $(this).text());
    });
});