document.getElementById("signupForm").addEventListener("submit", function(e){
    e.preventDefault();

    const fullname = document.getElementById("fullname").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    if (!fullname || !email || !phone || !password) {
        alert("Please fill all required fields.");
        return;
    }

    FlutterwaveCheckout({
        public_key: "FLWPUBK_TEST-527b64aa21c2dd1ec10c123bbf274399-X",
        tx_ref: "skillhub-" + Date.now(),
        amount: 5000,
        currency: "NGN",

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
            alert("Payment Successful! TX Ref: " + payment.transaction_id);

            const users = JSON.parse(localStorage.getItem("skillhub_users") || "[]");
            users.push({ fullname, email, phone, password });
            localStorage.setItem("skillhub_users", JSON.stringify(users));

            window.location.href = "student-dashboard.html";
        },

        onclose: function() {
            alert("Payment was cancelled.");
        }
    });
});
