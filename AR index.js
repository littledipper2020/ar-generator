<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Automated Receptionist Script Builder</title>

  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />

  <style>
    body { background:#f8f9fa; }
    .card { border-radius:12px; }
  </style>
</head>
<body>
<div id="root"></div>

<script type="text/babel">

const { jsPDF } = window.jspdf;

function App() {

  const [formData, setFormData] = React.useState({
    businessName: "",
    industry: "general",
    tone: "professional",
    hours: "",
    specialInstructions: "",
    enableAfterHours: false,
    afterHoursMessage: "",
    email: "",
    departments: [
      { name:"", extension:"", hasSubmenu:false, submenuOptions:[] }
    ]
  });

  const [generatedScript, setGeneratedScript] = React.useState("");
  const [error, setError] = React.useState("");

  /* ---------------- INDUSTRY TEMPLATES ---------------- */

  const industryNotes = {
    general: "",
    medical: "Please have your patient ID ready when calling.",
    retail: "Visit our website for current promotions and store hours.",
    professional: "Our consultants are available during business hours to assist you.",
    restaurant: "To make a reservation or place an order, please follow the menu options.",
    automotive: "To schedule service or inquire about vehicle availability, choose from the options below."
  };

  /* ---------------- VALIDATION ---------------- */

  function validateExtensions() {
    const allExtensions = [];

    formData.departments.forEach(d => {
      if (d.extension) allExtensions.push(d.extension);
      if (d.hasSubmenu) {
        d.submenuOptions.forEach(s => {
          if (s.extension) allExtensions.push(s.extension);
        });
      }
    });

    const duplicates = allExtensions.filter((item, index) => allExtensions.indexOf(item) !== index);

    if (duplicates.length > 0) {
      setError("Duplicate press numbers detected. Each option must be unique.");
      return false;
    }

    setError("");
    return true;
  }

  /* ---------------- SCRIPT GENERATOR ---------------- */

  function generateScript() {

    if (!validateExtensions()) return;

    const { businessName, tone, industry, hours, departments,
            specialInstructions, enableAfterHours, afterHoursMessage } = formData;

    let greeting = "";
    switch (tone) {
      case "friendly":
        greeting = `Hello and thank you for calling ${businessName}! We're glad you reached out.`;
        break;
      case "efficient":
        greeting = `Thank you for calling ${businessName}.`;
        break;
      default:
        greeting = `Thank you for calling ${businessName}. Your call is important to us.`;
    }

    let hoursText = hours ? `\n\nOur office hours are ${hours}.` : "";

    let menuText = "\n\nPlease select from the following options:";
    departments.forEach(d => {
      if (d.name && d.extension) {
        menuText += `\nPress ${d.extension} for ${d.name}.`;
        if (d.hasSubmenu) {
          d.submenuOptions.forEach(s => {
            if (s.name && s.extension) {
              menuText += `\n  Press ${s.extension} for ${s.name}.`;
            }
          });
        }
      }
    });

    menuText += "\nPress 0 to speak with an operator.";

    let industryText = industryNotes[industry] ? `\n\n${industryNotes[industry]}` : "";
    let specialText = specialInstructions ? `\n\n${specialInstructions}` : "";

    let afterHoursText = "";
    if (enableAfterHours) {
      afterHoursText =
      `\n\n--- AFTER HOURS SCRIPT ---\n\nThank you for calling ${businessName}. ` +
      `${afterHoursMessage || "We are currently closed. Please leave a message and we will return your call."}`;
    }

    setGeneratedScript(greeting + hoursText + menuText + industryText + specialText + afterHoursText);
  }

  /* ---------------- DEPARTMENT LOGIC ---------------- */

  function updateDepartment(i, field, value) {
    const updated = [...formData.departments];
    updated[i][field] = value;
    setFormData({ ...formData, departments: updated });
  }

  function updateSubmenu(dIndex, sIndex, field, value) {
    const updated = [...formData.departments];
    updated[dIndex].submenuOptions[sIndex][field] = value;
    setFormData({ ...formData, departments: updated });
  }

  function addDepartment() {
    setFormData({
      ...formData,
      departments: [...formData.departments,
        { name:"", extension:"", hasSubmenu:false, submenuOptions:[] }
      ]
    });
  }

  function removeDepartment(index) {
    const updated = formData.departments.filter((_, i) => i !== index);
    setFormData({ ...formData, departments: updated });
  }

  function toggleSubmenu(index) {
    const updated = [...formData.departments];
    updated[index].hasSubmenu = !updated[index].hasSubmenu;
    updated[index].submenuOptions = updated[index].hasSubmenu
      ? [{ name:"", extension:"" }]
      : [];
    setFormData({ ...formData, departments: updated });
  }

  function addSubmenu(index) {
    const updated = [...formData.departments];
    updated[index].submenuOptions.push({ name:"", extension:"" });
    setFormData({ ...formData, departments: updated });
  }

  function removeSubmenu(dIndex, sIndex) {
    const updated = [...formData.departments];
    updated[dIndex].submenuOptions =
      updated[dIndex].submenuOptions.filter((_, i) => i !== sIndex);
    setFormData({ ...formData, departments: updated });
  }

  /* ---------------- PDF + EMAIL ---------------- */

  function downloadAndEmail() {
    if (!generatedScript) return;

    const doc = new jsPDF();
    doc.text(generatedScript, 10, 10);
    doc.save("AR_Script.pdf");

    if (!formData.email) return;

    fetch("https://hooks.zapier.com/hooks/catch/2630762/uc1zyf1/", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({
        email: formData.email,
        script: generatedScript,
        cc:"onetalk@officecommunications.net",
        businessName: formData.businessName
      })
    });
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="container my-5">

      <div className="card p-4 shadow-sm">
        <h3 className="mb-4">Automated Receptionist Script Builder</h3>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3">
          <label className="form-label">Business Name</label>
          <input className="form-control"
            value={formData.businessName}
            onChange={(e)=>setFormData({...formData, businessName:e.target.value})}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Industry</label>
          <select className="form-select"
            value={formData.industry}
            onChange={(e)=>setFormData({...formData, industry:e.target.value})}>
            <option value="general">General</option>
            <option value="medical">Medical</option>
            <option value="retail">Retail</option>
            <option value="professional">Professional Services</option>
            <option value="restaurant">Restaurant</option>
            <option value="automotive">Automotive</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Tone</label>
          <select className="form-select"
            value={formData.tone}
            onChange={(e)=>setFormData({...formData, tone:e.target.value})}>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="efficient">Efficient</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Business Hours</label>
          <input className="form-control"
            value={formData.hours}
            onChange={(e)=>setFormData({...formData, hours:e.target.value})}
          />
        </div>

        <hr/>

        <h5>Departments</h5>

        {formData.departments.map((dept, i)=>(
          <div key={i} className="card p-3 mb-3">

            <div className="mb-2">
              <input className="form-control mb-2"
                placeholder="Department Name"
                value={dept.name}
                onChange={(e)=>updateDepartment(i,"name",e.target.value)}
              />
              <input className="form-control"
                placeholder="Press Number"
                value={dept.extension}
                onChange={(e)=>updateDepartment(i,"extension",e.target.value)}
              />
            </div>

            <button className="btn btn-sm btn-outline-secondary mb-2"
              onClick={()=>toggleSubmenu(i)}>
              {dept.hasSubmenu ? "Remove Submenu" : "Add Submenu"}
            </button>

            {dept.hasSubmenu && dept.submenuOptions.map((sub,s)=>(
              <div key={s} className="row mb-2">
                <div className="col">
                  <input className="form-control"
                    placeholder="Submenu Name"
                    value={sub.name}
                    onChange={(e)=>updateSubmenu(i,s,"name",e.target.value)}
                  />
                </div>
                <div className="col">
                  <input className="form-control"
                    placeholder="Press Number"
                    value={sub.extension}
                    onChange={(e)=>updateSubmenu(i,s,"extension",e.target.value)}
                  />
                </div>
                <div className="col-auto">
                  <button className="btn btn-danger"
                    onClick={()=>removeSubmenu(i,s)}>X</button>
                </div>
              </div>
            ))}

            {dept.hasSubmenu &&
              <button className="btn btn-sm btn-outline-primary"
                onClick={()=>addSubmenu(i)}>+ Add Submenu</button>
            }

          </div>
        ))}

        <button className="btn btn-outline-primary mb-3"
          onClick={addDepartment}>+ Add Department</button>

        <hr/>

        <div className="mb-3">
          <label className="form-label">Your Email (to receive script)</label>
          <input type="email" className="form-control"
            value={formData.email}
            onChange={(e)=>setFormData({...formData, email:e.target.value})}
          />
        </div>

        <button className="btn btn-primary me-2"
          onClick={generateScript}>
          Generate Script
        </button>

        {generatedScript &&
          <button className="btn btn-success"
            onClick={downloadAndEmail}>
            Download & Email
          </button>
        }

      </div>

      {generatedScript &&
        <div className="card p-4 mt-4 shadow-sm">
          <h5>Preview</h5>
          <pre style={{whiteSpace:"pre-wrap"}}>{generatedScript}</pre>
        </div>
      }

    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

</script>
</body>
</html>
