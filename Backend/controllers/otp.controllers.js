import { generateOTP, storeOTP, verifyOTP, sendOTP, sendTestOtp, getStoredOTPs } from "../services/sendSms.js";

// Send OTP to phone number
export const sendOTPController = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    
    console.log('Request body:', req.body);
    
    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }
    
    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP in memory (expires in 5 minutes)
    storeOTP(phoneNumber, otp);
    
    // Send OTP via SMS
    const result = await sendOTP(phoneNumber, otp);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: "OTP sent successfully",
        messageSid: result.messageSid
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Error in sendOTPController:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Verify OTP
export const verifyOTPController = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    
    console.log('Verify OTP request:', req.body);
    
    if (!phoneNumber || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required"
      });
    }
    
    const result = verifyOTP(phoneNumber, otp);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: result.message
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
  } catch (error) {
    console.error('Error in verifyOTPController:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Send test OTP (for testing with your verified number)
export const sendTestOTPController = async (req, res) => {
  try {
    const otp = generateOTP();
    
    // Store OTP for the test number
    storeOTP(process.env.TEST_TO, otp);
    
    const result = await sendTestOtp(otp);
    
    if (result.success) {
      res.status(200).json({
        success: true,
        message: "Test OTP sent successfully",
        messageSid: result.messageSid,
        // For testing purposes, return the OTP (remove in production)
        testOTP: otp
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to send test OTP",
        error: result.error
      });
    }
    
  } catch (error) {
    console.error('Error in sendTestOTPController:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Debug endpoint to check stored OTPs
export const getStoredOTPsController = async (req, res) => {
  try {
    const storedOTPs = getStoredOTPs();
    res.status(200).json({
      success: true,
      message: "Current stored OTPs",
      data: storedOTPs
    });
  } catch (error) {
    console.error('Error in getStoredOTPsController:', error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};