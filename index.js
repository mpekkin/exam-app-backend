import express from "express"
import cors from "cors"
import pg  from "pg"

const app = express()
const port = 3000

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  })

app.use(cors({origin: "http://localhost:5173"}))
app.use(express.json())

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "exams",
    password: "Kantatieto86",
    port: "5432"
})

const pool = new pg.Pool({
  host: 'localhost',
  user: 'postgres',
  database: "exams",
  password: "Kantatieto86",
  port: "5432"
})

app.get("/exams", async(req, res) => {
  await pool.connect
  try {
      const query = 
      `SELECT 
      e.exam_name AS name,
      e.id AS id, 
      (
        SELECT 
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', q.id, 
              'text', q.question_text, 
              'options', (
                SELECT 
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'id', ao.id, 
                      'text', ao.option_text, 
                      'is_correct', ao.is_correct
                    )
                  ) 
                FROM 
                  answer_options ao 
                WHERE 
                  ao.question_id = q.id
              )
            )
          ) 
        FROM 
          questions q 
        WHERE 
          q.exam_id = e.id
      ) AS questions
    FROM 
      exams e
    ORDER BY 
      e.id`

      const result = await pool.query(query)
      res.statusCode = 200
      res.send(result.rows)
      return
  }
  catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

  


/* app.put("/exams", async(req, res) => {
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
}) */

app.put("/exams/options", async(req, res) => {
  await pool.connect
  //const { question_id, option_text, is_correct } = req.body
    try {
      const query = 'INSERT INTO answer_options (option_text, is_correct, question_id) VALUES ($1, $2, $3)'
      const values = [req.body.optionText, req.body.correct, req.body.questionID]

      const result = await pool.query(query, values)
      console.log(result.rows);
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
})

/* app.get("/exams", async(req, res) => {
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
}) */



