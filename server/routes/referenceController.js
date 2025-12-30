const Medicine = require('../models/Medicine');
const LabTest = require('../models/LabTest');
const axios = require('axios');

// Basic in-memory cache for simple caching
const cache = new Map();

// Helper to map OpenFDA result to our format
const mapOpenFdaItem = (item) => {
    // Try to find a usable name
    let name = 'Unknown Name';
    if (item.openfda?.brand_name && item.openfda.brand_name.length > 0) name = item.openfda.brand_name[0];
    else if (item.openfda?.generic_name && item.openfda.generic_name.length > 0) name = item.openfda.generic_name[0];
    else if (item.openfda?.substance_name && item.openfda.substance_name.length > 0) name = item.openfda.substance_name[0];

    // Fallback description
    let description = 'No detailed description available.';
    if (item.description && item.description.length > 0) description = item.description[0];
    else if (item.indications_and_usage && item.indications_and_usage.length > 0) description = item.indications_and_usage[0];
    else if (item.purpose && item.purpose.length > 0) description = item.purpose[0];

    // Truncate description for list view
    const shortDesc = description.length > 150 ? description.substring(0, 150) + '...' : description;

    return {
        _id: item.id,
        name: name,
        description: shortDesc,
        fullDescription: description,
        uses: item.indications_and_usage ? [item.indications_and_usage[0]] : [],
        sideEffects: item.adverse_reactions ? [item.adverse_reactions[0]] : [],
        dosageInfo: item.dosage_and_administration ? item.dosage_and_administration[0] : 'Consult your physician.',
        manufacturer: item.openfda?.manufacturer_name ? item.openfda.manufacturer_name[0] : 'Unknown',
        category: item.openfda?.pharm_class_epc ? item.openfda.pharm_class_epc[0] : 'Medicine',
        type: 'medicine',
        source: 'OpenFDA'
    };
};

exports.searchItems = async (req, res) => {
    try {
        const { query, type } = req.query; // type can be 'medicine', 'test', or 'all' (default)

        if (!query) {
            return res.status(400).json({ success: false, message: 'Query parameter is required' });
        }

        const regex = new RegExp(query, 'i'); // Simple fuzzy search for local DB
        let results = [];

        // 1. Search Medicines (OpenFDA)
        if (!type || type === 'all' || type === 'medicine') {
            try {
                // OpenFDA Search - require brand_name to exist to avoid garbage
                const openFdaUrl = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${query}"*+OR+openfda.generic_name:"${query}"*)+AND+_exists_:openfda.brand_name&limit=10`;
                const response = await axios.get(openFdaUrl);

                if (response.data.results) {
                    const fdaMedicines = response.data.results
                        .map(mapOpenFdaItem)
                        .filter(item => item.name !== 'Unknown Name'); // Filter out bad data
                    results.push(...fdaMedicines);
                }
            } catch (fdaError) {
                // OpenFDA returns 404 if no results found, which is fine.
                if (fdaError.response && fdaError.response.status !== 404) {
                    console.error('OpenFDA API Error:', fdaError.message);
                }
                // If OpenFDA fails or returns nothing, we could fallback to local DB if we wanted, 
                // but for now we rely on OpenFDA as requested.
            }
        }

        // 2. Search Lab Tests (Local DB)
        if (!type || type === 'all' || type === 'test') {
            const tests = await LabTest.find({
                $or: [{ name: regex }, { category: regex }]
            }).select('name description category _id').limit(5);

            results.push(...tests.map(t => ({ ...t.toObject(), type: 'test', source: 'Local' })));
        }

        res.status(200).json({ success: true, data: results });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllMedicines = async (req, res) => {
    try {
        // Fetch "Common" medicines from OpenFDA by searching for a broad term or listing items with brand names
        // We us a generic query like "pain" or just fetch items that have a brand name to show *something* popular-ish
        // Or better, just fetch recent/standard drugs. 
        // Querying for "common" drugs often involves checking for specific classes, but for a general list:
        // We will fetch where brand_name exists, limit 20.
        try {
            const openFdaUrl = `https://api.fda.gov/drug/label.json?search=_exists_:openfda.brand_name&limit=20`;
            const response = await axios.get(openFdaUrl);

            if (response.data.results) {
                const fdaMedicines = response.data.results
                    .map(mapOpenFdaItem)
                    .filter(item => item.name !== 'Unknown Name');
                return res.status(200).json({ success: true, count: fdaMedicines.length, data: fdaMedicines });
            }
        } catch (fdaError) {
            console.error('OpenFDA Default Fetch Error:', fdaError.message);
            // Fallback to local DB if OpenFDA fails
        }

        const medicines = await Medicine.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, count: medicines.length, data: medicines });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getAllTests = async (req, res) => {
    try {
        const tests = await LabTest.find({}).sort({ name: 1 });
        res.status(200).json({ success: true, count: tests.length, data: tests });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getMedicineById = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if ID is a Mongo ObjectId (24 hex chars) -> Local DB
        if (id.match(/^[0-9a-fA-F]{24}$/)) {
            const medicine = await Medicine.findById(id);
            if (medicine) return res.status(200).json({ success: true, data: medicine });
        }

        // If not found in local or not Mongo ID, try OpenFDA
        try {
            const openFdaUrl = `https://api.fda.gov/drug/label.json?search=id:"${id}"`;
            const response = await axios.get(openFdaUrl);

            if (response.data.results && response.data.results.length > 0) {
                const item = response.data.results[0];
                const mappedMedicine = mapOpenFdaItem(item);

                // For details page, we want the full description
                mappedMedicine.description = mappedMedicine.fullDescription;

                return res.status(200).json({ success: true, data: mappedMedicine });
            }
        } catch (fdaError) {
            console.error('OpenFDA ID Fetch Error:', fdaError.message);
        }

        return res.status(404).json({ success: false, message: 'Medicine not found' });
    } catch (error) {
        console.error('Get Medicine Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

exports.getTestById = async (req, res) => {
    try {
        const test = await LabTest.findById(req.params.id);
        if (!test) return res.status(404).json({ success: false, message: 'Test not found' });
        res.status(200).json({ success: true, data: test });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
