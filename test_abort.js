async function run() {
  try {
    const controller = new AbortController();
    const res = await fetch("https://google.com", { signal: controller.signal });
    console.log("Status:", res.status);
    controller.abort();
    console.log("Aborted without throwing!");
  } catch(err) {
    console.error("Caught error:", err.message);
  }
}
run();
