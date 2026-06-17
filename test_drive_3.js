async function test() {
  const id = "1Wjiw9yv7rruNtgkGbkwtoxksIaCBqdsr";
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  
  console.log("Fetching:", downloadUrl);
  const res1 = await fetch(downloadUrl, { redirect: "manual" });
  console.log("res1 status:", res1.status);
  
  if (res1.status === 303 || res1.status === 302) {
    const loc = res1.headers.get("location");
    const cookieStr = res1.headers.get("set-cookie") || "";
    console.log("loc:", loc);
    // console.log("cookie:", cookieStr);
    
    if (loc) {
      const res2 = await fetch(loc, { headers: { Cookie: cookieStr } });
      const contentType = res2.headers.get("content-type") || "";
      console.log("res2 status:", res2.status, "content-type:", contentType);
      
      if (contentType.includes("text/html")) {
        const text = await res2.text();
        console.log("HTML response snippet:", text.substring(0, 500));
        
        const uuidMatch = text.match(/name="uuid" value="([^"]+)"/);
        console.log("uuidMatch:", uuidMatch ? uuidMatch[1] : "Not found!");
        
        // Let's also check for confirm match just in case
        const confirmMatch = loc.match(/confirm=([a-zA-Z0-9_-]+)/);
        console.log("loc confirm parameter:", confirmMatch ? confirmMatch[1] : "Not found in loc");
      }
    }
  }
}
test();
