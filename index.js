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

const pool = new pg.Pool({
  host: 'db',
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
            COALESCE (JSON_AGG(
              JSON_BUILD_OBJECT(
                'id', q.id, 
                'text', q.question_text, 
                'options', (
                  SELECT 
                    COALESCE(JSON_AGG(
                      JSON_BUILD_OBJECT(
                        'id', ao.id, 
                        'text', ao.option_text, 
                        'is_correct', ao.is_correct
                      )
                    ), '[]') 
                  FROM 
                    answer_options ao 
                  WHERE 
                    ao.question_id = q.id
                )
              )
            ), '[]') 
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

app.post("/question/:questionId/options", async(req, res) => {
  await pool.connect
  const { questionID, optionText, correct } = req.body
    try {
      const query = 'INSERT INTO answer_options (option_text, is_correct, question_id) VALUES ($1, $2, $3) RETURNING id'
      const values = [optionText, correct, questionID]

      const result = await pool.query(query, values)
      res.statusCode = 200
      res.send(result.rows[0])
      return;
  }
  catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.post("/exam/:examId/questions", async(req, res) => {
  await pool.connect
  const { examId, questionText } = req.body
    try {
      const query = 'INSERT INTO questions (question_text, exam_id) VALUES ($1, $2) RETURNING id'
      const values = [questionText, examId]

      const result = await pool.query(query, values)
      res.statusCode = 200
      res.send(result.rows[0])
      return;
  }
  catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.put("/option/:optionId", async(req, res) => {
  await pool.connect
  const { optionId, newText } = req.body
    try {
      const query = 'UPDATE answer_options SET option_text = $1 WHERE id = $2'
      const values = [newText, optionId]

      await pool.query(query, values)
      res.statusCode = 200
      res.status(200).json({"message" : "Option was successfully updated!" })
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.put("/question/:questionId", async(req, res) => {
  await pool.connect
  const { questionId, newText } = req.body
    try {
      const query = 'UPDATE questions SET question_text = $1 WHERE id = $2'
      const values = [newText, questionId]

      await pool.query(query, values)
      res.statusCode = 200
      res.status(200).json({"message" : "Question was successfully updated!" })
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.delete("/option/:optionId", async(req, res) => {
  await pool.connect
  const { optionId } = req.body
    try {
      const query = 'DELETE FROM answer_options WHERE id = $1'
      const values = [optionId]

      await pool.query(query, values)
      res.statusCode = 200
      res.status(200).json({"message" : "Option was successfully deleted!" })
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.delete("/question/:questionId", async(req, res) => {
  await pool.connect
  const { questionId } = req.body
    try {
      const query = 'DELETE FROM questions WHERE id = $1'
      const values = [questionId]

      await pool.query(query, values)
      res.statusCode = 200
      res.status(200).json({"message" : "Question was successfully deleted!" })
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.post("/exam", async(req, res) => {
  await pool.connect
  const { exam_name } = req.body
    try {
      const query = 'INSERT INTO exams (exam_name) VALUES ($1) RETURNING id'
      const values = [exam_name]

      const result = await pool.query(query, values)
      res.statusCode = 200
      res.send(result.rows[0])
      return;
  }
  catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.put("/exam/:examId", async(req, res) => {
  await pool.connect
  const { examName, examId } = req.body
    try {
      const query = 'UPDATE exams SET exam_name = $1 WHERE id = $2'
      const values = [examName, examId]

      await pool.query(query, values)
      res.statusCode = 200
      res.status(200).json({"message" : "Exam name was successfully updated!" })
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.delete("/exam/:examId", async(req, res) => {
  await pool.connect
  const { examId } = req.body
    try {
      const query = 'DELETE FROM exams WHERE id = $1'
      const values = [examId]

      await pool.query(query, values)
      res.statusCode = 200
      console.log("Exam was successfully deleted!")
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})

app.put("/option/:optionId/correct", async(req, res) => {
  await pool.connect
  const { is_correct, optionId } = req.body
    try {
      const query = 'UPDATE answer_options SET is_correct = $1 WHERE id = $2'
      const values = [is_correct, optionId]

      await pool.query(query, values)
      res.statusCode = 200
      res.status(200).json({"message" : "Option was successfully updated!" })
      return;
    }
    catch(error) {
      console.log(error)
      res.statusCode = 500
      res.send(error)
      return
  }
})
