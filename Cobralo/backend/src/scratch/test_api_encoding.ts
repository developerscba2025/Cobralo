
import axios from 'axios';

async function testProfileUpdate() {
    const API_URL = 'http://localhost:3000/api';
    const token = 'YOUR_TOKEN_HERE'; // I'd need a real token

    const payload = {
        welcomeTemplate: "Hola! 💰 ✅ á é í ó ú ñ » · 🔔"
    };

    try {
        console.log("Sending profile update with emojis...");
        // This is what the frontend does
        const res = await axios.put(`${API_URL}/auth/profile`, payload, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        });
        console.log("Response:", res.data.welcomeTemplate);
        if (res.data.welcomeTemplate === payload.welcomeTemplate) {
            console.log("✅ Success! Emojis preserved.");
        } else {
            console.log("❌ Mismatch! Received:", res.data.welcomeTemplate);
        }
    } catch (err: any) {
        console.error("Error:", err.response?.data || err.message);
    }
}

// testProfileUpdate();
