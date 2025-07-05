// REPLACE EVERYTHING in script.js with this new code

document.addEventListener('DOMContentLoaded', function () {
    
    // --- API & GLOBAL VARIABLES ---
    const API_BASE_URL = 'https://d6k47ju408.execute-api.us-east-1.amazonaws.com/prod'; // Your base URL
    const DONORS_URL = `${API_BASE_URL}/donors`;
    const PATIENTS_URL = `${API_BASE_URL}/patients`;
    const ANALYTICS_URL = `${API_BASE_URL}/analytics`; 

    let allDonors = [];
    let allPatients = [];
    let supplyChart, demandChart;

    // --- UI ELEMENTS: DONORS ---
    const donorTableBody = document.getElementById('donorTableBody');
    const searchInput = document.getElementById('searchInput');
    const addDonorForm = document.getElementById('addDonorForm');
    const submitButton = document.getElementById('submitButton');
    const submitButtonSpinner = submitButton.querySelector('.spinner-border');
    const editModalElement = document.getElementById('editModal');
    const editModal = new bootstrap.Modal(editModalElement);
    const saveChangesBtn = document.getElementById('saveChangesBtn');
    const deleteModalElement = document.getElementById('deleteConfirmModal');
    const deleteModal = new bootstrap.Modal(deleteModalElement);
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

    // --- UI ELEMENTS: PATIENTS (NEW) ---
    const patientTableBody = document.getElementById('patientTableBody');
    const addPatientForm = document.getElementById('addPatientForm');
    const submitPatientButton = document.getElementById('submitPatientButton');
    const patientSearchInput = document.getElementById('patientSearchInput');

    // --- UI ELEMENTS: ASSIGNMENT MODAL (NEW/MODIFIED) ---
    const assignPatientModalElement = document.getElementById('assignPatientModal');
    const assignPatientModal = new bootstrap.Modal(assignPatientModalElement);
    const assignPatientSelect = document.getElementById('assign-patient-select');
    const confirmAssignBtn = document.getElementById('confirmAssignBtn');
    

    // --- UI ELEMENTS: MAINTENANCE (NEW) ---
    const preparePurgeBtn = document.getElementById('preparePurgeBtn');
    const confirmPurgeBtn = document.getElementById('confirmPurgeBtn');
    const purgeDateInput = document.getElementById('purgeDate');
    const purgePreviewArea = document.getElementById('purgePreviewArea');

    // --- UI ELEMENTS: DASHBOARD (NEW) ---
    const kpiAvailableUnits = document.getElementById('kpi-available-units');
    const kpiPatientsWaiting = document.getElementById('kpi-patients-waiting');
    const kpiMostAbundant = document.getElementById('kpi-most-abundant');
    const kpiMostNeeded = document.getElementById('kpi-most-needed');
    const supplyChartCanvas = document.getElementById('supplyChart');
    const demandChartCanvas = document.getElementById('demandChart');

    // --- UI ELEMENTS: NOTIFICATIONS ---
    const toastElement = document.getElementById('liveToast');
    const toast = new bootstrap.Toast(toastElement);

    // --- UTILITY FUNCTION: Show Toast Notifications ---
    function showToast(title, body, isSuccess) {
        const toastTitle = document.getElementById('toastTitle');
        const toastBody = document.getElementById('toastBody');
        toastTitle.textContent = title;
        toastBody.textContent = body;
        toastElement.classList.remove('bg-success-subtle', 'bg-danger-subtle', 'bg-info-subtle');
        if (isSuccess === true) {
            toastElement.classList.add('bg-success-subtle');
        } else if (isSuccess === false) {
            toastElement.classList.add('bg-danger-subtle');
        } else {
            toastElement.classList.add('bg-info-subtle'); // For neutral info
        }
        toast.show();
    }

    // --- API FUNCTIONS ---
    async function fetchData(url, options = {}) {
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            // Handle methods that don't return a body (like DELETE)
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                return response.json();
            }
            return true; 
        } catch (error) {
            console.error(`API call to ${url} failed:`, error);
            showToast('API Error', `Could not complete the request. Please check console.`, false);
            throw error; // Re-throw the error to be handled by the caller
        }
    }
    
    // --- DONOR DATA MANAGEMENT ---
 async function getDonors() {
    console.log("CHECKPOINT 1: getDonors() function has been called.");
    donorTableBody.innerHTML = '<tr><td colspan="6" class="text-center"><div class="spinner-border text-danger" role="status"></div></td></tr>';
    try {
        allDonors = await fetchData(DONORS_URL);
        console.log("CHECKPOINT 2: Data fetched successfully from API. Number of donors:", allDonors.length);
        console.log("Full donor data received:", allDonors); // This shows us the actual data

        displayDonors(allDonors);

    } catch (error) {
        console.error("ERROR inside getDonors catch block:", error);
        donorTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading donor data.</td></tr>';
    }
}

  function displayDonors(donors) {
    console.log("CHECKPOINT 3: displayDonors() function has been called.");
    
    // First, let's make sure the table body element exists
    if (!donorTableBody) {
        console.error("CRITICAL FAILURE: The element 'donorTableBody' was not found in the HTML!");
        return;
    }
    
    donorTableBody.innerHTML = '';
    
    if (donors.length === 0) {
        donorTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No blood units found in repository.</td></tr>';
        console.log("CHECKPOINT 4: No donors to display. Function finished.");
        return;
    }

    console.log("CHECKPOINT 5: Starting to loop through each donor.");
    donors.forEach((donor, index) => {
        console.log(`Looping... Index ${index}, Donor:`, donor);
        const isUsed = donor.status === 'Used';
        const statusBadge = isUsed ? `<span class="badge bg-secondary">Used</span>` : `<span class="badge bg-success">Available</span>`;
        
        const actionsHtml = isUsed ?
            `<button class="btn btn-sm btn-outline-secondary" disabled title="Cannot assign a used unit"><i class="bi bi-check-circle"></i> Assign</button>` :
            `<button class="btn btn-sm btn-success btn-assign" data-id="${donor.id}" data-blood-type="${donor.bloodType}"><i class="bi bi-check-circle"></i> Assign</button>`;

        const row = `
            <tr>
                <td><strong>${donor.name}</strong><br><small class="text-muted">${donor.phone}</small></td>
                <td><span class="badge bg-danger fs-6">${donor.bloodType}</span></td>
                <td>${donor.city}<br><small class="text-muted"><strong>${donor.storageArea || 'N/A'}</strong></small></td>
                <td>${statusBadge}</td>
                <td>${donor.storageDate}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${donor.id}" ${isUsed ? 'disabled' : ''}><i class="bi bi-pencil-square"></i> Edit</button>
                    <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${donor.id}" ${isUsed ? 'disabled' : ''}><i class="bi bi-trash3"></i> Delete</button>
                    ${actionsHtml}
                </td>
            </tr>`;
        donorTableBody.innerHTML += row;
    });

    console.log("CHECKPOINT 6: Finished looping through all donors. Display should be complete.");
}


    // --- PATIENT DATA MANAGEMENT (NEW) ---
    async function getPatients() {
        patientTableBody.innerHTML = '<tr><td colspan="5" class="text-center"><div class="spinner-border text-primary" role="status"></div></td></tr>';
        try {
            allPatients = await fetchData(PATIENTS_URL);
            displayPatients(allPatients);
        } catch (error) {
            patientTableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading patient data.</td></tr>';
        }
    }
    // --- DASHBOARD FUNCTIONS (NEW) ---

