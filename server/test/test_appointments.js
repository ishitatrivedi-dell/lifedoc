const axios = require('axios');

const testAppointments = async () => {
    try {
        const API_URL = 'http://localhost:5000/api/appointments';
        console.log(`Testing GET ${API_URL} ...`);

        // Note: This test will likely fail with 401 Unauthorized because we are not sending a token.
        // But getting a 401 confirms the route exists and is protected, which is what we want to verify.
        // If we get 404, then the route is not registered.

        try {
            await axios.get(API_URL);
        } catch (error) {
            if (error.response) {
                console.log(`Response Status: ${error.response.status}`);
                if (error.response.status === 401) {
                    console.log('SUCCESS: Route exists and is protected (401 Unauthorized).');
                } else if (error.response.status === 404) {
                    console.error('FAILURE: Route not found (404).');
                } else {
                    console.log(`Response:`, error.response.data);
                }
            } else {
                console.error('Error:', error.message);
            }
        }

    } catch (error) {
        console.error('Unexpected error:', error);
    }
};

testAppointments();
