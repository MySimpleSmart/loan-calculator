document.addEventListener('DOMContentLoaded', function() {
    var amountInput = document.getElementById("amount");
    amountInput.addEventListener("input", formatAmount);

    document.getElementById("calculateButton").addEventListener("click", calculateLoan);
    document.getElementById("resetButton").addEventListener("click", resetForm);
});

function formatAmount() {
    var input = this.value.replace(/[^0-9.]/g, '');
    var parts = input.split('.');
    var integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    this.value = integerPart;
    if (parts.length > 1) {
        this.value += '.' + parts[1].substring(0, 2); // Limit to two decimal places
    }
}

function calculateLoan() {
    let validationResponse = validateInputs();
    if (!validationResponse.isValid) {
        displayErrorMessage(validationResponse.message);
        return;
    }
    setCalculatingState(true);
    clearResults();

    setTimeout(() => {
        performCalculations();
        setCalculatingState(false);
    }, 500); // Simulated delay to mimic processing time
}

function performCalculations() {
    var calcMethod = document.getElementById("calcMethod").value;
    var amount = parseFloat(document.getElementById("amount").value.replace(/,/g, ''));
    var monthlyInterestRate = parseFloat(document.getElementById("interest").value) / 100; // Monthly interest rate
    var termMonths = parseInt(document.getElementById("term").value);
    var startDate = new Date(document.getElementById("startDate").value);

    var repayment = document.getElementById("repaymentFrequency").value;
    var paymentsCount, daysPerPeriod;

    switch (repayment) {
        case "monthly":
            daysPerPeriod = 30;
            paymentsCount = termMonths;
            break;
        case "fortnightly":
            daysPerPeriod = 14;
            paymentsCount = Math.ceil((termMonths * 30) / 14);
            break;
        case "weekly":
            daysPerPeriod = 7;
            paymentsCount = Math.ceil((termMonths * 30) / 7);
            break;
    }

    // Calculate the daily interest rate
    var dailyInterestRate = Math.pow(1 + monthlyInterestRate, 1 / 30) - 1;

    // Calculate the period interest rate
    var periodInterestRate = Math.pow(1 + dailyInterestRate, daysPerPeriod) - 1;

    var remainingBalance = amount;
    var totalInterestPaid = 0;
    var paymentDate = new Date(startDate);
    var periodPayment = (amount * periodInterestRate) / (1 - Math.pow(1 + periodInterestRate, -paymentsCount));
    var totalPrincipalPayment = 0;

    // Add initial row for loan disbursement date
    addRow(0, paymentDate.toLocaleDateString(), 0, 0, remainingBalance, 0);

    for (let payment = 1; payment <= paymentsCount; payment++) {
        var interestPayment = remainingBalance * periodInterestRate;
        var principalPayment = periodPayment - interestPayment;
        totalPrincipalPayment += principalPayment;
        var totalPayment = periodPayment;

        remainingBalance -= principalPayment;
        totalInterestPaid += interestPayment;

        addRow(payment, paymentDate.toLocaleDateString(), principalPayment, interestPayment, remainingBalance, totalPayment);

        // Adjust the payment date based on the payment frequency
        if (repayment === "monthly") {
            paymentDate.setMonth(paymentDate.getMonth() + 1);
        } else if (repayment === "fortnightly") {
            paymentDate.setDate(paymentDate.getDate() + 14); // Add 14 days for fortnightly payments
        } else if (repayment === "weekly") {
            paymentDate.setDate(paymentDate.getDate() + 7);
        }
    }

    addTotalRow(totalPrincipalPayment, totalInterestPaid);
    displaySuccessMessage("Тооцоолол амжилттай.");
}

function addTotalRow(totalPrincipal, totalInterest) {
    var table = document.getElementById("resultTable");
    var row = table.insertRow();
    row.insertCell(0).innerHTML = "Total";
    row.insertCell(1).innerHTML = "";
    row.insertCell(2).innerHTML = `$${totalPrincipal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    row.insertCell(3).innerHTML = `$${totalInterest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    row.insertCell(4).innerHTML = "";
    row.insertCell(5).innerHTML = `$${(totalPrincipal + totalInterest).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function validateInputs() {
    var amount = document.getElementById("amount").value.replace(/,/g, '');
    var interestRate = document.getElementById("interest").value;
    var termMonths = document.getElementById("term").value;
    var startDate = document.getElementById("startDate").value;

    if (!amount || parseFloat(amount) <= 0) {
        return { isValid: false, message: "Зээлийн дүнгээ оруулна уу." };
    }
    if (!interestRate || parseFloat(interestRate) <= 0) {
        return { isValid: false, message: "Зээлийн хүү оруулна уу." };
    }
    if (!termMonths || parseInt(termMonths) <= 0 || parseInt(termMonths) > 72) {
        return { isValid: false, message: "Зээлийн хугацааг оруулна уу." };
    }
    if (!startDate) {
        return { isValid: false, message: "Зээл эхлэх огноог оруулна уу." };
    }
    return { isValid: true, message: "" };
}

function setCalculatingState(isCalculating) {
    document.getElementById("calculateButton").disabled = isCalculating;
    document.getElementById("loadingSpinner").style.display = isCalculating ? "inline-block" : "none";
}

function addRow(month, paymentDate, principal, interest, balance, totalPayment) {
    var table = document.getElementById("resultTable");
    var row = table.insertRow();
    row.insertCell(0).innerHTML = month;
    row.insertCell(1).innerHTML = paymentDate;
    row.insertCell(2).innerHTML = `$${principal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    row.insertCell(3).innerHTML = `$${interest.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    row.insertCell(4).innerHTML = `$${balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    row.insertCell(5).innerHTML = `$${totalPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
}

function resetForm() {
    document.getElementById("loanForm").reset();
    clearResults();
    displaySuccessMessage("Амжилттай шинэчлэгдлээ.");
}

function clearResults() {
    var table = document.getElementById("resultTable");
    table.innerHTML = `
        <tr>
            <th>Дугаар</th>
            <th>Төлөлт хийгдэх огноо</th>
            <th>Үндсэн зээл ($)</th>
            <th>Хүү ($)</th>
            <th>Үлдэгдэл ($)</th>
            <th>Нийт төлөх дүн ($)</th>
        </tr>
    `;
}

function displayErrorMessage(message) {
    var messageElement = document.getElementById("errorMessage");
    messageElement.innerText = message;
    messageElement.style.display = "block";
    setTimeout(function() {
        messageElement.style.display = "none";
    }, 3000);
}

function displaySuccessMessage(message) {
    var messageElement = document.getElementById("successMessage");
    messageElement.innerText = message;
    messageElement.style.display = "block";
    setTimeout(function() {
        messageElement.style.display = "none";
    }, 3000);
}

document.getElementById('downloadPdfButton').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.autoTable({
        html: '#resultTable',
        margin: { top: 10 }
    });

    doc.save('loan-payments.pdf');
});

document.getElementById('emailPdfButton').addEventListener('click', function() {
    var email = prompt("Please enter your email address:");
    if (email) {
        // Send email address and table data to your server
        console.log("Email and data sent to the server.");
    }
});