// Function to fetch analytics data and update the entire dashboard
async function updateDashboard() {
    try {
        // Show loading state
        kpiAvailableUnits.textContent = '...';
        kpiPatientsWaiting.textContent = '...';
        kpiMostAbundant.textContent = '...';
        kpiMostNeeded.textContent = '...';

        const data = await fetchData(ANALYTICS_URL);
        
        // Update KPI cards
        kpiAvailableUnits.textContent = data.supply.totalAvailable;
        kpiPatientsWaiting.textContent = data.demand.totalWaiting;
        kpiMostAbundant.textContent = data.supply.mostAbundant;
        kpiMostNeeded.textContent = data.demand.mostNeeded;

        // Update charts
        renderBarChart(supplyChart, supplyChartCanvas, Object.keys(data.supply.counts), Object.values(data.supply.counts), 'Blood Supply', 'rgba(40, 167, 69, 0.7)');
        renderBarChart(demandChart, demandChartCanvas, Object.keys(data.demand.counts), Object.values(data.demand.counts), 'Patient Demand', 'rgba(255, 193, 7, 0.7)');

    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        showToast('Dashboard Error', 'Could not load analytics data.', false);
    }
}

// Reusable function to create or update a bar chart
function renderBarChart(chartInstance, canvasElement, labels, data, label, color) {
    const chartData = {
        labels: labels,
        datasets: [{
            label: label,
            data: data,
            backgroundColor: color,
            borderColor: color.replace('0.7', '1'), // Make border solid
            borderWidth: 1
        }]
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    // Ensure only whole numbers are shown on the y-axis
                    stepSize: 1
                }
            }
        },
        plugins: {
            legend: {
                display: false // Hide the legend as the chart title is enough
            }
        },
        responsive: true,
        maintainAspectRatio: false
    };

    // If a chart instance already exists, destroy it before creating a new one
    // This prevents flickering and memory leaks on subsequent updates
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create a new chart instance and store it
    chartInstance = new Chart(canvasElement, {
        type: 'bar',
        data: chartData,
        options: chartOptions
    });
    
    // This part is a bit tricky due to Chart.js scope, we re-assign it to the global variable
    if (canvasElement.id === 'supplyChart') {
        supplyChart = chartInstance;
    } else if (canvasElement.id === 'demandChart') {
        demandChart = chartInstance;
    }
}

    function displayPatients(patients) {
        patientTableBody.innerHTML = '';
        if (patients.length === 0) {
            patientTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No patients on waitlist.</td></tr>';
            return;
        }
        patients.forEach(patient => {
            const isCompleted = patient.status === 'COMPLETED';
            const statusBadge = isCompleted 
                ? `<span class="badge bg-secondary">Completed</span>`
                : `<span class="badge bg-warning text-dark">Waiting</span>`;

                        const patientName = isCompleted
                ? `<s>${patient.patientName}</s>`
                : `<strong>${patient.patientName}</strong>`;

            // The 'patientCode' is now displayed prominently in the first column.
            const row = `
                <tr>
                    <td>${patientName}<br><small class="text-muted">ID: <strong>${patient.patientCode}</strong> | Required by: ${patient.requiredDate}</small></td>
                    <td>${patient.hospitalName}</td>
                    <td><span class="badge bg-danger fs-6">${patient.requiredBloodType}</span></td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-info btn-view-patient" data-id="${patient.id}" ${!isCompleted ? 'disabled' : ''}>
                            <i class="bi bi-info-circle"></i> View Details
                        </button>
                    </td>
                </tr>`;
            patientTableBody.innerHTML += row;
        });
    }
    
