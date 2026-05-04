const activeEmail = localStorage.getItem('active_session');
if (!activeEmail) {
    window.location.href = "Login.html";
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`/api/server/tinubu_users?email=${activeEmail}`);
        const users = await response.json();

        if (users.length === 0) {
            window.location.href = "Login.html";
            return;
        }

        const userData = users[0];
        const firstName = userData.name.split(' ')[0];
        document.getElementById('user-first-name').innerText = firstName;

        renderFullHistory(userData.transactions || []);

    } catch (error) {
        console.error("Failed to load history:", error);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('active_session');
            window.location.href = "Login.html";
        });
    }
});

function renderFullHistory(transactions) {
    const tableBody = document.getElementById('transaction-list');
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (transactions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color: #94a3b8;">No transactions yet.</td></tr>`;
        return;
    }

    transactions.slice().reverse().forEach(tx => {
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