const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
        const dailyClassWork = client.db('studentManagement').collection('dailyClassWork');
        const homeWork = client.db('studentManagement').collection('homeWork');
        const completeLesson = client.db('studentManagement').collection('completeLesson');
        const adminModeratorCollection = client.db('studentManagement').collection('adminModerator');

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

        /*Post Daily Class Work*/
        app.post('/dailyClassWork', async (req, res) => {
            const file = req.files.file;
            const className = req.body.className;
            const chapter = req.body.chapter;
            const subject = req.body.subject;
            const topic = req.body.topic;
            const description = req.body.description;
            const date = req.body.date;
            const newImg = file.data;
            const encImg = newImg.toString('base64');
            const image = {
                contentType: req.files.file.mimetype,
                size: req.files.file.size,
                img: Buffer.from(encImg, 'base64')
            };
            const result = await dailyClassWork.insertOne({ className, chapter, subject, topic, description, image, date });
            res.send({ result });

        })

        /* POST assign home work*/
        app.post('/assignHomeWork', async (req, res) => {
            const className = req.body.className;
            const subject = req.body.subject;
            const topic = req.body.topic;
            const chapter = req.body.chapter;
            const submissionDate = req.body.submissionDate;
            const teacherName = req.body.teacherName;
            const description = req.body.description;

            const homeWorkData = await homeWork.insertOne({
                subject, topic, chapter, submissionDate, teacherName, description
            });

            res.send({ homeWorkData });
        })

        /* POST Update Complete lesson */
        app.post('/updateCompleteLesson', async (req, res) => {
            const className = req.body.className;
            const subject = req.body.subject;
            const teacherName = req.body.teacherName;
            const totalLesson = req.body.totalLesson;
            const lessonCompleted = req.body.lessonCompleted;
            const lessonCompleteDate = req.body.lessonCompleteDate;
            const description = req.body.description;

            const result = await completeLesson.insertOne({
                className,
                subject,
                teacherName,
                totalLesson,
                lessonCompleted,
                lessonCompleteDate,
                description
            });

            res.send({ result });

        })

        /*POST admin moderator  */
        app.post('/adminOrModerator', async (req, res) => {
            const status = req.body.user;
            const email = req.body.email;
            const existing = await adminModeratorCollection.findOne({ email });

            if (!existing) {
                const result = await adminModeratorCollection.insertOne({
                    status, email
                });
                res.send({ result });
            } else {
                const result = existing;
                res.send(result);
            }

        })

        /* GET admin moderators  */
        app.get('/adminAndModerators', async (req, res) => {
            const query = {};
            const adminData = adminModeratorCollection.find(query);
            const result = await adminData.toArray();

            res.send({ result });
        })

        /*UPDATE admin moderators */
        app.put('/updateAdminModerator/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };

            const updateData = {
                $set: {
                    email: user.email,
                    status: user.status
                }
            }

            const result = await adminModeratorCollection.updateOne(filter, updateData, options);

            res.send({ result });

        })

        /* DELETE admin moderators */
        app.delete('/deleteAdminOrModerator/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await adminModeratorCollection.deleteOne(query);

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