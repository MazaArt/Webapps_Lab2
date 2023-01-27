const db = require("./db_connection");

const delete_questions_table_sql = "DELETE FROM Questions;"

db.execute(delete_questions_table_sql);


const insert_questions_table_sql = `
    INSERT INTO Questions
        (question, answer, creator) 
    VALUES 
        (?, ?, ?);
`
db.execute(insert_questions_table_sql, ['How many apples did Eve eat?', '1', 'Bible']); 


const read_questions_table_sql = "SELECT * FROM Questions";

db.execute(read_questions_table_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'Questions' initialized with:")
        console.log(results);
    }
);

db.end();
