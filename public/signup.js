const form = document.getElementById('signup-form');
const modalOverlay = document.getElementById('feedback-modal');
const closeBtn = document.getElementById('modal-close-btn');
closeBtn.addEventListener('click', () => {
    modalOverlay.classList.remove('show');
});
form.addEventListener('submit', async function(event) {
    event.preventDefault();
  
    if (validateForm()) {
        const name = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        
        try {
            const checkResponse = await fetch(`/api/server./tinubu_users?email=${email}`);
            const existingUsers = await checkResponse.json();
            
            if (existingUsers.length > 0) {
                showModal('error', 'Email Taken', 'This email is already registered. Please log in.');
                return; 
            }

            const newCustomer = new Customer(name, email, password, 0);

            await fetch('/api/server./tinubu_users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCustomer)
            });

            showModal('success', 'Welcome to Tinubu Bank!', 'Account created successfully. Redirecting to Login...');  
            closeBtn.style.display = 'none'; 
            
            setTimeout(() => {
                window.location.href = "Login.html"; 
            }, 2500);

        } catch (error) {
            console.error("Database Error:", error);
            showModal('error', 'Server Error', 'Could not connect to the bank servers. Is json-server running?');
        }
    }
});

function validateForm() {
    const username = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirm-password').value.trim();

    if (username === '' || email === '' || phone === '' || password === '' || confirmPassword === '') {
        showModal('error', 'Missing Information', 'Please fill out all required fields to continue.');
        return false;
    }

    if (!isValidEmail(email)) {
        showModal('error', 'Invalid Email', 'Please enter a valid email address format (e.g., name@email.com).');
        return false;
    }

    if (password.length < 8) {
        showModal('error', 'Weak Password', 'For your security, your password must be at least 8 characters long.');
        return false;
    }

    if (password !== confirmPassword) {
        showModal('error', 'Passwords Mismatch', 'The passwords you entered do not match. Please try again.');
        return false;
    }
    if (!/^\d{11}$/.test(phone)) {
        showModal('error', 'Invalid Phone Number', 'Please enter a valid 11-digit phone number without spaces or special characters.');
        return false;
    }

    return true; 
}

function showModal(type, title, message) {
    const iconEl = document.getElementById('modal-icon');
    const titleEl = document.getElementById('modal-title');
    const messageEl = document.getElementById('modal-message');

    titleEl.textContent = title;
    messageEl.textContent = message;

    
    if (type === 'success') {
        iconEl.innerHTML = '✅'; 
        titleEl.style.color = '#10b981'; 
    } else {
        iconEl.innerHTML = '⚠️'; 
        titleEl.style.color = '#ef4444'; 
        closeBtn.style.display = 'block'; 
    }

   
    modalOverlay.classList.add('show');
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}
