import express from "express"
import cors from "cors"
import { readFile, writeFile } from "fs/promises"


const app = express()
const port = 3000

app.use(cors({origin: "http://localhost:5173"}))
app.use(express.json())

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  })

app.put("/exams", async(req, res) => {
    if (req.header("Username") === "Mikko" && req.header("Password") === "12345") {
        try {
            let examData = req.body
            examData = JSON.stringify(examData)
            await writeFile("./exams.json", examData)
            res.statusCode = 200
            res.send()
            return;
        }
        catch(error) {
            console.log(error)
            res.statusCode = 500
            res.send(error)
            return
        }
    } else {
        res.send("Käyttäjällä ei ole oikeuksia")
        return
    }
})

app.get("/exams", async(req, res) => {
    try {
        const examData = await readFile("./exams.json", "utf8")
        console.log(examData)
        res.statusCode = 200
        res.send(examData)
        return
    }
    catch(error) {
        console.log(error)
        res.statusCode = 500
        res.send(error)
        return
    }
})