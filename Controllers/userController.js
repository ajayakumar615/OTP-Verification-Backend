const UserOTP = require('../Models/UserOTP');
const generateOTP = require('../Utils/otpGenerator');
const sendEmail = require('../Utils/sendEmail');

//! ----------------- Send OTP ---------------------------------

const sendOtp = async (req, res) => {
    let { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required.' });
    }

    try {
        //& Check if the user already exists in the database
        let user = await UserOTP.findOne({ email });

        if (user) {
            //& If the user already exists, do not generate or send a new OTP
            return res.status(400).json({ message: 'User with this email already exists.' });
        }

        //& Generate a new OTP
        let otp = generateOTP();
        let otpCreatedAt = new Date();

        //& Create a new record for the user
        let newUser = new UserOTP({ email, otp, otpCreatedAt });
        await newUser.save();

        //& Send OTP via email
        await sendEmail(email, otp);

        res.status(200).json({ message: 'OTP sent successfully.' });
    } catch (error) {
        console.error('Error in sendOtp:', error);
        res.status(500).json({ message: 'Failed to send OTP.', error });
    }
};

// & ---------------------------------- Verify OTP ---------------------------------

const verifyOtp = async (req, res) => {
    let { email, otp } = req.body;

    try {
        let user = await UserOTP.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Email not found.' });
        }

        // Check if the OTP is expired (5 minutes = 300000 milliseconds)
        let currentTime = new Date();
        const otpExpiryTime = new Date(user.otpCreatedAt.getTime() + 5 * 60 * 1000); // Add 5 minutes to the OTP creation time

        if (currentTime > otpExpiryTime) {
            user.otp = undefined;
            user.otpCreatedAt = undefined;
            await user.save();

            return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
        }

        //& Verify OTP
        if (user.otp === otp) {
            user.otp = undefined; //& Clear OTP on successful verification
            user.otpCreatedAt = undefined;
            await user.save();

            return res.status(200).json({ message: 'OTP verified successfully. Login success.' });
        }

        res.status(400).json({ message: 'Invalid OTP.' });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        res.status(500).json({ message: 'Failed to verify OTP.', error });
    }
};

module.exports = { sendOtp, verifyOtp };
