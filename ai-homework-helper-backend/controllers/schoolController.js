const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// @desc    Get school list
// @route   GET /api/schools
const getSchoolList = (req, res) => {
  const results = [];
  const filePath = path.join(__dirname, '../data/school_list.csv');

  fs.createReadStream(filePath, { encoding: 'utf-8' })
    .pipe(csv())
    .on('data', (data) => {
      if (data['학교명']) {
        results.push(data['학교명']);
      }
    })
    .on('end', () => {
      res.status(200).json(results);
    })
    .on('error', (error) => {
      console.error(error);
      res.status(500).json({ message: 'Error reading school list' });
    });
};

module.exports = {
  getSchoolList,
};