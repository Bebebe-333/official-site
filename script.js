/**
 * Sheet-First IMS Creator Logical Script
 * Enforces strict 10-row grid and WYSIWYG data handling.
 */

document.addEventListener('DOMContentLoaded', () => {

    // --- Configuration ---
    const MAX_ROWS = 10;
    const STORAGE_KEY = 'ims_sheet_data_v2'; // New key for new format

    // --- DOM Elements ---
    const btnSave = document.getElementById('btn-save');
    const btnPrint = document.getElementById('btn-print');
    const rowsContainer = document.getElementById('process-rows-container');

    // Meta Inputs
    const metaInputs = {
        date: document.getElementById('meta-date'),
        docNo: document.getElementById('meta-docno')
    };

    // Product Inputs
    const productInputs = {
        nameInternal: document.getElementById('p-name-in'),
        nameCustomer: document.getElementById('p-name-out'),
        material: document.getElementById('p-material'),
        spec: document.getElementById('p-spec'),
        notes: document.getElementById('p-notes')
    };

    // --- Initialization ---

    // 1. Set default date if empty
    if (!metaInputs.date.value) {
        metaInputs.date.valueAsDate = new Date();
    }

    // 2. Load Data or Initialize Empty
    loadData();

    // --- Event Listeners ---

    btnSave.addEventListener('click', () => {
        saveData();
        // Visual feedback
        const originalText = btnSave.innerHTML;
        btnSave.innerHTML = '✅ Saved!';
        setTimeout(() => btnSave.innerHTML = originalText, 1500);
    });

    btnPrint.addEventListener('click', () => {
        window.print();
    });

    // --- Core Functions ---

    /**
     * Renders the process table rows.
     * Always renders MAX_ROWS (10).
     * @param {Array} stepsData - Array of step objects (can be sparse)
     */
    function renderRows(stepsData = []) {
        rowsContainer.innerHTML = ''; // Clear current

        for (let i = 0; i < MAX_ROWS; i++) {
            const step = stepsData[i] || {}; // Get data or empty obj

            const rowDiv = document.createElement('div');
            rowDiv.className = 'proc-row';

            // Cells: No | Process | Conditions | Remarks
            // Note: We use data-index to help with scraping values later if needed, 
            // but mapped inputs are easier.

            rowDiv.innerHTML = `
                <div class="proc-cell cell-no">${i + 1}</div>
                <div class="proc-cell">
                    <input type="text" class="inp-proc" value="${step.process || ''}">
                </div>
                <div class="proc-cell">
                    <textarea class="inp-cond">${step.condition || ''}</textarea>
                </div>
                <div class="proc-cell">
                    <textarea class="inp-rem">${step.remarks || ''}</textarea>
                </div>
            `;

            rowsContainer.appendChild(rowDiv);
        }
    }

    /**
     * Scrapes current UI values and saves to LocalStorage
     */
    function saveData() {
        // Meta
        const metaData = {
            date: metaInputs.date.value,
            docNo: metaInputs.docNo.value
        };

        // Product
        const prodData = {
            nameInternal: productInputs.nameInternal.value,
            nameCustomer: productInputs.nameCustomer.value,
            material: productInputs.material.value,
            spec: productInputs.spec.value,
            notes: productInputs.notes.value
        };

        // Steps (Scrape from DOM to ensure what you see is what you save)
        const stepRows = rowsContainer.querySelectorAll('.proc-row');
        const stepsData = [];

        stepRows.forEach(row => {
            stepsData.push({
                process: row.querySelector('.inp-proc').value,
                condition: row.querySelector('.inp-cond').value,
                remarks: row.querySelector('.inp-rem').value
            });
        });

        // Construct Payload
        const payload = {
            meta: metaData,
            product: prodData,
            steps: stepsData,
            updatedAt: new Date().toISOString()
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        console.log('Saved:', payload);
    }

    /**
     * Loads date from LocalStorage and populates UI
     */
    function loadData() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            renderRows([]); // Render empty grid
            return;
        }

        try {
            const data = JSON.parse(raw);

            // Populate Meta
            if (data.meta) {
                metaInputs.date.value = data.meta.date || '';
                metaInputs.docNo.value = data.meta.docNo || '';
            }

            // Populate Product
            if (data.product) {
                productInputs.nameInternal.value = data.product.nameInternal || '';
                productInputs.nameCustomer.value = data.product.nameCustomer || '';
                productInputs.material.value = data.product.material || '';
                productInputs.spec.value = data.product.spec || '';
                productInputs.notes.value = data.product.notes || '';
            }

            // Populate Steps
            renderRows(data.steps || []);

        } catch (e) {
            console.error('Error loading data', e);
            renderRows([]);
        }
    }

});
