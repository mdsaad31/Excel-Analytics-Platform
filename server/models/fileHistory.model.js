// PostgreSQL queries for file history
const fileHistoryQueries = {
  // Get all history for a user
  findByUser: `
    SELECT id, file_name, upload_date, size, user_id, created_at, updated_at 
    FROM file_history 
    WHERE user_id = $1 
    ORDER BY created_at DESC
  `,
  
  // Add new file history
  create: `
    INSERT INTO file_history (file_name, upload_date, size, user_id) 
    VALUES ($1, $2, $3, $4) 
    RETURNING *
  `,
  
  // Delete a file history entry by ID
  deleteById: `
    DELETE FROM file_history 
    WHERE id = $1 
    RETURNING *
  `,
  
  // Get a specific file history entry by ID
  findById: `
    SELECT id, file_name, upload_date, size, user_id, created_at, updated_at 
    FROM file_history 
    WHERE id = $1
  `
};

module.exports = fileHistoryQueries;
