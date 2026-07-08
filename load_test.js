const fs = require('fs');

/**
 * A simple, zero-dependency load testing script using native Node.js fetch.
 * Ensure you are using Node.js v18 or higher.
 */
async function runLoadTest(url, method = 'GET', body = null, headers = {}, concurrency = 10, totalRequests = 100) {
    console.log(`\n🚀 Starting Load Test for: ${method} ${url}`);
    console.log(`👥 Concurrency (Simultaneous users): ${concurrency}`);
    console.log(`🔄 Total Requests: ${totalRequests}`);
    
    let requestsStarted = 0;
    let successful = 0;
    let failed = 0;
    const latencies = [];
    
    const startTime = Date.now();
    
    // Worker function to process requests
    const makeRequest = async () => {
        while (requestsStarted < totalRequests) {
            requestsStarted++;
            const reqStart = Date.now();
            try {
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...headers
                    },
                };
                if (body) {
                    options.body = JSON.stringify(body);
                }
                
                const response = await fetch(url, options);
                
                // Read the response body to fully complete the request, but discard it to save memory
                await response.text(); 
                
                if (response.ok) {
                    successful++;
                } else {
                    failed++;
                }
            } catch (error) {
                failed++;
            } finally {
                latencies.push(Date.now() - reqStart);
            }
        }
    };

    // Start concurrent workers
    const workers = Array.from({ length: Math.min(concurrency, totalRequests) }).map(() => makeRequest());
    
    // Wait for all workers to finish
    await Promise.all(workers);
    
    const totalTime = (Date.now() - startTime) / 1000; // in seconds
    
    // Calculate metrics
    latencies.sort((a, b) => a - b);
    const minLatency = latencies[0] || 0;
    const maxLatency = latencies[latencies.length - 1] || 0;
    const avgLatency = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const p95 = latencies.length ? latencies[Math.floor(latencies.length * 0.95)] : 0;
    const reqPerSec = totalRequests / totalTime;

    // Output Results
    console.log(`\n📊 --- TEST RESULTS ---`);
    console.log(`⏱️  Total Time: ${totalTime.toFixed(2)}s`);
    console.log(`✅ Successful Requests: ${successful}`);
    console.log(`❌ Failed Requests: ${failed}`);
    console.log(`🚀 Throughput: ${reqPerSec.toFixed(2)} req/s`);
    console.log(`\n⏳ --- LATENCY ---`);
    console.log(`📉 Min: ${minLatency}ms`);
    console.log(`📈 Max: ${maxLatency}ms`);
    console.log(`📏 Avg: ${avgLatency.toFixed(2)}ms`);
    console.log(`📊 p95: ${p95}ms (95% of requests completed faster than this)\n`);
}

async function main() {
    console.log("==================================================");
    console.log("             LEX AI - LOAD TEST TOOL              ");
    console.log("==================================================");

    // ---------------------------------------------------------
    // TEST 1: Basic Node.js Backend Health Endpoint
    // Good for seeing how many pure network requests the Express server can handle.
    // ---------------------------------------------------------
    await runLoadTest(
        url = 'http://localhost:4000/', 
        method = 'GET', 
        body = null, 
        headers = {}, 
        concurrency = 50,  // 50 users hitting it at the same time
        totalRequests = 1000 // 1000 total requests
    );

    // ---------------------------------------------------------
    // TEST 2: AI Analysis Endpoint (Proxy to Python Backend)
    // IMPORTANT: If you are running a local LLM, high concurrency WILL overload it.
    // Uncomment the block below to test it, but start with low numbers!
    // ---------------------------------------------------------
    /*
    await runLoadTest(
        url = 'http://localhost:4000/api/analyze-case', 
        method = 'POST', 
        body = { case_description: "A short test case regarding a theft in a store." }, 
        headers = {}, 
        concurrency = 3,  // Start very low for local AI inference (e.g. 3-5 users)
        totalRequests = 15 // Start with a small number of total requests
    );
    */
}

main();
