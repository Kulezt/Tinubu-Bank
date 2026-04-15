class Customer extends Bank {
    
    constructor(name, email, password, initialBalance = 0, accountNumber = null) {
        super(initialBalance); 
        this.name = name;
        this.email = email;
        this.password = password;
        this.isLoggedIn = false; 

        if (accountNumber) {
            console.log("Welcome back! Loading existing account number: " + accountNumber);
            this.accountNumber = accountNumber;
        } else {
            console.log("New user detected! Generating a brand new account number...");
            this.accountNumber = this.generateAccountNumber();
            console.log("Successfully generated: " + this.accountNumber);
        }
    }
    // Generates a unique 10-digit account number
    generateAccountNumber() {
        return Math.floor(1000000000 + Math.random() * 9000000000).toString();
    }

    register() {
        console.log(`Registering ${this.name} into the system...`);
        console.log("Registration successful!");
        return true; 
    }
  
    login(enteredEmail, enteredPassword) {
        if (enteredEmail === this.email && enteredPassword === this.password) {
            this.isLoggedIn = true;
            console.log(`Login successful! Welcome to the dashboard, ${this.name}.`);
            return true; 
        } else {
            console.error("Error: Incorrect email or password.");
            return false; 
        }
    }

    logout() {
        this.isLoggedIn = false;
        console.log(`${this.name} has been securely logged out.`);
    }
}