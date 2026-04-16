// check-supabase.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Checking Supabase connection to:', supabaseUrl);
    try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
            console.error('Error listing buckets:', error.message);
        } else {
            console.log('Buckets:', data.map(b => b.name));
            if (!data.find(b => b.name === 'uploads')) {
                console.log('Creating "uploads" bucket...');
                const { error: createError } = await supabase.storage.createBucket('uploads', { public: true });
                if (createError) console.error('Create error:', createError.message);
                else console.log('Bucket "uploads" created.');
            } else {
                console.log('Bucket "uploads" exists.');
            }
        }
    } catch (e) {
        console.error('Unexpected error:', e.message);
    }
}

run();
