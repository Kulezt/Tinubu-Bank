const activeEmail = localStorage.getItem('active_session');
if (!activeEmail) {
    window.location.href = "Login.html";
}
document.addEventListener('DOMContentLoaded', async () => {
    let myAccount;
    try {
        const response = await fetch(`http://localhost:3000/tinubu_users?email=${activeEmail}`);
        const users = await response.json();

        if (users.length === 0) {
            window.location.href = "Login.html";
            return;
        }

        const userData = users[0];
        myAccount = new Customer(userData.name, userData.email, userData.password, userData.balance || 0, userData.accountNumber);

        if (userData.transactions) {
            myAccount.transactions = userData.transactions;
        }

        myAccount.id = userData.id;
        myAccount.pin = userData.pin;

        const firstName = myAccount.name.split(' ')[0];
        document.getElementById('user-first-name').innerText = firstName;
        document.getElementById('user-account-number').innerText = myAccount.accountNumber;

        updateScreenBalance(myAccount);
        updateTransactionTable(myAccount);

    } catch (error) {
        console.error("Dashboard failed to load data:", error);
        showFeedback('error', 'Server Error', 'Could not connect to the bank server. Please check your database.');
        return;
    }

    const depositBtn = document.getElementById('nav-deposit');
    const withdrawBtn = document.getElementById('nav-withdraw');
    const transferBtn = document.getElementById('nav-transfer');

    const actionModal = document.getElementById('action-modal');
    const actionInput = document.getElementById('action-amount');
    const recipientInput = document.getElementById('action-recipient');

    const cancelBtn = document.getElementById('cancel-action-btn');
    const confirmBtn = document.getElementById('confirm-action-btn');

    const modalTitle = document.getElementById('action-modal-title');
    const modalMessage = document.getElementById('action-modal-message');
    const log0utBtn = document.getElementById('logout-btn');
    const pinInput = document.getElementById('action-pin');

    let currentAction = "";

    if (depositBtn) {
        depositBtn.addEventListener('click', (event) => {
            event.preventDefault();
            currentAction = "deposit";
            modalTitle.innerText = "Deposit Funds";
            modalMessage.innerText = "Enter the amount you wish to deposit.";
            actionInput.value = '';
            recipientInput.style.display = 'none';
            pinInput.style.display = 'none';
            resetModalViews();
            actionModal.classList.add('show');
        });
    }



    if (withdrawBtn) {
        withdrawBtn.addEventListener('click', (event) => {
            event.preventDefault();
            resetModalViews();

            if (!myAccount.pin) {
                document.getElementById('modal-form-view').style.display = 'none';
                document.getElementById('modal-setup-pin-view').style.display = 'block';
                actionModal.classList.add('show');
                return;
            }
            currentAction = "withdraw";
            modalTitle.innerText = "Withdraw Funds";
            modalMessage.innerText = "Enter the amount you wish to withdraw.";
            actionInput.value = '';
            recipientInput.style.display = 'none';
            document.getElementById('action-pin').style.display = 'block';
            document.getElementById('action-pin').value = '';
            actionModal.classList.add('show');
        });
    }

    if (transferBtn) {
        transferBtn.addEventListener('click', (event) => {
            event.preventDefault();
            resetModalViews();

            if (!myAccount.pin) {
                document.getElementById('modal-form-view').style.display = 'none';
                document.getElementById('modal-setup-pin-view').style.display = 'block';
                actionModal.classList.add('show');
                return;
            }
            currentAction = "transfer";
            modalTitle.innerText = "Transfer Funds";
            modalMessage.innerText = "Enter the amount you wish to transfer.";
            actionInput.value = '';
            recipientInput.value = '';
            recipientInput.style.display = 'block';
            document.getElementById('action-pin').style.display = 'none';
            document.getElementById('action-pin').value = '';
            actionModal.classList.add('show');
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            actionModal.classList.remove('show');
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', async () => {
            const amount = parseFloat(actionInput.value);

            if (isNaN(amount) || amount <= 0) {
                showFeedback('error', 'Invalid Amount', 'Please enter a valid amount greater than zero.');
                return;
            }
            if (currentAction === "withdraw") {
                const enteredPin = document.getElementById('action-pin').value;

                if (String(enteredPin) !== String(myAccount.pin)) {
                    showFeedback('error', 'Verification Failed', 'The transaction PIN you entered is incorrect.');
                    return;
                }
            }

            if (currentAction === "deposit") {
                myAccount.deposit(amount);
                updateScreenBalance(myAccount);
                updateTransactionTable(myAccount);
                await syncDatabase(myAccount);
                showFeedback('success', 'Deposit Successful', `₦${amount.toLocaleString()} has been added to your account.`);
            }

            else if (currentAction === "withdraw") {
                if (myAccount.withdraw(amount)) {
                    updateScreenBalance(myAccount);
                    updateTransactionTable(myAccount);
                    await syncDatabase(myAccount);
                    showFeedback('success', 'Withdrawal Successful', `₦${amount.toLocaleString()} has been deducted from your account.`);
                } else {
                    updateTransactionTable(myAccount);
                    await syncDatabase(myAccount);
                    showFeedback('error', 'Insufficient Funds', 'You do not have enough money for this withdrawal.');

                }
            }

            else if (currentAction === "transfer") {
                const recipientAccNumber = recipientInput.value.trim();

                if (recipientAccNumber === "" || recipientAccNumber.length !== 10) {
                    showFeedback('error', 'Invalid Account', 'Please enter a valid 10-digit account number.');
                    return;
                }
                if (recipientAccNumber === myAccount.accountNumber) {
                    showFeedback('error', 'Invalid Transfer', 'You cannot transfer money to your own account!');
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/tinubu_users`);
                    const allUsers = await response.json();
                    const recipientUser = allUsers.find(user => user.accountNumber === recipientAccNumber);

                    if (!recipientUser) {
                        showFeedback('error', 'User Not Found', 'Invalid Account Number. No user found in the database.');
                        return;
                    }

                    document.getElementById('modal-form-view').style.display = 'none';
                    const confirmView = document.getElementById('modal-confirm-view');
                    confirmView.style.display = 'block';
                    document.getElementById('confirm-message').innerHTML = `Are you sure you want to send <strong>₦${amount.toLocaleString()}
                    </strong> to <strong>${recipientUser.name}</strong>?`;

                    document.getElementById('transfer-confirm-pin').value = '';
                    document.getElementById('cancel-confirm-btn').onclick = () => {
                        confirmView.style.display = 'none';
                        document.getElementById('modal-form-view').style.display = 'block';
                    };


                    document.getElementById('final-confirm-btn').onclick = async () => {
                        const finalPin = document.getElementById('transfer-confirm-pin').value;
                        if (String(finalPin) !== String(myAccount.pin)) {
                            showFeedback('error', 'Verification Failed', 'The transaction PIN you entered is incorrect.');
                            return;
                        }

                        if (myAccount.transfer(amount, recipientUser.name)) {
                            const lastTx = myAccount.transactions[myAccount.transactions.length - 1];
                            if (lastTx) {
                                lastTx.description = `Transfer to ${recipientUser.name}`;
                            }

                            updateScreenBalance(myAccount);
                            updateTransactionTable(myAccount);
                            await syncDatabase(myAccount);

                            const newRecipientBalance = (parseFloat(recipientUser.balance) || 0) + amount;
                            const recipientTransactions = recipientUser.transactions || [];
                            recipientTransactions.push({
                                type: "Credit",
                                amount: amount,
                                date: new Date().toISOString(),
                                status: "Completed",
                                description: `Transfer from ${myAccount.name}`
                            });

                            await fetch(`http://localhost:3000/tinubu_users/${recipientUser.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    balance: newRecipientBalance,
                                    transactions: recipientTransactions
                                })
                            });

                            showFeedback('success', 'Transfer Sent!', `Successfully transferred ₦${amount.toLocaleString()} to ${recipientUser.name}.`);
                        } else {
                            updateTransactionTable(myAccount);
                            await syncDatabase(myAccount);
                            showFeedback('error', 'Transfer Failed', 'Insufficient funds to complete this transfer.');
                        }
                    };

                } catch (error) {
                    console.error("Verification Error:", error);
                    showFeedback('error', 'Network Error', 'Could not verify the account number with the server.');
                }
            }
        });
    }
    if (log0utBtn) {
        log0utBtn.addEventListener('click', () => {
            localStorage.removeItem('active_session');
            window.location.href = "Login.html";
        });
    }
    const savePinBtn = document.getElementById('save-pin-btn');
    if (savePinBtn) {
        savePinBtn.addEventListener('click', async () => {
            const pin1 = document.getElementById('new-pin').value;
            const pin2 = document.getElementById('confirm-new-pin').value;

            if (pin1.length !== 4 || isNaN(pin1)) {
                showFeedback('error', 'Invalid PIN', 'Your PIN must be exactly 4 numbers.');
                return;
            }
            if (pin1 !== pin2) {
                showFeedback('error', 'Mismatch', 'The PINs you entered do not match. Try again.');
                return;
            }
            myAccount.pin = pin1;

            try {
                await fetch(`http://localhost:3000/tinubu_users/${myAccount.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ pin: myAccount.pin })
                });

                document.getElementById('new-pin').value = '';
                document.getElementById('confirm-new-pin').value = '';
                showFeedback('success', 'Security Upgraded', 'Your PIN has been successfully saved! You can now proceed with your transaction.');

            } catch (error) {
                console.error("Failed to save PIN:", error);
                showFeedback('error', 'Server Error', 'Could not save your PIN to the database.');
            }
        });
    }
});


async function syncDatabase(updatedAccount) {
    try {
        await fetch(`http://localhost:3000/tinubu_users/${updatedAccount.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                balance: updatedAccount.balance,
                transactions: updatedAccount.transactions
            })
        });
    } catch (error) {
        console.error("Failed to save to server:", error);
        showFeedback('error', 'Sync Warning', 'Could not save your transaction to the server!');
    }
}

