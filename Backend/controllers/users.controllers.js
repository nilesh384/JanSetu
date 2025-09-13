import dbConnect from "../db/dbConnect.js";


const registerUser = (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    try {
        const {id, name, age} = req.body;
        
        if (!id || !name || !age) {
            return res.status(400).json({ 
                success: false,
                message: "Missing required fields: id, name, and age are required",
                received: req.body
            });
        }

        const registerQuery = `INSERT INTO users (id, name, age) VALUES ($1, $2, $3)`;

        dbConnect().then(client => {
            client.query(registerQuery, [id, name, age], (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                    res.status(500).json({ 
                        success: false,
                        message: 'Database error',
                        error: err.message 
                    });
                } else {
                    console.log(result);
                    res.status(200).json({ 
                        success: true,
                        message: 'User registered successfully' 
                    });
                }
                client.end();
            });
        }).catch(dbErr => {
            console.error('Database connection error:', dbErr);
            res.status(500).json({ 
                success: false,
                message: 'Database connection failed',
                error: dbErr.message 
            });
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({ 
            success: false,
            message: error.message,
            errors: [] 
        });
    }
}

const loginUser = (req, res) => {
    try {
        const {id} = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Missing required field: id is required",
                received: req.params
            });
        }

        const loginQuery = `SELECT * FROM users WHERE id = $1`;

        dbConnect().then(client => {
            client.query(loginQuery, [id], (err, result) => {
                if (err) {
                    console.error('Error executing query', err.stack);
                    res.status(500).json({
                        success: false,
                        message: 'Database error',
                        error: err.message
                    });
                } else {
                    if (result.rows.length > 0) {
                        res.status(200).json({
                            success: true,
                            message: 'Login successful',
                            user: result.rows[0]
                        });
                    } else {
                        res.status(401).json({
                            success: false,
                            message: 'Invalid id'
                        });
                    }
                }
                client.end();
            });
        }).catch(dbErr => {
            console.error('Database connection error:', dbErr);
            res.status(500).json({
                success: false,
                message: 'Database connection failed',
                error: dbErr.message
            });
        });
    } catch (error) {
        console.error('Controller error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            errors: []
        });
    }
}

const updateUser = (req, res) => {
    const { id } = req.params;
    const { name, age } = req.body;

    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Missing required field: id is required",
            received: req.params
        });
    }

    const updateQuery = `UPDATE users SET name = $1, age = $2 WHERE id = $3`;

    dbConnect().then(client => {
        client.query(updateQuery, [name, age, id], (err, result) => {
            if (err) {
                console.error('Error executing query', err.stack);
                res.status(500).json({
                    success: false,
                    message: 'Database error',
                    error: err.message
                });
            } else {
                res.status(200).json({
                    success: true,
                    message: 'User updated successfully'
                });
            }
            client.end();
        });
    }).catch(dbErr => {
        console.error('Database connection error:', dbErr);
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: dbErr.message
        });
    });
}

export {registerUser, loginUser, updateUser};
