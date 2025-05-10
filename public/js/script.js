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
                const loginMsg = document.getElementById("loginMessage");
                if (data.success) {
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('loggedInUser', enteredUsername);
                    window.location.href = 'dashboard.html';
                } else {
                    loginMsg.textContent = data.message || "Invalid username or password.";
                }
            })
            .catch(err => {
                console.error('Error:', err);
                document.getElementById("loginMessage").textContent = "Error connecting to server.";
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

        const username = document.getElementById("signupUsername").value.trim();
        const password = document.getElementById("signupPassword").value.trim();

        if (!username || !password) {
            alert("Please fill in all fields.");
            return;
        }

        fetch("/api/users/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
            .then(res => res.json())
            .then(data => {
                const signupMsg = document.getElementById("signupMessage");
                if (data.success) {
                    signupMsg.classList.remove("text-danger");
                    signupMsg.classList.add("text-success");
                    signupMsg.textContent = "Signup successful. You can now log in.";
                    setTimeout(() => {
                        document.getElementById("signupPopup").style.display = "none";
                        signupMsg.textContent = "";
                    }, 2000);
                } else {
                    signupMsg.classList.remove("text-success");
                    signupMsg.classList.add("text-danger");
                    signupMsg.textContent = "Signup failed: " + (data.message || "Please try again.");
                }
            })
            .catch(err => {
                document.getElementById("signupMessage").textContent = "Error: " + err.message;
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

    // Fetch reviews from MongoDB
    fetch('/api/reviews')
        .then(response => response.json())
        .then(data => {
            const reviewsContainer = document.getElementById('reviews-container');
            reviewsContainer.innerHTML = '';

            data.forEach(review => {
                const reviewCard = `
                <div class="col-md-4 mb-4">
                    <div class="service-card">
                        <h2>${review.name}</h2>
                        ${generateStars(review.rating)}
                        <p>"${review.review}"</p>
                    </div>
                </div>
            `;
                reviewsContainer.innerHTML += reviewCard;
            });
        })
        .catch(err => console.error('Error loading reviews:', err));

    //jquerry 
    $(document).ready(function () {
        $('#chatBtn').click(function () {
            $('#chatPopup').fadeIn();
        });

        $('#closeChat').click(function () {
            $('#chatPopup').fadeOut();
        });
    });
    // Show alert message
    function showAlert(message, type) {
        let alertHtml = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close custom-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
    `;
        $('#feedbackAlert').html(alertHtml);

        // Reload page when close button is clicked
        $('.custom-close').on('click', function () {
            location.reload();
        });
    }


    $('#feedbackForm').submit(function (e) {
        e.preventDefault();

        let name = $('#name').val();
        let rating = $('input[name="rating"]:checked').val();
        let review = $('#message').val();

        if (!name || !review || !rating) {
            showAlert('Please fill all fields.', 'danger');
            return;
        }


        $.ajax({
            url: '/api/reviews',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name, rating, review }),
            success: function (response) {
                showAlert("Thank you for your feedback!", 'success');
                $('#feedbackForm')[0].reset();
            },
            error: function (error) {
                showAlert("Error submitting feedback. Please try again.", 'danger');
            }
        });
    });
});