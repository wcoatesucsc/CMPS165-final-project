import csv
import json

with open('./steel_iron.csv') as csvfile:
	read_file_csv = csv.DictReader(csvfile)

	with open('./test_us_geo.json') as jsonfile:
		read_file_json = json.load(jsonfile)

		# CSV parsing
		for row in read_file_csv:


			fips_len = len(row['area_fips'])
			if fips_len == 4:
				csv_fips = '0'+row['area_fips']
			else:
				csv_fips=row['area_fips']

			employment = row['month3_emplvl']


			# JSON parsing
			for row in read_file_json['features']:
				properties = row['properties']
				json_fips = properties['STATE']+properties['COUNTY']
				steel_emp = properties['STEEL_EMP']

				entry = {'STEEL_EMP': 0}
				
				if json_fips==csv_fips:
					print(json_fips+" "+employment+" "+str(steel_emp))

