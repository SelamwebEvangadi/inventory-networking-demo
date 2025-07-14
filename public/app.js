document
  .getElementById("inventoryForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const item_name = document.getElementById("itemName").value;
    const quantity = parseInt(document.getElementById("quantity").value);

    try {
      const response = await fetch("http://54.204.241.146:3000/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
