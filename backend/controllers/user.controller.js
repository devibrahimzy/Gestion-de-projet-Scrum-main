const db = require("../config/database");

exports.getAllUsers = async (req, res) => {
  const search = req.query.search ? `%${req.query.search}%` : "%";
  const [users] = await db.query(
    "SELECT id, email, first_name, last_name, role, isActive, lastLogin FROM users WHERE first_name LIKE ? OR last_name LIKE ? OR email LIKE ?",
    [search, search, search]
  );
  res.json(users);
};
exports.getUserById = async (req, res) => {
  const [rows] = await db.query(
    "SELECT id, email, first_name, last_name, role, isActive, lastLogin FROM users WHERE id = ?",
    [req.params.id]
  );

  if (rows.length === 0)
    return res.status(404).json({ message: "User not found" });

  res.json(rows[0]);
};
exports.updateUser = async (req, res) => {
  const { first_name, last_name, role } = req.body;

  await db.query(
    `UPDATE users 
     SET first_name = ?, last_name = ?, role = ?
     WHERE id = ?`,
    [first_name, last_name, role, req.params.id]
  );

  res.json({ message: "User updated successfully" });
};
exports.deleteUser = async (req, res) => {
  await db.query(
    "UPDATE users SET isActive = false WHERE id = ?",
    [req.params.id]
  );

  res.json({ message: "User disabled successfully" });
};
