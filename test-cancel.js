const test = async () => {
  try {
    const loginRes = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'iago@teste.com', password: 'password123' })
    });
    const { token } = await loginRes.json();
    console.log('Login token:', token ? 'Success' : 'Failed');

    if (!token) {
      console.log('Cannot proceed without token.');
      return;
    }

    const appsRes = await fetch('http://localhost:3000/applications/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const apps = await appsRes.json();
    console.log('Applications:', apps.map(a => `${a.id} - ${a.status}`));

    if (apps.length > 0) {
      const appId = apps[0].id;
      console.log(`Canceling app: ${appId}`);
      const cancelRes = await fetch(`http://localhost:3000/applications/${appId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Cancel status:', cancelRes.status);
      const cancelBody = await cancelRes.text();
      console.log('Cancel body:', cancelBody);
    } else {
      console.log('No apps to cancel.');
    }
  } catch (e) {
    console.error('Error:', e);
  }
};
test();
