document.getElementById("signupForm").addEventListener("submit", async function(e){
    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (!fullname || !email || !phone || !password) {
        alert("Please fill all required fields.");
        return;
    }

    const submitBtn = this.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    
    try {
        submitBtn.textContent = "Creating Account...";
        submitBtn.disabled = true;

        // 1. Create Account
        const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname, email, phone, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        // 2. Initiate Payment (Optional: You might want to login automatically or redirect to login)
        // For now, we proceed to payment as before
        submitBtn.textContent = "Processing Payment...";
        
        FlutterwaveCheckout({
            public_key: "FLWPUBK_TEST-527b64aa21c2dd1ec10c123bbf274399-X",
            tx_ref: "skillhub-" + Date.now(),
            amount: 5000,
            currency: "NGN",
            payment_options: "card,banktransfer,ussd",
            customer: {
                email: email,
                phone_number: phone,
                name: fullname
            },
            customizations: {
                title: "SkillHub Enrollment",
                description: "Payment for SkillHub training enrollment",
                logo: "skillhub_logo.png"
            },
            callback: function(payment) {
                // Payment Successful
                // Ideally, verify payment on backend here
                alert("Payment Successful! Please login to your new account.");
                window.location.href = "login.html";
            },
            onclose: function() {
                alert("Payment cancelled. Your account has been created, please login.");
                window.location.href = "login.html";
            }
        });

    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
});