// --- EVENT LISTENERS ---

// Add listeners to all tabs to ensure data is fresh when a user clicks on them
document.getElementById('dashboard-tab').addEventListener('click', updateDashboard);
document.getElementById('donors-tab').addEventListener('click', getDonors);
document.getElementById('patients-tab').addEventListener('click', getPatients);

// Add Donor Form Submission
addDonorForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!addDonorForm.checkValidity()) { e.stopPropagation(); addDonorForm.classList.add('was-validated'); return; }
    
    submitButton.disabled = true;
    submitButtonSpinner.classList.remove('d-none');
    const newDonor = { name: document.getElementById('name').value, bloodType: document.getElementById('bloodType').value, city: document.getElementById('city').value, phone: document.getElementById('phone').value, storageDate: document.getElementById('storageDate').value, storageArea: document.getElementById('storageArea').value };
    
    try {
        await fetchData(DONORS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newDonor) });
        showToast('Success!', 'New blood unit added.', true);
        addDonorForm.reset();
        addDonorForm.classList.remove('was-validated');
        initializeApp(); // Use initializeApp to refresh ALL data consistently
    } finally {
        submitButton.disabled = false;
        submitButtonSpinner.classList.add('d-none');
    }
});

// Add Patient Form Submission
addPatientForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    if (!addPatientForm.checkValidity()) { e.stopPropagation(); addPatientForm.classList.add('was-validated'); return; }

    submitPatientButton.disabled = true;
    submitPatientButton.querySelector('.spinner-border').classList.remove('d-none');
    const newPatient = { patientName: document.getElementById('patientName').value, requiredBloodType: document.getElementById('requiredBloodType').value, hospitalName: document.getElementById('hospitalName').value, requiredDate: document.getElementById('requiredDate').value };

    try {
        await fetchData(PATIENTS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPatient) });
        showToast('Success!', 'New patient added to waitlist.', true);
        addPatientForm.reset();
        addPatientForm.classList.remove('was-validated');
        initializeApp(); // Use initializeApp to refresh ALL data consistently
    } finally {
        submitPatientButton.disabled = false;
        submitPatientButton.querySelector('.spinner-border').classList.add('d-none');
    }
});

