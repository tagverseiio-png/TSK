const id = "1Wjiw9yv7rruNtgkGbkwtoxksIaCBqdsr";

async function test() {
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${id}`;
  const res1 = await fetch(downloadUrl, { redirect: "manual" });
  
  if (res1.status === 303 || res1.status === 302) {
    const loc = res1.headers.get("location");
    console.log("Cached Loc:", loc);
    
    // Wait 5 seconds
    await new Promise(r => setTimeout(r, 5000));
    
    // Try fetching the loc again directly
    const res2 = await fetch(loc, { method: "HEAD" });
    console.log("Status after 5s:", res2.status);
    
    // Wait 60 seconds
    console.log("Waiting 30s...");
    await new Promise(r => setTimeout(r, 30000));
    
    const res3 = await fetch(loc, { method: "HEAD" });
    console.log("Status after 30s:", res3.status);
  }
}
test();
