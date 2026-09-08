const localtunnel = require("localtunnel");

async function startTunnel() {
  try {
    const sub = "conango-" + Math.floor(1000 + Math.random() * 9000);
    const tunnel = await localtunnel({ port: 3000, subdomain: sub });
    console.log("PUBLIC_TUNNEL_URL=" + tunnel.url);
    
    // Save to a file so we can read it easily
    const fs = require("fs");
    fs.writeFileSync("C:\\Users\\pablo\\.gemini\\antigravity\\scratch\\ConanGo\\public_url.txt", tunnel.url, "utf8");

    tunnel.on("close", () => {
      console.log("Tunnel closed");
    });
  } catch (err) {
    console.error("Tunnel error:", err);
  }
}

startTunnel();