function updateScreenBalance(account) {
    const formattedBalance = account.balance.toLocaleString('en-NG', {
        style: 'currency',
        currency: 'NGN'
    });
    document.getElementById('total-balance').innerText = `${formattedBalance}`;
}

function updateTransactionTable(account) {
    const tableBody = document.getElementById('transaction-list');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (!account.transactions || account.transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #94a3b8;">No transactions yet.</td></tr>`;
        return;
    }

    account.transactions.slice().reverse().slice(0, 5).forEach(tx => {
        const row = document.createElement('tr');
        const niceTime = new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const niceDate = new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const formattedAmount = parseFloat(tx.amount).toLocaleString('en-NG', {
            style: 'currency', currency: 'NGN'
        }).replace('₦', '');

        const isIncome = tx.type === 'Deposit' || tx.type === 'Credit';
        const amountClass = isIncome ? 'positive' : 'negative';
        const amountSign = isIncome ? '+' : '-';

        const statusTheme = tx.status === 'Failed' ? 'failed' : 'completed';

        row.innerHTML = `
            <td class="tx-desc">
                <strong>${tx.type}</strong>
                <span>${tx.description || 'Self Service'}</span>
            </td>
            <td class="tx-category">${tx.type}</td>
            <td class="tx-date">${niceDate}</td>
            <td class="tx-time">${niceTime}</td>
            <td class="tx-status"><span class="status ${statusTheme}">${tx.status}</span></td>
            <td class="tx-amount ${amountClass}">${amountSign}₦${formattedAmount}</td>
        `;
        tableBody.appendChild(row);
    });
}


