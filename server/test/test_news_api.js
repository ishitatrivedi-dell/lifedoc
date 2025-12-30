const axios = require('axios');

const testApi = async () => {
    try {
        console.log('Testing GET http://localhost:5000/api/news ...');
        const response = await axios.get('http://localhost:5000/api/news');

        if (response.status === 200 && response.data.success) {
            console.log('API Success!');
            console.log(`Received ${response.data.data.length} articles.`);
            if (response.data.data.length > 0) {
                console.log('Sample Article:', response.data.data[0].title);
            }
        } else {
            console.error('API Failed:', response.status, response.data);
        }
    } catch (error) {
        console.error('API Request Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('Make sure the server is running on port 5000.');
        }
    }
};

testApi();
