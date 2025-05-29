import sql from 'mssql';
import { DB_HOST, DB_NAME, DB_USER, DB_PASSWORD } from '$env/static/private';

const config: sql.config = {
	server: DB_HOST,
	database: DB_NAME,
	user: DB_USER,
	password: DB_PASSWORD,
	options: {
		trustServerCertificate: true,
		enableArithAbort: true
	}
};

export async function getVoterByNameAndDob(first: string, last: string, dob: string) {
	const pool = await sql.connect(config);
	const request = pool.request();
	const result = await request
		.input('First', sql.NVarChar, first)
		.input('Last', sql.NVarChar, last)
		.input('DOB', sql.NVarChar, dob)
		.execute('Elections.GetVoter_NEW');
	return result.recordset;
}

export async function getVoterDetails(id: string, electionID: string) {
	const pool = await sql.connect(config);
	const request = pool.request();
	const result = await request
		.input('ID', sql.NVarChar, id)
		.execute('Elections.GetVoterDetailsWithLinks');
	return result.recordsets;
}

