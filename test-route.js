const fetch = require('node-fetch');

async function testRoute() {
    try {
        const response = await fetch('http://localhost:5000/api/alumni/me', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'auth-token': 'test-token' // This should fail with 401, not 404
            }
        });
        console.log('Status:', response.status);
        console.log('Content-Type:', response.headers.get('content-type'));
        const text = await response.text();
        console.log('Response:', text.substring(0, 200));
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testRoute();