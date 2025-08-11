import { json } from '@sveltejs/kit';

export async function GET() {
    try {
        const res = await fetch ('http://dev.wilco.org/sampleBallotAdmin/data/sampleBallotSettings.json');
        if (!res.ok) {
            console.error(`Fetch failed with status ${res.status}`);
            return json({ error: 'Remote server responded with error' }, { status: res.status });
        }
        const data = await res.json();
        return json(data);
    } catch (err) {
        console.error('Error fetching remote data: ', err);
        return json({ error: 'Unexpected server error' }, { status: 500 });
    }
}