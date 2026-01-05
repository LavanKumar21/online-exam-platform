const {Queue}=require("bullmq")
const { redisConnection } = require("../config/redis")



const examQueue=new Queue("examQueue",{
    connection:redisConnection
})

module.exports={examQueue}