import sql from 'mssql';
import { env } from '$env/dynamic/private';

function getRequiredEnv(name: 'DB_HOST' | 'DB_NAME' | 'DB_USER' | 'DB_PASSWORD') {
	const value = env[name]?.trim();
	if (!value) {
		throw new Error(`Missing required database environment variable: ${name}`);
	}

	return value;
}

function getConfig(): sql.config {
	return {
		server: getRequiredEnv('DB_HOST'),
		database: getRequiredEnv('DB_NAME'),
		user: getRequiredEnv('DB_USER'),
		password: getRequiredEnv('DB_PASSWORD'),
		options: {
			trustServerCertificate: true,
			enableArithAbort: true
		}
	};
}

export async function getVoterByNameAndDob(first: string, last: string, dob: string) {
	const pool = await sql.connect(getConfig());
	const request = pool.request();
	const result = await request
		.input('First', sql.NVarChar, first)
		.input('Last', sql.NVarChar, last)
		.input('DOB', sql.NVarChar, dob)
		.execute('Elections.GetVoter_NEW');
	return result.recordset;
}

export async function getVoterDetails(id: string, electionID: string) {
	const pool = await sql.connect(getConfig());
	const request = pool.request();
	const result = await request
		.input('ID', sql.NVarChar, id)
		.input('ElectionID', sql.NVarChar, electionID)
		.execute('Elections.GetVoterDetailsWithLinks');
	return result.recordsets;
}

export async function getVoterDetailsPrimary(id: string, electionID: string) {
	const pool = await sql.connect(getConfig());
	const request = pool.request();
	const result = await request
		.input('ID', sql.NVarChar, id)
		.input('ElectionID', sql.NVarChar, electionID)
		.execute('Elections.GetVoterDetailsWithLinks_SplitBallot');
	return result.recordsets;
}
