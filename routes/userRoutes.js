const express = require("express");
const router = express.Router();
const {pool} = require("../db.js");
const {kafka} = require('../kafka/client.js');
const wsServer = require('../websocket.js');

router.post('/signup', async(req,res)=>{
    try{
        const { name,email, password } = req.body;

    if (!name || !email ||  !password) {
        return res.status(500).json({ error: "Missing required fields" });
    }

    const userExists = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
    );
    if (userExists.rows.length > 0) {
        return res.status(500).json({
            error: "User already exists"
        });
    }
    const result = await pool.query(
        'INSERT INTO users(name,email, password) VALUES ($1, $2, $3)',
        [name, email, password] 
    );
    res.status(200).json({
        message: "User registered successfully",
        data: result.rows[0]
    });
    }catch(err){
        res.status(500).json({ error: "Interval Server error" });
    }
})

module.exports = router;