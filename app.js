const express = require('express');
const sequelize = require("./util/database");
const bodyParser = require('body-parser');
const path = require('path');
const userRoutes = require("./routes/user");
const chatRoutes = require("./routes/chat");
const Group = require("./models/group");
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("views"));

app.get("/", (req, res) => {
    res.redirect('/chats');
});

app.use("/user", userRoutes);
app.use("/chats", chatRoutes);

async function ensureDefaultGroupExists() {
    try {
        const [group, created] = await Group.findOrCreate({
            where: { name: 'Common Group' },
            defaults: {
                membersNo: 1,
                description: 'This is the common group.',
                date: new Date()
            }
        });

        if (created) {
            console.log("Default group created:");
        } else {
            console.log("Default group already exists.");
        }
    } catch (error) {
        console.error("Error ensuring default group:", error);
    }
}

app.use(helmet());
app.use(compression());

sequelize
    .authenticate()
    .then(() => {
        console.log("Connected to the database");
        sequelize.sync({ force: false })
            .then(async () => {
                console.log("Database synced successfully");
                await ensureDefaultGroupExists();

                app.listen(process.env.PORT, () => {
                    console.log(`Server running`);
                });
            });
    })
    .catch((err) => console.error("Database connection failed:", err));