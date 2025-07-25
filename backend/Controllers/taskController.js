const pool = require("../db/db");


exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }


    const result = await pool.query(
      'INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );


    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};




exports.getTasks = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM tasks ORDER BY created_at ASC LIMIT 6'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' }); 
  }
};



exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Updating task ${id} to status ${status}`);

  const validStatuses = ['completed', 'pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid status',
      details: `Status must be one of: ${validStatuses.join(', ')}`
    });
  }

  try {

    const taskId = parseInt(id, 10);
    if (isNaN(taskId)) {
      return res.status(400).json({
        error: 'Invalid ID',
        details: 'Task ID must be a number'
      });
    }


    const result = await pool.query(
      `UPDATE tasks 
       SET status = $1::text, 
           completed_at = CASE WHEN $1::text = 'completed' THEN NOW() ELSE NULL END
       WHERE id = $2::integer
       RETURNING *`,
      [status, taskId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Task not found',
        details: `No task found with ID ${taskId}`
      });
    }

    return res.json(result.rows[0]);

  } catch (err) {
    console.error('Database error:', {
      message: err.message,
      query: err.query,
      parameters: err.parameters,
      stack: err.stack
    });

    return res.status(500).json({
      error: 'Database operation failed',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};