
const payload = {
    text: "Hola! 💰 ✅ á é í ó ú ñ » · \uD83D\uDD14"
};

console.log("Original:", payload.text);

const json = JSON.stringify(payload);
console.log("JSON string:", json);

const buffer = Buffer.from(json, 'utf-8');
console.log("Buffer length:", buffer.length);

const backToString = buffer.toString('utf-8');
console.log("Back to string:", backToString);

const backToObj = JSON.parse(backToString);
console.log("Back to object text:", backToObj.text);

if (backToObj.text === payload.text) {
    console.log("✅ Encoding is preserved perfectly in Node.js buffer flow.");
} else {
    console.log("❌ Encoding mismatch!");
}

// Check for replacement characters
if (backToString.includes('\uFFFD')) {
    console.log("❌ Found replacement character \uFFFD!");
}
