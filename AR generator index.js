<!DOCTYPE html>
<html>
<head>
  <title>Business Auto Attendant Generator</title>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial; max-width: 800px; margin: auto; padding: 20px; }
    select, input, textarea, button { width: 100%; margin: 10px 0; padding: 8px; }
    textarea { height: 180px; }
  </style>
</head>
<body>

<h2>Business Auto Attendant Generator</h2>

<label>Business Name</label>
<input id="businessName" placeholder="Office Communications">

<label>Industry</label>
<select id="industry">
  <option value="generic">Generic</option>
  <option value="automotive">Automotive</option>
  <option value="medical">Medical</option>
  <option value="law">Law Firm</option>
  <option value="realestate">Real Estate</option>
  <option value="restaurant">Restaurant</option>
  <option value="contractor">Home Services / Contractor</option>
  <option value="finance">Finance / Insurance</option>
  <option value="retail">Retail</option>
</select>

<label>Business Hours</label>
<input id="hours" placeholder="Monday through Friday, 9 AM to 5 PM">

<label>After Hours?</label>
<select id="afterHours">
  <option value="no">No</option>
  <option value="yes">Yes</option>
</select>

<label>Custom Message (Optional)</label>
<input id="customMessage" placeholder="Leave blank to auto-fill by industry">

<button onclick="generateGreeting()">Generate Greeting</button>

<label>Generated Script</label>
<textarea id="output"></textarea>

<button onclick="sendToZapier()">Send to Zapier</button>

<script>

function generateGreeting() {

  const name = document.getElementById("businessName").value;
  const industry = document.getElementById("industry").value;
  const hours = document.getElementById("hours").value;
  const afterHours = document.getElementById("afterHours").value;
  let custom = document.getElementById("customMessage").value;

  // -------------------------
  // INDUSTRY SETTINGS
  // -------------------------

  const industryData = {

    generic: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "Please choose from the following options.",
      options: "Press 1 for Sales.\nPress 2 for Support.\nPress 0 for the Operator.",
      afterHours: "Our office is currently closed. Please leave a message and we will return your call as soon as possible."
    },

    automotive: {
      greeting: `Thank you for calling ${name}, your trusted automotive service and sales provider.`,
      prompt: "To schedule service or inquire about vehicle availability, choose from the options below.",
      options: "Press 1 for Service.\nPress 2 for Sales.\nPress 3 for Parts.\nPress 0 for Reception.",
      afterHours: "Our dealership is currently closed. To schedule service online, please visit our website. Otherwise, leave a message and our team will return your call on the next business day."
    },

    medical: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "For patient care and scheduling, please select from the following options.",
      options: "Press 1 to schedule or manage an appointment.\nPress 2 for billing questions.\nPress 3 for prescription refills.\nIf this is a medical emergency, please hang up and dial 911.",
      afterHours: "Our office is currently closed. If this is a medical emergency, hang up and dial 911. Otherwise, leave a message and our staff will return your call."
    },

    law: {
      greeting: `Thank you for calling ${name}, Attorneys at Law.`,
      prompt: "Please select from the following options.",
      options: "Press 1 for new client intake.\nPress 2 for an existing case.\nPress 3 for billing.\nPress 0 for the receptionist.",
      afterHours: "Our office is currently closed. Please leave a detailed message and an attorney or staff member will return your call as soon as possible."
    },

    realestate: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "To speak with an agent or inquire about a listing, please choose an option.",
      options: "Press 1 for residential sales.\nPress 2 for commercial properties.\nPress 3 for property management.\nPress 0 for the front desk.",
      afterHours: "Our office is currently closed. To view listings, visit our website. Leave a message and an agent will contact you shortly."
    },

    restaurant: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "For reservations or ordering, please select an option.",
      options: "Press 1 for reservations.\nPress 2 for takeout or catering.\nPress 3 for hours and location.\nPress 0 to speak with the host.",
      afterHours: "We are currently closed. Please visit our website for hours and menu information. We look forward to serving you soon."
    },

    contractor: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "For service requests or project estimates, please choose from the following options.",
      options: "Press 1 to request service.\nPress 2 for a new project estimate.\nPress 3 for billing.\nPress 0 for the office.",
      afterHours: "Our office is currently closed. Please leave a message describing your service needs and we will contact you the next business day."
    },

    finance: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "For account assistance or policy information, please choose from the following options.",
      options: "Press 1 for account support.\nPress 2 for new policies or services.\nPress 3 for billing.\nPress 0 for reception.",
      afterHours: "Our office is currently closed. If you need immediate assistance, please visit your online account portal. Otherwise, leave a message."
    },

    retail: {
      greeting: `Thank you for calling ${name}.`,
      prompt: "For store information or customer support, please choose an option.",
      options: "Press 1 for store hours and location.\nPress 2 for order status.\nPress 3 for returns and exchanges.\nPress 0 to speak with a team member.",
      afterHours: "Our store is currently closed. Please visit our website for store hours and online ordering. We will return your call soon."
    }

  };

  const selected = industryData[industry];

  if (!custom) {
    custom = selected.prompt;
  }

  let script = selected.greeting + "\n\n";

  if (afterHours === "yes") {
    script += selected.afterHours;
  } else {
    script += custom + "\n\n" + selected.options + "\n\nOur business hours are " + hours + ".";
  }

  document.getElementById("output").value = script;
}

function sendToZapier() {

  const webhookURL = "https://hooks.zapier.com/hooks/catch/2630762/uc1zyf1";

  const payload = {
    businessName: document.getElementById("businessName").value,
    industry: document.getElementById("industry").value,
    hours: document.getElementById("hours").value,
    afterHours: document.getElementById("afterHours").value,
    script: document.getElementById("output").value
  };

  fetch(webhookURL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  })
  .then(response => alert("Sent to Zapier successfully!"))
  .catch(error => alert("Error sending to Zapier"));
}

</script>

</body>
</html>
