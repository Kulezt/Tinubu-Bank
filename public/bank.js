class Bank {
    constructor(initialBalance = 0) {
        this.balance = initialBalance;
        this.transactions = [];
    }

    deposit(amount) {
        if (amount <= 0) {
            console.error("Deposit amount must be greater than zero.");
            return false;
        }
        this.balance += amount;
        console.log(`Deposited: ₦${amount}. New Balance: ₦${this.balance}`);
        
        this.transactions.push({ 
            type: 'Deposit', 
            amount: amount, 
            date: new Date().toISOString(), 
            status: 'Completed',
            description: 'Self Service' 
        });
        return true;
    }

    withdraw(amount) {
        if (amount <= 0) {
            console.error("Withdrawal amount must be greater than zero.");
            return false;
        }
        if (amount > this.balance) {
            console.error("Insufficient funds for withdrawal.");
            this.transactions.push({ 
                type: 'Withdrawal', 
                amount: amount, 
                date: new Date().toISOString(), 
                status: 'Failed', 
                description: 'Insufficient Funds' 
            });
            return false;
        }
        this.balance -= amount;
        
        this.transactions.push({ 
            type: 'Withdrawal', 
            amount: amount, 
            date: new Date().toISOString(), 
            status: 'Completed', 
            description: 'Self Service' 
        });
        return true;
    }

    transfer(amount, recipient) {
        if (amount <= 0) {
            console.error("Transfer amount must be greater than zero.");
            return false;
        }
        if (amount > this.balance) {
            console.error("Insufficient funds for transfer.");
            
            this.transactions.push({ 
                type: 'Transfer', 
                amount: amount, 
                date: new Date().toISOString(), 
                status: 'Failed', 
                description: `Transfer to ${recipient}` 
            });
            return false;
        }
        if (typeof recipient !== 'string' || recipient.trim() === '') {
            console.error("Invalid recipient for transfer.");
            return false;
        }
        
        this.balance -= amount;
        
        this.transactions.push({ 
            type: 'Transfer', 
            amount: amount, 
            date: new Date().toISOString(), 
            status: 'Completed', 
            description: `Transfer to ${recipient}` 
        });
        return true;
    }
}