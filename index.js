const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const fileUpload = require('express-fileupload');
const fs = require('fs-extra');
const bodyParser = require('body-parser');

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.brhhmac.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
    try {
        await client.connect();

        const admissionCollection = client.db('studentManagement').collection('admission');
        const studentGoal = client.db('studentManagement').collection('studentGoal');

        /* Post Student Goals */
        app.post('/studentGoal', async (req, res) => {

            const file = req.files.file;
            const goalName = req.body.goalName;
            const description = req.body.description;
            const goalType = req.body.goalType;
            const newImg = file.data;
            const encImg = newImg.toString('base64');
            const image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer.from(encImg, 'base64')
            };

            const result = await studentGoal.insertOne({
                goalName,
                description,
                goalType,
                image
            });
            res.send({ result });
        })

        /* GET students Goals */
        app.get('/students-goals', async (req, res) => {
            const query = {};
            const goalsData = studentGoal.find(query);
            const result = await goalsData.toArray();

            res.send({ result })
        })

    } finally {
        // client.close()
    }
}
run().catch(console.dir)








app.get('/', (req, res) => {
    res.send("Student managemant system server is running");

})

app.listen(port, () => {
    console.log("Example app listening on port", port);
})