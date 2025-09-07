const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

// @desc    Get school list
// @route   GET /api/schools
const getSchoolList = (req, res) => {
  const results = [];
  const filePath = path.join(process.cwd(), 'data', 'school_list.csv');

  fs.createReadStream(filePath)
    .pipe(csv({ bom: true })) // BOM header removal
    .on('data', (data) => {
      const schoolTypes = ['초등학교', '중학교', '고등학교'];
      if (data['학교명'] && schoolTypes.includes(data['학교종류명'])) {
        results.push(data['학교명']);
      }
    })
    .on('end', () => {
      res.status(200).json(results);
    })
    .on('error', (error) => {
      console.error('CSV Read Error:', error);
      res.status(500).json({ message: 'Error reading school list' });
    });
};

module.exports = {
  getSchoolList,
};
