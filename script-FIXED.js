async function queryAI(userMessage, imageBase64 = null) {
    const systemPrompt = `You are Mubra AI 8.v1...
    [keep the system prompt same]`;

    try {
        // Use YOUR OWN API route instead of calling Anthropic directly
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: userMessage,
                imageBase64: imageBase64,
                systemPrompt: systemPrompt
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`API Error: ${error.error || 'Unknown error'}`);
        }

        const data = await response.json();
        return data.text;
    } catch (error) {
        throw new Error(error.message || 'Failed to get response');
    }
}
```

---

## 📋 **Steps:**

### **Step 1: Create /api folder**
```
GitHub එකේ
→ "Add file"
→ Type path: api/chat.js
→ Paste code (above)
→ Commit
```

### **Step 2: Update script.js**
```
Find queryAI() function
Replace එක (above code)
Commit
```

### **Step 3: Vercel auto-deploys**
```
Detects /api folder
Creates serverless function
Deploy (2-3 තත්පර)
```

### **Step 4: Test**
```
Hard refresh
Type message
Send
Should work! ✅
```

---

## ✅ **Why This Works:**
```
Browser → /api/chat (YOUR server)
         ↓
Server (Vercel) → Anthropic API (with API key)
         ↓
Response back to browser

✅ No CORS errors!
✅ API key safe (server-side only)
✅ Works perfect!
