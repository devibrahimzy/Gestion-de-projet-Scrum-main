require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use("/api/auth", require("./routes/auth.routes"));

const userRoutes = require("./routes/users.routes");

app.use("/api/users", userRoutes);
app.use("/api/projects", require("./routes/projects.routes"));
app.use("/api/sprints", require("./routes/sprints.routes"));
app.use("/api/backlog", require("./routes/backlog.routes"));
app.use("/api/kanban", require("./routes/kanban.routes"));
app.use("/api/comments", require("./routes/comments.routes"));
app.use("/api/retrospectives", require("./routes/retrospectives.routes"));
app.use("/api/dashboard", require("./routes/dashboard.routes"));


module.exports = app;
