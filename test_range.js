const https = require("https");
const id = "1Wjiw9yv7rruNtgkGbkwtoxksIaCBqdsr";

async function test() {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  const res1 = await fetch(downloadUrl, { redirect: "manual" });
  
  if (res1.status === 303 || res1.status === 302) {
    const loc = res1.headers.get("location");
    const cookieStr = res1.headers.get("set-cookie") || "";
    
    https.get(loc, { headers: { Cookie: cookieStr, Range: "bytes=0-" } }, (proxyRes) => {
      console.log("https.get statusCode:", proxyRes.statusCode);
      console.log("https.get headers location:", proxyRes.headers.location);
      proxyRes.destroy();
    }).on('error', (err) => {
      console.error("https.get error:", err);
    });
  }
}
test();
