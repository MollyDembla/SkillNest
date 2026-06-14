const Certificate = require('../models/Certificate');

const generateCertificate = async (student, course) => {
  const existing = await Certificate.findOne({ student: student._id, course: course._id });
  if (existing) return existing;

  const cert = await Certificate.create({
    student: student._id,
    course: course._id,
    studentNameSnapshot: student.name,
    courseNameSnapshot: course.title,
  });
  return cert;
};

module.exports = { generateCertificate };
