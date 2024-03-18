const express = require('express');
const router = express.Router();
const Nurse = require('../models/schema');
const json2csv = require('json2csv').Parser;
const exceljs = require('exceljs');
const fs = require('fs');
const path = require('path');


// Insert an nurse into Database
router.post('/add', async (req, res) => {
    if (!req.body) {
        res.status(400).send({ message: "Content can not be emtpy!" });
        return;
    }

    const nurse = await new Nurse({
        name: req.body.name,
        licenseNumber: req.body.licenseNumber,
        dob: req.body.dob,
        age: req.body.age,
    })

    // Assuming req.body contains the nurse data
    const { name, licenseNumber, dob, age } = req.body;
    // Append nurse data to data.json file
    const newData = {
        name,
        licenseNumber,
        dob,
        age
    };
    const dataFilePath = path.join(__dirname, 'data.json');
    const existingData = fs.existsSync(dataFilePath) ? JSON.parse(fs.readFileSync(dataFilePath)) : [];
    existingData.push(newData);
    fs.writeFileSync(dataFilePath, JSON.stringify(existingData, null, 2));

    nurse.save(nurse).then(data => {
        res.redirect('/')
    }).catch(err => {
        res.status(500).send({
            message: err.message || 'Error'
        })
    })
})


router.get('/', (req, res) => {
    Nurse.find().then((nurse) => {
        res.render('index', {
            nurse: nurse
        })
    }).catch(err => {
        res.json({ message: err.message || 'Error' });

    })
})


router.get("/edit/:id", async (req, res) => {
    try {
        const nurse = await Nurse.findById(req.params.id);
        if (!nurse) {
            return res.redirect('/');
        }
        res.render('edit', { nurse: nurse });
    } catch (err) {
        res.redirect('/');
        res.json({ message: err.message || 'Error' });
    }
});


// Update a new idetified nurse by nurse id
router.post('/update/:id', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).send({ message: "Data to update can not be empty" });
        }

        const id = req.params.id;

        const updatedNurse = await Nurse.findByIdAndUpdate(id, {
            name: req.body.name,
            licenseNumber: req.body.licenseNumber,
            dob: req.body.dob,
            age: req.body.age
        });

        if (updatedNurse) {
            req.session.message = {
                type: 'success',
                message: 'Nurse updated!'
            };
        } else {
            throw new Error('Nurse not found');
        }

        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

// Delete Nurse route
router.get('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const deletedNurse = await Nurse.findByIdAndDelete(id);

        if (deletedNurse) {
            req.session.message = {
                type: 'info',
                message: 'Nurse deleted successfully!'
            };
            res.redirect("/");
        } else {
            throw new Error('Nurse not found');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get("/add", (req, res) => {
    res.render('add');
})

// Route to download nurse data as CSV
router.get('/download/csv', async (req, res) => {
    try {
        const nurses = await Nurse.find(); // Assuming you have a Nurse model

        if (nurses.length === 0) {
            return res.status(404).send("No nurse data found");
        }

        const csvFields = ['_id', 'name', 'licenseNumber', 'dob', 'age']; // Define fields for CSV
        const json2csvParser = new json2csv({ fields: csvFields });
        const csvData = json2csvParser.parse(nurses);

        res.header('Content-Type', 'text/csv');
        res.attachment('nurse_data.csv');
        return res.send(csvData);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

// Route to download nurse data as excel
router.get('/download/excel', async (req, res, next) => {
    try {
        const nurses = await Nurse.find(); // Assuming you have a Nurse model

        if (nurses.length === 0) {
            return res.status(404).send("No nurse data found");
        }

        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet('Nurse Data');

        // Define columns in Excel
        worksheet.columns = [
            { header: '_id', key: '_id', width: 20 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'License Number', key: 'licenseNumber', width: 20 },
            { header: 'DOB', key: 'dob', width: 20 },
            { header: 'Age', key: 'age', width: 10 }
        ];


        let object = JSON.parse(fs.readFileSync('./routes/data.json', 'utf8'));

        // Add nurse data to the worksheet
        await object.map((value) => {
            worksheet.addRow({
                _id: value._id,
                name: value.name,
                licenseNumber: value.licenseNumber,
                dob: value.dob,
                age: value.age
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=' + "nurse_data.xlsx");
        await workbook.xlsx.write(res);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});



module.exports = router;