// Donor Table Actions (Edit, Delete, Assign)
donorTableBody.addEventListener('click', function(e) {
    // This function does not need changes, your existing code is fine here
    const target = e.target.closest('button');
    if (!target) return;
    const donorId = target.dataset.id;
    const donor = allDonors.find(d => d.id === donorId);
    if (!donor) return;
    if (target.classList.contains('btn-edit')) {
        document.getElementById('edit-id').value = donor.id;
        document.getElementById('edit-name').value = donor.name;
        document.getElementById('edit-bloodType').value = donor.bloodType;
        document.getElementById('edit-city').value = donor.city;
        document.getElementById('edit-phone').value = donor.phone;
        document.getElementById('edit-storageDate').value = donor.storageDate;
        document.getElementById('edit-storageArea').value = donor.storageArea;
        editModal.show();
    } else if (target.classList.contains('btn-delete')) {
        confirmDeleteBtn.dataset.donorId = donorId;
        document.getElementById('deleteModalBody').textContent = `Are you sure you want to delete the record for "${donor.name}"? This cannot be undone.`;
        deleteModal.show();
    } else if (target.classList.contains('btn-assign')) {
        const donorBloodType = target.dataset.bloodType;
        const matchingPatients = allPatients.filter(p => p.status === 'WAITING' && p.requiredBloodType === donorBloodType);
        assignPatientSelect.innerHTML = '<option selected disabled value="">Choose a patient...</option>';
        if (matchingPatients.length > 0) {
            matchingPatients.forEach(p => {
                const option = new Option(`${p.patientName} (${p.hospitalName})`, p.id);
                assignPatientSelect.add(option);
            });
        } else {
            assignPatientSelect.innerHTML = '<option selected disabled value="">No matching patients on waitlist</option>';
        }
        document.getElementById('assign-donor-id').value = donorId;
        document.getElementById('assign-transfusionDate').valueAsDate = new Date();
        assignPatientModal.show();
    }
});

// Patient Table Actions (View Details)
patientTableBody.addEventListener('click', function(e) {
    // This function does not need changes, your existing code is fine here
    const target = e.target.closest('button.btn-view-patient');
    if (!target) return;
    const patientId = target.dataset.id;
    const patient = allPatients.find(p => p.id === patientId);
    if (!patient) return;
    const assignedDonor = allDonors.find(d => d.id === patient.assignedDonorId);
    const donorInfo = assignedDonor ? `from donor ${assignedDonor.name}` : `(donor info not found)`;
    showToast(`Details for ${patient.patientName}`, `Patient Code: ${patient.patientCode || '(Legacy Record)'}. Transfusion completed on ${patient.transfusionDate} with blood ${donorInfo}.`, null);
});

// Save Changes (Edit Donor)
saveChangesBtn.addEventListener('click', async function() {
    const donorId = document.getElementById('edit-id').value;
    const originalDonor = allDonors.find(d => d.id === donorId);
    if (!originalDonor) return; // Safety check
    const donorData = { 
        ...originalDonor, // Start with original data to preserve status, etc.
        name: document.getElementById('edit-name').value, 
        bloodType: document.getElementById('edit-bloodType').value, 
        city: document.getElementById('edit-city').value, 
        phone: document.getElementById('edit-phone').value, 
        storageDate: document.getElementById('edit-storageDate').value,
        storageArea: document.getElementById('edit-storageArea').value
    };
    try {
        await fetchData(`${DONORS_URL}/${donorId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(donorData) });
        editModal.hide();
        showToast('Success', 'Donor details updated.', true);
        initializeApp(); // Use initializeApp to refresh ALL data consistently
    } catch (error) { /* error is handled by fetchData */ }
});

// Confirm Deletion (Delete Donor)
confirmDeleteBtn.addEventListener('click', async function() {
    const donorId = this.dataset.donorId;
    try {
        await fetchData(`${DONORS_URL}/${donorId}`, { method: 'DELETE' });
        deleteModal.hide();
        showToast('Success', 'Donor record deleted.', true);
        initializeApp(); // Use initializeApp to refresh ALL data consistently
    } catch (error) { /* error is handled by fetchData */ }
});

// Confirm Assignment
confirmAssignBtn.addEventListener('click', async function() {
    const donorId = document.getElementById('assign-donor-id').value;
    const patientId = assignPatientSelect.value;
    const transfusionDate = document.getElementById('assign-transfusionDate').value;
    if (!patientId || !transfusionDate) {
        showToast('Invalid Input', 'Please select a patient and a valid transfusion date.', false);
        return;
    }
    const originalDonor = allDonors.find(d => d.id === donorId);
    const originalPatient = allPatients.find(p => p.id === patientId);
    if (!originalDonor || !originalPatient) {
        showToast('Error', 'Could not find original records. Please refresh.', false);
        return;
    }
    const updatedDonorData = { ...originalDonor, status: 'Used', assignedPatientId: patientId };
    const updatedPatientData = { ...originalPatient, status: 'COMPLETED', assignedDonorId: donorId, transfusionDate: transfusionDate };
    this.disabled = true;
    try {
        await Promise.all([
            fetchData(`${DONORS_URL}/${donorId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedDonorData) }),
            fetchData(`${PATIENTS_URL}/${patientId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPatientData) })
        ]);
        showToast('Assignment Complete!', `${originalDonor.name}'s blood has been assigned to ${originalPatient.patientName}.`, true);
        assignPatientModal.hide();
        initializeApp(); // Use initializeApp to refresh ALL data consistently
    } catch (error) {
        showToast('Assignment Failed', 'Could not complete the assignment. Check console for details.', false);
    } finally {
        this.disabled = false;
    }
});

