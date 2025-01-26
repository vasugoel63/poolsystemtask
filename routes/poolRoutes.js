const express = require("express");
const router = express.Router();
const {pool} = require("../db.js");
const {kafka} = require('../kafka/client.js');
const wsServer = require('../websocket.js');
router.post('/polls', async(req,res)=> {
    try{
        const {question, userid, options} = req.body;
        if(!question || !userid || !options){
            return res.status(500).json({error: "Interval Server error"})
        }
        const result = await pool.query(
            'INSERT INTO pools(question, user_id) VALUES($1,$2)',
            [question, userid]
        );
      
        const poolId = result.rows[0].id;
        const poolOptions = options.map(option=>{
            return pool.query('INSERT INTO pools_options(pool_id, option) VALUES($1, $2)', [poolId, option])
        })
        await Promise.all(poolOptions);
        
        res.status(200).json({
            message: "Pools created successfully",
            data: {
                poll: result.rows[0],
                polloptions: poolOptions.rows
            }
        })
    }
    catch(err){
        res.status(500).json({error: "Database connected"});
    }
})
router.get('/pools/:id', async(req,res)=>{
    const {id} = req.params;
    const result = await pool.query(
        'SELECT * FROM pools WHERE id = $1',
        [id]
    );
    if (result.rows.length == 0) {
        return res.status(500).json({
            error: "Not Found"
        });
    }
    const optionsresult = await pool.query(
        'SELECT * FROM pools_options WHERE pool_id = $1',
        [id]
    )
    const votesresult = await pool.query(
        'SELECT * FROM votes WHERE pool_id = $1',
        [id]
    )
    
    res.status(201).json({
        message: "Pools Displayed successfully",
        data: {
            pool: result.rows[0],
            options: optionsresult.rows,
            votes: votesresult.rows
    }
})

})
router.post('/polls/:poolid/vote', async(req,res)=>{
    const {poolid} = req.params;
    const {optionid, userid} = req.body;
    try{
    const poolfoundrow = await pool.query(
        'SELECT * FROM pools WHERE id = $1',
        [poolid]
    );

    if(poolfoundrow.rows.length == 0){
        return res.status(500).json({
            error: "Not Found"
        });
    }
    const optionCheck = await pool.query(
        'SELECT * FROM pools_options WHERE id = $1 AND pool_id = $2',
        [optionid, poolid]
    );

    if (optionCheck.rows.length === 0) {
        return res.status(400).json({ error: "Invalid option for this poll" });
    }
    const hasUserVoted = await pool.query('SELECT * FROM votes WHERE user_id = $1 AND pool_id= $2', [userid, poolid]);
    if(hasUserVoted.rows.length > 0){
        return res.status(500).json({
            message: 'User has already voted in this pool'
        })
    }
    const poolfound = poolfoundrow.rows[0];
    const producer = kafka.producer();
    await producer.connect();

    const query = await pool.query('INSERT into votes(user_id,pool_option_id, pool_id) VALUES($1, $2, $3)',[
        userid, optionid, poolid
    ]);
    const result = await pool.query(
        `SELECT pools_options.option, COUNT(votes.id) AS votes_count 
         FROM pools_options 
         LEFT JOIN votes 
         ON pools_options.id = votes.pool_option_id 
         WHERE pools_options.pool_id = $1
         GROUP BY pools_options.id`,
        [poolid]
    );
    const leaderboarddata = result.rows;
    await producer.send({
        topic: 'pool-system',
        messages: [
            {
                key: poolid.toString(),
                value: JSON.stringify({ poolId: poolid, leaderboarddata: leaderboarddata, timestamp: new Date().toISOString})}
        ]
    });
    producer.disconnect();
    res.status(200).json({
        message: "Voted successfully",
        data: query.rows[0]
    })
    }catch (err) {
        res.status(500).json({
            error: "An error occurred while processing the vote"
        });
    }

})

router.get('/leaderboard/:poolId', async(req,res)=> {
    const {poolId} = req.params;
    try{
        const result = await pool.query(
            `SELECT pools_options.option, COUNT(votes.id) AS votes_count 
             FROM pools_options 
             LEFT JOIN votes 
             ON pools_options.id = votes.pool_option_id 
             WHERE pools_options.pool_id = $1
             GROUP BY pools_options.id`,
            [poolId]
        );
        if(wsServer && wsServer.clients){
         wsServer.clients.forEach((client) => {
                        if (client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(result.rows)); 
                        }
                    });
                }
        res.status(200).json({
            message: "Pool Result Displayed successfully",
            data: result.rows
        
    });
    }catch(err){
        console.log(err);
        res.status(500).json({message: err})
    }
})

module.exports = router;

