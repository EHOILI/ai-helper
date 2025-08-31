const User = require('../models/userModel');

// @desc    Get school ranking
// @route   GET /api/ranking/schools
const getSchoolRanking = async (req, res) => {
  try {
    const schoolRanking = await User.aggregate([
      {
        $group: {
          _id: '$school',
          totalXp: { $sum: '$xp' },
        },
      },
      {
        $sort: { totalXp: -1 },
      },
      {
        $project: {
          _id: 0,
          school: '$_id',
          totalXp: 1,
        },
      },
    ]);

    res.status(200).json(schoolRanking);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching school ranking' });
  }
};

module.exports = {
  getSchoolRanking,
};