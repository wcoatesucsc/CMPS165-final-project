import csv

with open('./steel_iron.csv') as csvfile:
		read_file = csv.DictReader(csvfile)
		for row in read_file:
			print(row)