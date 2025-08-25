document.addEventListener('DOMContentLoaded', () => {
    // Netlify CMS Integration (with sample data)
    const impactCardsContainer = document.getElementById('impact-cards-container');

    const sampleData = [
        { title: 'Education for All', funded: 62, supporters: 156, goal: 25000, current: 15420 },
        { title: 'Community Food Programs', funded: 58, supporters: 89, goal: 15000, current: 8750 }
    ];

    function renderImpactCards(data) {
        if (impactCardsContainer) {
            impactCardsContainer.innerHTML = data.map(item => `
                <div class="card">
                    <h3>${item.title}</h3>
                    <p>${item.supporters} supporters • ${item.funded}% funded</p>
                    <progress value="${item.current}" max="${item.goal}"></progress>
                    <p>₹${item.current.toLocaleString('en-IN')} of ₹${item.goal.toLocaleString('en-IN')}</p>
                </div>
            `).join('');
        }
    }

    renderImpactCards(sampleData);

    // --- Donation Form Interactivity ---
    const amountButtons = document.querySelectorAll('.amount-btn');
    const customAmountInput = document.getElementById('custom-amount');

    amountButtons.forEach(button => {
        button.addEventListener('click', () => {
            const amount = button.getAttribute('data-amount');
            customAmountInput.value = amount;
        });
    });

    // --- Razorpay Integration ---
    const donateBtn = document.getElementById('donate-btn');
   
    if (donateBtn) {
        donateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const amount = customAmountInput.value;
            const fullName = document.getElementById('full-name').value;
            const email = document.getElementById('email').value;

            // Simple validation
            if (!amount || !fullName || !email) {
                alert('Please fill in your name, email, and a donation amount.');
                return;
            }

            const options = {
                "key": "rzp_test_R97BJt5cOtiIX8", // Make sure this is your Razorpay Key ID
                "amount": amount * 100, // Amount in the smallest currency unit
                "currency": "INR",
                "name": "Social Good Initiative",
                "description": "Donation",
                
                // --- THIS IS THE REPLACED/UPDATED PART ---
                "handler": async function (response){
                    // This function runs after a successful donation
                    alert('Thank you for your donation! A personalized confirmation email is on its way.');
                    console.log('Payment ID:', response.razorpay_payment_id);
                
                    // Get all the donor details from the form
                    const donationData = {
                        amount: document.getElementById('custom-amount').value,
                        name: document.getElementById('full-name').value,
                        email: document.getElementById('email').value,
                        message: document.getElementById('message').value
                    };
                
                    // Call our new serverless backend function
                    try {
                        await fetch('/.netlify/functions/send-thank-you', {
                            method: 'POST',
                            body: JSON.stringify(donationData)
                        });
                    } catch (error) {
                        console.error('Failed to trigger thank you email:', error);
                    }
                },
                // --- END OF REPLACED/UPDATED PART ---

                "prefill": {
                    "name": fullName,
                    "email": email
                },
                "theme": {
                    "color": "#0275d8"
                }
            };
            const rzp1 = new Razorpay(options);
            rzp1.open();
        });
    }
});