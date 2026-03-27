const emailTemplate = (username, role, course) => {
return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Welcome to EduPlatform</title>
<style>
body{
    font-family: Arial, sans-serif;
    background-color:#f4f6f8;
    margin:0;
    padding:0;
}

.container{
    max-width:600px;
    margin:40px auto;
    background:#ffffff;
    border-radius:8px;
    overflow:hidden;
    box-shadow:0 2px 10px rgba(0,0,0,0.1);
}

.header{
    background:#4F46E5;
    color:white;
    text-align:center;
    padding:20px;
}

.header h1{
    margin:0;
}

.content{
    padding:30px;
    color:#333;
}

.info-box{
    background:#f1f5f9;
    padding:15px;
    border-radius:6px;
    margin:20px 0;
}

.footer{
    background:#f9fafb;
    text-align:center;
    padding:15px;
    font-size:12px;
    color:#777;
}
</style>
</head>

<body>

<div class="container">

<div class="header">
<h1>EduPlatform</h1>
<p>Your Learning Journey Starts Here</p>
</div>

<div class="content">

<h2>Hello ${username}, 👋</h2>

<p>
Welcome to <strong>EduPlatform</strong>. Your account has been successfully created.
We are excited to have you join our learning community.
</p>

<div class="info-box">
<p><strong>Role:</strong> ${role}</p>
<p><strong>Course:</strong> ${course}</p>
</div>

<p>
You can now login to your account and start exploring exams, learning resources,
and your personalized dashboard.
</p>

<p>
If you have any questions, feel free to contact our support team.
</p>

<p>
Best regards,<br>
<strong>EduPlatform Team</strong>
</p>

</div>

<div class="footer">
<p>© 2026 EduPlatform. All rights reserved.</p>
<p>This is an automated message. Please do not reply.</p>
</div>

</div>

</body>
</html>
`;
};

module.exports = emailTemplate;