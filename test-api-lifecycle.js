const http = require('http');

function request(method, path, body, token = null) {
  return new Promise((resolve, reject) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const data = body ? JSON.stringify(body) : '';
    if (data) {
      headers['Content-Length'] = Buffer.byteLength(data);
    }

    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers
    }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: raw ? JSON.parse(raw) : null });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', reject);
    if (data) {
      req.write(data);
    }
    req.end();
  });
}

async function run() {
  const uniqueSuffix = Date.now();
  const companyEmail = `company_${uniqueSuffix}@test.com`;
  const companyCnpj = `9876543210${(uniqueSuffix % 10000).toString().padStart(4, '0')}`;
  const userEmail = `user_${uniqueSuffix}@test.com`;
  const password = 'password123';

  try {
    console.log('--- 1. Registering Company ---');
    console.log(`Email: ${companyEmail}, CNPJ: ${companyCnpj}`);
    const resCompany = await request('POST', '/accounts', {
      email: companyEmail,
      password: password,
      role: 'Company',
      name: 'Dynamic Company Inc.',
      cnpj: companyCnpj,
      contact: 'contact@dynamiccompany.com'
    });
    console.log('Company register status:', resCompany.status, resCompany.body);

    console.log('--- 2. Logging in as Company ---');
    const loginComp = await request('POST', '/auth/login', {
      email: companyEmail,
      password: password
    });
    console.log('Company login status:', loginComp.status, loginComp.body);
    const companyToken = loginComp.body?.access_token;

    if (!companyToken) {
      throw new Error('Failed to obtain Company token');
    }

    // Wait a brief moment to ensure RabbitMQ profiles consumer finished
    console.log('Waiting 1s for backend event processing...');
    await new Promise(r => setTimeout(r, 1000));

    console.log('--- 3. Creating a Job (DRAFT) ---');
    const createJob = await request('POST', '/jobs', {
      title: 'Senior Software Engineer',
      description: 'Looking for an experienced backend developer with NestJS and Prisma.',
      requirements: 'Experience with NestJS, Prisma, and PostgreSQL is required.',
      location: 'Sao Paulo',
      contractType: 'PJ',
      expiresAt: '2026-08-31T00:00:00.000Z'
    }, companyToken);
    console.log('Job create status:', createJob.status, createJob.body);
    const jobId = createJob.body?.id;

    if (!jobId) {
      throw new Error('Failed to create Job');
    }

    console.log('--- 4. Publishing the Job ---');
    const publishJob = await request('PATCH', `/jobs/${jobId}`, {
      status: 'PUBLISHED'
    }, companyToken);
    console.log('Job publish status:', publishJob.status, publishJob.body);

    console.log('--- 5. Registering User ---');
    console.log(`Email: ${userEmail}`);
    const resUser = await request('POST', '/accounts', {
      email: userEmail,
      password: password,
      role: 'User',
      name: 'Dynamic Candidate',
      bio: 'Fascinated by NestJS and clean architectures.'
    });
    console.log('User register status:', resUser.status, resUser.body);

    console.log('--- 6. Logging in as User ---');
    const loginUser = await request('POST', '/auth/login', {
      email: userEmail,
      password: password
    });
    console.log('User login status:', loginUser.status, loginUser.body);
    const userToken = loginUser.body?.access_token;

    if (!userToken) {
      throw new Error('Failed to obtain User token');
    }

    console.log('--- 7. Listing Jobs (User) ---');
    const listJobs = await request('GET', '/jobs', null, userToken);
    console.log('Jobs listing status:', listJobs.status, listJobs.body);

    console.log('--- 8. Applying to the Job (Will fail or return 404 since /applications is not implemented yet) ---');
    const applyJob = await request('POST', '/applications', { jobId }, userToken);
    console.log('Apply response status:', applyJob.status, applyJob.body);

  } catch (e) {
    console.error('Test run failed:', e);
  }
}

run();
