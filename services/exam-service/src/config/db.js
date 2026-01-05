const { Pool}=require("pg")

const pool=new Pool({
    user:process.env.DB_USER,
    host:process.env.DB_HOST,
    database:process.env.DB_NAME,
    password:process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    max:20,
    idleTimeoutMillis:30000,
    connectionTimeoutMillis:2000
})

const connectDB = async(retries=5,delay=2000) => {
    for(let i=0;i<retries;i++){
        try {
            await pool.connect();
            console.log('✅ Connected to PostgreSQL database');
            break;
        } catch (err) {
            console.error(`❌ Failed to connect to DB (attempt ${i + 1})`, err.message); 
            if (i === retries - 1) process.exit(1); // exit after final attempt
            await new Promise((res) => setTimeout(res, delay * (i + 1))); // exponential backoff
        }
    }

    pool.on('error', (err) => {
        console.error('❌ Unexpected error on idle client', err);
        process.exit(-1);
    });
    return pool;
};

module.exports={pool, connectDB}