const nodemailer=require("nodemailer");

// create transporter

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

const sendEmail=async (to,subject,html)=>{
    const mailOptions={
        from:process.env.EMAIL_USER,
        to,
        subject,
        html
    }

  try {
        await transporter.sendMail(mailOptions)
  } catch (error) {
    console.log(error);
  }
}
module.exports=sendEmail