// --- Search/Filter Listeners --- (No changes needed here)
searchInput.addEventListener('keyup', () => {
    const searchTerm = searchInput.value.toLowerCase();
    const filtered = allDonors.filter(d => d.name.toLowerCase().includes(searchTerm) || d.bloodType.toLowerCase().includes(searchTerm) || d.city.toLowerCase().includes(searchTerm));
    displayDonors(filtered);
});

patientSearchInput.addEventListener('keyup', () => {
    const searchTerm = patientSearchInput.value.toLowerCase();
    const filtered = allPatients.filter(p => p.patientName.toLowerCase().includes(searchTerm) || p.hospitalName.toLowerCase().includes(searchTerm) || (p.patientCode && p.patientCode.toLowerCase().includes(searchTerm)));
    displayPatients(filtered);
});

// ADD THIS NEW BLOCK OF EVENT LISTENERS FOR THE MAINTENANCE TAB

// --- Maintenance Tab Listeners ---

// Listener for the "Preview Records for Deletion" button
preparePurgeBtn.addEventListener('click', function() {
    const purgeDate = purgeDateInput.value;
    if (!purgeDate) {
        showToast('Input Required', 'Please select a date to preview the purge.', false);
        return;
    }

    // Perform a quick client-side filter for the preview
    // This is fast and doesn't require an API call just to get a count
    const patientsToDelete = allPatients.filter(p => 
        p.status === 'COMPLETED' && p.transfusionDate && p.transfusionDate < purgeDate
    );
    
    // Count how many of these patients have a valid assigned donor ID
    const donorsToDeleteCount = patientsToDelete.filter(p => p.assignedDonorId).length;

    if (patientsToDelete.length === 0) {
        purgePreviewArea.innerHTML = '<strong>No records found.</strong> There are no completed records before the selected date.';
        confirmPurgeBtn.classList.add('d-none'); // Hide confirm button if there's nothing to delete
    } else {
        // Display the preview message
        purgePreviewArea.innerHTML = `You are about to permanently delete:
            <ul>
                <li><strong>${patientsToDelete.length}</strong> patient record(s).</li>
                <li><strong>${donorsToDeleteCount}</strong> associated donor record(s).</li>
            </ul>
            This action cannot be undone. Please confirm.`;
        confirmPurgeBtn.classList.remove('d-none'); // Show the final confirm button
    }
    purgePreviewArea.classList.remove('d-none'); // Make the preview area visible
});

// Listener for the final "Yes, I understand. Purge These Records" button
confirmPurgeBtn.addEventListener('click', async function() {
    const purgeDate = purgeDateInput.value;
    if (!purgeDate) {
        showToast('Error', 'Date was lost. Please try previewing again.', false);
        return;
    }
    
    const spinner = this.querySelector('.spinner-border');
    this.disabled = true;
    spinner.classList.remove('d-none');

    try {
        // This is where we make the real API call to the backend
        const response = await fetchData(`${API_BASE_URL}/purge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completedBefore: purgeDate })
        });
        
        showToast('Purge Successful', `Deleted ${response.deletedPatients} patient and ${response.deletedDonors} donor records.`, true);
        
        // Reset the Maintenance UI after a successful purge
        purgePreviewArea.classList.add('d-none');
        confirmPurgeBtn.classList.add('d-none');
        purgeDateInput.value = '';

        // IMPORTANT: Refresh the app data from the server
        initializeApp();

    } catch (error) {
        showToast('Purge Failed', 'An error occurred during the purge operation. Check console.', false);
    } finally {
        // This runs whether the purge succeeded or failed
        this.disabled = false;
        spinner.classList.add('d-none');
    }
});

    // --- INITIAL DATA LOAD ---
    function initializeApp() {
        updateDashboard();
        getDonors();
        getPatients();
    }

    initializeApp();
});