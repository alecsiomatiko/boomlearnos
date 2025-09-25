const { exec } = require('child_process');

// Función para hacer una petición HTTP usando Node.js nativo
function testAPI(url) {
  return new Promise((resolve, reject) => {
    const http = require('http');
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function testAPIs() {
  console.log('🔍 Probando APIs del sistema...\n');
  
  const apis = [
    { name: 'User Profile', url: 'http://localhost:3000/api/user/profile' },
    { name: 'Diagnostic Modules', url: 'http://localhost:3000/api/diagnostic/modules' },
    { name: 'Diagnostics Overview', url: 'http://localhost:3000/api/diagnostics/overview' }
  ];
  
  for (const api of apis) {
    try {
      console.log(`Probando ${api.name}...`);
      const result = await testAPI(api.url);
      console.log(`✅ Status: ${result.status}`);
      
      if (result.status === 200) {
        const response = JSON.parse(result.data);
        console.log(`✅ Success: ${response.success ? 'true' : 'false'}`);
      } else {
        console.log(`❌ Error: Status ${result.status}`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    console.log('');
  }
}

testAPIs();
