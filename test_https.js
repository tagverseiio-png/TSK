const https = require("https");
const id = "1Wjiw9yv7rruNtgkGbkwtoxksIaCBqdsr";

async function test() {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  const res1 = await fetch(downloadUrl, { redirect: "manual" });
  
  if (res1.status === 303 || res1.status === 302) {
    const loc = res1.headers.get("location");
    const cookieStr = res1.headers.get("set-cookie") || "";
    
    https.get(loc, { headers: { Cookie: cookieStr } }, (proxyRes) => {
      console.log("https.get statusCode:", proxyRes.statusCode);
      console.log("https.get headers:", proxyRes.headers);
      
      let bytes = 0;
      proxyRes.on('data', (chunk) => {
        bytes += chunk.length;
        if (bytes > 10000) {
            console.log("Successfully received 10KB+, aborting.");
            proxyRes.destroy();
            process.exit(0);
        }
      });
    }).on('error', (err) => {
      console.error("https.get error:", err);
    });
  }
}
test();