const dashMobileMenu = document.getElementById('dash-mobile-menu');
const sidebar = document.querySelector('.sidebar');
if (dashMobileMenu && sidebar) {
    dashMobileMenu.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });
}


function resetModalViews() {
    document.getElementById('modal-form-view').style.display = 'block';
    document.getElementById('modal-confirm-view').style.display = 'none';
    document.getElementById('modal-feedback-view').style.display = 'none';
    document.getElementById('modal-setup-pin-view').style.display = 'none';
}

function showFeedback(type, title, message) {
    document.getElementById('modal-form-view').style.display = 'none';
    document.getElementById('modal-confirm-view').style.display = 'none';
    document.getElementById('modal-setup-pin-view').style.display = 'none';

    const feedbackView = document.getElementById('modal-feedback-view');
    feedbackView.style.display = 'block';

    const iconEl = document.getElementById('feedback-icon');
    const titleEl = document.getElementById('feedback-title');
    const messageEl = document.getElementById('feedback-message');

    titleEl.innerText = title;
    messageEl.innerText = message;

    if (type === 'success') {
        iconEl.innerHTML = '✅';
        titleEl.style.color = '#10b981';
    } else {
        iconEl.innerHTML = '⚠️';
        titleEl.style.color = '#ef4444';
    }

    document.getElementById('action-modal').classList.add('show');

    document.getElementById('feedback-close-btn').onclick = () => {
        document.getElementById('action-modal').classList.remove('show');
        setTimeout(resetModalViews, 300);
    };

}

