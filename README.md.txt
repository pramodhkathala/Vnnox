<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>PeopleLink LED Video Wall Configuration Calculator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.25/jspdf.plugin.autotable.min.js"></script>
  <style>
    :root {
      --bg: #eef1f8;
      --card: #ffffff;
      --ink: #1c2738;
      --ink-2: #444;
      --brand: #0d47a1;
      --accent: #b71c1c;
      --muted: #f7f9fc;
      --ok: #1b5e20;
    }
    html, body { height: 100%; }
    body { font-family: 'Inter', sans-serif; margin: 0; padding: 40px; background: var(--bg); color: var(--ink); font-size: 14px; }
    .main-wrapper { max-width: 1200px; margin: auto; }

    h2 { text-align: center; color: var(--brand); margin: 0 0 30px; font-weight: 700; font-size: 1.8em; display: flex; align-items: center; justify-content: center; }

    /* Input/Form */
    .input-panel { background: var(--card); padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: all 0.6s ease-out; }
    .input-panel.minimized { height: 120px; padding-top: 15px; padding-bottom: 10px; opacity: 0.95; overflow: hidden; background: var(--muted); }
    .input-panel.minimized > *:not(h2):not(#enteredValuesDisplay):not(.back-btn-placeholder) { opacity: 0; max-height: 0; overflow: hidden; pointer-events: none; }
    .input-panel.minimized h2 { margin-bottom: 5px; }

    .input-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px 30px; }
    .input-group { margin-top: 0; }

    label { display: block; margin-bottom: 5px; font-weight: 600; color: var(--ink-2); }
    select, input[type="number"], input[type="text"], input[type="email"], input[type="tel"] { width: 100%; padding: 10px 12px; font-size: 15px; border: 1px solid #dcdcdc; border-radius: 6px; box-sizing: border-box; transition: border-color 0.3s, box-shadow 0.3s; background: #fff; }
    select:focus, input:focus { border-color: var(--brand); box-shadow: 0 0 0 2px rgba(13, 71, 161, 0.2); outline: none; }

    /* Buttons */
    .btn { background-color: var(--brand); color: white; padding: 14px; border: none; border-radius: 8px; font-size: 16px; width: 100%; cursor: pointer; transition: background-color 0.2s, transform 0.15s; font-weight: 600; }
    .btn:hover { background-color: #1565c0; transform: translateY(-1px); }
    .btn.gray { background-color: #6c757d; }
    .btn.gray:hover { background-color: #5a6268; }
    .btn.ok { background-color: var(--ok); }
    .btn.ok:hover { background-color: #2e7d32; }

    /* Helper text */
    .hidden { display: none !important; }
    .error-message { color: var(--accent); font-weight: 700; text-align: center; margin-top: 15px; padding: 12px 15px; background: #ffebee; border: 2px solid var(--accent); border-radius: 8px; }
    #enteredValuesDisplay { text-align: center; font-size: 0.95em; color: #444; margin-bottom: 15px; line-height: 1.4; display: none; }
    .input-panel.minimized #enteredValuesDisplay { display: block !important; }

    /* Output */
    .visualization { background: var(--card); padding: 30px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); opacity: 0; max-height: 0; overflow-y: hidden; transition: opacity 0.6s ease-out, max-height 1s ease-out; margin-top: 30px; }
    .visualization.visible { opacity: 1; max-height: 2000px; }
    .output-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }

    .vis-box, .details-box { border: 1px solid #e0e0e0; padding: 20px; border-radius: 8px; background: var(--muted); }
    .details-box h4 { margin: 0 0 15px; color: var(--brand); border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; font-size: 1.1em; }

    .vis-details { display: grid; grid-template-columns: 1fr; gap: 10px; font-size: 0.95em; color: #333; }
    .vis-details span { display: flex; align-items: center; line-height: 1.4; padding-bottom: 6px; border-bottom: 1px dotted #e0e0e0; }
    .vis-details strong { color: #333; font-weight: 500; min-width: 250px; text-align: left; margin-right: 15px; }
    .vis-details small { font-size: 1em; color: var(--accent); font-weight: 700; }

    .edit-btn { background: none; border: none; color: var(--brand); font-size: 0.9em; cursor: pointer; text-decoration: underline; padding: 0; margin-left: 10px; }

    .vis-content { position: relative; width: 100%; margin-bottom: 20px; padding-top: 35px; padding-right: 45px; padding-bottom: 10px; box-sizing: border-box; }
    .grid { position: relative; width: 100%; border: 3px solid var(--accent); min-height: 100px; overflow: hidden; background: linear-gradient(135deg, #e3f2fd, #bbdefb); }
    #cabinetOverlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; box-sizing: border-box; pointer-events: none; z-index: 5; display: grid; }
    .dimension-label { position: absolute; color: var(--accent); background: rgba(255,255,255,0.95); padding: 3px 6px; font-size: 0.9em; border-radius: 3px; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .dim-top { top: 5px; left: 50%; transform: translateX(-50%); }
    .dim-right { top: 50%; right: 10px; transform: translateY(-50%) rotate(90deg); transform-origin: center; }

    #downloadPdfLink { grid-column: 1 / -1; margin-top: 15px; text-align: center; cursor: pointer; color: var(--ok); text-decoration: underline; padding: 8px 0; font-weight: 600; }
    #downloadPdfLink:hover { color: #2e7d32; }

    footer { text-align: center; color: #b0c4de; font-size: 12px; margin-top: 24px; }

    /* Responsive */
    @media (max-width: 900px) {
      .input-grid, .output-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="main-wrapper">
    <div class="input-panel" id="formContainer">
      <h2>LED Video Wall Configuration Calculator</h2>
      <div id="enteredValuesDisplay" class="hidden">
        <span id="enteredSummaryText"></span><br />
        Actual Final Aspect Ratio: <strong><span id="aspectRatioValue">--</span></strong>
      </div>
      <div id="errorMessage" class="error-message hidden"></div>

      <div class="input-grid">
        <div class="input-group">
          <label for="productModel">LED Model / Pixel Pitch</label>
          <select id="productModel">
            <option value="">Select LED Model</option>
            <optgroup label="COB Models (16:9 Cabinet - 600x337.5mm)">
              <option value="cob_09">0.9375mm</option>
              <option value="cob_125">1.25mm</option>
              <option value="cob_15">1.5625mm</option>
            </optgroup>
            <optgroup label="SMD Indoor Models (4:3 Cabinet - 640x480mm)">
              <option value="indoor_186">1.86mm</option>
              <option value="indoor_20">2.0mm</option>
              <option value="indoor_25">2.5mm</option>
            </optgroup>
            <optgroup label="SMD Outdoor Models (1:1 Cabinet - 960x960mm)">
              <option value="outdoor_40">4.0mm</option>
              <option value="outdoor_667">6.67mm</option>
              <option value="outdoor_80">8.0mm</option>
              <option value="outdoor_100">10.0mm</option>
            </optgroup>
          </select>
        </div>
        <div class="input-group">
          <label for="unit">Unit of Measurement</label>
          <select id="unit" onchange="toggleMeasurementFields()">
            <option value="">Select unit</option>
            <option value="meters">Meters (m)</option>
            <option value="feet">Feet (ft)</option>
            <option value="inches">Inches (in) - Diagonal</option>
          </select>
        </div>

        <div class="input-group" id="widthGroup">
          <label for="width" id="widthLabel">Desired Width (m)</label>
          <input type="number" id="width" placeholder="Enter desired width" min="0.1" step="0.01" />
        </div>
        <div class="input-group" id="heightGroup">
          <label for="height" id="heightLabel">Desired Height (m)</label>
          <input type="number" id="height" placeholder="Enter desired height" min="0.1" step="0.01" />
        </div>

        <div class="input-group hidden" id="diagonalGroup">
          <label for="diagonal" id="diagonalLabel">Desired Diagonal (inches)</label>
          <input type="number" id="diagonal" placeholder="Enter desired diagonal inches" min="10" step="1" />
        </div>

        <div class="input-group" id="aspectRatioGroup">
          <label for="aspectRatio" id="aspectRatioLabel">Target Aspect Ratio (Optional)</label>
          <select id="aspectRatio">
            <option value="">Select ratio (Optional)</option>
            <option value="16:9">16:9 (HD/UHD)</option>
            <option value="16:10">16:10 (WUXGA)</option>
            <option value="4:3">4:3 (Legacy)</option>
            <option value="2:1">2:1 (Cinematic)</option>
            <option value="21:9">21:9 (Cinematic/2.37:1)</option>
            <option value="1:1">1:1 (Square)</option>
          </select>
        </div>

        <button class="btn" id="submitButton" onclick="showVisualization()">Calculate & Visualize System</button>
        <div class="back-btn-placeholder hidden"></div>
      </div>
    </div>

    <div class="visualization" id="visualization">
      <div class="output-grid">
        <div class="details-box">
          <h4>LED Wall Specifications</h4>
          <div class="vis-details">
            <span id="pixelPitchDisplay"><strong>Pixel Pitch :</strong><small>--</small></span>
            <span id="finalDimensions"><strong>Actual Final Dimensions (WxH) :</strong><small>--</small></span>
            <span id="resolution"><strong>Actual Final Resolution (WxH) :</strong><small>--</small></span>
            <span id="numCabinets"><strong>Total Cabinets (W x H) :</strong><small>--</small></span>
            <span id="totalModules"><strong>Total Modules Required :</strong><small>--</small></span>
            <span id="finalDiagonal"><strong>Final Diagonal Size :</strong><small>--</small></span>
            <span id="finalArea"><strong>Final Area :</strong><small>--</small></span>
            <span id="totalPixels"><strong>Total Pixels :</strong><small>--</small></span>
            <span id="cabinetSize"><strong>Cabinet Size (WxH) :</strong><small>--</small></span>
            <span id="cabinetPixels"><strong>Cabinet Pixels (WxH) :</strong><small>--</small></span>
          </div>
        </div>

        <div class="details-box">
          <h4>Control System Requirements <button class="edit-btn" onclick="openControllerModal()">Edit/View Components ⚙️</button></h4>
          <div class="vis-details" id="controlSystemDetails"></div>
        </div>
      </div>

      <div class="vis-box" style="margin-top: 30px;">
        <h4>Physical Wall Visualization</h4>
        <div class="vis-content">
          <div class="grid" id="visGrid">
            <div id="cabinetOverlay"></div>
            <span class="dimension-label dim-top" id="visWidthLabel">-- W --</span>
            <span class="dimension-label dim-right" id="visHeightLabel">-- H --</span>
          </div>
        </div>
      </div>

      <!-- Direct download (removed contact gate) -->
      <span id="downloadPdfLink" onclick="proceedToDownloadPdf()">Download PDF Technical Summary 📄</span>

      <button class="btn gray" id="backButton" onclick="hideVisualization()">Modify Configuration</button>
    </div>

    <!-- Controller Modal -->
    <div id="controllerModal" class="modal hidden" aria-hidden="true">
      <div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="controllerModalTitle">
        <div class="modal-header">
          <h3 id="controllerModalTitle" style="margin:0; color:var(--brand);">Edit Control System Components</h3>
          <button class="close-btn" aria-label="Close" onclick="closeControllerModal()">&times;</button>
        </div>

        <div class="modal-grid">
          <div class="modal-input-group modal-grid-span-2">
            <label for="modalControllerModel">Suggested Controller/Processor Model (Select):</label>
            <select id="modalControllerModel"></select>
          </div>

          <div class="modal-input-group">
            <label for="modalSplicerSolution">Splicer Frame/Solution (Optional):</label>
            <input type="text" id="modalSplicerSolution" placeholder="e.g., H5 Modular Splicer (5U)" />
          </div>

          <div class="modal-input-group">
            <label for="modalMaxPortsPerCard">Max Ports per Output Card (Read Only from Selection):</label>
            <input type="number" id="modalMaxPortsPerCard" min="1" step="1" readonly placeholder="e.g., 20" />
          </div>

          <div class="modal-input-group">
            <label for="modalOutputCardModel">Output Card Model (Select):</label>
            <select id="modalOutputCardModel" onchange="updatePortsFromOutputCard()"></select>
          </div>

          <div class="modal-input-group">
            <label for="modalInputCardModel">Input Card Model (Select Default Input):</label>
            <select id="modalInputCardModel"></select>
          </div>

          <div class="modal-input-group">
            <label for="modalInputCardQty">Input Card Quantity:</label>
            <input type="number" id="modalInputCardQty" min="1" step="1" placeholder="e.g., 2" />
          </div>
        </div>

        <div class="modal-disclaimer">
          <p><strong>Note:</strong> Edit input/output card models/quantities as required. The solution regenerates based on total pixels and the <em>Max Ports per Output Card</em> you select. Default input card quantity is 2 × 4K.</p>
        </div>

        <button class="btn ok" onclick="applyModalChanges()">Apply Changes & Recalculate</button>
      </div>
    </div>
  </div>

  <footer>© 2025 PeopleLink Unified Communications Pvt. Ltd. | Designed by Pramodh Kathala</footer>

  <script>
    // ===== Constants =====
    const MM_PER_METER = 1000;
    const MM_PER_INCH = 25.4;
    const MM_PER_FOOT = MM_PER_INCH * 12;
    const METER_TO_FEET = 3.28084; // display helper
    const PIXELS_PER_PORT_DEFAULT = 650000; // ~650K per NovaStar port

    // Safety buffers (design margins)
    const POWER_BUFFER = 1.15;
    const WEIGHT_BUFFER = 1.15;
    const MARGIN_PERCENT_TEXT = "15%";

    // ===== Products =====
    const LED_PRODUCTS = {
      cob_09:   { name: "PeopleLink COB (0.9375mm)", pitch_mm: 0.9375, cabW_mm: 600,  cabH_mm: 337.5, cabPixW: 640, cabPixH: 360, modulesPerCab: 8,  weight_kg: 4.6,  nits_range: "600-1000", maxPower_W_m2: 300 },
      cob_125:  { name: "PeopleLink COB (1.25mm)",    pitch_mm: 1.25,   cabW_mm: 600,  cabH_mm: 337.5, cabPixW: 480, cabPixH: 270, modulesPerCab: 8,  weight_kg: 4.6,  nits_range: "600-800",  maxPower_W_m2: 300 },
      cob_15:   { name: "PeopleLink COB (1.5625mm)", pitch_mm: 1.5625, cabW_mm: 600,  cabH_mm: 337.5, cabPixW: 384, cabPixH: 216, modulesPerCab: 8,  weight_kg: 4.6,  nits_range: "600-800",  maxPower_W_m2: 300 },
      indoor_186:{ name: "PeopleLink SMD Indoor (1.86mm)", pitch_mm: 1.86, cabW_mm: 640, cabH_mm: 480, cabPixW: 344, cabPixH: 258, modulesPerCab: 6, weight_kg: 6.24, nits_range: "450-600", maxPower_W_m2: 560 },
      indoor_20:{ name: "PeopleLink SMD Indoor (2.0mm)", pitch_mm: 2.0, cabW_mm: 640, cabH_mm: 480, cabPixW: 320, cabPixH: 240, modulesPerCab: 6, weight_kg: 6.24, nits_range: "450-600", maxPower_W_m2: 560 },
      indoor_25:{ name: "PeopleLink SMD Indoor (2.5mm)", pitch_mm: 2.5, cabW_mm: 640, cabH_mm: 480, cabPixW: 256, cabPixH: 192, modulesPerCab: 6, weight_kg: 6.24, nits_range: "450-600", maxPower_W_m2: 560 },
      outdoor_40:{ name: "PeopleLink SMD Outdoor (4.0mm)", pitch_mm: 4.0, cabW_mm: 960, cabH_mm: 960, cabPixW: 240, cabPixH: 240, modulesPerCab: 18, weight_kg: 8.28, nits_range: "4500-5000", maxPower_W_m2: 937.5 },
      outdoor_667:{ name: "PeopleLink SMD Outdoor (6.67mm)", pitch_mm: 6.67, cabW_mm: 960, cabH_mm: 960, cabPixW: 144, cabPixH: 144, modulesPerCab: 18, weight_kg: 8.28, nits_range: "4500-5000", maxPower_W_m2: 937.5 },
      outdoor_80:{ name: "PeopleLink SMD Outdoor (8.0mm)", pitch_mm: 8.0, cabW_mm: 960, cabH_mm: 960, cabPixW: 120, cabPixH: 120, modulesPerCab: 18, weight_kg: 8.28, nits_range: "4500-5000", maxPower_W_m2: 937.5 },
      outdoor_100:{ name: "PeopleLink SMD Outdoor (10.0mm)", pitch_mm: 10.0, cabW_mm: 960, cabH_mm: 960, cabPixW: 96, cabPixH: 96, modulesPerCab: 18, weight_kg: 8.28, nits_range: "4500-5000", maxPower_W_m2: 937.5 }
    };

    // ===== Controllers =====
    const CONTROLLER_MODELS = [
      { name: "TB40",            type: "Multimedia Player",   ports: 2,  maxPixels: 1_300_000,  maxW: 10240, maxH: 8192,  priority: 1 },
      { name: "TB60",            type: "Multimedia Player",   ports: 4,  maxPixels: 2_300_000,  maxW: 4096,  maxH: 4096,  priority: 2 },
      { name: "VX400 Pro / DSP400 Pro",   type: "All-in-One Processor", ports: 4,  maxPixels: 2_600_000,  maxW: 10240, maxH: 8192, priority: 3 },
      { name: "VX600 Pro / DSP600 Pro",   type: "All-in-One Processor", ports: 6,  maxPixels: 3_900_000,  maxW: 10240, maxH: 8192, priority: 4 },
      { name: "VX1000 Pro / DSP1000 Pro", type: "All-in-One Processor", ports: 10, maxPixels: 6_500_000,  maxW: 10240, maxH: 8192, priority: 5 },
      { name: "4K Prime",       type: "All-in-One Processor", ports: 16, maxPixels: 10_400_000, maxW: 16384, maxH: 8192, priority: 6 },
      { name: "4K Prime Pro",   type: "All-in-One Processor", ports: 20, maxPixels: 13_000_000, maxW: 16384, maxH: 8192, priority: 7 },
      { name: "H2 (2U)",        type: "Modular Splicer",      ports: 20, maxPixels: 26_000_000, maxW: 16384, maxH: 8192, priority: 8 },
      { name: "H5 (5U)",        type: "Modular Splicer",      ports: 20, maxPixels: 39_000_000, maxW: 16384, maxH: 8192, priority: 9 },
      { name: "H9 (9U)",        type: "Modular Splicer",      ports: 20, maxPixels: 65_000_000, maxW: 16384, maxH: 8192, priority: 10 },
      { name: "H15 (15U)",      type: "Modular Splicer",      ports: 20, maxPixels: 130_000_000, maxW: 16384, maxH: 8192, priority: 11 },
      { name: "H20 (20U)",      type: "Modular Splicer",      ports: 20, maxPixels: 260_000_000, maxW: 16384, maxH: 8192, priority: 12 }
    ].sort((a,b)=>a.priority-b.priority);

    const H_SERIES_DEFAULTS = {
      SPLICER_NAME: "H-Series Modular Splicer Frame",
      INPUT_CARD_OPTIONS: [
        { model: "H_1xHDMI2.0 input card (4K)", display: "1x 4K HDMI (Single Input)", qty: 1 },
        { model: "H_2xHDMI2.0 input card (4K)", display: "2x 4K HDMI (Dual Input)",   qty: 1 },
        { model: "H_4xHDMI input card (1080P)", display: "4x FHD HDMI (Quad Input)",   qty: 1 }
      ],
      DEFAULT_INPUT_CARD_MODEL: "H_1xHDMI2.0 input card (4K)",
      DEFAULT_INPUT_CARD_QTY: 2,
      OUTPUT_CARD_20_PORTS: 20,
      OUTPUT_CARD_20_MODEL: "H_20xRJ45 Sending Card",
      OUTPUT_CARD_16_PORTS: 16,
      OUTPUT_CARD_16_MODEL: "H_16xRJ45 Sending Card"
    };

    // ===== Helpers =====
    let finalCalculationData = {};
    function formatNumber(n,d=1){return n.toLocaleString(undefined,{minimumFractionDigits:d,maximumFractionDigits:d});}
    function formatLargeNumber(n){if(n>=1e6)return(n/1e6).toFixed(2)+"M";if(n>=1e3)return(n/1e3).toFixed(1)+"K";return n.toLocaleString();}
    function gcd(a,b){return b===0?a:gcd(b,a%b);}    

    function toggleMeasurementFields(){
      const unit = document.getElementById('unit').value;
      const isDiagonal = unit === 'inches';
      const isFeet = unit === 'feet';
      let unitText = ' (m)';
      if (isFeet) unitText = ' (ft)';
      if (isDiagonal) unitText = ' (in)';
      document.getElementById('widthLabel').textContent = `Desired Width${unitText}`;
      document.getElementById('heightLabel').textContent = `Desired Height${unitText}`;
      document.getElementById('widthGroup').classList.toggle('hidden', isDiagonal);
      document.getElementById('heightGroup').classList.toggle('hidden', isDiagonal);
      document.getElementById('diagonalGroup').classList.toggle('hidden', !isDiagonal);
      if (isDiagonal){ document.getElementById('width').value=''; document.getElementById('height').value=''; }
      else { document.getElementById('diagonal').value=''; }
      document.getElementById('errorMessage').classList.add('hidden');
    }

    function populateModalControllers(){
      const select = document.getElementById('modalControllerModel');
      select.innerHTML = '';
      CONTROLLER_MODELS.forEach(c=>{
        const opt = document.createElement('option');
        opt.value = c.name; opt.textContent = `${c.name} (${c.type}, ${formatLargeNumber(c.maxPixels)} max px)`; select.appendChild(opt);
      });
    }
    function populateModalOutputCards(){
      const select = document.getElementById('modalOutputCardModel');
      select.innerHTML = '';
      [
        { model: H_SERIES_DEFAULTS.OUTPUT_CARD_20_MODEL, ports: H_SERIES_DEFAULTS.OUTPUT_CARD_20_PORTS },
        { model: H_SERIES_DEFAULTS.OUTPUT_CARD_16_MODEL, ports: H_SERIES_DEFAULTS.OUTPUT_CARD_16_PORTS }
      ].forEach(card=>{
        const opt = document.createElement('option');
        opt.value = `${card.model}|${card.ports}`; opt.textContent = `${card.model} (${card.ports} ports)`; select.appendChild(opt);
      });
    }
    function populateModalInputCards(){
      const select = document.getElementById('modalInputCardModel');
      select.innerHTML='';
      H_SERIES_DEFAULTS.INPUT_CARD_OPTIONS.forEach(o=>{
        const opt=document.createElement('option');
        opt.value = `${o.model}|${o.qty}`; opt.textContent = o.display; select.appendChild(opt);
      });
    }
    function updatePortsFromOutputCard(){
      const [model, ports] = document.getElementById('modalOutputCardModel').value.split('|');
      document.getElementById('modalMaxPortsPerCard').value = ports;
    }

    function openControllerModal(){
      populateModalControllers();
      populateModalOutputCards();
      populateModalInputCards();
      const suggestedControllerName = finalCalculationData.controllerOverrideName || (finalCalculationData.controllerName ? finalCalculationData.controllerName.split('(')[0].trim() : '');
      const controllerSelect = document.getElementById('modalControllerModel');
      if (controllerSelect.querySelector(`option[value="${suggestedControllerName}"]`)) controllerSelect.value = suggestedControllerName;
      document.getElementById('modalSplicerSolution').value = finalCalculationData.splicerSolution || H_SERIES_DEFAULTS.SPLICER_NAME;

      const currentOutputCardValue = `${finalCalculationData.outputCardModel||H_SERIES_DEFAULTS.OUTPUT_CARD_20_MODEL}|${finalCalculationData.outputCardPorts||H_SERIES_DEFAULTS.OUTPUT_CARD_20_PORTS}`;
      const outputCardSelect = document.getElementById('modalOutputCardModel');
      if (outputCardSelect.querySelector(`option[value="${currentOutputCardValue}"]`)) outputCardSelect.value = currentOutputCardValue; else outputCardSelect.selectedIndex = 0;
      document.getElementById('modalMaxPortsPerCard').value = (finalCalculationData.outputCardPorts || H_SERIES_DEFAULTS.OUTPUT_CARD_20_PORTS);

      const inputCardSelect = document.getElementById('modalInputCardModel');
      const desiredModel = finalCalculationData.inputCardModel || H_SERIES_DEFAULTS.DEFAULT_INPUT_CARD_MODEL;
      const opt = Array.from(inputCardSelect.options).find(o=>o.value.startsWith(desiredModel));
      inputCardSelect.value = opt ? opt.value : inputCardSelect.options[0].value;
      document.getElementById('modalInputCardQty').value = finalCalculationData.inputCardQty || H_SERIES_DEFAULTS.DEFAULT_INPUT_CARD_QTY;

      const modal = document.getElementById('controllerModal');
      modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
    }
    function closeControllerModal(){
      const modal = document.getElementById('controllerModal');
      modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true');
    }
    function applyModalChanges(){
      finalCalculationData.controllerOverrideName = document.getElementById('modalControllerModel').value;
      finalCalculationData.splicerSolution = document.getElementById('modalSplicerSolution').value;
      const [model, ports] = document.getElementById('modalOutputCardModel').value.split('|');
      finalCalculationData.outputCardModel = model; finalCalculationData.outputCardPorts = parseFloat(ports);
      const inputCardModelSelect = document.getElementById('modalInputCardModel');
      finalCalculationData.inputCardModel = inputCardModelSelect.value.split('|')[0];
      finalCalculationData.inputCardQty = parseFloat(document.getElementById('modalInputCardQty').value);
      closeControllerModal(); showVisualization();
    }

    function getSuggestedControllerModel(totalPixels, finalResW, finalResH, productKey){
      const isOutdoor = productKey.startsWith('outdoor');
      const isSmallIndoor = totalPixels < 1_500_000;
      let suggested = null;
      if (isOutdoor || isSmallIndoor){
        suggested = CONTROLLER_MODELS.find(c=>c.type==="Multimedia Player" && c.maxPixels>=totalPixels && c.maxW>=finalResW && c.maxH>=finalResH);
      }
      if (!suggested){
        suggested = CONTROLLER_MODELS.find(c=>c.type==="All-in-One Processor" && c.maxPixels>=totalPixels && c.maxW>=finalResW && c.maxH>=finalResH);
      }
      if (!suggested){
        suggested = CONTROLLER_MODELS.find(c=>c.name.includes('4K Prime') && c.maxPixels>=totalPixels && c.maxW>=finalResW && c.maxH>=finalResH);
      }
      if (!suggested){
        const mods = CONTROLLER_MODELS.filter(c=>c.type==="Modular Splicer" && c.maxPixels>=totalPixels && c.maxW>=finalResW && c.maxH>=finalResH).sort((a,b)=>a.maxPixels-b.maxPixels);
        suggested = mods[0] || CONTROLLER_MODELS[CONTROLLER_MODELS.length-1];
      }
      return suggested;
    }

    function calculateLEDWall(){
      const productKey = document.getElementById('productModel').value;
      const unit = document.getElementById('unit').value;
      const widthInput = document.getElementById('width').value;
      const heightInput = document.getElementById('height').value;
      const diagonalInput = document.getElementById('diagonal').value;
      const aspectRatioKey = document.getElementById('aspectRatio').value;

      let inputW = parseFloat(widthInput);
      let inputH = parseFloat(heightInput);
      let inputD = parseFloat(diagonalInput);

      const errorDiv = document.getElementById('errorMessage');
      errorDiv.classList.add('hidden');

      // Basic validation
      if (!productKey || !unit || ((unit !== 'inches' && (!inputW && !inputH)) || (unit === 'inches' && !inputD))){
        errorDiv.textContent = 'ERROR: Please select a Model, Unit, and enter valid dimensions to continue.';
        errorDiv.classList.remove('hidden');
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return null;
      }

      const details = LED_PRODUCTS[productKey];
      const cabinetW_mm = details.cabW_mm;
      const cabinetH_mm = details.cabH_mm;

      let desiredW_mm, desiredH_mm; let usedW_input, usedH_input, usedRatio = aspectRatioKey || 'None Specified'; let inputDiagonal;

      if (unit === 'inches'){
        const ratioToUse = aspectRatioKey || '16:9';
        const [rW, rH] = ratioToUse.split(':').map(Number);
        const rDiag = Math.sqrt(rW*rW + rH*rH);
        const factor = inputD / rDiag;
        desiredW_mm = rW * factor * MM_PER_INCH; desiredH_mm = rH * factor * MM_PER_INCH;
        usedW_input = 0; usedH_input = 0; usedRatio = aspectRatioKey || '16:9 (Assumed)'; inputDiagonal = inputD;
      } else {
        const unit_factor = (unit === 'meters') ? MM_PER_METER : MM_PER_FOOT;
        const hasW = !isNaN(inputW) && inputW > 0; const hasH = !isNaN(inputH) && inputH > 0;
        if (aspectRatioKey){
          const [rW, rH] = aspectRatioKey.split(':').map(Number);
          if (hasW){ usedW_input = inputW; usedH_input = (inputW / rW) * rH; }
          else if (hasH){ usedH_input = inputH; usedW_input = (inputH / rH) * rW; }
          else { usedW_input = inputW; usedH_input = inputH; }
          desiredW_mm = usedW_input * unit_factor; desiredH_mm = usedH_input * unit_factor;
        } else {
          // If only one dimension provided, infer the other from cabinet AR
          const cabAR = cabinetW_mm / cabinetH_mm;
          if (hasW && !hasH){ usedW_input = inputW; usedH_input = inputW / cabAR; usedRatio = `Inferred from Cabinet AR (${cabinetW_mm}:${cabinetH_mm})`; }
          else if (hasH && !hasW){ usedH_input = inputH; usedW_input = inputH * cabAR; usedRatio = `Inferred from Cabinet AR (${cabinetW_mm}:${cabinetH_mm})`; }
          else { usedW_input = inputW; usedH_input = inputH; }
          desiredW_mm = usedW_input * unit_factor; desiredH_mm = usedH_input * unit_factor;
        }
        inputDiagonal = 0;
      }

      // Snap to nearest whole cabinets
      let numCabW = Math.max(1, Math.round(desiredW_mm / cabinetW_mm));
      let numCabH = Math.max(1, Math.round(desiredH_mm / cabinetH_mm));

      const totalCabinets = numCabW * numCabH;
      const totalModules = totalCabinets * details.modulesPerCab;
      const finalW_mm = numCabW * cabinetW_mm; const finalH_mm = numCabH * cabinetH_mm;
      const finalArea_m2 = (finalW_mm / MM_PER_METER) * (finalH_mm / MM_PER_METER);

      const finalResW = numCabW * details.cabPixW; const finalResH = numCabH * details.cabPixH; const totalPixels = finalResW * finalResH;

      const ratioGCD = gcd(finalResW, finalResH); const aspectRatioText = `${finalResW/ratioGCD}:${finalResH/ratioGCD}`;
      const finalDiagonal_mm = Math.sqrt(finalW_mm*finalW_mm + finalH_mm*finalH_mm); const finalDiagonal_in = finalDiagonal_mm / MM_PER_INCH;

      // Viewing distance rule: ~pixel pitch in meters -> feet
      const minViewingDistance_ft = details.pitch_mm * METER_TO_FEET; // intentional heuristic

      // Power/Weight (actual + design margins)
      const actualPower_W_unbuffered = finalArea_m2 * details.maxPower_W_m2;
      const maxPower_W_buffered = actualPower_W_unbuffered * POWER_BUFFER;
      const actualCurrent_A = actualPower_W_unbuffered / 220; const maxCurrent_A_buffered = maxPower_W_buffered / 220;
      const actualCabinetWeight_unbuffered = details.weight_kg * totalCabinets; const totalWallWeight_buffered = actualCabinetWeight_unbuffered * WEIGHT_BUFFER;

      // Controller suggestion
      const suggestedController = getSuggestedControllerModel(totalPixels, finalResW, finalResH, productKey);
      const isHSeries = suggestedController.type.includes('Modular');

      const outputCardPorts = finalCalculationData.outputCardPorts || H_SERIES_DEFAULTS.OUTPUT_CARD_20_PORTS;
      const outputCardModel = finalCalculationData.outputCardModel || H_SERIES_DEFAULTS.OUTPUT_CARD_20_MODEL;
      const inputCardModel = finalCalculationData.inputCardModel || H_SERIES_DEFAULTS.DEFAULT_INPUT_CARD_MODEL;
      const inputCardQty = finalCalculationData.inputCardQty || H_SERIES_DEFAULTS.DEFAULT_INPUT_CARD_QTY;
      const splicerSolution = finalCalculationData.splicerSolution || (isHSeries ? H_SERIES_DEFAULTS.SPLICER_NAME : 'N/A');

      const requiredPorts = Math.max(1, Math.ceil(totalPixels / PIXELS_PER_PORT_DEFAULT));
      const requiredSendCards = Math.max(1, Math.ceil(requiredPorts / outputCardPorts));
      const requiredShortEthernet = Math.max(0, totalCabinets - requiredPorts);

      const controllerName = finalCalculationData.controllerOverrideName || suggestedController.name;

      finalCalculationData = {
        ...finalCalculationData,
        productName: details.name,
        pixelPitch_mm: details.pitch_mm,
        cabinetW_mm, cabinetH_mm,
        cabPixW: details.cabPixW, cabPixH: details.cabPixH,
        finalW_mm, finalH_mm, finalArea_m2,
        finalResW, finalResH, totalPixels,
        aspectRatioText, finalDiagonal_in,
        totalCabinets, totalModules, totalRecCards: totalCabinets,
        numCabW, numCabH, modulesPerCab: details.modulesPerCab,
        nits_range: details.nits_range,
        minViewingDistance_ft,
        actualPower_W_unbuffered, maxPower_W: maxPower_W_buffered,
        actualCurrent_A, maxCurrent_A_buffered,
        actualWallWeight_unbuffered, totalWallWeight_buffered,
        controllerName, controllerType: suggestedController.type,
        requiredPorts, requiredShortEthernet,
        outputCardPorts, outputCardModel, requiredSendCards,
        inputCardModel, inputCardQty, splicerSolution
      };
      return finalCalculationData;
    }

    function calculateDimensions(data){
      const finalW_M = data.finalW_mm / MM_PER_METER; const finalH_M = data.finalH_mm / MM_PER_METER;
      const finalW_FT = data.finalW_mm / MM_PER_FOOT; const finalH_FT = data.finalH_mm / MM_PER_FOOT;
      return { finalW_M, finalH_M, finalW_FT, finalH_FT };
    }

    function showVisualization(){
      const data = calculateLEDWall(); if (!data) return;
      const { finalW_M, finalH_M, finalW_FT, finalH_FT } = calculateDimensions(data);
      document.getElementById('enteredSummaryText').textContent = `Cabinet Matrix: ${data.numCabW}x${data.numCabH} (${data.totalCabinets} Cabinets)`;
      document.getElementById('aspectRatioValue').textContent = data.aspectRatioText;
      document.getElementById('formContainer').classList.add('minimized');
      document.getElementById('submitButton').classList.add('hidden');
      document.querySelector('.back-btn-placeholder').classList.remove('hidden');
      document.getElementById('visualization').classList.add('visible');
      // Left card
      document.getElementById('pixelPitchDisplay').innerHTML = `<strong>Pixel Pitch :</strong><small>${data.pixelPitch_mm} mm</small>`;
      document.getElementById('finalDimensions').innerHTML = `<strong>Actual Final Dimensions (WxH) :</strong><small>(${finalW_FT.toFixed(2)}ft x ${finalH_FT.toFixed(2)}ft) - ${finalW_M.toFixed(2)}m x ${finalH_M.toFixed(2)}m</small>`;
      document.getElementById('resolution').innerHTML = `<strong>Actual Final Resolution (WxH) :</strong><small>${data.finalResW} x ${data.finalResH}</small>`;
      document.getElementById('numCabinets').innerHTML = `<strong>Total Cabinets (W x H) :</strong><small>${data.totalCabinets} (${data.numCabW} x ${data.numCabH})</small>`;
      document.getElementById('totalModules').innerHTML = `<strong>Total Modules Required :</strong><small>${data.totalModules} (${data.modulesPerCab} per cabinet)</small>`;
      document.getElementById('finalDiagonal').innerHTML = `<strong>Final Diagonal Size :</strong><small>${data.finalDiagonal_in.toFixed(1)} in</small>`;
      document.getElementById('finalArea').innerHTML = `<strong>Final Area :</strong><small>${data.finalArea_m2.toFixed(2)} m²</small>`;
      document.getElementById('totalPixels').innerHTML = `<strong>Total Pixels :</strong><small>${formatLargeNumber(data.totalPixels)}</small>`;
      document.getElementById('cabinetSize').innerHTML = `<strong>Cabinet Size (WxH) :</strong><small>${data.cabinetW_mm}mm x ${data.cabinetH_mm}mm</small>`;
      document.getElementById('cabinetPixels').innerHTML = `<strong>Cabinet Pixels (WxH) :</strong><small>${data.cabPixW} x ${data.cabPixH}</small>`;

      // Right card (control)
      const isHSeries = data.controllerType.includes('Modular');
      const controlDiv = document.getElementById('controlSystemDetails');
      let html = `
        <span style="grid-column:1/-1;font-weight:700;color:var(--brand);border-bottom:1px solid var(--brand);padding-bottom:5px;margin-bottom:5px;margin-top:10px;">Control System Summary</span>
        <span id="suggestedControllerModel"><strong>Controller/Processor Model (${data.controllerType}) :</strong><small>${data.controllerName}</small></span>
      `;
      if (isHSeries){
        html += `
          <div id="modularDetails" class="vis-details" style="grid-column:1/-1;gap:5px;border-top:1px solid #e0e0e0;padding-top:10px;margin-top:5px;">
            <span style="grid-column:1/-1;font-weight:700;color:var(--accent);margin-bottom:5px;">Modular Components (H-Series)</span>
            <span id="splicerSolution"><strong>Splicer Frame/Solution :</strong><small>${data.splicerSolution||'N/A'}</small></span>
            <span id="sendingCardModel"><strong>Output Card (${data.outputCardPorts} ports/card) :</strong><small>${data.requiredSendCards} x ${data.outputCardModel}</small></span>
            <span id="inputCardModel"><strong>Input Card (User Specified) :</strong><small>${data.inputCardQty} x ${data.inputCardModel}</small></span>
          </div>`;
      }
      html += `
        <span style="grid-column:1/-1;font-weight:700;color:var(--brand);border-bottom:1px solid var(--brand);padding-bottom:5px;margin-bottom:5px;margin-top:10px;">Connection Summary</span>
        <span id="requiredRecCards"><strong>Total Receiving Cards Required :</strong><small>${data.totalRecCards}</small></span>
        <span id="controllerLongPorts"><strong>Long Ethernet Ports/Runs :</strong><small>${data.requiredPorts} (Controller → Wall)</small></span>
        <span id="controllerShortPorts"><strong>Short Ethernet Cables :</strong><small>${data.requiredShortEthernet} (Between Cabinets)</small></span>
        <span style="grid-column:1/-1;font-weight:700;color:var(--brand);border-bottom:1px solid var(--brand);padding-bottom:5px;margin-bottom:5px;margin-top:10px;">Power and Weight</span>
        <span id="wallPowerActual"><strong>Max Power Consumption (Actual) :</strong><small>${formatNumber(data.actualPower_W_unbuffered,0)} W</small></span>
        <span id="wallCurrent"><strong>Max Current Draw (Actual @220V) :</strong><small>${data.actualCurrent_A.toFixed(2)} A</small></span>
        <span id="cabinetWeightActual"><strong>Total Wall Weight (Actual Cabinets) :</strong><small>${formatNumber(data.actualWallWeight_unbuffered,1)} kg</small></span>
      `;
      controlDiv.innerHTML = html;

      // Visualization sizing
      const aspectRatio = data.finalW_mm / data.finalH_mm; const visualizationHeight = 300; const visGrid = document.getElementById('visGrid');
      if (visualizationHeight * aspectRatio > 800){ visGrid.style.width = `800px`; visGrid.style.height = `${800 / aspectRatio}px`; }
      else { visGrid.style.height = `${visualizationHeight}px`; visGrid.style.width = `${visualizationHeight * aspectRatio}px`; }
      visGrid.style.margin = '0 auto';
      document.getElementById('visWidthLabel').textContent = `${finalW_M.toFixed(2)} m (W)`;
      document.getElementById('visHeightLabel').textContent = `${finalH_M.toFixed(2)} m (H)`;
      const cabinetOverlay = document.getElementById('cabinetOverlay');
      cabinetOverlay.innerHTML='';
      cabinetOverlay.style.gridTemplateColumns = `repeat(${data.numCabW}, 1fr)`;
      cabinetOverlay.style.gridTemplateRows = `repeat(${data.numCabH}, 1fr)`;
      for (let r=0;r<data.numCabH;r++){
        for (let c=0;c<data.numCabW;c++){
          const cell=document.createElement('div');
          cell.style.border='1px dashed rgba(13,71,161,0.4)'; cell.style.boxSizing='border-box';
          cabinetOverlay.appendChild(cell);
        }
      }
      document.getElementById('downloadPdfLink').classList.remove('hidden');
    }

    function hideVisualization(){
      document.getElementById('formContainer').classList.remove('minimized');
      document.getElementById('visualization').classList.remove('visible');
      document.getElementById('submitButton').classList.remove('hidden');
      document.querySelector('.back-btn-placeholder').classList.add('hidden');
      document.getElementById('downloadPdfLink').classList.add('hidden');
    }

    // ===== PDF (no watermark, no contact gate) =====
    function proceedToDownl
