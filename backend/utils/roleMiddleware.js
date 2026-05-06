const prisma = require('./prismaClient');

const verifyCompanyRole = async (req, res, next) => {
  // Extraemos el id ya sea del body o de un header temporal hasta tener auth tokens formales
  const userId = req.body.companyId || req.headers['x-user-id'];
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized: Missing user identification" });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { auth_id: userId },
      select: { role: true }
    });

    if (!user || (user.role !== 'COMPANY' && user.role !== 'ADMIN')) {
      return res.status(403).json({ message: "Forbidden: You don't have the required role." });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error during role validation" });
  }
};

module.exports = { verifyCompanyRole };
