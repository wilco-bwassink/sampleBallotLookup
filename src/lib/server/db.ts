import sql from 'mssql';

const config = {
	server: 'WILCOSQL1',
	database: 'DBNAME',
	user: 'DBUSER',
	password: 'DBPASS',
	options: {
		trustServerCertificate: true,
		enableArithAbort: true
	}
};

export async function getVoterByNameAndDob(first: string, last: string, dob: string) {
	await sql.connect(config);
	const result = await sql
		.request()
		.input('First', sql.NVarChar, first)
		.input('Last', sql.NVarChar, last)
		.input('DOB', sql.NVarChar, dob)
		.execute('Elections.GetVoter_NEW');
	return result.recordset;
}

export async function getVoterDetails(id: string, electionID: string) {
	await sql.connect(config);
	const result = await sql
		.request()
		.input('ID', sql.NVarChar, id)
		.execute('Elections.GetVoterDetailsWithLinks');
	return result.recordsets;
}
