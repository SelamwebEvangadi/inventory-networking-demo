document
  .getElementById("inventoryForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const item_name = document.getElementById("itemName").value;
    const quantity = parseInt(document.getElementById("quantity").value);
    const backendURL = `http://54.204.241.146:3000/submit`;

    try {
      const response = await fetch(backendURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_name, quantity }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`✅ ${result.message}: ${result.item_name} (${result.quantity})`);
      } else {
        const err = await response.text();
        console.error("❌ Server responded with error:", err);
        alert("❌ Failed to submit. Check console for details.");
      }
    } catch (error) {
      console.error("❌ Network or fetch error:", error);
      alert("❌ Could not connect to backend.");
    }
  });

document
  .getElementById("showList")
  .addEventListener("click", async function () {
    const listURL = `http://54.204.241.146:3000/list`;

    try {
      const response = await fetch(listURL);
      if (response.ok) {
        const items = await response.json();
        const resultDiv = document.getElementById("inventoryResults");
        if (items.length === 0) {
          resultDiv.innerHTML = "<p>🕳️ No items found.</p>";
        } else {
          resultDiv.innerHTML = items
            .map(
              (i) => `<p>📦 ${i.item_name} — <strong>${i.quantity}</strong></p>`
            )
            .join("");
        }
      } else {
        const err = await response.text();
        console.error("❌ Failed to load inventory:", err);
        alert("❌ Error loading inventory.");
      }
    } catch (error) {
      console.error("❌ Fetch error:", error);
      alert("❌ Could not connect to backend.");
    }
  });
