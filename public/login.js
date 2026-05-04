class LoginValidator {
    constructor() {
        this.form = document.getElementById('login-form');
        this.email = document.getElementById('email');
        this.password = document.getElementById('password');
        this.modalOverlay = document.getElementById('feedback-modal');
        this.closeBtn = document.getElementById('modal-close-btn');
        this.iconEl = document.getElementById('modal-icon');
        this.titleEl = document.getElementById('modal-title');
        this.messageEl = document.getElementById('modal-message');
    }

    init() {
        if (!this.form) {
            console.error("CRITICAL ERROR: Could not find <form id='login-form'> in the HTML.");
            return;
        }

        this.form.addEventListener('submit', (event) => this.handleSubmit(event));

        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.hideModal());
        }
    }

    handleSubmit(event) {
        event.preventDefault();
      if (this.validateInputs()) {
            const email = this.email.value.trim();
            const password = this.password.value.trim();

            fetch(`/api/tinubu_users?email=${email}`)
                .then(response => response.json())
                .then(users => {
                    
                    
                    if (users.length === 0) {
                        this.showModal('error', 'Account Not Found', 'No account found with that email. Please sign up!');
                        return;
                    }

                   
                    const userData = users[0];

                   
                    const returningCustomer = new Customer(userData.name, userData.email, userData.password, userData.balance, userData.accountNumber);

                  
                    if (returningCustomer.login(email, password)) {
                        
                        localStorage.setItem('active_session', returningCustomer.email);

                        this.showModal('success', 'Welcome Back!', 'Credentials verified. Redirecting to dashboard...');
                        this.closeBtn.style.display = 'none';

                        setTimeout(() => {
                            window.location.href = "dashboard.html";
                        }, 2000);
                    } else {
                        this.showModal('error', 'Login Failed', 'Incorrect password. Please try again.');
                    }
                })
                .catch(error => {
                    console.error("Database Error:", error);
                    this.showModal('error', 'Server Error', 'Could not connect to the bank servers. Is json-server running?');
                });
        }
    }

    validateInputs() {
        const emailVal = this.email.value.trim();
        const passVal = this.password.value.trim();

        if (!emailVal || !passVal) {
            this.showModal('error', 'Login Failed', 'Please enter both your Email and Password.');
            return false;
        }

        return true;
    }

    showModal(type, title, message) {
        this.titleEl.textContent = title;
        this.messageEl.textContent = message;

        if (type === 'success') {
            this.iconEl.innerHTML = '✅';
            this.titleEl.style.color = '#10b981';
        } else {
            this.iconEl.innerHTML = '⚠️';
            this.titleEl.style.color = '#ef4444';
            this.closeBtn.style.display = 'block';
        }

        this.modalOverlay.classList.add('show');
    }

    hideModal() {
        this.modalOverlay.classList.remove('show');
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const loginApp = new LoginValidator();
    loginApp.init();
});