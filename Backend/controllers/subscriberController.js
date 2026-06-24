const Subscriber = require("../models/Subscriber");
const { sendWelcomeEmail } = require("../services/emailService");

exports.subscribe = async (req, res) => {
    try {
        console.log("BODY:", req.body);

        const { email } = req.body;

        console.log("EMAIL:", email);

        const existing = await Subscriber.findOne({ email });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already subscribed",
            });
        }

        await Subscriber.create({ email });

        console.log("Subscriber saved");

        try {
            await sendWelcomeEmail(email);
            console.log("Email sent");
        } catch (emailError) {
            console.error("Email sending failed:", emailError);
        }

        res.status(201).json({
            success: true,
            message: "Subscribed successfully",
        });
    } catch (error) {
        console.error("SUBSCRIBE ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};