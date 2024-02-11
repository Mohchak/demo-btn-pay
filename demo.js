class MyDemoBalise extends HTMLElement {
  constructor() {
    super();
    this.baseAmount = 25; // Default value, will be updated from API
    this.minAmount = 0;
    this.maxAmount = Infinity;
    this.isPaymentLinkDisabled = false;
    this.amount = 25;
  }

  connectedCallback() {
    this.fetchPaymentDetails();
  }

  static get observedAttributes() {
    return ["amount"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "amount" && this.validateAmount(newValue)) {
      const button = this.querySelector("button");
      button.textContent = `Pay $${newValue}`;
      this.amount = newValue;
    }
  }

  async fetchPaymentDetails() {
    try {
      const response = await fetch(
        "https://express-demo-backend-bfec4155bddb.herokuapp.com/api/payment-details?integrityKey=" +
          this.getAttribute("integrate-key")
      );
      if (!response.ok) throw new Error("Network response was not ok.");
      const data = await response.json();
      this.isPaymentLinkDisabled = data.isPaymentLinkDisabled;
      this.minAmount = data.minAmount;
      this.maxAmount = data.maxAmount;
      this.baseAmount = data.baseAmount || this.baseAmount;
      this.amount = data.baseAmount || this.baseAmount;
      this.render();
    } catch (error) {
      console.error("Fetch error:", error);
      this.innerHTML = `<p>Error has occurred.</p>`;
    }
  }

  render() {
    this.innerHTML = ""; // Clear current content
    if (this.isPaymentLinkDisabled) {
      this.innerHTML = `<p>This payment link is canceled.</p>`;
      return;
    }

    const amount = this.getAttribute("amount") || this.baseAmount;
    this.validateAmount(amount);

    // Create and append the button
    const button = document.createElement("button");
    button.textContent = `Pay $${amount}`;
    button.disabled = this.isPaymentLinkDisabled;
    button.style = "padding: 10px 20px; font-size: 16px; cursor: pointer; text-transform: uppercase; background-color: #4CAF50; color: white; border: none; border-radius: 5px; margin: 10px 0;";
    button.onclick = () => this.processPayment();
    this.appendChild(button);
  }

  validateAmount(amount) {
    if (amount < this.minAmount || amount > this.maxAmount) {
      this.showToast(
        `Amount must be between $${this.minAmount} and $${this.maxAmount}.`
      );
      return false;
    }
    return true;
  }

  async processPayment(amount) {
    try {
      const response = await fetch(
        "https://express-demo-backend-bfec4155bddb.herokuapp.com/api/process-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: this.amount,
            integrityKey: this.getAttribute("integrate-key"),
          }),
        }
      );
      if (!response.ok) throw new Error("Payment processing failed.");
      const data = await response.json();
      window.open(data.redirectionUrl, "_blank"); // Open in a new tab
    } catch (error) {
      console.error("Payment error:", error);
      this.innerHTML = `<p>Error has occurred.</p>`;
      this.querySelector("button").disabled = true;
    }
  }

  showToast(message) {
    // Implement toast message UI

    console.log("Toast message:", message);
    // This is a placeholder. Use a library or custom toast UI as needed.
  }
}

customElements.define("my-demo-balise", MyDemoBalise);
